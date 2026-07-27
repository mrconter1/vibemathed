import type { MathProblem } from "@/lib/problems";

function polar(cx: number, cy: number, r: number, angle: number): [number, number] {
  return [cx + r * Math.cos(angle), cy + r * Math.sin(angle)];
}

function slice(cx: number, cy: number, r: number, a0: number, a1: number): string {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
}

export function SolveRatioChart({ problems }: { problems: MathProblem[] }) {
  const proved = problems.filter((p) => p.solveType === "proved").length;
  const disproved = problems.filter((p) => p.solveType === "disproved").length;
  const total = proved + disproved;
  if (total === 0) return null;

  const pct = (n: number) => Math.round((n / total) * 100);
  const cx = 90;
  const cy = 90;
  const r = 80;
  const start = -Math.PI / 2;
  const mid = start + (proved / total) * 2 * Math.PI;
  const end = start + 2 * Math.PI;

  const rows = [
    { label: "Proved", n: proved, color: "var(--accent-blue)" },
    { label: "Disproved", n: disproved, color: "var(--accent-orange)" },
  ];

  return (
    <div>
      <h2 className="font-serif text-lg text-[var(--ink)]">Proved vs. disproved</h2>
      <p className="mt-1 text-xs text-[var(--ink-muted)]">Across all {total} tracked resolutions.</p>

      <div className="mt-4 flex items-center justify-center gap-6">
        <svg
          viewBox="0 0 180 180"
          className="h-36 w-36 shrink-0"
          role="img"
          aria-label={`${pct(proved)} percent proved, ${pct(disproved)} percent disproved`}
        >
          {proved > 0 && (
            <path
              d={slice(cx, cy, r, start, mid)}
              fill="var(--accent-blue)"
              stroke="var(--paper)"
              strokeWidth={2}
            />
          )}
          {disproved > 0 && (
            <path
              d={slice(cx, cy, r, mid, end)}
              fill="var(--accent-orange)"
              stroke="var(--paper)"
              strokeWidth={2}
            />
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
    </div>
  );
}
