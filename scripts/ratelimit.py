"""Adaptive per-host request pacing, modelled on TCP congestion control.

The finder spent a whole session getting 429ed by arXiv because it paced
requests with a fixed `time.sleep(3)` and ignored what the server said back.
A fixed delay is wrong in both directions: too slow when the host is happy,
far too fast once it is not, and it forgets everything between runs so every
invocation rediscovers the limit the hard way.

The model here is AIMD, the same rule TCP uses to find a link's capacity:

  * additive decrease of the inter-request delay on every success, so pacing
    creeps back toward the floor when the host is healthy;
  * multiplicative increase on a congestion signal (429, 503), because the
    right response to "you are going too fast" is to back off hard, not by a
    little;
  * the learned delay persists to disk per host, so the next run starts where
    the last one left off instead of re-triggering the limiter to relearn it;
  * and that persisted delay decays with wall-clock time, because a backoff is
    a claim about the host's state *right then*, and that claim goes stale.

The decay is not a refinement, it is what makes persistence safe. Additive
decrease of 0.25s needs ~480 consecutive successes to walk back from the 120s
ceiling, so without decay a single bad throttling episode is written to disk
and poisons every later run: the early-May scan inherited a 119.5s arXiv delay,
crawled at two minutes per request, and produced nothing in an hour. Congestion
information has a half-life. Treat it that way.

Three details that matter more than the control law:

  * `Retry-After` is obeyed when present. It is the server stating exactly
    how long to wait, and ignoring it is what turns one 429 into twenty.
  * Retry sleeps use full jitter (`random.uniform(0, backoff)`) rather than a
    fixed backoff. Without jitter, parallel workers that get throttled
    together retry together and stay synchronized.

Stdlib only, to keep the finder dependency-free.
"""

from __future__ import annotations

import json
import random
import threading
import time
import urllib.error
import urllib.request
from email.utils import parsedate_to_datetime
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

STATE_PATH = Path(__file__).parent / ".ratelimit_state.json"

# Signals that mean "slow down" as opposed to "this request was bad".
CONGESTION_CODES = {429, 503}
# Retryable but not necessarily load-related: arXiv 500s on deep pagination
# are a query problem, so they get a retry without the full pacing penalty.
TRANSIENT_CODES = {500, 502, 504}


class AdaptiveLimiter:
    """Per-host pacing shared across threads."""

    def __init__(self, floor: float = 0.5, ceiling: float = 120.0,
                 start: float = 3.0, decrease: float = 0.25, multiplier: float = 3.0,
                 half_life: float = 600.0, floors: dict[str, float] | None = None):
        self.floor = floor
        self.ceiling = ceiling
        self.start = start
        self.decrease = decrease
        self.multiplier = multiplier
        self.half_life = half_life
        # Hosts whose tolerable rate is PUBLISHED do not need it learned.
        # Additive decrease walks pacing below such a host's real limit, earns
        # a 429, backs off, and decays right back into the limit - an
        # oscillation that is slower in wall-clock terms than just holding the
        # documented pace. The floor is the knowledge; encode it.
        self.floors = floors or {}
        self._lock = threading.Lock()
        self._next_ok: dict[str, float] = {}
        self._delay: dict[str, float] = {}
        # Wall-clock time each host's delay was last set, so decay survives a
        # restart. time.time() rather than monotonic() precisely because this
        # has to mean something across processes.
        self._stamp: dict[str, float] = {}
        self._load()

    # ---------------------------------------------------------------- state
    def _load(self) -> None:
        try:
            saved = json.loads(STATE_PATH.read_text())
        except Exception:
            return  # a missing or corrupt pacing file is not worth failing over
        # State written before stamps existed still has an age: the file's own
        # mtime. Falling back to "now" would treat an ancient 120s backoff as
        # fresh, which is the exact failure this decay exists to prevent.
        try:
            default_stamp = STATE_PATH.stat().st_mtime
        except OSError:
            default_stamp = 0.0
        stamps = saved.get("stamp", {})
        for host, d in saved.get("delay", {}).items():
            try:
                self._delay[host] = min(self.ceiling, max(self._floor(host), float(d)))
                self._stamp[host] = float(stamps.get(host, default_stamp))
            except (TypeError, ValueError):
                continue

    def _write(self) -> None:
        """Caller holds the lock (or is single-threaded at shutdown)."""
        try:
            STATE_PATH.write_text(json.dumps(
                {"delay": self._delay, "stamp": self._stamp}, indent=1))
        except Exception:
            pass  # pacing is an optimisation; never fail a scan over it

    def save(self) -> None:
        with self._lock:
            self._write()

    # ------------------------------------------------------------- controls
    def _floor(self, host: str) -> float:
        return self.floors.get(host, self.floor)

    def _current_delay(self, host: str) -> float:
        """The stored delay, aged. Caller holds the lock.

        Halves every `half_life` seconds since the delay was last set. Elapsed
        quiet time is evidence the host has recovered, and it is the only
        evidence available when the alternative is not asking at all.
        """
        d = self._delay.get(host)
        if d is None:
            return max(self._floor(host), self.start)
        age = max(0.0, time.time() - self._stamp.get(host, time.time()))
        return max(self._floor(host), d * (0.5 ** (age / self.half_life)))

    def _wait_turn(self, host: str) -> None:
        """Block until this host's next slot, then claim the one after it."""
        while True:
            with self._lock:
                now = time.monotonic()
                ready = self._next_ok.get(host, 0.0)
                if now >= ready:
                    self._next_ok[host] = now + self._current_delay(host)
                    return
                sleep_for = ready - now
            time.sleep(sleep_for)

    def _on_success(self, host: str) -> None:
        with self._lock:
            # Decrease from the aged value, then re-stamp: the new number is
            # current as of now, so its own decay restarts here.
            self._delay[host] = max(self._floor(host), self._current_delay(host) - self.decrease)
            self._stamp[host] = time.time()

    def _on_congestion(self, host: str) -> float:
        """Multiplicative increase; returns the new steady-state delay."""
        with self._lock:
            d = min(self.ceiling, max(self._floor(host), self._current_delay(host)) * self.multiplier)
            self._delay[host] = d
            self._stamp[host] = time.time()
            # Nobody touches this host again until the new delay has passed.
            self._next_ok[host] = time.monotonic() + d
            # Persist on the way up, not only at the end of a run. A long scan
            # that gets killed mid-throttle is exactly when the learned delay
            # is most valuable, and saving only on exit threw it away - which
            # is what happened to the June top-up.
            self._write()
            return d

    @staticmethod
    def _retry_after(err: urllib.error.HTTPError) -> float | None:
        raw = err.headers.get("Retry-After") if err.headers else None
        if not raw:
            return None
        raw = raw.strip()
        if raw.isdigit():
            return float(raw)
        try:  # HTTP-date form
            when = parsedate_to_datetime(raw)
            if when.tzinfo is None:
                when = when.replace(tzinfo=timezone.utc)
            return max(0.0, (when - datetime.now(timezone.utc)).total_seconds())
        except Exception:
            return None

    # ----------------------------------------------------------------- main
    def fetch(self, url: str, headers: dict, timeout: int = 30,
              attempts: int = 5, on_wait=None) -> bytes:
        host = urlsplit(url).netloc
        last: Exception | None = None
        for attempt in range(attempts):
            self._wait_turn(host)
            try:
                req = urllib.request.Request(url, headers=headers)
                with urllib.request.urlopen(req, timeout=timeout) as res:
                    body = res.read()
                self._on_success(host)
                return body
            except urllib.error.HTTPError as err:
                last = err
                if err.code in CONGESTION_CODES:
                    steady = self._on_congestion(host)
                    hinted = self._retry_after(err)
                    # Full jitter over the exponential envelope, unless the
                    # server named a time, in which case that wins outright.
                    backoff = hinted if hinted is not None else \
                        random.uniform(0, min(self.ceiling, steady * (2 ** attempt)))
                    if on_wait:
                        on_wait(host, err.code, backoff, attempt,
                                "Retry-After" if hinted is not None else "jittered")
                    time.sleep(backoff)
                    continue
                if err.code in TRANSIENT_CODES:
                    backoff = random.uniform(0, min(30.0, 2.0 * (2 ** attempt)))
                    if on_wait:
                        on_wait(host, err.code, backoff, attempt, "transient")
                    time.sleep(backoff)
                    continue
                raise  # 404 and friends: retrying cannot help
            except Exception as err:  # timeouts, resets, malformed responses
                last = err
                backoff = random.uniform(0, min(30.0, 2.0 * (2 ** attempt)))
                if on_wait:
                    on_wait(host, 0, backoff, attempt, type(err).__name__)
                time.sleep(backoff)
        assert last is not None
        raise last

    def status(self) -> str:
        with self._lock:
            if not self._delay:
                return "no pacing learned yet"
            # Report the effective delay, not the stored one. The stored number
            # is only half the state; a reader who sees "120s" and not "aged to
            # 2s" learns the wrong thing about what the next run will do.
            parts = []
            for h in sorted(self._delay):
                now, aged = self._delay[h], self._current_delay(h)
                parts.append(f"{h} {aged:.2f}s" if abs(now - aged) < 0.01
                             else f"{h} {aged:.2f}s (from {now:.2f}s)")
            return ", ".join(parts)


# arXiv's API terms ask for one request every three seconds, on both the
# search API and the OAI-PMH harvester. The web frontend (arxiv.org, CDN
# backed) is not the API and keeps the default floor.
LIMITER = AdaptiveLimiter(floors={
    "export.arxiv.org": 3.0,
    "oaipmh.arxiv.org": 3.0,
})
