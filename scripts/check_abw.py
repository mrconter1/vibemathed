# Does the claimed classification actually contain Agulnick-Busick-Warner's own
# published example? If their pair failed to fit the form, the "complete
# classification" would be refuted by the very example it claims to generalize.
#
# Their pair, transcribed from arXiv:2604.13310 main.tex (the display just above
# the conjecture at line 311).
from math import gcd
import mpmath as mp

mp.mp.dps = 50
N = 30
U = [u for u in range(N) if gcd(u, N) == 1]
zeta = lambda k: mp.e ** (2j * mp.pi * k / N)

f = [56, -7, 7, 14, 7, 28, -14, -7, 7, 14, -28, -7, -14, -7, 7,
     -56, 7, -7, -14, -7, -28, 14, 7, -7, -14, 28, 7, 14, 7, -7]
g = [52, -2, 11, 13, 2, 44, -13, -2, 11, 13, -8, -11, -13, -2, 11,
     -52, 2, -11, -13, -2, -44, 13, 2, -11, -13, 8, 11, 13, 2, -11]
assert len(f) == len(g) == 30

hat = lambda s, u: sum(s[x] * zeta((-u * x) % N) for x in range(N))
TOL = mp.mpf(10) ** -30

print("--- support")
offs = [u for u in range(N) if u not in U and abs(hat(f, u)) > TOL]
offg = [u for u in range(N) if u not in U and abs(hat(g, u)) > TOL]
print("  f: nonzero off U_30:", offs, "| min |fhat| on U_30:",
      mp.nstr(min(abs(hat(f, u)) for u in U), 8))
print("  g: nonzero off U_30:", offg, "| min |ghat| on U_30:",
      mp.nstr(min(abs(hat(g, u)) for u in U), 8))
print("  exact support U_30 for both:", not offs and not offg)

r = {u: hat(g, u) / hat(f, u) for u in U}
z = r[1]
print("\n--- the ratio r(u) = ghat(u)/fhat(u)")
print("  z := r(1) =", mp.nstr(z, 12), "   |z| =", mp.nstr(abs(z), 12))
print("  |z| == 1 (norm-one) ?", abs(abs(z) - 1) < TOL)

# Galois action on Q(zeta_6) factors through u mod 6: identity on u=1, complex
# conjugation on u=5. So the classification predicts r(u)=z or zbar accordingly.
print("\n--- is r Galois-equivariant of the form sigma_u(z), z in Q(zeta_6)?")
ok = True
for u in U:
    pred = z if u % 6 == 1 else mp.conj(z)
    d = abs(r[u] - pred)
    ok &= d < TOL
    print(f"    u={u:2d}  u mod 6 = {u % 6}   r(u) = {mp.nstr(r[u], 10):>28}"
          f"   matches {'z   ' if u % 6 == 1 else 'zbar'}: {d < TOL}")
print("  all eight match:", ok)

print("\n--- z in Q(zeta_6)?  (z = (a+b*zeta_6)/(c+d*zeta_6) has degree <= 2)")
# z lies in the quadratic field Q(sqrt(-3)); test that z + zbar is rational.
tr = z + mp.conj(z)
print("  z + zbar =", mp.nstr(mp.re(tr), 20), " (rational trace => z is quadratic)")
print("  z*zbar   =", mp.nstr(mp.re(z * mp.conj(z)), 20))

print("\n--- order-by-order agreement, zero-sum criterion")
from itertools import product
for m in range(1, 7):
    worst = mp.mpf(0)
    for us in product(U, repeat=m):
        if sum(us) % N:
            continue
        worst = max(worst, abs(mp.fprod([r[u] for u in us]) - 1))
    print(f"  order {m}: max |prod r(u_i) - 1| = {mp.nstr(worst, 8)}"
          f"   -> {'agree' if worst < TOL else 'DIFFER'}")

z6 = z ** 6
print("\n  z^6 =", mp.nstr(z6, 12), "  z^6 == 1 ?", abs(z6 - 1) < TOL,
      "  (theorem: order-6 data agree iff z^6 = 1)")
