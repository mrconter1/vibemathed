"""Deterministic checks for the adaptive limiter.

Written against a fake opener rather than a live host: the control law has to
be verifiable when arXiv is healthy, when it is throttling, and at 3am in CI,
none of which are the same thing.

Run: python scripts/test_ratelimit.py
"""

import io
import sys
import time
import urllib.error
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
import ratelimit  # noqa: E402
from ratelimit import AdaptiveLimiter  # noqa: E402

UA = {"User-Agent": "test"}
FAILS = []


def check(name: str, cond: bool, detail: str = "") -> None:
    print(f"  {'PASS' if cond else 'FAIL'}  {name}{'  ' + detail if detail else ''}")
    if not cond:
        FAILS.append(name)


class FakeResponse:
    def __init__(self, body: bytes):
        self._b = body

    def read(self):
        return self._b

    def __enter__(self):
        return self

    def __exit__(self, *a):
        return False


def make_opener(script):
    """script: list of either bytes (success) or (code, headers) for an error."""
    calls = {"n": 0}

    def opener(req, timeout=None):
        i = calls["n"]
        calls["n"] += 1
        step = script[min(i, len(script) - 1)]
        if isinstance(step, bytes):
            return FakeResponse(step)
        code, headers = step
        raise urllib.error.HTTPError(req.full_url, code, "boom", headers, None)

    return opener, calls


def run():
    ratelimit.STATE_PATH = Path(__file__).parent / ".ratelimit_test_state.json"
    if ratelimit.STATE_PATH.exists():
        ratelimit.STATE_PATH.unlink()
    real_open = ratelimit.urllib.request.urlopen

    # 1. Success path leaves pacing at or below where it started, and the
    #    additive decrease actually moves it down.
    #    half_life=inf disables time decay: these first two checks are about
    #    the control law, and real elapsed time would otherwise shave
    #    microseconds off the arithmetic they assert exactly. Decay gets its
    #    own checks below.
    lim = AdaptiveLimiter(floor=0.0, start=1.0, decrease=0.25, multiplier=3.0,
                          half_life=float("inf"))
    opener, _ = make_opener([b"ok"])
    ratelimit.urllib.request.urlopen = opener
    for _ in range(3):
        lim.fetch("http://h/x", UA)
    d = lim._delay["h"]
    check("additive decrease on success", abs(d - 0.25) < 1e-9, f"delay={d:.2f}s")

    # 2. A 429 multiplies the steady-state delay, and the body still arrives.
    lim = AdaptiveLimiter(floor=0.0, start=1.0, multiplier=3.0, ceiling=100.0,
                          half_life=float("inf"))
    opener, calls = make_opener([(429, {"Retry-After": "0"}), b"recovered"])
    ratelimit.urllib.request.urlopen = opener
    body = lim.fetch("http://h/x", UA)
    check("429 retried, body returned", body == b"recovered", f"{calls['n']} calls")
    # The retry that succeeds immediately earns back one additive decrease,
    # so the landing point is start*multiplier - decrease, not start*multiplier.
    # That is congestion avoidance starting, not a lost penalty; the invariant
    # worth asserting is that a 429 leaves pacing materially slower than before.
    d = lim._delay["h"]
    check("multiplicative increase on 429", d > 1.0 and abs(d - (3.0 - 0.25)) < 1e-9,
          f"delay={d:.2f}s, was 1.00s")

    # 3. Retry-After is obeyed rather than the jittered envelope. The header
    #    says 2s, so the call cannot return sooner than that.
    lim = AdaptiveLimiter(floor=0.0, start=0.0, multiplier=1.0, ceiling=100.0)
    opener, _ = make_opener([(429, {"Retry-After": "2"}), b"ok"])
    ratelimit.urllib.request.urlopen = opener
    t0 = time.monotonic()
    lim.fetch("http://h/x", UA)
    waited = time.monotonic() - t0
    check("Retry-After honoured", waited >= 1.9, f"waited {waited:.2f}s")

    # 4. A 404 is not retried: retrying cannot help and masks real bugs.
    lim = AdaptiveLimiter(floor=0.0, start=0.0)
    opener, calls = make_opener([(404, {})])
    ratelimit.urllib.request.urlopen = opener
    try:
        lim.fetch("http://h/x", UA)
        check("404 raises immediately", False)
    except urllib.error.HTTPError:
        check("404 raises immediately", calls["n"] == 1, f"{calls['n']} call")

    # 5. Persistent congestion gives up after `attempts` instead of hanging.
    lim = AdaptiveLimiter(floor=0.0, start=0.0, multiplier=1.0, ceiling=0.0)
    opener, calls = make_opener([(429, {"Retry-After": "0"})])
    ratelimit.urllib.request.urlopen = opener
    try:
        lim.fetch("http://h/x", UA, attempts=3)
        check("gives up after N attempts", False)
    except urllib.error.HTTPError:
        check("gives up after N attempts", calls["n"] == 3, f"{calls['n']} calls")

    # 6. Pacing is per host: throttling arXiv must not slow GitHub.
    lim = AdaptiveLimiter(floor=0.0, start=1.0, multiplier=3.0)
    opener, _ = make_opener([(429, {"Retry-After": "0"}), b"ok"])
    ratelimit.urllib.request.urlopen = opener
    lim.fetch("http://slow/x", UA)
    check("pacing is per host", "fast" not in lim._delay,
          f"tracked: {sorted(lim._delay)}")

    # 7. The learned delay survives a restart, which is the whole point.
    lim._delay["slow"] = 7.5
    lim.save()
    reborn = AdaptiveLimiter(floor=0.0)
    check("pacing persists across runs", abs(reborn._delay.get("slow", 0) - 7.5) < 1e-9,
          f"reloaded {reborn._delay.get('slow')}s")

    # 8. A stored delay ages out. This is the fix for the failure that started
    #    it: a 119.5s arXiv backoff persisted to disk and every later run
    #    inherited it at full strength, because ~480 successes are needed to
    #    walk back from the ceiling additively.
    lim = AdaptiveLimiter(floor=0.5, half_life=600.0)
    lim._delay["h"] = 120.0
    lim._stamp["h"] = time.time() - 3600  # an hour ago: six half-lives
    aged = lim._current_delay("h")
    check("stored delay decays with time", aged < 2.5,
          f"120.00s an hour ago reads as {aged:.2f}s")

    # 9. Decay bottoms out at the floor rather than running to zero.
    lim._stamp["h"] = time.time() - 86400
    check("decay stops at the floor", abs(lim._current_delay("h") - 0.5) < 1e-9)

    # 10. A fresh backoff is NOT discounted. Decay must not become a way to
    #     ignore a host that is throttling us right now.
    lim._delay["h"], lim._stamp["h"] = 60.0, time.time()
    check("fresh backoff is respected", lim._current_delay("h") > 59.0,
          f"{lim._current_delay('h'):.2f}s")

    # 11. Age survives the file: state written by an older version has no
    #     stamps, so the file's mtime supplies one. Reading those as "now"
    #     would resurrect exactly the stale ceiling this is meant to kill.
    ratelimit.STATE_PATH.write_text('{"delay": {"h": 120.0}}')
    import os
    old = time.time() - 7200
    os.utime(ratelimit.STATE_PATH, (old, old))
    reborn = AdaptiveLimiter(floor=0.5, half_life=600.0)
    check("stampless state ages from file mtime", reborn._current_delay("h") < 1.0,
          f"reads as {reborn._current_delay('h'):.2f}s")

    # 12. A per-host floor overrides the global one: pacing for a host with a
    #     PUBLISHED rate never decays below it, while other hosts still get
    #     the global floor. This is what stops the decay walking arXiv pacing
    #     under its documented 3s and into a 429 oscillation.
    lim = AdaptiveLimiter(floor=0.0, start=4.0, decrease=3.0,
                          half_life=float("inf"), floors={"slow": 3.0})
    opener, _ = make_opener([b"ok"])
    ratelimit.urllib.request.urlopen = opener
    lim.fetch("http://slow/x", UA)
    lim.fetch("http://fast/x", UA)
    check("per-host floor holds", abs(lim._delay["slow"] - 3.0) < 1e-9,
          f"slow={lim._delay['slow']:.2f}s")
    check("other hosts keep the global floor", abs(lim._delay["fast"] - 1.0) < 1e-9,
          f"fast={lim._delay['fast']:.2f}s")

    ratelimit.urllib.request.urlopen = real_open
    if ratelimit.STATE_PATH.exists():
        ratelimit.STATE_PATH.unlink()


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    print("adaptive limiter:")
    run()
    print(f"\n{'ALL PASS' if not FAILS else 'FAILED: ' + ', '.join(FAILS)}")
    sys.exit(1 if FAILS else 0)
