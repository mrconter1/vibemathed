"""Independent reproduction of arXiv:2607.15305 (Niedbala Giraudin),
the counterexample to Thakur's conjecture on Carlitz-Wieferich primes.

Why this is worth doing: the author states plainly that he has no formal
mathematical training and cannot verify the mathematics directly, and that the
model supplied the domain knowledge and designed every computation. The claim
is a single explicit polynomial, so it reduces to a finite check that can be
redone from scratch.

Everything below is written from the definitions in the paper, from scratch,
with no computer-algebra dependency, so it shares no code with the author's
appendix. Two independent routes to the same claim are run:

  (A) the DEFINITION: rho_P(1) = 1 mod P^2, computed via the Carlitz recursion
      e_0 = 1, e_{k+1} = T*e_k + e_k^q inside F_q[T]/(P^2);
  (B) the CRITERION the paper cites from Bamunoba-Bergstrom: M_d(theta) = 0
      in F_q[T]/(P), via the nested form of M_5.

If the paper is right both must hold. If they disagree, one of the two is
wrong and the entry needs a flag either way.

  q = 19^3, F_q = F_19[c] with c^3 = 8c^2 + 4c + 11
  P(T) = T^5 + (11+17c+9c^2)T^4 + (3+7c+18c^2)T^3 + (2+5c+6c^2)T^2
             + (3+3c+11c^2)T + (6+17c+5c^2)
"""

import sys

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

p = 19
# c^3 = 8c^2 + 4c + 11, so the reduction rule for c^3 in the basis 1, c, c^2.
C3 = (11, 4, 8)
q = p ** 3

ZERO = (0, 0, 0)
ONE = (1, 0, 0)


# ---------------------------------------------------------------- F_q = F_19[c]
def fadd(a, b):
    return ((a[0] + b[0]) % p, (a[1] + b[1]) % p, (a[2] + b[2]) % p)


def fsub(a, b):
    return ((a[0] - b[0]) % p, (a[1] - b[1]) % p, (a[2] - b[2]) % p)


def fmul(a, b):
    # Schoolbook to degree 4, then fold c^3 and c^4 back down.
    r = [0] * 5
    for i in range(3):
        if a[i]:
            for j in range(3):
                r[i + j] = (r[i + j] + a[i] * b[j]) % p
    # c^4 = c * c^3
    c4 = [0, 0, 0]
    for i in range(3):
        c4[i] = C3[i]
    # multiply (C3 as poly) by c
    hi = c4[2]
    c4 = [0, c4[0], c4[1]]
    c4 = [(c4[0] + hi * C3[0]) % p, (c4[1] + hi * C3[1]) % p, (c4[2] + hi * C3[2]) % p]
    out = [r[0], r[1], r[2]]
    for i in range(3):
        out[i] = (out[i] + r[3] * C3[i] + r[4] * c4[i]) % p
    return (out[0], out[1], out[2])


def fpow(a, n):
    r, b = ONE, a
    while n:
        if n & 1:
            r = fmul(r, b)
        b = fmul(b, b)
        n >>= 1
    return r


def finv(a):
    assert a != ZERO
    return fpow(a, q - 2)


# --------------------------------------------------------------- F_q[T] polys
def pnorm(f):
    while f and f[-1] == ZERO:
        f.pop()
    return f


def padd(f, g):
    n = max(len(f), len(g))
    return pnorm([fadd(f[i] if i < len(f) else ZERO, g[i] if i < len(g) else ZERO)
                  for i in range(n)])


def psub(f, g):
    n = max(len(f), len(g))
    return pnorm([fsub(f[i] if i < len(f) else ZERO, g[i] if i < len(g) else ZERO)
                  for i in range(n)])


def pmul(f, g):
    if not f or not g:
        return []
    r = [ZERO] * (len(f) + len(g) - 1)
    for i, a in enumerate(f):
        if a == ZERO:
            continue
        for j, b in enumerate(g):
            if b == ZERO:
                continue
            r[i + j] = fadd(r[i + j], fmul(a, b))
    return pnorm(r)


def pdivmod(f, g):
    f = f[:]
    dg = len(g) - 1
    inv = finv(g[-1])
    quo = [ZERO] * max(0, len(f) - dg)
    while len(f) - 1 >= dg and f:
        shift = len(f) - 1 - dg
        coef = fmul(f[-1], inv)
        quo[shift] = coef
        for i, b in enumerate(g):
            f[shift + i] = fsub(f[shift + i], fmul(coef, b))
        pnorm(f)
    return pnorm(quo), f


def pmod(f, g):
    return pdivmod(f, g)[1]


def pgcd(f, g):
    f, g = f[:], g[:]
    while g:
        f, g = g, pmod(f, g)
    if f:
        inv = finv(f[-1])
        f = [fmul(x, inv) for x in f]
    return f


def pmulmod(f, g, m):
    return pmod(pmul(f, g), m)


def ppowmod(f, n, m):
    r, b = [ONE], pmod(f, m)
    while n:
        if n & 1:
            r = pmulmod(r, b, m)
        b = pmulmod(b, b, m)
        n >>= 1
    return r


def pstr(f):
    return " + ".join(f"{c}*T^{i}" for i, c in enumerate(f) if c != ZERO) or "0"


# ------------------------------------------------------------------- the data
def e(a0, a1, a2):
    return (a0 % p, a1 % p, a2 % p)


P = [e(6, 17, 5), e(3, 3, 11), e(2, 5, 6), e(3, 7, 18), e(11, 17, 9), ONE]
T = [ZERO, ONE]
d = len(P) - 1

results = {}
print(f"q = 19^3 = {q},  deg P = {d},  p = {p},  p | d ? {d % p == 0}")
print()

# ---- 0. F_q is a field: x^3 - 8x^2 - 4x - 11 irreducible over F_19 ----------
# Degree 3, so irreducible iff it has no root in F_19.
roots = [x for x in range(p) if (x * x * x - 8 * x * x - 4 * x - 11) % p == 0]
results["F_q is a field"] = not roots
print(f"[0] c^3 - 8c^2 - 4c - 11 has no root in F_19: {not roots}  (roots found: {roots})")

# ---- 1. P is monic, degree 5, and genuinely over the cubic extension -------
monic = P[-1] == ONE
over_prime_field = all(c[1] == 0 and c[2] == 0 for c in P)
results["P monic of degree 5"] = monic and d == 5
results["P not defined over F_19"] = not over_prime_field
print(f"[1] P monic of degree 5: {monic and d == 5};  uses the extension: {not over_prime_field}")

# ---- 2. P is irreducible over F_q ------------------------------------------
# deg 5 with 5 prime: irreducible iff T^(q^5) = T mod P and gcd(T^q - T, P) = 1.
tq = ppowmod(T, q, P)
step = tq
for _ in range(d - 1):
    # compose: apply Frobenius again, i.e. substitute T -> tq
    acc = []
    powr = [ONE]
    for coef in step:
        if coef != ZERO:
            acc = padd(acc, pmul([coef], powr))
        powr = pmulmod(powr, tq, P)
    step = pmod(acc, P)
full = step == pmod(T, P)
nontrivial = pgcd(psub(tq, T), P) == [ONE]
results["P irreducible over F_q"] = full and nontrivial
print(f"[2] T^(q^5) = T mod P: {full};  gcd(T^q - T, P) = 1: {nontrivial}"
      f"  ->  P irreducible: {full and nontrivial}")

# ---- 3. (A) THE DEFINITION: rho_P(1) = 1 mod P^2 ---------------------------
P2 = pmul(P, P)
tq2 = ppowmod(T, q, P2)
# Frobenius x -> x^q is a ring endomorphism of F_q[T]/(P^2) fixing F_q,
# so (sum a_i T^i)^q = sum a_i (T^q)^i.
tqpow = [[ONE]]
for _ in range(len(P2) - 2):
    tqpow.append(pmulmod(tqpow[-1], tq2, P2))


def frob(u):
    acc = []
    for i, coef in enumerate(u):
        if coef != ZERO:
            acc = padd(acc, pmul([coef], tqpow[i]))
    return pmod(acc, P2)


ek = [ONE]                      # e_0 = 1
es = [ek]
for _ in range(d):
    ek = padd(pmulmod(T, ek, P2), frob(ek))
    es.append(ek)
rho = []
for i, coef in enumerate(P):    # rho_P(1) = sum p_i e_i
    if coef != ZERO:
        rho = padd(rho, pmul([coef], es[i]))
rho = pmod(rho, P2)
defn_ok = psub(rho, [ONE]) == []
results["(A) rho_P(1) = 1 mod P^2"] = defn_ok
print(f"[3] (A) definition   rho_P(1) - 1 mod P^2 = {pstr(psub(rho, [ONE]))}  ->  {defn_ok}")

# ---- 4. (B) THE CITED CRITERION: M_5(theta) = 0 ----------------------------
# y_j = theta^(q^j) - theta in F_q[T]/(P); nested form
# M_5(theta) = 1 - y_4(1 - y_3(1 - y_2(1 - y_1))).
th_pow = pmod(T, P)
ys = []
for _ in range(d - 1):
    th_pow = ppowmod(th_pow, q, P)
    ys.append(psub(th_pow, pmod(T, P)))
acc = [ONE]
for y in reversed(ys):          # y_4 outermost
    acc = psub([ONE], pmulmod(y, acc, P))
# acc currently equals 1 - y_1(...) with an extra outer layer; rebuild exactly:
inner = [ONE]
for j in range(len(ys)):        # y_1 innermost
    inner = psub([ONE], pmulmod(ys[j], inner, P))
crit_ok = inner == []
results["(B) M_5(theta) = 0"] = crit_ok
print(f"[4] (B) BB criterion M_5(theta) = {pstr(inner)}  ->  {crit_ok}")

# ---- 5. mu(X) | X + X^q + ... + X^(q^4), which gives G | [5] ---------------
# Work in F_19[X]/(mu); all coefficients stay in the prime field.
mu = [(-9) % p, (-4) % p, 3, 5, 0, 1]


def mmul(a, b):
    r = [0] * (len(a) + len(b) - 1)
    for i, x in enumerate(a):
        if x:
            for j, y in enumerate(b):
                r[i + j] = (r[i + j] + x * y) % p
    while len(r) > 1 and r[-1] == 0:
        r.pop()
    # reduce mod mu (monic, degree 5)
    while len(r) > 5:
        c = r[-1]
        sh = len(r) - 6
        for i in range(5):
            r[sh + i] = (r[sh + i] - c * mu[i]) % p
        r.pop()
        while len(r) > 1 and r[-1] == 0:
            r.pop()
    return r


def mpow(a, n):
    r, b = [1], a
    while n:
        if n & 1:
            r = mmul(r, b)
        b = mmul(b, b)
        n >>= 1
    return r


tot = [0, 1]                          # X
cur = [0, 1]
for _ in range(4):
    cur = mpow(cur, q)                # X^(q^i)
    tot = [(tot[i] if i < len(tot) else 0) + (cur[i] if i < len(cur) else 0)
           for i in range(max(len(tot), len(cur)))]
    tot = [x % p for x in tot]
    while len(tot) > 1 and tot[-1] == 0:
        tot.pop()
mu_ok = tot == [0]
results["mu | sum X^(q^i), so G | [5]"] = mu_ok
print(f"[5] (X + X^q + ... + X^(q^4)) mod mu = {tot}  ->  mu divides it: {mu_ok}")

print()
print("=" * 72)
allok = all(results.values())
for k, v in results.items():
    print(f"  {'PASS' if v else 'FAIL'}  {k}")
print("=" * 72)
print("REPRODUCED" if allok else "NOT REPRODUCED - at least one check failed")
