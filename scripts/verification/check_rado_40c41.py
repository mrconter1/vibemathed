"""Independent verification of R(c) = R_4(x+y+c=z) claims.

Nothing here reads the repo's code. Two layers:
  1. every shipped coloring certificate is re-checked by scanning all
     monochromatic triples directly (the lower bounds, in full);
  2. an independently written SAT encoding (own variable layout, own sound
     color-precedence symmetry breaking) re-solves both directions of the
     cheap cells: SAT at 40c+40, UNSAT at 40c+41.
"""
import glob
import itertools
import json
import os
import sys
import time

from pysat.formula import CNF
from pysat.solvers import Cadical153

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.join(HERE, "..", "rado")
K = 4


def violations(coloring, c, n):
    """Monochromatic solutions of x + y + c = z with x,y,z in [1,n]."""
    col = {i + 1: coloring[i] for i in range(n)}
    bad = 0
    for x in range(1, n + 1):
        for y in range(x, n + 1):  # x <= y; solutions unordered in x,y
            z = x + y + c
            if z > n:
                break
            if col[x] == col[y] == col[z]:
                bad += 1
    return bad


def check_certificates():
    files = sorted(glob.glob(os.path.join(REPO, "results", "rado-xyc-k4-*.json")))
    print(f"== layer 1: {len(files)} shipped coloring certificates, re-checked directly")
    ok = 0
    for f in files:
        d = json.load(open(f))
        c, n, coloring = d["c"], d["n"], d["coloring"]
        assert len(coloring) == n, f"{f}: coloring length {len(coloring)} != n {n}"
        assert set(coloring) <= set(range(1, K + 1)) | set(range(K)), f"{f}: colors {set(coloring)}"
        bad = violations(coloring, c, n)
        expect = 40 * c + 40 if c >= 1 else 44
        good = bad == 0 and (n == expect or c in (0, 1))
        ok += bad == 0
        print(f"   c={c:3d} n={n:5d}: {'VALID' if bad == 0 else f'{bad} VIOLATIONS'}"
              + ("" if n == expect or c in (0, 1) else f"  (n != {expect}?)"))
    print(f"   {ok}/{len(files)} valid\n")
    return ok == len(files)


def encode(c, n):
    """Own encoding: var(i,j) = element i has color j."""
    def v(i, j):
        return (i - 1) * K + j  # j in 1..K

    cnf = CNF()
    for i in range(1, n + 1):
        cnf.append([v(i, j) for j in range(1, K + 1)])
        for j1, j2 in itertools.combinations(range(1, K + 1), 2):
            cnf.append([-v(i, j1), -v(i, j2)])
    for x in range(1, n + 1):
        for y in range(x, n + 1):
            z = x + y + c
            if z > n:
                break
            for j in range(1, K + 1):
                cnf.append([-v(x, j), -v(y, j), -v(z, j)])
    # Sound symmetry breaking for interchangeable colors: color j appears
    # only if color j-1 has appeared at a smaller index.
    for j in range(2, K + 1):
        for i in range(1, n + 1):
            cnf.append([-v(i, j)] + [v(i2, j - 1) for i2 in range(1, i)])
    return cnf


def solve_cell(c):
    n = {0: 45, 1: 83}.get(c, 40 * c + 41)
    lo = n - 1
    t0 = time.time()
    with Cadical153(bootstrap_with=encode(c, lo)) as s:
        sat_lo = s.solve()
    t1 = time.time()
    with Cadical153(bootstrap_with=encode(c, n)) as s:
        sat_hi = s.solve()
    t2 = time.time()
    verdict = "OK" if (sat_lo and not sat_hi) else "FAIL"
    print(f"   c={c:3d}: SAT at {lo} = {sat_lo} ({t1-t0:.0f}s), SAT at {n} = {sat_hi} ({t2-t1:.0f}s)  [{verdict}]")
    return sat_lo and not sat_hi


def main():
    cells = [int(x) for x in sys.argv[1:]] or [0, 1, 2, 3]
    all_ok = check_certificates()
    print(f"== layer 2: own encoder, both directions, cells {cells}")
    for c in cells:
        all_ok &= solve_cell(c)
    print("\nALL OK" if all_ok else "\nFAILURES ABOVE")


if __name__ == "__main__":
    main()
