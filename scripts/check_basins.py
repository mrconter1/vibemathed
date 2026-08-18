# The survey paper claims the basin-count sequence 1, 2, 2, 6, 7, 18, 17, 29,
# 56, 157 for n = 3..12 "appears to be new". Recount it from scratch: number of
# periodic orbits of D on the n-cycles, which is the number of basins.
from itertools import permutations


def compose(a, b):
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


CLAIM = {3: 1, 4: 2, 5: 2, 6: 6, 7: 7, 8: 18, 9: 17, 10: 29, 11: 56, 12: 157}
print(f"{'n':>3} {'#cycles':>9} {'basins':>7} {'claimed':>8} {'orbit lengths (len:count)':>28}")
for n in range(3, 11):
    s = tuple((i + 1) % n for i in range(n))
    cycles = [p for p in permutations(range(n)) if is_ncycle(p)]
    D = {q: compose(compose(q, s), inverse(q)) for q in cycles}
    # find periodic points: iterate to detect the cycle each node falls into
    state = {}          # 0 = unvisited, 1 = on current path, 2 = done
    orbits = []
    for start in cycles:
        if start in state:
            continue
        path, q = [], start
        while q not in state:
            state[q] = 1
            path.append(q)
            q = D[q]
        if state[q] == 1:                    # closed a new periodic orbit
            orbits.append(path[path.index(q):])
        for v in path:
            state[v] = 2
    lens = {}
    for o in orbits:
        lens[len(o)] = lens.get(len(o), 0) + 1
    ok = "OK" if len(orbits) == CLAIM[n] else "MISMATCH"
    print(f"{n:>3} {len(cycles):>9} {len(orbits):>7} {CLAIM[n]:>8}"
          f"   {str(sorted(lens.items())):>28}  {ok}")
