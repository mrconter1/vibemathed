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
  const barW = Math.max(1, W / Math.max(1, points.length) - gap);

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
        {points.map((p, i) => {
          const h = (p.count / peak) * (H - 4);
          return (
            <rect
              key={p.day}
              x={i * (barW + gap)}
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
      <div className="mt-1 flex justify-between font-mono text-[10px] text-[var(--ink-muted)]">
        <span>{points[0]?.day}</span>
        <span>{points[points.length - 1]?.day}</span>
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
