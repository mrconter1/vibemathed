# Independent check of arXiv:2605.23020 (Korsky, "Polylogarithmic Full-Chord
# Buffon Discrepancy"). Written from the statements in the paper, not from any
# code of the author's.
#
# Two things are worth checking, and they are the two the whole note rests on.
#
#  (A) Lemma 3.1: in endpoint-pair space the set of chords crossing a test line
#      is a union of two rectangles, and its measure is 2*H1(l ∩ Omega)/Lambda.
#      That identity is what turns a Buffon problem into a 2-d rectangle
#      discrepancy problem. Checked here exactly for the disk and numerically
#      for an ellipse (which has no closed form and is the case the theorem's
#      "general convex body" clause has to survive).
#
#  (B) Theorem 1.1's conclusion, empirically: a full-chord construction whose
#      endpoint pairs are low-discrepancy for mu really does have Buffon
#      discrepancy growing like a power of log L, where the Steinhaus-style
#      construction it replaces grows like a power of L.
import numpy as np
from scipy import integrate

TWO_PI = 2 * np.pi

# ----------------------------------------------------------------- (A) disk
# Pushforward of the kinematic line measure to endpoint angles (x, y) on the
# unit circle has density proportional to the chord length 2|sin((x-y)/2)|.
# Normalising over ordered pairs: int int |sin((x-y)/2)| dx dy = 8*pi.
print("=== (A) Lemma 3.1, the crossing identity ===")
print("\n-- unit disk, exact vs closed form")


def crossing_measure_disk(alpha):
    """mu(A_I) for the arc I = (-alpha, alpha), by 2-d quadrature."""
    def inner(x):
        val, _ = integrate.quad(
            lambda y: abs(np.sin((x - y) / 2)), alpha, TWO_PI - alpha, limit=200
        )
        return val
    tot, _ = integrate.quad(inner, -alpha, alpha, limit=200)
    return 2 * tot / (8 * np.pi)          # both orderings


ok = True
for alpha in (0.3, 0.7, np.pi / 2, 2.0, 2.9):
    # test line at distance p = cos(alpha) from centre; chord length 2 sin(alpha)
    lhs = crossing_measure_disk(alpha)
    rhs = 2 * (2 * np.sin(alpha)) / TWO_PI   # 2*H1(l ∩ Omega)/Lambda, Lambda = 2*pi
    ok &= abs(lhs - rhs) < 1e-9
    print(f"  alpha={alpha:5.3f}  mu(A_I)={lhs:.12f}   2*H1/Lambda={rhs:.12f}"
          f"   match={abs(lhs - rhs) < 1e-9}")
print(f"  identity holds for the disk: {ok}")

# ------------------------------------------------------------- (A) ellipse
# No closed form here, so mu is estimated by sampling the kinematic measure
# directly in (p, theta) - a parametrisation that knows nothing about endpoint
# pairs - and the arcs are read off the sampled lines. If the identity is an
# artifact of the disk's symmetry this is where it breaks.
print("\n-- ellipse a=1, b=0.4, Monte Carlo from the (p, theta) side")
A, B = 1.0, 0.4
rng = np.random.default_rng(20260818)


def ellipse_pt(t):
    return np.stack([A * np.cos(t), B * np.sin(t)], axis=-1)


# arclength parametrisation table, so "arc" means the same thing as in the paper
tt = np.linspace(0, TWO_PI, 400001)
d = np.linalg.norm(np.diff(ellipse_pt(tt), axis=0), axis=1)
s = np.concatenate([[0.0], np.cumsum(d)])
PERIM = s[-1]
print(f"  perimeter Lambda = {PERIM:.9f}")


def line_hits(p, th):
    """Endpoint angles where the line {x.n = p} meets the ellipse, or None."""
    n = np.array([np.cos(th), np.sin(th)])
    # (A cos t) n0 + (B sin t) n1 = p  ->  R cos(t - phi) = p
    R = np.hypot(A * n[0], B * n[1])
    if abs(p) >= R:
        return None
    phi = np.arctan2(B * n[1], A * n[0])
    dlt = np.arccos(p / R)
    return (phi - dlt) % TWO_PI, (phi + dlt) % TWO_PI


NS = 400000
Rmax = max(A, B)
p_s = rng.uniform(-Rmax, Rmax, NS)
th_s = rng.uniform(0, np.pi, NS)
pairs = []
for p, th in zip(p_s, th_s):
    h = line_hits(p, th)
    if h is not None:
        pairs.append(h)
pairs = np.array(pairs)
# measure of the whole line set, from the acceptance rate: the sampling box has
# lambda-mass 2*Rmax*pi, and lambda{g : g meets Omega} = perimeter.
print(f"  {len(pairs)} of {NS} sampled lines meet the ellipse")
print(f"  implied Lambda = {2 * Rmax * np.pi * len(pairs) / NS:.6f}"
      f"  (perimeter {PERIM:.6f})")

for trial in range(4):
    p0, th0 = rng.uniform(-0.6, 0.6), rng.uniform(0, np.pi)
    h = line_hits(p0, th0)
    if h is None:
        continue
    u, v = h
    P0, P1 = ellipse_pt(u), ellipse_pt(v)
    chord_len = np.linalg.norm(P0 - P1)
    # arc I = angles from u to v going positively
    def in_arc(t, u=u, v=v):
        return ((t - u) % TWO_PI) < ((v - u) % TWO_PI)
    sep = in_arc(pairs[:, 0]) ^ in_arc(pairs[:, 1])
    mc = sep.mean()
    pred = 2 * chord_len / PERIM
    print(f"  line p={p0:+.3f} th={th0:.3f}: mu(A_I) MC={mc:.5f}"
          f"   2*H1/Lambda={pred:.5f}   rel err={abs(mc - pred) / pred:.2%}")

# ------------------------------------------------------- (B) discrepancy growth
print("\n=== (B) Theorem 1.1's conclusion, empirically (unit disk) ===")


def buffon_disc(xs, ys):
    """Exact sup over test lines of |#(l ∩ S) - Crofton prediction|.

    A test line of the disk is itself determined by the two boundary points it
    hits, so the supremum is over arcs I=(u,v). The count is piecewise constant
    with breakpoints at chord endpoints, so evaluating just outside every
    endpoint pair attains the sup.
    """
    L = np.sum(2 * np.abs(np.sin((xs - ys) / 2)))
    marks = np.unique(np.concatenate([xs, ys]))
    eps = 1e-9
    cand = np.sort(np.concatenate([marks - eps, marks + eps]) % TWO_PI)
    best = 0.0
    # row-blocked: the full |cand|^2 x |S| indicator array does not fit in RAM
    for lo in range(0, len(cand), 64):
        U = cand[lo:lo + 64, None]
        width = (cand[None, :] - U) % TWO_PI
        inx = ((xs[None, None, :] - U[:, :, None]) % TWO_PI) < width[:, :, None]
        iny = ((ys[None, None, :] - U[:, :, None]) % TWO_PI) < width[:, :, None]
        count = (inx ^ iny).sum(axis=2)
        h1 = np.abs(2 * np.sin(width / 2))          # length of the test chord
        target = (2 * L / (np.pi * np.pi)) * h1     # |Omega| = pi
        best = max(best, float(np.max(np.abs(count - target))))
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
    """Low-discrepancy in endpoint space via the Rosenblatt transform of mu:
    x uniform, and (y-x) has CDF (1-cos(u/2))/2."""
    a, b = halton(n, 2), halton(n, 3)
    x = TWO_PI * a
    u = 2 * np.arccos(1 - 2 * b)
    return x % TWO_PI, (x + u) % TWO_PI


def steinhaus_chords(n_dir, n_off):
    """Evenly spaced directions crossed with an even grid of offsets - the
    construction class Steinerberger's L^{1/3} bound comes from."""
    xs, ys = [], []
    for k in range(n_dir):
        th = np.pi * k / n_dir
        for j in range(n_off):
            p = -1 + 2 * (j + 0.5) / n_off
            dlt = np.arccos(np.clip(p, -1, 1))
            xs.append((th - dlt) % TWO_PI)
            ys.append((th + dlt) % TWO_PI)
    return np.array(xs), np.array(ys)


print("\n  QMC-in-endpoint-space full chords (Theorem 1.1's class):")
qmc = []
for n in (64, 128, 256, 512, 1024, 2048):
    x, y = qmc_chords(n)
    D, L = buffon_disc(x, y)
    qmc.append((L, D))
    print(f"    N={n:5d}  L={L:9.2f}   disc={D:8.3f}"
          f"   disc/(log L)^1.5={D / np.log(L) ** 1.5:6.3f}"
          f"   disc/L^(1/3)={D / L ** (1 / 3):6.3f}")

print("\n  Steinhaus-style directions x offsets (the L^{1/3} class):")
for nd, no in ((4, 4), (6, 6), (8, 8), (11, 11), (16, 16), (22, 22)):
    x, y = steinhaus_chords(nd, no)
    D, L = buffon_disc(x, y)
    print(f"    {nd}x{no}={nd*no:5d}  L={L:9.2f}   disc={D:8.3f}"
          f"   disc/(log L)^1.5={D / np.log(L) ** 1.5:6.3f}"
          f"   disc/L^(1/3)={D / L ** (1 / 3):6.3f}")

Ls = np.array([q[0] for q in qmc])
Ds = np.array([q[1] for q in qmc])
sl = np.polyfit(np.log(Ls), np.log(Ds), 1)[0]
print(f"\n  QMC construction: fitted disc ~ L^{sl:.3f}"
      f"  (polynomial growth would show a clear positive exponent;"
      f" polylog looks like a small drifting one)")
