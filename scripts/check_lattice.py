# Tests the COMPLETENESS side, which the example check cannot reach.
#
# If g/f has Fourier ratio r(u) on the exact support U_30, then agreement of the
# m-th order data forces  prod_i r(u_i) = 1  for every zero-sum tuple of length m.
# Taking logs, the admissible r form Hom(Z^{U_30} / L_m, C^x), where L_m is the
# lattice spanned by the exponent vectors of all zero-sum multisets of size <= m.
#
# The classification predicts, sharply:
#   through order 5 -> a positive-rank (torus) ambiguity survives;
#   through order 6 -> the rank drops to 0 and exactly a mu_6 of torsion is left,
#                      matching "translation-equivalent exactly modulo mu_6" and
#                      "sixth-order data agree exactly when z^6 = 1".
# A rank that failed to drop, or torsion of the wrong order, would refute it.
from itertools import combinations_with_replacement
from math import gcd
from sympy import Matrix, ZZ
from sympy.matrices.normalforms import smith_normal_form

N = 30
U = [u for u in range(N) if gcd(u, N) == 1]
idx = {u: i for i, u in enumerate(U)}


def lattice_upto(m_max):
    """Exponent vectors of zero-sum multisets of U_30 of size 1..m_max."""
    rows = []
    for m in range(1, m_max + 1):
        for ms in combinations_with_replacement(U, m):
            if sum(ms) % N == 0:
                v = [0] * len(U)
                for u in ms:
                    v[idx[u]] += 1
                rows.append(v)
    return rows


def structure(rows):
    """Invariant factors of Z^8 / L, as (free rank, torsion orders)."""
    if not rows:
        return len(U), []
    S = smith_normal_form(Matrix(rows), domain=ZZ)
    diag = [S[i, i] for i in range(min(S.shape))]
    nz = [abs(int(d)) for d in diag if d != 0]
    rank = len(U) - len(nz)
    torsion = [d for d in nz if d != 1]
    return rank, torsion


print(f"U_30 = {U}   (rank of ambient lattice = {len(U)})\n")
print(" orders kept | #zero-sum gens | free rank of Z^8/L | torsion")
print(" " + "-" * 66)
prev = None
for m in range(1, 8):
    rows = lattice_upto(m)
    rank, tors = structure(rows)
    note = ""
    if prev is not None and rank < prev:
        note = "   <- rank drops here"
    prev = rank
    print(f"   1..{m}      |{len(rows):11d}     |{rank:14d}      | {tors}{note}")

print()
print("Reading the prediction off the table:")
r5, t5 = structure(lattice_upto(5))
r6, t6 = structure(lattice_upto(6))
print(f"  through order 5: free rank {r5}, torsion {t5}")
print(f"  through order 6: free rank {r6}, torsion {t6}")
print()
print(f"  rank>0 at order 5 (a torus of ambiguity survives)?  {r5 > 0}")
print(f"  rank==0 at order 6 (torus collapses)?               {r6 == 0}")
print(f"  torsion at order 6 is exactly one factor of 6?      {t6 == [6]}")
