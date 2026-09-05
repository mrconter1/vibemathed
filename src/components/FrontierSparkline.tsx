// A frontier's staircase at thumbnail size, for the strips on /frontiers. Same
// derivation as FrontierChart (steps, direction), stripped of axes and labels;
// the only thing it has to convey is the shape and where the AI dots are.
//
// Those AI dots are hoverable, with the same card the full chart shows. It fits
// here only because the thumbnail dots the entries and nothing else - one to
// three per frontier, not the twenty-odd points of the full history - so the
// targets do not overlap at 160px wide.

import {
  chartScale,
  dodge,
  offScale,
  steps,
  yAxis,
  yPos,
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
  const { numeric } = chartScale(rows);
  // Rank-only frontiers have no chart (see FrontierChart), so no thumbnail
  // either; the strip's value cell already shows the expression.
  if (!numeric) return null;
  const stepped = steps(rows, direction);
  const val = (r: FrontierRowView) => r.valueNumeric ?? NaN;
  // Same exclusions as the full chart: rows without a value (the qualitative
  // early steps) and rows a hundred times off the rest of the data. The
  // thumbnail has no room to say what it left out; the chart page does.
  const { excluded } = offScale(
    stepped.map((s) => val(s.row)),
    direction,
  );
  const pts = stepped.filter(
    (s) => Number.isFinite(val(s.row)) && !excluded.includes(val(s.row)),
  );
  if (pts.length === 0) return null;

  const xs = pts.map((s) => yearOf(s.row.date));
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs) + 0.5;
  // Same axis as the full chart, so the thumbnail's shape is the chart's
  // shape (log where the chart is log). Not pinned for a proportion, though:
  // at 40px tall the thumbnail has room to show the climb, not the distance
  // to 100%.
  const axis = yAxis(
    pts.map((s) => val(s.row)),
    false,
  );
  const sx = (y: number) => P + ((y - x0) / (x1 - x0 || 1)) * (W - 2 * P);
  const sy = (v: number) => P + (1 - yPos(axis, v, direction)) * (H - 2 * P);

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

  // Same nudge as the chart: three AI rows four days apart are one blob at
  // this size otherwise, and their hover targets one target.
  const dots = dodge(
    pts
      .filter((s) => s.row.entry)
      .map((s) => ({
        row: s.row,
        cx: sx(yearOf(s.row.date)),
        cy: sy(val(s.row)),
        r: 3,
      })),
    0,
    W,
    1,
  );

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
