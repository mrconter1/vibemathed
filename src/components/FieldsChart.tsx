import type { ChartProblem } from "@/lib/problems";

// Entries per mathematical area: a horizontal bar per field group, whole
// record, sorted by size. A server component on purpose - there is nothing
// to hover or toggle, so it ships no JavaScript.

const VIEW_W = 640;
const VIEW_H = 360;
// The label column fits the taxonomy's longest name ("Quantum information &
// computing") at 12px; the right margin holds the count.
const M = { top: 6, right: 42, bottom: 6, left: 196 };

export function FieldsChart({ problems }: { problems: ChartProblem[] }) {
  const counts = new Map<string, number>();
  for (const p of problems) {
    const key = p.fieldGroup ?? "Unclassified";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const rows = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const max = rows[0]?.[1] ?? 1;

  const innerH = VIEW_H - M.top - M.bottom;
  const rowH = innerH / Math.max(1, rows.length);
  const barH = Math.min(18, rowH * 0.6);
  const barW = (n: number) =>
    Math.max(2, (n / max) * (VIEW_W - M.left - M.right));

  return (
    <div>
      <h2 className="font-serif text-lg text-[var(--ink)]">Entries per area</h2>
      <p className="mt-1 text-xs text-[var(--ink-muted)]">
        Every tracked entry, grouped by mathematical area.
      </p>

      <div className="relative mt-3" style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}>
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-full w-full"
          role="img"
          aria-label={`Bar chart of tracked entries per mathematical area: ${rows
            .map(([g, n]) => `${g} ${n}`)
            .join(", ")}.`}
        >
          {rows.map(([group, n], i) => {
            const cy = M.top + rowH * i + rowH / 2;
            return (
              <g key={group}>
                <text
                  x={M.left - 10}
                  y={cy}
                  dominantBaseline="middle"
                  textAnchor="end"
                  style={{ fontSize: 12, fill: "var(--ink-secondary)" }}
                >
                  {group}
                </text>
                <rect
                  x={M.left}
                  y={cy - barH / 2}
                  width={barW(n)}
                  height={barH}
                  rx={2}
                  fill="var(--accent-blue)"
                  fillOpacity={0.75}
                />
                <text
                  x={M.left + barW(n) + 8}
                  y={cy}
                  dominantBaseline="middle"
                  className="font-mono"
                  style={{
                    fontSize: 12,
                    fill: "var(--ink-muted)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {n}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
