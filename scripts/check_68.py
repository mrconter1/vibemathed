# Is the 68-vertex graph posted to X on 23 July 2026 a genuine counterexample to
# the Petersen colouring conjecture? If so it predates the 112-vertex arXiv paper
# this catalog's entry is built on by 16 days.
#
# sparse6 decoded here rather than via networkx, and the CNF written from the
# definition, so nothing is inherited from the paper's artifacts.
from itertools import combinations

S6 = (":~?@C_o?A_GW@@GGC@WKD@gEHagAMAOqIB?uJBOyR@XCRcX[QDXKTDhOUDxIYexEJe`uZ"
      "FPy[F`}bCgEaHII[gqYcHa]dHqabiyqakAkmjAwnjQ{olA}lkrUr_jOvlR[wlb_xlJqLN"
      "ZMUnB}|NsA}OCF")

# First 30 edges as printed in the follow-up tweet, for cross-checking.
TWEET_EDGES = [(0,3),(0,4),(0,12),(1,6),(1,9),(1,36),(2,3),(2,7),(2,56),(3,8),
               (4,6),(4,7),(5,7),(5,8),(5,19),(6,8),(9,10),(9,14),(10,11),
               (10,15),(11,16),(11,30),(12,14),(12,15),(13,15),(13,16),(13,62),
               (14,16),(17,20),(17,21)]


def decode_sparse6(s):
    assert s.startswith(":"), "not sparse6"
    d = [ord(c) - 63 for c in s[1:]]
    p = 0
    if d[0] == 63:                      # '~' marker: n in next 3 sextets
        n = (d[1] << 12) | (d[2] << 6) | d[3]
        p = 4
    else:
        n, p = d[0], 1
    k = max(1, (n - 1).bit_length())     # bits per vertex index
    bits = []
    for x in d[p:]:
        bits.extend((x >> i) & 1 for i in range(5, -1, -1))
    edges, v, i = [], 0, 0
    while i + 1 + k <= len(bits):
        b = bits[i]
        x = 0
        for j in range(k):
            x = (x << 1) | bits[i + 1 + j]
        i += 1 + k
        if b:
            v += 1
        if x > v:
            v = x
        else:
            edges.append((x, v) if x < v else (v, x))
    return n, edges


n, edges = decode_sparse6(S6)
edges = sorted(set(edges))
deg = [0] * n
for a, b in edges:
    deg[a] += 1
    deg[b] += 1

print(f"decoded: n = {n}, |E| = {len(edges)}")
print(f"  claim was 68 vertices, 102 edges -> {n == 68 and len(edges) == 102}")
print(f"  simple (no loops/multi): {all(a != b for a, b in edges)}")
print(f"  cubic: {set(deg) == {3}}   degree set = {sorted(set(deg))}")

adj = {i: set() for i in range(n)}
for a, b in edges:
    adj[a].add(b)
    adj[b].add(a)


def connected(adjacency, skip=None):
    seen, stack = set(), [next(iter(adjacency))]
    while stack:
        u = stack.pop()
        if u in seen:
            continue
        seen.add(u)
        for w in adjacency[u]:
            if skip and ((u, w) == skip or (w, u) == skip):
                continue
            if w not in seen:
                stack.append(w)
    return len(seen) == len(adjacency)


print(f"  connected: {connected(adj)}")
bridges = [e for e in edges if not connected(adj, skip=e)]
print(f"  bridgeless: {not bridges}" + (f"  BRIDGES: {bridges}" if bridges else ""))
girth = min(
    (len(c) for c in [[]]), default=None)  # placeholder, computed below
# girth by BFS from each vertex
best = 10**9
for s in range(n):
    dist = {s: 0}
    par = {s: None}
    q = [s]
    while q:
        u = q.pop(0)
        for w in adj[u]:
            if w not in dist:
                dist[w] = dist[u] + 1
                par[w] = u
                q.append(w)
            elif w != par[u]:
                best = min(best, dist[u] + dist[w] + 1)
print(f"  girth: {best}")

print("\ncross-check against the 30 edges printed in the tweet:")
missing = [e for e in TWEET_EDGES if e not in set(edges)]
print(f"  all 30 present in the decoded graph: {not missing}"
      + (f"   MISSING {missing}" if missing else ""))

# ---- Petersen colouring as SAT, encoder written from the definition ----
# P = Kneser graph KG(5,2): vertices are 2-subsets of {0..4}, adjacent when disjoint.
PV = list(combinations(range(5), 2))
PE = [(i, j) for i in range(10) for j in range(i + 1, 10)
      if not set(PV[i]) & set(PV[j])]
STAR = [[k for k, (i, j) in enumerate(PE) if i == p or j == p] for p in range(10)]
assert len(PE) == 15 and all(len(s) == 3 for s in STAR), (len(PE), STAR)


def petersen_colourable(nv, es):
    """SAT iff a Petersen colouring exists."""
    ei = {e: i for i, e in enumerate(es)}
    nE = len(es)
    X = lambda e, j: 1 + ei[e] * 15 + j            # edge e -> edge j of P
    Y = lambda v, p: 1 + nE * 15 + v * 10 + p      # vertex v -> vertex p of P
    cnf = []
    for e in es:                                    # exactly one image per edge
        cnf.append([X(e, j) for j in range(15)])
        for a in range(15):
            for b in range(a + 1, 15):
                cnf.append([-X(e, a), -X(e, b)])
    inc = {v: [] for v in range(nv)}
    for e in es:
        inc[e[0]].append(e)
        inc[e[1]].append(e)
    for v in range(nv):
        cnf.append([Y(v, p) for p in range(10)])    # at least one star per vertex
        for a in range(10):
            for b in range(a + 1, 10):
                cnf.append([-Y(v, a), -Y(v, b)])
        for p in range(10):                         # chosen star constrains images
            for e in inc[v]:
                cnf.append([-Y(v, p)] + [X(e, j) for j in STAR[p]])
        for e, f in combinations(inc[v], 2):        # pairwise distinct at v
            for j in range(15):
                cnf.append([-X(e, j), -X(f, j)])
    from pysat.solvers import Cadical153
    with Cadical153(bootstrap_with=cnf) as s:
        return s.solve(), nE * 15 + nv * 10, len(cnf)


print("\n--- controls (all should be SAT)")
CONTROLS = {
    "K4": (4, [(0,1),(0,2),(0,3),(1,2),(1,3),(2,3)]),
    "K3,3": (6, [(0,3),(0,4),(0,5),(1,3),(1,4),(1,5),(2,3),(2,4),(2,5)]),
    "prism": (6, [(0,1),(1,2),(2,0),(3,4),(4,5),(5,3),(0,3),(1,4),(2,5)]),
    "Petersen": (10, sorted({(min(a,b),max(a,b)) for a,b in
                 [(i,j) for i in range(10) for j in range(10)
                  if i!=j and not set(PV[i]) & set(PV[j])]})),
}
for name, (nv, es) in CONTROLS.items():
    sat, nvars, ncl = petersen_colourable(nv, es)
    print(f"  {name:10s} n={nv:3d} m={len(es):3d}  {nvars:5d} vars {ncl:6d} clauses -> "
          f"{'SAT' if sat else 'UNSAT'}")

print("\n--- the 68-vertex graph")
sat, nvars, ncl = petersen_colourable(n, edges)
print(f"  {nvars} vars, {ncl} clauses -> {'SAT (colourable)' if sat else 'UNSAT'}")
print(f"\n  counterexample to the Petersen colouring conjecture: {not sat}")
