"""Independent check of arXiv:2607.18186's Gaussian-moments counterexamples.

Exact rational arithmetic, no reliance on the paper's own algebra.

Moment facts used (both standard):
  * Z = (X1 + i X2)/sqrt2 a standard circular complex Gaussian, W = conj(Z):
        E(W^a Z^b) = delta_{ab} * a!
  * T a standard real Gaussian independent of Z:
        E(T^c) = (c-1)!! for even c, 0 for odd c
Monomials are keyed by exponent tuples and multiplied out exactly.
"""
from fractions import Fraction
from itertools import product
from math import factorial

# ---------- three-variable example (X1, X2 -> Z,W ; X3 -> T) ----------
# P3 = W + W*Z - T^2 - (3/2) Z T^2 - (1/2) Z^2 T^2 ,  Q3 = Z
# key = (aW, bZ, cT)
P3 = {
    (1, 0, 0): Fraction(1),
    (1, 1, 0): Fraction(1),
    (0, 0, 2): Fraction(-1),
    (0, 1, 2): Fraction(-3, 2),
    (0, 2, 2): Fraction(-1, 2),
}
Q3 = {(0, 1, 0): Fraction(1)}


def mul(a, b):
    out = {}
    for ka, va in a.items():
        for kb, vb in b.items():
            k = tuple(x + y for x, y in zip(ka, kb))
            out[k] = out.get(k, Fraction(0)) + va * vb
    return {k: v for k, v in out.items() if v}


def dfact(c):
    """E(T^c) for a standard real Gaussian."""
    if c % 2:
        return 0
    r = 1
    for i in range(1, c, 2):
        r *= i
    return r


def expect3(poly):
    tot = Fraction(0)
    for (aW, bZ, cT), v in poly.items():
        if aW != bZ:
            continue  # rotational invariance kills these
        tot += v * factorial(aW) * dfact(cT)
    return tot


print("three-variable example  P3 (5 terms, degree 4), Q3 = Z")
ok3 = True
for m in range(1, 11):
    Pm = {(0, 0, 0): Fraction(1)}
    for _ in range(m):
        Pm = mul(Pm, P3)
    e_p = expect3(Pm)
    e_qp = expect3(mul(Q3, Pm))
    good = (e_p == 0) and (e_qp == factorial(m))
    ok3 &= good
    print(f"  m={m:2d}  E(P^m)={e_p}   E(Q P^m)={e_qp}   (m! = {factorial(m)})  {'OK' if good else 'MISMATCH'}")

# ---------- four-variable example (Z1,W1,Z2,W2) ----------
# P4 = (1+Z2)(W1(1-Z1) + W2) ,  Q4 = Z2
# key = (aW1, bZ1, aW2, bZ2)
def poly(*terms):
    return {k: Fraction(c) for k, c in terms}


one_plus_Z2 = poly(((0, 0, 0, 0), 1), ((0, 0, 0, 1), 1))
inner = poly(((1, 0, 0, 0), 1), ((1, 1, 0, 0), -1), ((0, 0, 1, 0), 1))
P4 = mul(one_plus_Z2, inner)
Q4 = poly(((0, 0, 0, 1), 1))


def expect4(p):
    tot = Fraction(0)
    for (a1, b1, a2, b2), v in p.items():
        if a1 != b1 or a2 != b2:
            continue
        tot += v * factorial(a1) * factorial(a2)
    return tot


print("\nfour-variable example  P4 (6 terms, degree 3), Q4 = Z2")
ok4 = True
for m in range(1, 11):
    Pm = {(0, 0, 0, 0): Fraction(1)}
    for _ in range(m):
        Pm = mul(Pm, P4)
    e_p = expect4(Pm)
    e_qp = expect4(mul(Q4, Pm))
    good = (e_p == 0) and (e_qp == factorial(m))
    ok4 &= good
    print(f"  m={m:2d}  E(P^m)={e_p}   E(Q P^m)={e_qp}   (m! = {factorial(m)})  {'OK' if good else 'MISMATCH'}")

print(f"\nthree-variable claim reproduces: {ok3}")
print(f"four-variable claim reproduces:  {ok4}")
print(f"P3 term count: {len(P3)}  |  P4 term count: {len(P4)}")
print(f"P3 total degree: {max(sum(k) for k in P3)}  |  P4 total degree: {max(sum(k) for k in P4)}")
