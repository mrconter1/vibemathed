# Independent check of arXiv:2608.05781 (Bevins and Bidav, "Symmetry-guided
# constructions of absolutely maximally entangled states in five open cases").
#
# The paper's whole logical content is a certificate: three printed matrices A
# over F_{q^2}, and two checks on each,
#
#     A conj(A)^T = -I_k        (Hermitian self-duality of rowspace[I_k | A])
#     det A[R,C] != 0           for every square submatrix (MDS)
#
# from which the stabilizer construction gives AME(2k, q) and projection gives
# AME(2k-1, q). That is fully re-runnable, so it is re-run here from the
# printed matrices and the printed field conventions - own field arithmetic,
# own determinant, nothing from the authors' code.
from itertools import combinations

# ---------------------------------------------------------------- F_{p^2}
class GF2:
    """F_{p^2} = F_p(t) with t^2 = c1*t + c0, elements as (a, b) = a + b*t."""

    def __init__(self, p, c1, c0):
        self.p, self.c1, self.c0 = p, c1 % p, c0 % p

    def add(self, x, y):
        return ((x[0] + y[0]) % self.p, (x[1] + y[1]) % self.p)

    def neg(self, x):
        return ((-x[0]) % self.p, (-x[1]) % self.p)

    def mul(self, x, y):
        p = self.p
        a, b = x
        c, d = y
        # (a+bt)(c+dt) = ac + (ad+bc)t + bd t^2, t^2 = c1 t + c0
        lo = (a * c + b * d * self.c0) % p
        hi = (a * d + b * c + b * d * self.c1) % p
        return (lo, hi)

    def inv(self, x):
        # brute force is fine at these sizes and cannot be got subtly wrong
        for a in range(self.p):
            for b in range(self.p):
                if self.mul(x, (a, b)) == (1, 0):
                    return (a, b)
        raise ZeroDivisionError(x)

    def conj(self, x):
        """Frobenius y -> y^p, the nontrivial F_{p^2}/F_p involution."""
        # t^p is the other root of the minimal polynomial: t' = c1 - t
        # (sum of roots = c1), so (a + b t)^p = a + b(c1 - t).
        p = self.p
        a, b = x
        return ((a + b * self.c1) % p, (-b) % p)

    zero = (0, 0)
    one = (1, 0)


def det(F, M):
    """Determinant by Gaussian elimination over F."""
    n = len(M)
    M = [row[:] for row in M]
    d = F.one
    for col in range(n):
        piv = next((r for r in range(col, n) if M[r][col] != F.zero), None)
        if piv is None:
            return F.zero
        if piv != col:
            M[col], M[piv] = M[piv], M[col]
            d = F.neg(d)
        d = F.mul(d, M[col][col])
        inv = F.inv(M[col][col])
        for r in range(col + 1, n):
            if M[r][col] == F.zero:
                continue
            f = F.mul(M[r][col], inv)
            for c in range(col, n):
                M[r][c] = F.add(M[r][c], F.neg(F.mul(f, M[col][c])))
    return d


def check(name, F, A, expect_minors):
    k = len(A)
    print(f"\n--- {name}: {k}x{k} over F_{F.p}^2")

    # 1. sanity on the field itself
    assert F.conj(F.conj((3, 4))) == (3, 4), "Frobenius is not an involution"
    for x in [(1, 1), (2, 3), (0, 1)]:
        norm = F.mul(x, F.conj(x))
        assert norm[1] == 0, f"norm of {x} left the base field: {norm}"
    print("  field ok: Frobenius is an involution, norms land in F_p")

    # 2. A conj(A)^T = -I
    ok = True
    negI = [[F.neg(F.one) if i == j else F.zero for j in range(k)] for i in range(k)]
    for i in range(k):
        for j in range(k):
            s = F.zero
            for m in range(k):
                s = F.add(s, F.mul(A[i][m], F.conj(A[j][m])))
            if s != negI[i][j]:
                ok = False
                print(f"    MISMATCH at ({i},{j}): {s} != {negI[i][j]}")
    print(f"  A conj(A)^T = -I_{k}: {ok}")

    # 3. every nonempty square minor nonzero
    bad, total = [], 0
    for s in range(1, k + 1):
        for R in combinations(range(k), s):
            for C in combinations(range(k), s):
                total += 1
                if det(F, [[A[r][c] for c in C] for r in R]) == F.zero:
                    bad.append((R, C))
    print(f"  square minors checked: {total} (paper says {expect_minors})"
          f"   all nonzero: {not bad}")
    if bad:
        print(f"    VANISHING MINORS: {bad[:5]}")
    return ok and not bad and total == expect_minors


# ------------------------------------------------------------------ q = 5
# F_25 = F_5(alpha), alpha^2 + alpha + 2 = 0  ->  alpha^2 = -alpha - 2
F5 = GF2(5, c1=-1, c0=-2)
# printed as integers, "encode a + 5b as a + b*alpha"
A5_int = [
    [1, 1, 1, 1, 1, 2],
    [23, 1, 2, 3, 5, 3],
    [19, 7, 1, 22, 17, 12],
    [9, 15, 11, 2, 18, 15],
    [1, 4, 22, 9, 2, 1],
    [6, 7, 18, 15, 10, 2],
]
A5 = [[(n % 5, n // 5) for n in row] for row in A5_int]

# ----------------------------------------------------------------- q = 11
# F_121 = F_11(gamma), gamma^2 = -1
F11 = GF2(11, c1=0, c0=-1)
K11 = [
    [(4, 8), (10, 3), (9, 10)],
    [(8, 10), (0, 8), (8, 10)],
    [(9, 10), (10, 3), (4, 8)],
]

# ----------------------------------------------------------------- q = 13
# F_169 = F_13(beta), beta^2 + beta + 2 = 0
F13 = GF2(13, c1=-1, c0=-2)
K13 = [
    [(6, 12), (9, 9), (1, 7)],
    [(1, 10), (11, 7), (0, 5)],
    [(8, 12), (6, 9), (2, 7)],
]


def group_circulant(K):
    """A_{x,y} = a(y - x) on H = Z_3 x Z_3, coordinates ordered
    (0,0),(1,0),(2,0),(0,1),... so index i <-> h = (i mod 3, i // 3),
    and a(u,v) is the kernel entry at row u, column v."""
    H = [(i % 3, i // 3) for i in range(9)]
    return [[K[(hy[0] - hx[0]) % 3][(hy[1] - hx[1]) % 3] for hy in H] for hx in H]


print("Re-running the certificates of arXiv:2608.05781")
r5 = check("[12,6,7]_25  -> AME(12,5)", F5, A5, 923)
r11 = check("[18,9,10]_121 -> AME(18,11), AME(17,11)", F11, group_circulant(K11), 48619)
r13 = check("[18,9,10]_169 -> AME(18,13), AME(17,13)", F13, group_circulant(K13), 48619)

print("\n--- the paper's own consistency claim: the length-18 blocks are")
print("    group-circulant, so self-duality reduces to 9 convolution equations")
for nm, F, K in (("q=11", F11, K11), ("q=13", F13, K13)):
    H = [(i % 3, i // 3) for i in range(9)]
    a = {h: K[h[0]][h[1]] for h in H}
    ok = True
    for g in H:
        s = F.zero
        for h in H:
            hg = ((h[0] + g[0]) % 3, (h[1] + g[1]) % 3)
            s = F.add(s, F.mul(a[hg], F.conj(a[h])))
        want = F.neg(F.one) if g == (0, 0) else F.zero
        ok &= s == want
    print(f"    {nm}: sum_h a(h+g) conj(a(h)) = -delta_(g,0) for all 9 g: {ok}")

# --- the non-GRS claim for q = 5: dim of the Schur square of the code
print("\n--- q=5: is the code monomially inequivalent to a GRS code?")
G5 = [[(1, 0) if i == j else (0, 0) for j in range(6)] + A5[i] for i in range(6)]
prods = []
for i in range(6):
    for j in range(i, 6):
        prods.append([F5.mul(G5[i][c], G5[j][c]) for c in range(12)])
# rank over F_25
M = [row[:] for row in prods]
rank, r = 0, 0
for c in range(12):
    piv = next((i for i in range(r, len(M)) if M[i][c] != F5.zero), None)
    if piv is None:
        continue
    M[r], M[piv] = M[piv], M[r]
    inv = F5.inv(M[r][c])
    M[r] = [F5.mul(inv, v) for v in M[r]]
    for i in range(len(M)):
        if i != r and M[i][c] != F5.zero:
            f = M[i][c]
            M[i] = [F5.add(M[i][k], F5.neg(F5.mul(f, M[r][k]))) for k in range(12)]
    r += 1
    rank += 1
print(f"    dim C^(*2) = {rank}   (paper claims 12; every GRS [12,6] code has <= 11,")
print(f"     so {rank} == 12 means the code is not monomially equivalent to a GRS code)")

print(f"\nALL THREE CERTIFICATES: {r5 and r11 and r13}")
