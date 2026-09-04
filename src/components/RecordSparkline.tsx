// A record's staircase at thumbnail size, for the strips on /records. Same
// derivation as RecordChart (steps, direction), stripped of axes and labels;
// the only thing it has to convey is the shape and where the AI dots are.

import { isNumericRecord, steps, yearOf, type RecordDirection } from "@/lib/records";
import type { RecordRowView } from "@/lib/data";

const W = 160;
const H = 40;
const P = 4;

export function RecordSparkline({ rows, direction }: { rows: RecordRowView[]; direction: RecordDirection }) {
  const numeric = isNumericRecord(rows);
  const stepped = steps(rows, direction);
  const val = (r: RecordRowView) => (numeric ? (r.valueNumeric ?? NaN) : (r.rank ?? NaN));
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
    d += i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : ` H ${x.toFixed(1)} V ${y.toFixed(1)}`;
  });
  if (stepRows.length) d += ` H ${W - P}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} aria-hidden className="shrink-0">
      <path d={d} fill="none" stroke="var(--ink-muted)" strokeWidth={1.25} />
      {pts
        .filter((s) => s.row.entry)
        .map((s) => (
          <circle
            key={s.row.id}
            cx={sx(yearOf(s.row.date))}
            cy={sy(val(s.row))}
            r={3}
            fill={s.row.status === "candidate" ? "var(--paper-raised)" : "var(--accent-orange)"}
            stroke={s.row.status === "candidate" ? "var(--status-warning)" : "var(--accent-orange)"}
            strokeWidth={1}
          />
        ))}
    </svg>
  );
}
