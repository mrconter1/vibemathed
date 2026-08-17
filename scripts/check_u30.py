# Independent check of the U_30 fifth-order autocorrelation classification.
#
# Claim under test (entry + Corollary cor:u30-intro): for rational f,g on C_30
# with exact Fourier support U_30, after translation there are a in Q(z30)^x and
# z in Q(z6)^x with z*conj(z)=1 such that
#     fhat(u) = sigma_u(a),   ghat(u) = sigma_u(z*a)   for all u in U_30,
# every such pair is rational-valued and agrees through order five, and the
# sixth-order data agree exactly when z^6 = 1.
#
# Two things are checked here, both from scratch:
#   1. rationality of the inverse transforms;
#   2. the order-by-order agreement, via the standard reduction that m-th order
#      autocorrelation data is equivalent to the products fhat(u_1)...fhat(u_m)
#      over zero-sum tuples. Since ghat/fhat = sigma_u(z), agreement at order m
#      is exactly  prod_i sigma_{u_i}(z) = 1  on every zero-sum tuple of U_30^m.
#      That reduction is verified directly against brute-force autocorrelations
#      at orders 2 and 3 before it is trusted at orders 4-6.
from itertools import product
from fractions import Fraction
import mpmath as mp

mp.mp.dps = 60
N = 30
U = [u for u in range(N) if mp.mpf(1) and __import__("math").gcd(u, N) == 1]
zeta = lambda k: mp.e ** (2j * mp.pi * k / N)


def sigma(poly, u):
    """Apply sigma_u: zeta_30 -> zeta_30^u, to sum(c * zeta^e)."""
    return sum(mp.mpf(c) * zeta((e * u) % N) for e, c in poly.items())


# alpha: a primitive-ish element of Q(zeta_30), chosen with no special structure.
ALPHA = {0: 1, 1: 2, 7: 3, 11: -1}

# z = w / conj(w) with w in Q(zeta_6): Hilbert 90 gives every norm-one element
# this way, and zeta_6 = zeta_30^5 so w lives on exponents that are multiples of 5.
W = {0: 2, 5: 3}
WBAR = {(-e) % N: c for e, c in W.items()}


def sig_z(u):
    return sigma(W, u) / sigma(WBAR, u)


def fhat(u):
    return sigma(ALPHA, u)


def ghat(u):
    return sig_z(u) * fhat(u)


def inverse(hat):
    """f(x) = (1/30) sum_{u in U} hat(u) zeta^{ux}."""
    return [sum(hat(u) * zeta((u * x) % N) for u in U) / N for x in range(N)]


def as_rational(v, tol=mp.mpf(10) ** -40):
    """Recognise a high-precision real as a rational with modest denominator."""
    if abs(mp.im(v)) > tol:
        return None
    r = mp.re(v)
    for den in range(1, 4000):
        num = mp.nint(r * den)
        if abs(r - num / den) < tol:
            return Fraction(int(num), den)
    return None


def autocorr(f, m):
    """Full m-th order autocorrelation tensor: m factors, m-1 free shifts."""
    out = {}
    for xs in product(range(N), repeat=m - 1):
        out[xs] = sum(
            f[t] * mp.fprod([f[(t + x) % N] for x in xs]) for t in range(N)
        )
    return out


def zero_sum_agrees(m):
    """prod_i sigma_{u_i}(z) == 1 on every zero-sum tuple of U^m ?"""
    worst = mp.mpf(0)
    for us in product(U, repeat=m):
        if sum(us) % N:
            continue
        worst = max(worst, abs(mp.fprod([sig_z(u) for u in us]) - 1))
    return worst


print("U_30 =", U, " (phi(30) =", len(U), ")")
zpow6 = mp.fprod([sig_z(1)] * 6)
print("z (as sigma_1) =", mp.nstr(sig_z(1), 12), " |z| =", mp.nstr(abs(sig_z(1)), 12))
print("z^6 =", mp.nstr(zpow6, 12), " -> z^6 == 1 ?", abs(zpow6 - 1) < mp.mpf(10) ** -40)
print()

f = inverse(fhat)
g = inverse(ghat)
print("--- rationality of the inverse transforms")
fr = [as_rational(v) for v in f]
gr = [as_rational(v) for v in g]
print("  f rational at all 30 points:", all(x is not None for x in fr))
print("  g rational at all 30 points:", all(x is not None for x in gr))
print("  f =", [str(x) for x in fr[:6]], "...")
print("  g =", [str(x) for x in gr[:6]], "...")
print("  f == g pointwise?", all(abs(a - b) < mp.mpf(10) ** -40 for a, b in zip(f, g)))
print()

print("--- support is exactly U_30 (no accidental vanishing)")
print("  min |fhat(u)| over U:", mp.nstr(min(abs(fhat(u)) for u in U), 8))
print("  min |ghat(u)| over U:", mp.nstr(min(abs(ghat(u)) for u in U), 8))
print()

print("--- cross-check: brute-force autocorrelation vs the zero-sum criterion")
for m in (2, 3):
    af, ag = autocorr(f, m), autocorr(g, m)
    brute = max(abs(af[k] - ag[k]) for k in af)
    print(f"  order {m}: brute-force max|A_f - A_g| = {mp.nstr(brute, 8)}"
          f"   zero-sum defect = {mp.nstr(zero_sum_agrees(m), 8)}")
print()

print("--- order-by-order, via the zero-sum criterion")
for m in range(1, 7):
    d = zero_sum_agrees(m)
    print(f"  order {m}: max |prod sigma_u(z) - 1| = {mp.nstr(d, 8)}"
          f"   -> {'agree' if d < mp.mpf(10) ** -40 else 'DIFFER'}")
print()

print("--- the z^6 = 1 boundary: same test with z a primitive 6th root of unity")
_orig = W.copy()
globals()["W"] = {5: 1}          # w = zeta_6  =>  z = w/wbar = zeta_6^2, z^6 = 1
globals()["WBAR"] = {(-5) % N: 1}
z6 = mp.fprod([sig_z(1)] * 6)
print("  z^6 == 1 ?", abs(z6 - 1) < mp.mpf(10) ** -40)
for m in (5, 6):
    d = zero_sum_agrees(m)
    print(f"  order {m}: defect = {mp.nstr(d, 8)}"
          f"   -> {'agree' if d < mp.mpf(10) ** -40 else 'DIFFER'}")
