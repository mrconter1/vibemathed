"""Independent rebuild of the 1.17353 planar lower-bound instance.

Everything geometric is rediscovered here: the graph comes from the raw arc
list, the two routes per terminal are found by depth-first search, the
fractional arc loads and all 64 routing overloads are recomputed in exact
rational arithmetic. The author's verify/ scripts are never imported and the
certificate's precomputed loads and overloads are read only at the end, as
something to disagree with.

Two conventions are taken from the certificate rather than guessed, and are
declared as such:
  * route bit 1 selects a terminal's LATE leg, which is its longer path;
  * the cost of flipping a terminal to its index-1 path is a flat -1, so the
    fractional reference cost of 2.000000001 makes a routing cost-preserving
    exactly when at least three terminals sit on their index-1 path. That
    formula is not assumed - it is fitted below against all 64 of the
    certificate's own cost_delta values and must reproduce every one.
"""
import itertools
import json
import os
from fractions import Fraction as F

HERE = os.path.dirname(os.path.abspath(__file__))
CERT = os.path.join(HERE, "repo", "certificates")

flow = json.load(open(os.path.join(CERT, "part3_v2_planar_k6_edit_r1_exact_20260810.json"), encoding="utf-8"))
topo = json.load(open(os.path.join(CERT, "part3_v2_planar_k6_edit_r1_topology_exact_20260810.json"), encoding="utf-8"))

arcs = [tuple(a) for a in topo["raw_directed_arcs"]]
terminals = [f"t{i}" for i in range(flow["terminals"])]
demands = [F(s) for s in flow["demands_normalized"]]
late_frac = [F(s) for s in flow["fraction_late"]]
src = flow["raw_dag"]["source"]

adj = {}
for u, v in arcs:
    adj.setdefault(u, []).append(v)


def dfs_paths(a, b):
    out, stack = [], [(a, [a])]
    while stack:
        n, p = stack.pop()
        if n == b:
            out.append(p)
            continue
        for m in adj.get(n, []):
            if m not in p:
                stack.append((m, p + [m]))
    return out


P = {t: sorted(dfs_paths(src, t), key=len, reverse=True) for t in terminals}
assert all(len(P[t]) == 2 for t in terminals)
print(f"rediscovered 2 paths for each of {len(terminals)} terminals from {len(arcs)} raw arcs")


def arcset(p):
    return set(zip(p, p[1:]))


# --- fractional flow, then checked against the certificate's arc loads ---
x = {}
for i, t in enumerate(terminals):
    for j, p in enumerate(P[t]):
        share = late_frac[i] if j == 0 else 1 - late_frac[i]
        for a in arcset(p):
            x[a] = x.get(a, F(0)) + demands[i] * share

their_loads = {tuple(d["arc"]): F(d["load"]) for d in flow["raw_dag"]["fractional_arc_loads"]}
load_ok = all(x.get(a, F(0)) == v for a, v in their_loads.items())
print(f"fractional arc loads reproduced on all {len(their_loads)} arcs: {load_ok}")
if not load_ok:
    for a, v in their_loads.items():
        if x.get(a, F(0)) != v:
            print(f"   MISMATCH {a}: mine {x.get(a, F(0))} theirs {v}")

# --- all 64 routings ---
D = max(demands)
mine = {}
for bits in itertools.product((0, 1), repeat=len(terminals)):
    y = {}
    for i, t in enumerate(terminals):
        for a in arcset(P[t][1 - bits[i]]):
            y[a] = y.get(a, F(0)) + demands[i]
    mine[bits] = max(y.get(a, F(0)) - x.get(a, F(0)) for a in set(x) | set(y)) / D

theirs = {tuple(c["route"]): F(c["overload"]) for c in flow["raw_dag"]["all_routing_checks_from_discovered_paths"]}
agree = sum(1 for k in theirs if mine.get(k) == theirs[k])
print(f"routing overloads reproduced: {agree}/{len(theirs)}")

# --- the cost rule, fitted against every cost_delta rather than assumed ---
ref = F(flow["fractional_cost_reference"]) * -1  # 2.000000001
cost_delta = {tuple(c["route"]): F(c["cost_delta"]) for c in flow["raw_dag"]["all_routing_checks_from_discovered_paths"]}
fit = all(cost_delta[k] == ref - sum(k) for k in cost_delta)
print(f"cost rule  delta = {float(ref):.9f} - (number of index-1 legs)  fits all 64: {fit}")

good = [k for k in mine if ref - sum(k) <= 0]
print(f"cost-preserving routings: {len(good)} (certificate lists {len(flow['cost_good_routings'])})")

C_inst = min(mine[k] for k in good)
claimed = F(flow["cost_face_lower_bound"])
print(f"\nmin overload over cost-preserving routings = {C_inst}")
print(f"  as a decimal            {float(C_inst):.14f}")
print(f"  certificate claims      {float(claimed):.14f}")
print(f"  EXACT MATCH: {C_inst == claimed}")
print(f"  equals the submitted record 1.17353531974518: {f'{float(C_inst):.14f}' == '1.17353531974518'}")

# --- structure ---
V = len({v for a in arcs for v in a})
E = len({tuple(sorted(a)) for a in arcs})
print(f"\nV={V} E={E} F={topo['faces_count']} -> Euler {V - E + topo['faces_count']}")
try:
    import networkx as nx

    g = nx.Graph()
    g.add_edges_from(arcs)
    print(f"networkx planarity (independent of the certificate): {nx.check_planarity(g)[0]}")
except Exception as e:
    print(f"networkx skipped: {e}")
