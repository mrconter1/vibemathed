// The staircase: one frontier's history as a step chart. Server-rendered SVG,
// same fixed-viewBox approach as the stats charts, because a frontier page
// should be static HTML that indexes and prints.
//
// The picture is still drawn entirely here. Hovering a point shows a card with
// the date, the value, who did it and how it was checked, and that layer alone
// is a client component (FrontierChartPoints) sitting on top as an overlay -
// see its header for why it is not inside the SVG. The <title> tooltips below
// stay, so a reader with no JavaScript loses the card and nothing else.
//
// Three things the picture has to say without a legend being read:
//   - the frontier is the line, and it only ever moves in the frontier's
//     direction;
//   - the AI rows are the coloured dots at the right-hand end, the human
//     history is muted;
//   - a candidate (a held or unreviewed claim) is hollow and off the line.
//
// Only numeric frontiers (an exponent, a rank, a proportion, a bound) are
// charted. A frontier whose values are expressions has no axis to put them
// on and renders nothing here; its page says so and shows the table.

import {
  chartScale,
  competes,
  fmtTick,
  offScale,
  sortRows,
  steps,
  yAxis,
  yPos,
  yearOf,
  type FrontierDirection,
} from "@/lib/frontiers";
import type { FrontierRowView } from "@/lib/data";
import { TeX, deTeX, texToHtml } from "@/components/TeX";
import { VERIFICATION } from "@/lib/display";
import {
  FrontierChartPoints,
  type ChartPoint,
} from "@/components/FrontierChartPoints";

const W = 640;
const H = 300;
const PAD = { l: 64, r: 20, t: 16, b: 36 };

/// A date for the hover card. Rows carry whatever precision their source had -
/// a bare year for the older history, a full date for the recent rows - and the
/// card shows exactly that, no more.
function fmtDate(d: string): string {
  if (d.length === 4) return d;
  const dt = new Date(d.slice(0, 10));
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString("en-GB", {
    day: d.length >= 10 ? "numeric" : undefined,
    month: "short",
    year: "numeric",
  });
}

/// Shown as a chip on the card. "published" and "historical" are the ordinary
/// cases and saying so adds nothing; the two exceptions are the whole point.
const CARD_STATUS: Record<string, string> = {
  candidate: "candidate",
  retracted: "retracted",
};

/// One row as a line of text: the SVG <title> a no-JS reader gets, and the
/// accessible name of the hover target. deTeX, not the raw TeX, because a
/// screen reader given "\gg \dfrac{\log X}{\log_4 X}" reads it out backslash by
/// backslash.
function rowLabel(row: FrontierRowView): string {
  const flag =
    row.status === "candidate"
      ? " - candidate, under review"
      : row.status === "retracted"
        ? " - retracted"
        : "";
  return `${row.date}: ${deTeX(row.valueTex)} (${row.attribution})${flag}`;
}

/// The hover card's payload for one row, positioned as a percentage of whatever
/// box drew it. Exported because the sparkline on the frontiers landing page
/// shows the same card from a different geometry, and the two must not describe
/// the same row differently.
///
/// This runs on the server: it calls texToHtml, which is KaTeX. Building it in
/// the client component instead would put the whole of KaTeX in the browser
/// bundle to render one line of math.
export function chartPoint(
  row: FrontierRowView,
  xPct: number,
  yPct: number,
): ChartPoint {
  const ver = row.entry
    ? VERIFICATION[row.entry.verification as keyof typeof VERIFICATION]
    : undefined;
  return {
    id: row.id,
    xPct,
    yPct,
    ai: !!row.entry,
    label: rowLabel(row),
    date: fmtDate(row.date),
    valueHtml: texToHtml(row.valueTex),
    attribution: row.attribution,
    model: row.entry?.model ?? null,
    verificationLabel: ver?.label ?? null,
    verificationColor: ver?.color ?? null,
    statusLabel: CARD_STATUS[row.status] ?? null,
    note: row.note,
    href: row.entry ? `/problem/${row.entry.slug}` : null,
    sourceUrl: row.sourceUrl,
  };
}

export function FrontierChart({
  rows,
  direction,
}: {
  rows: FrontierRowView[];
  direction: FrontierDirection;
}) {
  const { numeric, proportion } = chartScale(rows);
  const sorted = sortRows(rows, direction);
  const stepped = steps(rows, direction);
  if (sorted.length === 0) return null;
  // No chart for a frontier whose values are expressions rather than numbers
  // (long gaps between primes: bounds like X log X log₂X / log₃X). An ordinal
  // axis was tried and read as a fake scale - equal spacing per rank looks
  // like a measurement of something. The table below the chart slot carries
  // the history in the only honest form, the expressions themselves.
  if (!numeric) return null;

  const val = (r: FrontierRowView) => r.valueNumeric ?? NaN;
  // Rows so far off the rest of the data that the axis must not reach them
  // (lib/frontiers offScale). They are not drawn; they are named under the
  // plot instead.
  const { excluded } = offScale(sorted.map(val), direction);
  const onChart = (r: FrontierRowView) => !excluded.includes(val(r));
  const shown = sorted.filter(onChart);
  const left = sorted.filter((r) => !onChart(r));

  // x: fractional year, padded a little either side so end dots are not clipped.
  const years = shown.map((r) => yearOf(r.date));
  const x0 = Math.floor(Math.min(...years)) - 1;
  const x1 = Math.ceil(Math.max(...years)) + 1;
  const sx = (y: number) =>
    PAD.l + ((y - x0) / (x1 - x0)) * (W - PAD.l - PAD.r);

  // y: higher-is-better draws up; for a "min" frontier the axis is inverted so
  // an improvement still goes UP - the reader's eye should not have to learn a
  // new convention per frontier. Extent, linear/log and ticks all come from
  // one place (lib/frontiers), so the sparkline projects identically.
  const axis = yAxis(shown.map(val), proportion);
  // Where a row with no value on this axis is drawn: the worst end, which is
  // the bottom for a "max" frontier and the top for a "min" one. For a
  // proportion that is literally true - Selberg's "positive proportion" is
  // κ > 0 - and for anything else it is the only honest place, since any other
  // height would claim a value the source did not give.
  const floor = direction === "max" ? axis.lo : axis.hi;
  const sy = (v: number) =>
    PAD.t + (1 - yPos(axis, v, direction)) * (H - PAD.t - PAD.b);

  // The frontier path: horizontal to the next step's year, then vertical.
  // Only steps with a value on this axis; a qualitative early step has no
  // height for the line to be at, and a NaN in a path datum blanks the line.
  const stepRows = stepped
    .filter((s) => s.isStep && Number.isFinite(val(s.row)) && onChart(s.row))
    .map((s) => s.row);
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
  const yticks = axis.ticks;

  // Geometry is computed once and consumed twice: by the SVG circles below, and
  // by the hover overlay, which needs the same coordinates as percentages. Two
  // passes would be two chances for them to drift apart.
  // Muted history first, so the AI dots paint on top of it.
  const drawn = stepped
    .slice()
    .sort((a, b) => Number(!!a.row.entry) - Number(!!b.row.entry))
    .map(({ row, isStep }) => ({ row, isStep, v: val(row) }))
    // A competing row with no value on a numeric axis is still drawn, on the
    // floor. Anything else without a value (a rank-only candidate on a numeric
    // frontier, say) has nowhere to go and is left out.
    .filter(
      ({ row, v }) =>
        onChart(row) && (Number.isFinite(v) || competes(row.status)),
    )
    .map(({ row, isStep, v }) => {
      const cx = sx(yearOf(row.date));
      // No value at all (a qualitative early step): drawn on the floor.
      const offScale = !Number.isFinite(v);
      const cy = sy(offScale ? floor : v);
      const live = competes(row.status);
      const ai = !!row.entry;
      return {
        row,
        isStep,
        cx,
        cy,
        live,
        ai,
        fill: offScale
          ? "var(--paper-raised)"
          : !live
            ? "var(--paper-raised)"
            : ai
              ? "var(--accent-orange)"
              : isStep
                ? "var(--ink)"
                : "var(--ink-muted)",
        stroke: offScale
          ? "var(--ink-muted)"
          : !live
            ? "var(--status-warning)"
            : ai
              ? "var(--accent-orange)"
              : "var(--ink)",
        r: ai ? 5.5 : offScale ? 3 : isStep ? 3.5 : 2.5,
        label: rowLabel(row),
      };
    });

  const points: ChartPoint[] = drawn.map(({ row, cx, cy }) =>
    chartPoint(row, (cx / W) * 100, (cy / H) * 100),
  );

  return (
    <>
      <div className="relative">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full"
          role="img"
          aria-label={`Frontier history, ${shown.length} points from ${shown[0].date.slice(0, 4)} to ${shown[shown.length - 1].date.slice(0, 4)}`}
        >
          {/* gridlines + x ticks */}
          {xticks.map((y) => (
            <g key={y}>
              <line
                x1={sx(y)}
                x2={sx(y)}
                y1={PAD.t}
                y2={H - PAD.b}
                stroke="var(--hairline)"
                strokeWidth={1}
              />
              <text
                x={sx(y)}
                y={H - PAD.b + 16}
                textAnchor="middle"
                fontSize={11}
                fill="var(--ink-muted)"
              >
                {y}
              </text>
            </g>
          ))}
          {/* y ticks */}
          {yticks.map((v, i) => (
            <g key={i}>
              <line
                x1={PAD.l}
                x2={W - PAD.r}
                y1={sy(v)}
                y2={sy(v)}
                stroke="var(--hairline)"
                strokeWidth={1}
                strokeDasharray="2 4"
              />
              <text
                x={PAD.l - 8}
                y={sy(v) + 4}
                textAnchor="end"
                fontSize={11}
                fill="var(--ink-muted)"
              >
                {fmtTick(v, axis, proportion)}
              </text>
            </g>
          ))}
          {!numeric && (
            <text
              x={PAD.l - 8}
              y={PAD.t + 10}
              textAnchor="end"
              fontSize={10}
              fill="var(--ink-muted)"
            >
              better ↑
            </text>
          )}

          {/* frontier */}
          {d && (
            <path
              d={d}
              fill="none"
              stroke="var(--ink)"
              strokeWidth={1.75}
              strokeLinejoin="miter"
            />
          )}

          {/* points. The <title> is the no-JS tooltip and stays whatever the
          overlay does. */}
          {drawn.map(({ row, cx, cy, ai, fill, stroke, r, label }) => (
            <g key={row.id}>
              <circle
                cx={cx}
                cy={cy}
                r={r}
                fill={fill}
                stroke={stroke}
                strokeWidth={ai ? 1.5 : 1}
              />
              <title>{label}</title>
            </g>
          ))}
        </svg>

        <FrontierChartPoints points={points} />
      </div>
      {left.length > 0 && (
        <p className="mt-2 text-[11px] text-[var(--ink-muted)]">
          Not on the chart:{" "}
          {left.map((r, i) => (
            <span key={r.id}>
              {i > 0 && ", "}
              {r.attribution}&apos;s <TeX>{r.valueTex}</TeX> (
              {r.date.slice(0, 4)})
            </span>
          ))}
          . {left.length === 1 ? "It is" : "They are"} more than a hundred times
          off the scale of everything else, and an axis that reached{" "}
          {left.length === 1 ? "it" : "them"} would flatten the rest of the
          history into a few pixels. The table below has every step.
        </p>
      )}
    </>
  );
}
