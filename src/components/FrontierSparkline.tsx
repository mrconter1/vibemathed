// A frontier's staircase at thumbnail size, for the strips on /frontiers. Same
// derivation as FrontierChart (steps, direction), stripped of axes and labels;
// the only thing it has to convey is the shape and where the AI dots are.
//
// Those AI dots are hoverable, with the same card the full chart shows. It fits
// here only because the thumbnail dots the entries and nothing else - one to
// three per frontier, not the twenty-odd points of the full history - so the
// targets do not overlap at 160px wide.

import {
  isNumericRecord,
  steps,
  yearOf,
  type FrontierDirection,
} from "@/lib/frontiers";
import type { FrontierRowView } from "@/lib/data";
import { chartPoint } from "@/components/FrontierChart";
import { FrontierChartPoints } from "@/components/FrontierChartPoints";

const W = 160;
const H = 40;
const P = 4;

export function FrontierSparkline({
  rows,
  direction,
}: {
  rows: FrontierRowView[];
  direction: FrontierDirection;
}) {
  const numeric = isNumericRecord(rows);
  const stepped = steps(rows, direction);
  const val = (r: FrontierRowView) =>
    numeric ? (r.valueNumeric ?? NaN) : (r.rank ?? NaN);
  const pts = stepped.filter((s) => Number.isFinite(val(s.row)));
  if (pts.length === 0) return null;

  const xs = pts.map((s) => yearOf(s.row.date));
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs) + 0.5;
  const vs = pts.map((s) => val(s.row));
  let vmin = Math.min(...vs);
  let vmax = Math.max(...vs);
  if (vmin === vmax) {
    vmin -= 1;
    vmax += 1;
  }
  const sx = (y: number) => P + ((y - x0) / (x1 - x0 || 1)) * (W - 2 * P);
  const sy = (v: number) => {
    const t = (v - vmin) / (vmax - vmin);
    const up = direction === "max" ? t : 1 - t;
    return P + (1 - up) * (H - 2 * P);
  };

  const stepRows = pts.filter((s) => s.isStep).map((s) => s.row);
  let d = "";
  stepRows.forEach((r, i) => {
    const x = sx(yearOf(r.date));
    const y = sy(val(r));
    d +=
      i === 0
        ? `M ${x.toFixed(1)} ${y.toFixed(1)}`
        : ` H ${x.toFixed(1)} V ${y.toFixed(1)}`;
  });
  if (stepRows.length) d += ` H ${W - P}`;

  const dots = pts
    .filter((s) => s.row.entry)
    .map((s) => ({
      row: s.row,
      cx: sx(yearOf(s.row.date)),
      cy: sy(val(s.row)),
    }));

  return (
    <div className="relative shrink-0" style={{ width: W, height: H }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        aria-hidden
        className="block"
      >
        <path d={d} fill="none" stroke="var(--ink-muted)" strokeWidth={1.25} />
        {dots.map(({ row, cx, cy }) => (
          <circle
            key={row.id}
            cx={cx}
            cy={cy}
            r={3}
            fill={
              row.status === "candidate"
                ? "var(--paper-raised)"
                : "var(--accent-orange)"
            }
            stroke={
              row.status === "candidate"
                ? "var(--status-warning)"
                : "var(--accent-orange)"
            }
            strokeWidth={1}
          />
        ))}
      </svg>
      <FrontierChartPoints
        compact
        points={dots.map(({ row, cx, cy }) =>
          chartPoint(row, (cx / W) * 100, (cy / H) * 100),
        )}
      />
    </div>
  );
}
