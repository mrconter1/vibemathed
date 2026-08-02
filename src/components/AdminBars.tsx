// A bare daily bar chart for the admin dashboard.
//
// Server-rendered SVG with no interaction: this page is one person checking
// numbers, so the hover layer the public charts carry would be cost without
// benefit. Bars rather than a line because these are counts of discrete
// events per day, several of which are legitimately zero.

export function AdminBars({
  points,
  label,
  color = "var(--accent-blue)",
}: {
  points: { day: string; count: number }[];
  label: string;
  color?: string;
}) {
  const total = points.reduce((s, p) => s + p.count, 0);
  const peak = Math.max(1, ...points.map((p) => p.count));
  const W = 640;
  const H = 120;
  const gap = 2;
  // A "nice" y step: 5 where counts are small, stepping up through the 1-2-5
  // sequence so a busy day never produces twenty gridlines. The ladder runs
  // well past any plausible traffic - a spike of 17k page views in a day is
  // real, and it has to land on sane gridlines rather than fall off the end.
  const step =
    [5, 10, 20, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000].find(
      (c) => peak / c <= 4,
    ) ?? 100000;
  const top = Math.ceil(peak / step) * step;
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step);
  const yOf = (v: number) => H - (v / top) * H;

  /// Thousands get a k, so five-digit counts stay two or three characters
  /// wide. Written out in full they overflowed the gutter and were clipped
  /// mid-number, which read as a smaller value than it was.
  const fmtTick = (v: number) => {
    if (v < 1000) return String(v);
    const k = v / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)}k`;
  };
  const tickLabels = ticks.map(fmtTick);

  // Left gutter sized to the widest label at the label's own font size, so
  // nothing is ever cut off. The day-tick row below is plain HTML, so it
  // gets the same offset as a percentage to stay aligned with the bars.
  const yFont = 12;
  const widest = Math.max(...tickLabels.map((l) => l.length));
  const padL = 8 + widest * yFont * 0.62;
  const plotW = W - padL;
  const barW = Math.max(1, plotW / Math.max(1, points.length) - gap);
  // Roughly 16 labels fit across the card before they collide.
  const labelEvery = Math.max(1, Math.ceil(points.length / 16));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-serif text-base text-[var(--ink)]">{label}</h3>
        <span className="font-mono text-xs tabular-nums text-[var(--ink-muted)]">
          {total} in {points.length}d · peak {peak}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-2 h-24 w-full"
        role="img"
        aria-label={`${label}: ${total} over ${points.length} days`}
      >
        {/* Gridlines first so bars sit on top of them. */}
        {ticks.map((t, i) => (
          <g key={t}>
            <line
              x1={padL}
              x2={W}
              y1={yOf(t)}
              y2={yOf(t)}
              stroke="var(--hairline)"
              strokeWidth={1}
            />
            <text
              x={padL - 6}
              y={yOf(t)}
              textAnchor="end"
              dominantBaseline="middle"
              style={{ fontSize: yFont, fill: "var(--ink-muted)" }}
              className="font-mono"
            >
              {tickLabels[i]}
            </text>
          </g>
        ))}
        {points.map((p, i) => {
          const h = (p.count / top) * H;
          return (
            <rect
              key={p.day}
              x={padL + i * (barW + gap)}
              y={H - h}
              width={barW}
              height={h}
              rx={1}
              fill={color}
              opacity={p.count === 0 ? 0.12 : 0.85}
            >
              <title>{`${p.day}: ${p.count}`}</title>
            </rect>
          );
        })}
      </svg>
      {/* A tick under every bar, aligned to it, so a spike can be read off
          to the exact day. Only every nth label is printed - enough to stay
          legible at this width - but each bar still carries its own count in
          the SVG title on hover. */}
      <div
        className="mt-1 flex"
        style={{ paddingLeft: `${(padL / W) * 100}%` }}
        aria-hidden
      >
        {points.map((p, i) => {
          const dayNum = p.day.slice(8);
          const first = i === 0;
          const monthChanges = i > 0 && p.day.slice(5, 7) !== points[i - 1].day.slice(5, 7);
          const show = first || monthChanges || i % labelEvery === 0;
          return (
            <span
              key={p.day}
              className="min-w-0 flex-1 text-center font-mono text-[9px] leading-none text-[var(--ink-muted)]"
              title={p.day}
            >
              {show ? (monthChanges || first ? `${p.day.slice(5, 7)}/${dayNum}` : dayNum) : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/// A ranked list with a proportional bar behind each row - top routes,
/// referrers, countries, submitters.
export function AdminRanked({
  rows,
  label,
  unit,
}: {
  rows: { label: string; value: number; sub?: string }[];
  label: string;
  unit: string;
}) {
  const peak = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div>
      <h3 className="font-serif text-base text-[var(--ink)]">{label}</h3>
      {rows.length === 0 ? (
        <p className="mt-2 text-xs text-[var(--ink-muted)]">Nothing yet.</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {rows.map((r) => (
            <li key={r.label} className="relative">
              <div
                aria-hidden
                className="absolute inset-y-0 left-0 rounded-sm"
                style={{
                  width: `${(r.value / peak) * 100}%`,
                  backgroundColor: "color-mix(in srgb, var(--accent-blue) 12%, transparent)",
                }}
              />
              <div className="relative flex items-baseline justify-between gap-3 px-2 py-1">
                <span className="min-w-0 truncate text-xs text-[var(--ink-secondary)]">
                  {r.label}
                </span>
                <span className="shrink-0 font-mono text-[11px] tabular-nums text-[var(--ink-muted)]">
                  {r.value.toLocaleString("en-US")} {unit}
                  {r.sub ? ` · ${r.sub}` : ""}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
