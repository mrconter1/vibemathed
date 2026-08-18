# Part (B) of the check on arXiv:2605.23020, split out because the naive
# evaluation of the supremum does not fit in memory at the interesting sizes.
#
# Exact Buffon discrepancy of a full-chord set in the unit disk. A test line is
# determined by the two boundary points it hits, so the sup is over arcs, and
# the intersection count is piecewise constant with breakpoints at the 2N chord
# endpoints. Walking the arc's right end past one endpoint flips exactly one
# chord's membership, so the count moves by +-1: a cumulative sum over the
# sorted marks evaluates a whole row of the supremum in one pass.
import numpy as np

TWO_PI = 2 * np.pi


def buffon_disc(xs, ys):
    L = float(np.sum(2 * np.abs(np.sin((xs - ys) / 2))))
    n = len(xs)
    marks = np.concatenate([xs, ys])
    chord = np.concatenate([np.arange(n), np.arange(n)])
    o = np.argsort(marks)
    marks, chord = marks[o], chord[o]
    M = 2 * n

    # position of each chord's two marks
    pos = np.zeros((n, 2), dtype=np.int64)
    seen = np.zeros(n, dtype=bool)
    for k, c in enumerate(chord):
        pos[c, int(seen[c])] = k
        seen[c] = True
    partner = np.empty(M, dtype=np.int64)
    partner[pos[:, 0]] = pos[:, 1]
    partner[pos[:, 1]] = pos[:, 0]

    idx = np.arange(M)
    best = 0.0
    for i in range(M):
        rel = (idx - i) % M                 # cyclic order from i
        relp = (partner - i) % M
        delta = np.where(rel < relp, 1, -1)  # +1 on a chord's first mark
        order = np.argsort(rel)
        cnt = np.cumsum(delta[order])        # count over arcs [mark_i, mark_j]
        width = (marks[order] - marks[i]) % TWO_PI
        target = (2 * L / (np.pi * np.pi)) * np.abs(2 * np.sin(width / 2))
        best = max(best, float(np.max(np.abs(cnt - target))))
    return best, L


def halton(n, base):
    out = np.zeros(n)
    for i in range(1, n + 1):
        f, r, k = 1.0, 0.0, i
        while k:
            f /= base
            r += f * (k % base)
            k //= base
        out[i - 1] = r
    return out


def qmc_chords(n):
    """Low-discrepancy in endpoint-pair space via the Rosenblatt transform of
    mu: the first endpoint is uniform, and the gap has CDF (1-cos(u/2))/2."""
    a, b = halton(n, 2), halton(n, 3)
    x = TWO_PI * a
    u = 2 * np.arccos(1 - 2 * b)
    return x % TWO_PI, (x + u) % TWO_PI


def steinhaus_chords(n_dir, n_off):
    """Evenly spaced directions crossed with an even offset grid - the class
    Steinerberger's L^{1/3} bound is proved for."""
    xs, ys = [], []
    for k in range(n_dir):
        th = np.pi * k / n_dir
        for j in range(n_off):
            p = -1 + 2 * (j + 0.5) / n_off
            dlt = np.arccos(np.clip(p, -1, 1))
            xs.append((th - dlt) % TWO_PI)
            ys.append((th + dlt) % TWO_PI)
    return np.array(xs), np.array(ys)


def report(name, sets):
    print(f"\n  {name}")
    out = []
    for label, (x, y) in sets:
        D, L = buffon_disc(x, y)
        out.append((L, D))
        print(f"    {label:>10s}  L={L:9.2f}   disc={D:8.3f}"
              f"   disc/(log L)^1.5={D / np.log(L) ** 1.5:6.3f}"
              f"   disc/L^(1/3)={D / L ** (1/3):6.3f}")
    Ls = np.array([o[0] for o in out])
    Ds = np.array([o[1] for o in out])
    a = np.polyfit(np.log(Ls), np.log(Ds), 1)[0]
    b = np.polyfit(np.log(np.log(Ls)), np.log(Ds), 1)[0]
    print(f"    fit: disc ~ L^{a:.3f}   and   disc ~ (log L)^{b:.3f}")
    return Ls, Ds


print("Buffon discrepancy growth in the unit disk, exact supremum")
report("full chords, endpoints low-discrepancy for mu (Thm 1.1's class):",
       [(f"N={n}", qmc_chords(n)) for n in (64, 128, 256, 512, 1024, 2048, 4096)])
report("full chords, Steinhaus-style directions x offsets:",
       [(f"{k}x{k}", steinhaus_chords(k, k)) for k in (8, 11, 16, 22, 32, 45, 64)])

rng = np.random.default_rng(7)
def rnd(n):
    x = rng.uniform(0, TWO_PI, n)
    u = 2 * np.arccos(1 - 2 * rng.uniform(0, 1, n))
    return x, (x + u) % TWO_PI
report("full chords, i.i.d. from mu (control, expect ~sqrt(N)):",
       [(f"N={n}", rnd(n)) for n in (64, 128, 256, 512, 1024, 2048, 4096)])
