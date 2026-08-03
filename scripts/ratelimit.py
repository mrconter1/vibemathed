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
    the last one left off instead of re-triggering the limiter to relearn it.

Two details that matter more than the control law:

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
                 start: float = 3.0, decrease: float = 0.25, multiplier: float = 3.0):
        self.floor = floor
        self.ceiling = ceiling
        self.start = start
        self.decrease = decrease
        self.multiplier = multiplier
        self._lock = threading.Lock()
        self._next_ok: dict[str, float] = {}
        self._delay: dict[str, float] = {}
        self._load()

    # ---------------------------------------------------------------- state
    def _load(self) -> None:
        try:
            saved = json.loads(STATE_PATH.read_text())
            for host, d in saved.get("delay", {}).items():
                self._delay[host] = min(self.ceiling, max(self.floor, float(d)))
        except Exception:
            pass  # a missing or corrupt pacing file is not worth failing over

    def save(self) -> None:
        try:
            STATE_PATH.write_text(json.dumps({"delay": self._delay}, indent=1))
        except Exception:
            pass

    # ------------------------------------------------------------- controls
    def _wait_turn(self, host: str) -> None:
        """Block until this host's next slot, then claim the one after it."""
        while True:
            with self._lock:
                now = time.monotonic()
                ready = self._next_ok.get(host, 0.0)
                if now >= ready:
                    self._next_ok[host] = now + self._delay.get(host, self.start)
                    return
                sleep_for = ready - now
            time.sleep(sleep_for)

    def _on_success(self, host: str) -> None:
        with self._lock:
            d = self._delay.get(host, self.start)
            self._delay[host] = max(self.floor, d - self.decrease)

    def _on_congestion(self, host: str) -> float:
        """Multiplicative increase; returns the new steady-state delay."""
        with self._lock:
            d = self._delay.get(host, self.start)
            d = min(self.ceiling, max(self.floor, d) * self.multiplier)
            self._delay[host] = d
            # Nobody touches this host again until the new delay has passed.
            self._next_ok[host] = time.monotonic() + d
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
            return ", ".join(f"{h} {d:.2f}s" for h, d in sorted(self._delay.items()))


LIMITER = AdaptiveLimiter()
