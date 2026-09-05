// The staircase: one frontier's history as a step chart. Server-rendered SVG,
// same fixed-viewBox approach as the stats charts, no client bundle - the
// chart has nothing to toggle, and a frontier page should be static HTML that
// indexes and prints.
//
// Three things the picture has to say without a legend being read:
//   - the frontier is the line, and it only ever moves in the frontier's
//     direction;
//   - the AI rows are the coloured dots at the right-hand end, the human
//     history is muted;
//   - a candidate (a held or unreviewed claim) is hollow and off the line.
//
// Numeric frontiers (an exponent, a rank, a proportion) get a real y axis.
// Rank-only frontiers (bounds that are expressions) get an ordinal axis: equal
// spacing per rank, no numbers, because printing "rank 3" would suggest a
// scale that does not exist.

import { competes, isNumericRecord, sortRows, steps, yearOf, type FrontierDirection } from "@/lib/frontiers";
import type { FrontierRowView } from "@/lib/data";

const W = 640;
const H = 300;
const PAD = { l: 64, r: 20, t: 16, b: 36 };

function fmt(v: number): string {
  if (Number.isInteger(v)) return String(v);
  if (v > 0 && v < 1) return `${(v * 100).toFixed(v * 100 < 10 ? 1 : 0)}%`;
  const s = v.toFixed(4);
  return s.replace(/0+$/, "").replace(/\.$/, "");
}

export function FrontierChart({ rows, direction }: { rows: FrontierRowView[]; direction: FrontierDirection }) {
  const numeric = isNumericRecord(rows);
  const sorted = sortRows(rows, direction);
  const stepped = steps(rows, direction);
  if (sorted.length === 0) return null;

  // x: fractional year, padded a little either side so end dots are not clipped.
  const years = sorted.map((r) => yearOf(r.date));
  const x0 = Math.floor(Math.min(...years)) - 1;
  const x1 = Math.ceil(Math.max(...years)) + 1;
  const sx = (y: number) => PAD.l + ((y - x0) / (x1 - x0)) * (W - PAD.l - PAD.r);

  // y: value (numeric) or rank (ordinal). Higher-is-better draws up; for a
  // "min" frontier the axis is inverted so an improvement still goes UP - the
  // reader's eye should not have to learn a new convention per frontier.
  const val = (r: FrontierRowView) => (numeric ? (r.valueNumeric ?? NaN) : (r.rank ?? NaN));
  const vals = sorted.map(val).filter((v) => Number.isFinite(v));
  let vmin = Math.min(...vals);
  let vmax = Math.max(...vals);
  if (vmin === vmax) {
    vmin -= 1;
    vmax += 1;
  }
  const span = vmax - vmin;
  vmin -= span * 0.08;
  vmax += span * 0.08;
  const sy = (v: number) => {
    const t = (v - vmin) / (vmax - vmin);
    const up = direction === "max" ? t : 1 - t;
    return PAD.t + (1 - up) * (H - PAD.t - PAD.b);
  };

  // The frontier path: horizontal to the next step's year, then vertical.
  const stepRows = stepped.filter((s) => s.isStep).map((s) => s.row);
  let d = "";
  stepRows.forEach((r, i) => {
    const x = sx(yearOf(r.date));
    const y = sy(val(r));
    if (i === 0) d += `M ${x.toFixed(1)} ${y.toFixed(1)}`;
    else d += ` H ${x.toFixed(1)} V ${y.toFixed(1)}`;
  });
  // Extend the frontier to the right edge so "still the frontier" is visible.
  if (stepRows.length) {
    const last = stepRows[stepRows.length - 1];
    d += ` H ${(W - PAD.r).toFixed(1)}`;
    void last;
  }

  // Axis ticks: decades on x; four ticks on y for numeric frontiers.
  const decadeStart = Math.ceil(x0 / 10) * 10;
  const xticks: number[] = [];
  for (let y = decadeStart; y <= x1; y += 10) xticks.push(y);
  const yticks = numeric ? [0, 1, 2, 3, 4].map((i) => vmin + (i / 4) * (vmax - vmin)) : [];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Frontier history, ${sorted.length} points from ${sorted[0].date.slice(0, 4)} to ${sorted[sorted.length - 1].date.slice(0, 4)}`}
    >
      {/* gridlines + x ticks */}
      {xticks.map((y) => (
        <g key={y}>
          <line x1={sx(y)} x2={sx(y)} y1={PAD.t} y2={H - PAD.b} stroke="var(--hairline)" strokeWidth={1} />
          <text x={sx(y)} y={H - PAD.b + 16} textAnchor="middle" fontSize={11} fill="var(--ink-muted)">
            {y}
          </text>
        </g>
      ))}
      {/* y ticks */}
      {yticks.map((v, i) => (
        <g key={i}>
          <line x1={PAD.l} x2={W - PAD.r} y1={sy(v)} y2={sy(v)} stroke="var(--hairline)" strokeWidth={1} strokeDasharray="2 4" />
          <text x={PAD.l - 8} y={sy(v) + 4} textAnchor="end" fontSize={11} fill="var(--ink-muted)">
            {fmt(v)}
          </text>
        </g>
      ))}
      {!numeric && (
        <text x={PAD.l - 8} y={PAD.t + 10} textAnchor="end" fontSize={10} fill="var(--ink-muted)">
          better ↑
        </text>
      )}

      {/* frontier */}
      {d && <path d={d} fill="none" stroke="var(--ink)" strokeWidth={1.75} strokeLinejoin="miter" />}

      {/* points, muted history first so AI dots paint on top */}
      {stepped
        .slice()
        .sort((a, b) => Number(!!a.row.entry) - Number(!!b.row.entry))
        .map(({ row, isStep }) => {
          const v = val(row);
          if (!Number.isFinite(v)) return null;
          const cx = sx(yearOf(row.date));
          const cy = sy(v);
          const live = competes(row.status);
          const ai = !!row.entry;
          const fill = !live ? "var(--paper-raised)" : ai ? "var(--accent-orange)" : isStep ? "var(--ink)" : "var(--ink-muted)";
          const stroke = !live ? "var(--status-warning)" : ai ? "var(--accent-orange)" : "var(--ink)";
          const r = ai ? 5.5 : isStep ? 3.5 : 2.5;
          const label = `${row.date}: ${row.valueTex.replace(/\$/g, "")} (${row.attribution})${row.status === "candidate" ? " - candidate, under review" : ""}${row.status === "retracted" ? " - retracted" : ""}`;
          return (
            <g key={row.id}>
              <circle cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={ai ? 1.5 : 1} />
              <title>{label}</title>
            </g>
          );
        })}
    </svg>
  );
}
