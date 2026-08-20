import type { ReactNode } from "react";

// A whole-of-something pie card: title, one-line caption, the pie, and a
// legend with counts and percentages. Shared by the ratio charts on the stats
// page so they stay visually identical (mark specs per the dataviz skill:
// paper-colored 2px gaps between slices, legend text in ink tokens with the
// color carried by a dot, never by the text itself).

interface PieRow {
  label: string;
  n: number;
  /// CSS color. Assign by entity, in fixed order - never by rank.
  color: string;
}

function polar(cx: number, cy: number, r: number, angle: number): [number, number] {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

function slice(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
}

export function RatioPie({
  title,
  caption,
  rows,
  note,
  controls,
}: {
  title: string;
  caption: string;
  rows: PieRow[];
  /// Rendered under the caption: what a filter excluded, when one is active.
  note?: ReactNode;
  /// Rendered centered at the foot of the card, like the time charts' toggles.
  controls?: ReactNode;
}) {
  const total = rows.reduce((sum, r) => sum + r.n, 0);

  // An empty pie still renders its frame, because `controls` is how the reader
  // got here and returning null would take the filter away with the chart -
  // and the filter is persisted, so the card would not come back on reload.
  if (total === 0) {
    return (
      <div className="flex h-full flex-col">
        <h2 className="font-serif text-lg text-[var(--ink)]">{title}</h2>
        <p className="mt-1 text-xs text-[var(--ink-muted)]">{caption}</p>
        {note}
        <div className="mt-4 flex flex-1 items-center justify-center">
          <p className="text-sm text-[var(--ink-muted)]">Nothing in this slice.</p>
        </div>
        {controls && <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">{controls}</div>}
      </div>
    );
  }

  const pct = (n: number) => Math.round((n / total) * 100);
  const cx = 90;
  const cy = 90;
  const r = 80;

  // Slices start at 12 o'clock and run clockwise in row order.
  const start = -Math.PI / 2;
  const visible = rows.filter((row) => row.n > 0);
  const slices = visible.map((row, i) => {
    const before = visible.slice(0, i).reduce((sum, r) => sum + r.n, 0);
    return {
      ...row,
      a0: start + (before / total) * 2 * Math.PI,
      a1: start + ((before + row.n) / total) * 2 * Math.PI,
    };
  });

  return (
    <div className="flex h-full flex-col">
      <h2 className="font-serif text-lg text-[var(--ink)]">{title}</h2>
      <p className="mt-1 text-xs text-[var(--ink-muted)]">{caption}</p>
      {note}

      {/* flex-wrap: on very narrow screens the legend drops below the pie
          instead of squeezing out of the card. */}
      <div className="mt-4 flex flex-1 flex-wrap items-center justify-center gap-x-6 gap-y-3">
        <svg
          viewBox="0 0 180 180"
          className="h-36 w-36 shrink-0"
          role="img"
          aria-label={slices.map((s) => `${pct(s.n)} percent ${s.label.toLowerCase()}`).join(", ")}
        >
          {/* A lone slice is the whole circle, and an SVG arc whose start and
              end are the same point draws nothing at all - the card rendered
              as an empty square with a hairline seam. Rare before the tier
              filter existed, routine now that one can drive a category to
              zero, so the full-circle case gets a real circle. */}
          {slices.length === 1 ? (
            <circle cx={cx} cy={cy} r={r} fill={slices[0].color} />
          ) : (
            slices.map((s) => (
              <path
                key={s.label}
                d={slice(cx, cy, r, s.a0, s.a1)}
                fill={s.color}
                stroke="var(--paper)"
                strokeWidth={2}
              />
            ))
          )}
        </svg>

        <ul className="flex flex-col gap-2 text-sm">
          {rows.map((row) => (
            <li key={row.label} className="flex items-center gap-2">
              <span
                aria-hidden
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: row.color }}
              />
              <span className="text-[var(--ink-secondary)]">{row.label}</span>
              <span className="font-mono tabular-nums text-[var(--ink)]">{row.n}</span>
              <span className="font-mono text-xs tabular-nums text-[var(--ink-muted)]">
                ({pct(row.n)}%)
              </span>
            </li>
          ))}
        </ul>
      </div>

      {controls && <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">{controls}</div>}
    </div>
  );
}
