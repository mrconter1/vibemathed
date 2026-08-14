"""Independently establish the LOWER bound of all 19 claimed values.

Each claim R_G(H1, H2) = n needs two halves: no good coloring at n (their
DRAT-certified UNSAT side), and a good coloring AT n-1. This script does the
second half from scratch: the pattern families, both group actions and the
monotone-embedding notion are implemented here directly from the DD26
paper's definitions - the vendored generator, the referee code and the shipped
witnesses are not read. A witness found by CaDiCaL is then re-verified by a
brute-force embedding check that shares no code with the encoder's clause
construction.

Definitions (DD26, section 2):
  P_n^mon: i ~ i+1.               P_n^alt: path (0, n-1, 1, n-2, ...).
  C_n^mon: P_n^mon + {0, n-1} (n>=3); C_2 := K_2.
  S_n^sc:  0 ~ every other vertex.
  M_n^nest (n even): v ~ n-1-v.
  K_n: complete.
  R_ref: each argument's group is <sigma>, sigma(i) = n-1-i.
  R_dih: each argument's group is Dih(n) = <rho, sigma>.
  A Gamma-copy of H in color r: some gamma in Gamma and an increasing map v
  with {v_gamma(i), v_gamma(j)} color r for every edge {i,j} of H.
"""
import itertools
import json
import os
import re
import sys
import time

from pysat.formula import CNF
from pysat.solvers import Cadical153

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.join(HERE, "..", "ramsey3")


# --- pattern families, straight from the paper ---

def edges_palt(n):
    seq, lo, hi = [], 0, n - 1
    for k in range(n):
        seq.append(lo if k % 2 == 0 else hi)
        lo, hi = (lo + 1, hi) if k % 2 == 0 else (lo, hi - 1)
    return frozenset(frozenset(p) for p in zip(seq, seq[1:]))


def edges_pmon(n):
    return frozenset(frozenset({i, i + 1}) for i in range(n - 1))


def edges_cmon(n):
    if n == 2:
        return frozenset({frozenset({0, 1})})
    return edges_pmon(n) | {frozenset({0, n - 1})}


def edges_ssc(n):
    return frozenset(frozenset({0, i}) for i in range(1, n))


def edges_mnest(n):
    assert n % 2 == 0
    return frozenset(frozenset({v, n - 1 - v}) for v in range(n // 2))


def edges_k(n):
    return frozenset(frozenset(p) for p in itertools.combinations(range(n), 2))


FAMILY = {"palt": edges_palt, "cmon": edges_cmon, "ssc": edges_ssc, "mnest": edges_mnest, "k": edges_k}


# --- group actions ---

def group(kind, m):
    sigma = tuple(m - 1 - i for i in range(m))
    ident = tuple(range(m))
    if kind == "ref":
        return {ident, sigma}
    rho = tuple((i + 1) % m for i in range(m))
    out, frontier = {ident}, [ident]
    while frontier:
        nxt = []
        for g in frontier:
            for h in (rho, sigma):
                gh = tuple(h[g[i]] for i in range(m))
                if gh not in out:
                    out.add(gh)
                    nxt.append(gh)
        frontier = nxt
    return out


def orbit(edges, m, kind):
    out = set()
    for g in group(kind, m):
        out.add(frozenset(frozenset({g[i], g[j]}) for e in edges for i, j in [tuple(e)]))
    return out


# --- the check ---

def find_witness(fam1, m1, fam2, m2, kind, n):
    """A coloring of K_n avoiding a color-1 copy of H1 and color-2 copy of H2."""
    H1, H2 = FAMILY[fam1](m1), FAMILY[fam2](m2)
    orb1, orb2 = orbit(H1, m1, kind), orbit(H2, m2, kind)
    var = {}
    for u, v in itertools.combinations(range(n), 2):
        var[frozenset({u, v})] = len(var) + 1  # true = color 1
    cnf = CNF()
    for verts in itertools.combinations(range(n), m1):
        for Hp in orb1:
            cnf.append([-var[frozenset({verts[i], verts[j]})] for e in Hp for i, j in [tuple(e)]])
    for verts in itertools.combinations(range(n), m2):
        for Hp in orb2:
            cnf.append([var[frozenset({verts[i], verts[j]})] for e in Hp for i, j in [tuple(e)]])
    with Cadical153(bootstrap_with=cnf) as s:
        if not s.solve():
            return None, len(cnf.clauses)
        model = set(s.get_model())
    color1 = frozenset(e for e, x in var.items() if x in model)
    return color1, len(cnf.clauses)


def brute_has_copy(orb, m, n, edge_set):
    """Independent re-verification: monotone embedding search, no CNF involved."""
    for verts in itertools.combinations(range(n), m):
        for Hp in orb:
            if all(frozenset({verts[i], verts[j]}) in edge_set for e in Hp for i, j in [tuple(e)]):
                return True
    return False


def main():
    t = open(os.path.join(REPO, "README.md"), encoding="utf-8").read()
    rows = re.findall(
        r"\| (R\d+|B\d+\.\d+) \| .R(dih|ref)\(([A-Za-z]+?)(\d+)(alt|sc|mon|nest)?,([A-Za-z]+?)(\d+)(alt|sc|mon|nest)?\)=(\d+). \|",
        t,
    )
    print(f"parsed {len(rows)} value rows")
    fam_of = {"P": "palt", "S": "ssc", "C": "cmon", "M": "mnest", "K": "k"}
    ok = 0
    results = {}
    for rid, kind, f1, m1, _s1, f2, m2, _s2, val in rows:
        fam1, fam2 = fam_of[f1], fam_of[f2]
        m1, m2, R = int(m1), int(m2), int(val)
        t0 = time.time()
        witness, clauses = find_witness(fam1, m1, fam2, m2, kind, R - 1)
        if witness is None:
            print(f"  {rid:6s} R{kind}({fam1}{m1},{fam2}{m2})={R}: NO WITNESS at n={R-1} - LOWER BOUND FAILS")
            results[rid] = "FAIL"
            continue
        # brute-force re-check of the witness, independent of the encoding
        H1, H2 = FAMILY[fam1](m1), FAMILY[fam2](m2)
        all_pairs = set(frozenset(p) for p in itertools.combinations(range(R - 1), 2))
        color2 = all_pairs - witness
        bad1 = brute_has_copy(orbit(H1, m1, kind), m1, R - 1, witness)
        bad2 = brute_has_copy(orbit(H2, m2, kind), m2, R - 1, color2)
        good = not bad1 and not bad2
        ok += good
        results[rid] = "OK" if good else "WITNESS INVALID"
        print(
            f"  {rid:6s} R{kind}({fam1}{m1},{fam2}{m2})={R}: witness at n={R-1} "
            f"{'verified' if good else 'INVALID'} ({clauses} clauses, {time.time()-t0:.1f}s)"
        )
    print(f"\n{ok}/{len(rows)} lower bounds independently established and re-verified")
    json.dump(results, open(os.path.join(HERE, "lower_results.json"), "w"), indent=1)


if __name__ == "__main__":
    main()
