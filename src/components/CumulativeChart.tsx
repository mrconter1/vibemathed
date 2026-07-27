import type { MathProblem } from "@/lib/problems";

const VIEW_W = 640;
const VIEW_H = 300;
const MARGIN = { top: 20, right: 20, bottom: 40, left: 44 };
const PLOT_W = VIEW_W - MARGIN.left - MARGIN.right;
const PLOT_H = VIEW_H - MARGIN.top - MARGIN.bottom;

const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// solveDate is "YYYY-MM-DD" | "YYYY-MM" | "YYYY". Bucket to a month key; a bare
// year (a couple of the imported entries) is placed mid-year so it doesn't
// distort the front of the timeline.
function monthKey(solveDate: string): string {
  if (/^\d{4}-\d{2}/.test(solveDate)) return solveDate.slice(0, 7);
  if (/^\d{4}$/.test(solveDate)) return `${solveDate}-06`;
  return solveDate.slice(0, 7);
}

function label(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return `${MONTH[m - 1]} '${String(y).slice(2)}`;
}

function niceMax(v: number, step: number) {
  return Math.max(step, Math.ceil(v / step) * step);
}

export function CumulativeChart({ problems }: { problems: MathProblem[] }) {
  const keys = problems.map((p) => monthKey(p.solveDate)).sort();
  if (keys.length === 0) return null;

  // Build a continuous month range from first to last solve.
  const range: string[] = [];
  let [y, m] = keys[0].split("-").map(Number);
  const [ey, em] = keys[keys.length - 1].split("-").map(Number);
  while (y < ey || (y === ey && m <= em)) {
    range.push(`${y}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }

  const cumulative = range.map((mk) => keys.filter((k) => k <= mk).length);
  const total = problems.length;
  const yMax = niceMax(total, 20);
  const yStep = yMax / 4;

  const x = (i: number) => MARGIN.left + (range.length === 1 ? PLOT_W / 2 : (i / (range.length - 1)) * PLOT_W);
  const yScale = (v: number) => MARGIN.top + PLOT_H - (v / yMax) * PLOT_H;

  const linePts = cumulative.map((v, i) => `${x(i)},${yScale(v)}`).join(" ");
  const areaPts = `${x(0)},${yScale(0)} ${linePts} ${x(range.length - 1)},${yScale(0)}`;

  // Show at most ~7 x labels to avoid crowding.
  const xEvery = Math.ceil(range.length / 7);
  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round(i * yStep));

  return (
    <div>
      <h2 className="font-serif text-lg text-[var(--ink)]">Problems solved over time</h2>
      <p className="mt-1 text-xs text-[var(--ink-muted)]">
        Cumulative count of tracked resolutions, {total} to date.
      </p>

      <div className="relative mt-3" style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}>
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-full w-full"
          role="img"
          aria-label={`Cumulative problems solved over time, rising to ${total}`}
        >
          {yTicks.map((t) => (
            <g key={t}>
              <line
                x1={MARGIN.left}
                x2={VIEW_W - MARGIN.right}
                y1={yScale(t)}
                y2={yScale(t)}
                stroke="var(--hairline)"
                strokeWidth={1}
              />
              <text
                x={MARGIN.left - 8}
                y={yScale(t)}
                dominantBaseline="middle"
                textAnchor="end"
                className="font-mono"
                style={{ fontSize: 11, fill: "var(--ink-muted)", fontVariantNumeric: "tabular-nums" }}
              >
                {t}
              </text>
            </g>
          ))}

          <polygon points={areaPts} fill="var(--accent-blue)" fillOpacity={0.12} />
          <polyline
            points={linePts}
            fill="none"
            stroke="var(--accent-blue)"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {range.map((mk, i) =>
            i % xEvery === 0 || i === range.length - 1 ? (
              <text
                key={mk}
                x={x(i)}
                y={VIEW_H - MARGIN.bottom + 18}
                textAnchor="middle"
                className="font-mono"
                style={{ fontSize: 10, fill: "var(--ink-muted)" }}
              >
                {label(mk)}
              </text>
            ) : null,
          )}
        </svg>
      </div>
    </div>
  );
}
