"""Numerical checks of the stated theorems in arXiv:2608.17802,
"Fourth-Moment Geometry of Rademacher Sums" (Gao and Qian).

Nothing here checks a proof. Each theorem in that paper is an inequality
between quantities that are finite sums and one-dimensional integrals, so the
statements can be evaluated directly and hunted for counterexamples. A pass
means the claims survive search; it does not mean they are proved.

Three claims are tested.

  Theorem 1.1 (corrected Jakimiuk Conjecture 1). With sum a_i^2 = 1,
  S = sum a_i eps_i, q = sum a_i^4, mu_p = E|G|^p:

      E|S|^p  <=  mu_p - (mu_p - 1) q          for p >= 4.

  Proposition 4.3 (the counterexample). The same inequality FAILS at
  S_2 = (eps_1 + eps_2)/sqrt(2) for every 2 < p < 4, which is what makes
  Jakimiuk's originally conjectured range p >= 3 wrong. For that vector
  q = 1/2 and E|S|^p = 2^(p/2 - 1), so the inequality reduces to
  2^(p/2) <= mu_p + 1, with equality exactly at p = 2 and p = 4.

  Theorem 1.3 (BMNO flat-point conjecture, strong form). For real p >= 5 and
  n >= 1, x -> ||x + S_n||_p / ||x + S_n||_4 is strictly decreasing on
  [1, inf), where S_n is a sum of n unweighted Rademacher signs. The
  supremum over x >= 1 is therefore at x = 1, which is BMNO's conjecture.

Run: python scripts/check_rademacher.py
"""

import itertools
import math
import random
from math import comb, gamma, lgamma, sqrt


def mu(p: float) -> float:
    """E|G|^p for standard Gaussian G."""
    return 2.0 ** (p / 2.0) * gamma((p + 1.0) / 2.0) / sqrt(math.pi)


def rademacher_moment(a: list[float], p: float) -> float:
    """E|sum a_i eps_i|^p by exact enumeration of the 2^n sign patterns."""
    n = len(a)
    total = 0.0
    for signs in itertools.product((1.0, -1.0), repeat=n):
        s = sum(ai * si for ai, si in zip(a, signs))
        total += abs(s) ** p
    return total / (2.0**n)


def shifted_moment(x: float, n: int, p: float) -> float:
    """E|x + S_n|^p where S_n is a sum of n unweighted Rademacher signs."""
    total = 0.0
    for k in range(n + 1):
        total += comb(n, k) * abs(x + (n - 2 * k)) ** p
    return total / (2.0**n)


def check_theorem_11() -> int:
    """E|S|^p <= mu_p - (mu_p - 1) sum a_i^4 for p >= 4. Hunt for failures."""
    print("Theorem 1.1: E|S|^p <= mu_p - (mu_p - 1)q, p >= 4")
    rng = random.Random(20260819)
    worst = None
    fails = 0
    tested = 0
    ps = [4.0, 4.0001, 4.25, 4.5, 4.75, 5.0, 5.5, 6.0, 7.0, 8.5, 10.0, 13.0]
    for p in ps:
        m = mu(p)
        vectors: list[list[float]] = []
        # Flat vectors of every length: the conjectured extremal family.
        for n in range(1, 15):
            vectors.append([1.0 / sqrt(n)] * n)
        # One spike plus a flat sea, which the paper says is extremal at
        # fixed fourth moment.
        for n in range(2, 13):
            for w in (0.1, 0.3, 0.5, 0.7, 0.9, 0.98):
                rest = sqrt((1.0 - w * w) / (n - 1))
                vectors.append([w] + [rest] * (n - 1))
        # Random vectors, including very sparse and very spread ones.
        for _ in range(1500):
            n = rng.randint(1, 13)
            v = [rng.random() ** rng.choice([0.3, 1.0, 4.0]) for _ in range(n)]
            norm = sqrt(sum(t * t for t in v))
            if norm == 0.0:
                continue
            vectors.append([t / norm for t in v])
        for a in vectors:
            q = sum(t**4 for t in a)
            lhs = rademacher_moment(a, p)
            rhs = m - (m - 1.0) * q
            slack = rhs - lhs
            tested += 1
            # Scale-relative tolerance: these moments reach ~10^5 at p = 13.
            if slack < -1e-9 * max(1.0, abs(rhs)):
                fails += 1
                if worst is None or slack < worst[0]:
                    worst = (slack, p, a)
    print(f"  {tested} vectors tested, {fails} violations")
    if worst:
        print(f"  worst: slack={worst[0]:.3e} at p={worst[1]} a={worst[2]}")
    # Equality case the paper states: q = 1 (a single unit coefficient).
    for p in ps:
        lhs = rademacher_moment([1.0], p)
        rhs = mu(p) - (mu(p) - 1.0) * 1.0
        assert abs(lhs - rhs) < 1e-9, (p, lhs, rhs)
    print("  equality at q = 1 (single coefficient) holds exactly")
    return fails


def check_prop_43() -> int:
    """The chord inequality must fail on (2,4) and hold at 4, for S_2."""
    print("Proposition 4.3: failure of the p >= 3 range at S_2")
    bad = 0
    for p in [2.05, 2.25, 2.5, 2.75, 3.0, 3.25, 3.5, 3.75, 3.95, 3.999]:
        lhs = 2.0 ** (p / 2.0 - 1.0)  # E|S_2|^p
        rhs = mu(p) - (mu(p) - 1.0) * 0.5  # q = 1/2
        if not lhs > rhs:
            bad += 1
            print(f"  p={p}: expected failure but lhs={lhs:.6f} <= rhs={rhs:.6f}")
    print(f"  inequality fails for every tested p in (2,4): {bad == 0}")
    for p in (2.0, 4.0):
        lhs = 2.0 ** (p / 2.0 - 1.0)
        rhs = mu(p) - (mu(p) - 1.0) * 0.5
        print(f"  p={p}: lhs={lhs:.10f} rhs={rhs:.10f} (endpoint equality)")
        if abs(lhs - rhs) > 1e-9:
            bad += 1
    # Direct enumeration agrees with the closed form used above.
    for p in (2.5, 3.0, 3.7):
        direct = rademacher_moment([1 / sqrt(2), 1 / sqrt(2)], p)
        assert abs(direct - 2.0 ** (p / 2.0 - 1.0)) < 1e-12, p
    return bad


def check_theorem_13() -> int:
    """x -> ||x+S_n||_p / ||x+S_n||_4 strictly decreasing on [1,inf), p >= 5."""
    print("Theorem 1.3: strict monotonicity of the L_p/L_4 ratio")
    bad = 0
    checked = 0
    for p in [5.0, 5.001, 5.5, 6.0, 7.0, 9.0, 12.0, 20.0]:
        for n in range(1, 11):
            xs = [1.0 + 0.05 * i for i in range(0, 400)]
            prev = None
            for x in xs:
                num = shifted_moment(x, n, p) ** (1.0 / p)
                den = shifted_moment(x, n, 4.0) ** 0.25
                r = num / den
                if prev is not None and r > prev + 1e-12:
                    bad += 1
                    print(f"  p={p} n={n} x={x}: ratio rose {prev:.12f} -> {r:.12f}")
                prev = r
                checked += 1
    print(f"  {checked} ratio evaluations, {bad} increases")
    # And below p = 5 the paper claims nothing; record where it first breaks,
    # as a check that the p >= 5 threshold is not decorative.
    for p in (4.0, 4.2, 4.5, 4.8):
        rose = False
        for n in range(1, 9):
            prev = None
            for i in range(0, 300):
                x = 1.0 + 0.05 * i
                r = shifted_moment(x, n, p) ** (1.0 / p) / shifted_moment(x, n, 4.0) ** 0.25
                if prev is not None and r > prev + 1e-12:
                    rose = True
                prev = r
        print(f"  p={p}: monotonicity {'FAILS somewhere' if rose else 'still holds'}")
    return bad


def main() -> None:
    f1 = check_theorem_11()
    print()
    f2 = check_prop_43()
    print()
    f3 = check_theorem_13()
    print()
    print(f"total violations: T1.1={f1}, P4.3={f2}, T1.3={f3}")


if __name__ == "__main__":
    main()
