# Independent check of the in-tree depth claim for D(q) = q s q^{-1} on n-cycles.
#
# The submission claims, for s a fixed n-cycle:
#   (1) exactly phi(n) cycles map directly onto s;
#   (2) the in-tree of s has depth 1 unless 8 | n, or p^2 | n for an odd prime;
#   (3) for n = p^e the depth is p^(e-1) for odd p, and 2^(e-1) - 1 for p = 2;
#   (4) in general the largest of those over the prime powers dividing n.
#
# Nothing here is taken from the author's code or paper: the permutations are
# enumerated from scratch and the graph is built by brute force.
from itertools import permutations
from math import gcd
from collections import deque


def phi(n):
    return sum(1 for k in range(1, n + 1) if gcd(k, n) == 1)


def predicted_depth(n):
    """max over prime powers p^e || n of p^(e-1), or 2^(e-1)-1 at p = 2."""
    best, m, p = 0, n, 2
    while p * p <= m:
        if m % p == 0:
            e = 0
            while m % p == 0:
                m //= p
                e += 1
            best = max(best, (2 ** (e - 1) - 1) if p == 2 else p ** (e - 1))
        p += 1
    if m > 1:                        # leftover prime to the first power
        best = max(best, 0 if m == 2 else 1)
    return best


def compose(a, b):
    """(a o b)(i) = a(b(i))."""
    return tuple(a[b[i]] for i in range(len(a)))


def inverse(a):
    out = [0] * len(a)
    for i, v in enumerate(a):
        out[v] = i
    return tuple(out)


def is_ncycle(a):
    n = len(a)
    seen, i = 0, 0
    for _ in range(n):
        seen += 1
        i = a[i]
        if i == 0:
            break
    return seen == n and i == 0


print("=== exhaustive: enumerate every n-cycle and build the whole graph ===")
print(f"{'n':>3} {'#cycles':>8} {'|D^-1(s)|':>10} {'phi(n)':>7} {'depth':>6}"
      f" {'predicted':>10} {'reached s':>10} {'match':>6}")
for n in range(2, 11):
    s = tuple((i + 1) % n for i in range(n))
    cycles = [p for p in permutations(range(n)) if is_ncycle(p)]
    D = {}
    for q in cycles:
        D[q] = compose(compose(q, s), inverse(q))
    # in-tree of s: backward BFS over the functional graph, excluding s's own
    # preimage-of-itself edge
    pre = {}
    for q, img in D.items():
        pre.setdefault(img, []).append(q)
    depth, seen, frontier = 0, {s}, [s]
    while frontier:
        nxt = []
        for v in frontier:
            for u in pre.get(v, []):
                if u not in seen:
                    seen.add(u)
                    nxt.append(u)
        if nxt:
            depth += 1
        frontier = nxt
    print(f"{n:>3} {len(cycles):>8} {len(pre.get(s, [])):>10} {phi(n):>7} {depth:>6}"
          f" {predicted_depth(n):>10} {len(seen):>10}"
          f" {str(len(pre.get(s, [])) == phi(n) and depth == predicted_depth(n)):>6}")

print("\n=== the level-2 mechanism: affine maps and Hull-Dobell ===")
# Claim implicit in the "Hull-Dobell threshold": the preimages of the
# translation t_a are exactly the affine maps i -> a*i + c that happen to be
# n-cycles, and Hull-Dobell decides which those are. Checked directly.
def hull_dobell(a, c, n):
    """full period of i -> a*i + c mod n"""
    if gcd(c, n) != 1:
        return False
    m, p = n, 2
    while p * p <= m:
        if m % p == 0:
            while m % p == 0:
                m //= p
            if (a - 1) % p:
                return False
        p += 1
    if m > 1 and (a - 1) % m:
        return False
    return (a - 1) % 4 == 0 if n % 4 == 0 else True


for n in (6, 8, 9, 12, 16, 18, 25, 27):
    s = tuple((i + 1) % n for i in range(n))
    ok_affine = ok_hd = True
    n_lvl2 = 0
    for a in range(n):
        if gcd(a, n) != 1:
            continue
        t_a = tuple((i + a) % n for i in range(n))
        # every solution of x s x^-1 = t_a is x0 o s^k with x0(i) = a*i
        x0 = tuple((a * i) % n for i in range(n))
        for k in range(n):
            x = compose(x0, tuple((i + k) % n for i in range(n)))
            assert compose(compose(x, s), inverse(x)) == t_a
            # x is the affine map i -> a*i + a*k
            c = (a * k) % n
            ok_affine &= x == tuple((a * i + c) % n for i in range(n))
            ok_hd &= is_ncycle(x) == hull_dobell(a, c, n)
            if is_ncycle(x) and a != 1:
                n_lvl2 += 1
    has_lvl2 = n % 8 == 0 or any(
        n % (p * p) == 0 for p in range(3, n + 1, 2) if all(p % d for d in range(2, p))
    )
    print(f"  n={n:>3}  preimages of translations are affine: {ok_affine}"
          f"   Hull-Dobell predicts n-cycle: {ok_hd}"
          f"   level-2 nodes: {n_lvl2:>4}   threshold says nonempty: {has_lvl2}"
          f"   {'OK' if (n_lvl2 > 0) == has_lvl2 else 'MISMATCH'}")

print("\n=== backward BFS, the sizes brute force cannot reach ===")
# Preimages of q: solve x s x^-1 = q. One solution x0 sends s's cycle order to
# q's; the rest are x0 o s^k. So each node has at most n preimages and the tree
# can be walked without enumerating (n-1)! permutations.
def preimages(q, s, n, spow):
    order_s, order_q, i, j = [], [], 0, 0
    for _ in range(n):
        order_s.append(i)
        i = s[i]
        order_q.append(j)
        j = q[j]
    x0 = [0] * n
    for a, b in zip(order_s, order_q):
        x0[a] = b
    x0 = tuple(x0)
    out = []
    for k in range(n):
        x = compose(x0, spow[k])
        if is_ncycle(x):
            out.append(x)
    return out


CAP = 1_500_000
for n in (8, 9, 12, 16, 18, 25, 27):
    s = tuple((i + 1) % n for i in range(n))
    spow = [tuple((i + k) % n for i in range(n)) for k in range(n)]
    seen, frontier, depth = {s}, [s], 0
    blown = False
    while frontier:
        nxt = []
        for v in frontier:
            for u in preimages(v, s, n, spow):
                if u not in seen:
                    seen.add(u)
                    nxt.append(u)
        if len(seen) > CAP:
            blown = True
            break
        if nxt:
            depth += 1
        frontier = nxt
    pred = predicted_depth(n)
    if blown:
        print(f"  n={n:>3}  ABANDONED past {CAP} nodes at depth >= {depth}"
              f"   (predicted {pred})")
    else:
        print(f"  n={n:>3}  tree has {len(seen):>9} nodes, depth {depth:>3}"
              f"   predicted {pred:>3}   {'OK' if depth == pred else 'MISMATCH'}")
