"use client";

import { useEffect, useRef, useState } from "react";
import type { ChartProblem } from "@/lib/problems";
import {
  CHART_GRAN,
  bucketKey,
  lastBucketPartial,
  bucketTooltipLabel,
  rangeCaption,
  timeWindow,
} from "@/lib/time-buckets";
import { PartialWeekNote, TierNote, TierToggle, TimeAxis, TimeRangeToggle } from "@/components/TimeControls";
import { useChartSettings } from "@/lib/chart-settings";

// Cumulative entries over time, one line per mathematical area. Was a
// snapshot bar chart, which answered "what is the record made of" but not the
// more interesting question next to it - whether an area is growing or has
// stalled. Same frame, scales and hover behaviour as the other line charts.
//
// SERIES COUNT. The taxonomy has twelve groups and twelve lines is spaghetti,
// so the seven largest are named and the rest fold into one "Other" line. That
// is a cap, so it is stated in the caption and the folded groups are listed in
// the legend chip's title - a reader can always see what was folded and how
// much of the record it is.
//
// COLOR. The seven hues are ModelsChart's palette, unchanged, because the two
// charts sit on the same page and a second colour system would read as a
// second meaning. "Other" takes a neutral gray: it is a residue, not an
// identity, and should not compete with the named areas.
//
// The palette was run through the dataviz validator against both surfaces
// (#faf8f0 light, #201d16 dark). It passes the lightness band, the
// normal-vision floor (worst adjacent pair 16.3) and contrast on both. It does
// NOT clear the colour-blind separation bar: mustard and green sit at 4.6 dE
// under protanopia, which is the same limitation the existing site palette
// already carries. That is admissible only with secondary encoding, and this
// chart has three: every legend chip pairs its colour with the written area
// name, hovering a line or a chip isolates it and fades the rest to 25%, and
// the tooltip lists each visible series by value. Colour is never the only
// thing distinguishing two lines here.

const VIEW_W = 640;
const VIEW_H = 360;
const MARGIN = { top: 20, right: 20, bottom: 40, left: 44 };
const PLOT_W = VIEW_W - MARGIN.left - MARGIN.right;
const PLOT_H = VIEW_H - MARGIN.top - MARGIN.bottom;

/// How many areas get a line of their own before the tail is folded.
const NAMED = 7;

const OTHER = "Other";

/// Fixed hue order, ModelsChart's palette. Colour follows the entity: an area
/// keeps its hue no matter how many series the legend toggles have hidden.
const PALETTE = [
  "#2a78d6", // blue
  "#eb6834", // orange
  "#8b5cf6", // violet
  "#2e9e4f", // green
  "#b8860b", // mustard
  "#0f9b9b", // teal
  "#d23b6e", // magenta
];

/// The residue, deliberately desaturated so it reads as "everything else".
const OTHER_COLOR = "#6f6a5e";

function niceMax(v: number, step: number) {
  return Math.max(step, Math.ceil(v / step) * step);
}

export function FieldsChart({
  problems,
  today,
}: {
  problems: ChartProblem[];
  /// Today's date from the server, so the window's last bucket is the same
  /// on both sides of hydration.
  today: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const { range: timeRange, setRange, tier, setTier, hidden, toggleSeries } =
    useChartSettings("fields");
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Tier scope is applied before anything else, so every count, axis and
  // legend total below describes exactly the selected slice. Choosing a tier
  // necessarily drops entries with none recorded; the caption says how many.
  const scoped =
    tier === "all" ? problems : problems.filter((p) => p.aiContribution === tier);

  // Axis source falls back to the unfiltered set when a tier selects nothing.
  // Without this the empty case hits the early return below and the whole card
  // disappears - including the control that chose the tier, which is persisted,
  // so the chart would still be gone on the next visit. Better to draw the
  // frame with no line in it and leave the way out on screen.
  const axisSource = scoped.length > 0 ? scoped : problems;
  const keys = axisSource.map((p) => bucketKey(p.solveDate, CHART_GRAN)).sort();
  if (keys.length === 0) return null;

  const { buckets: range, from } = timeWindow(keys[0], today, timeRange);
  const inWindow = scoped.filter((p) => bucketKey(p.solveDate, CHART_GRAN) >= from);

  // Rank by WHOLE-RECORD total, not by the window's. This is the one chart
  // whose series are data-derived rather than a fixed list, so ranking on the
  // window would rename and recolour the lines every time the range changed -
  // an area's colour has to belong to the area, not to its current position.
  // A named area with nothing in the window simply draws flat at zero.
  const totals = new Map<string, number>();
  for (const p of problems) {
    const g = p.fieldGroup ?? "Unclassified";
    totals.set(g, (totals.get(g) ?? 0) + 1);
  }
  const ranked = [...totals.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );
  const named = ranked.slice(0, NAMED).map(([g]) => g);
  const folded = ranked.slice(NAMED);

  const groupOf = (p: ChartProblem) => {
    const g = p.fieldGroup ?? "Unclassified";
    return named.includes(g) ? g : OTHER;
  };

  const series = [
    ...named.map((g, i) => ({ key: g, label: g, color: PALETTE[i], title: g })),
    ...(folded.length
      ? [
          {
            key: OTHER,
            label: OTHER,
            color: OTHER_COLOR,
            title: folded.map(([g, n]) => `${g} (${n})`).join(", "),
          },
        ]
      : []),
  ].map((s) => {
    const seriesKeys = inWindow
      .filter((p) => groupOf(p) === s.key)
      .map((p) => bucketKey(p.solveDate, CHART_GRAN));
    return {
      ...s,
      cumulative: range.map((mk) => seriesKeys.filter((k) => k <= mk).length),
      total: seriesKeys.length,
    };
  });

  const visible = series.filter((s) => !hidden.has(s.key));
  // Step scales to the window. A fixed step of 20 was right for the whole
  // record but rounded a narrow window's totals up to a single gridline,
  // flattening every line onto the axis just as the reader zoomed in.
  const peak = Math.max(1, ...visible.map((s) => s.total));
  const yMax = niceMax(peak, peak > 60 ? 20 : peak > 20 ? 10 : 5);

  const x = (i: number) =>
    MARGIN.left + (range.length === 1 ? PLOT_W / 2 : (i / (range.length - 1)) * PLOT_W);
  const yScale = (v: number) => MARGIN.top + PLOT_H - (v / yMax) * PLOT_H;

  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round((i * yMax) / 4));

  function handleMove(e: React.MouseEvent<SVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * VIEW_W;
    const t = (svgX - MARGIN.left) / PLOT_W;
    const i = Math.round(t * (range.length - 1));
    setHover(Math.min(Math.max(i, 0), range.length - 1));
  }

  const active = isDesktop && hover !== null && hover < range.length ? hover : null;

  return (
    <div className="flex h-full flex-col">
      <h2 className="font-serif text-lg text-[var(--ink)]">Growth per area</h2>
      <p className="mt-1 text-xs text-[var(--ink-muted)]">
        Cumulative tracked entries by mathematical area {rangeCaption(timeRange)};
        the {NAMED} largest over the whole record, with the remaining{" "}
        {folded.length} folded into Other.
      </p>
      <TierNote tier={tier} shown={scoped.length} total={problems.length} />

      {/* Legend doubles as the current totals AND the visibility toggles. */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {series.map((s) => {
          const off = hidden.has(s.key);
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => toggleSeries(s.key)}
              aria-pressed={!off}
              title={s.title}
              onMouseEnter={() => setFocused(s.key)}
              onMouseLeave={() => setFocused(null)}
              className={`inline-flex items-center gap-1.5 rounded px-1 py-0.5 transition-opacity ${
                off ? "opacity-40" : ""
              }`}
            >
              <span
                aria-hidden
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className={`text-[var(--ink-secondary)] ${off ? "line-through" : ""}`}>
                {s.label}
              </span>
              <span className="font-mono tabular-nums text-[var(--ink-muted)]">{s.total}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex flex-1 flex-col justify-center">
        <div className="relative" style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="h-full w-full"
            role="img"
            aria-label={`Cumulative tracked entries over time, one line per mathematical area: ${series
              .map((s) => `${s.label} ${s.total}`)
              .join(", ")}.`}
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
                  style={{ fontSize: 14, fill: "var(--ink-muted)", fontVariantNumeric: "tabular-nums" }}
                >
                  {t}
                </text>
              </g>
            ))}

            {visible.map((s) => (
              <polyline
                key={s.key}
                points={s.cumulative.map((v, i) => `${x(i)},${yScale(v)}`).join(" ")}
                fill="none"
                stroke={s.color}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
                pointerEvents="none"
                opacity={focused !== null && focused !== s.key ? 0.25 : 1}
              />
            ))}

            <TimeAxis range={range} gran={CHART_GRAN} x={x} y={VIEW_H - MARGIN.bottom + 18} />

            {active !== null && (
              <g pointerEvents="none">
                <line
                  x1={x(active)}
                  x2={x(active)}
                  y1={MARGIN.top}
                  y2={yScale(0)}
                  stroke="var(--ink-muted)"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                {visible.map((s) => (
                  <circle
                    key={s.key}
                    cx={x(active)}
                    cy={yScale(s.cumulative[active])}
                    r={4}
                    fill={s.color}
                    stroke="var(--paper)"
                    strokeWidth={2}
                    opacity={focused !== null && focused !== s.key ? 0.25 : 1}
                  />
                ))}
              </g>
            )}

            {isDesktop && (
              <rect
                x={MARGIN.left}
                y={MARGIN.top}
                width={PLOT_W}
                height={PLOT_H}
                fill="transparent"
                onMouseMove={handleMove}
                onMouseLeave={() => setHover(null)}
              />
            )}

            {isDesktop &&
              visible.map((s) => (
                <polyline
                  key={`hover-${s.key}`}
                  points={s.cumulative.map((v, i) => `${x(i)},${yScale(v)}`).join(" ")}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={12}
                  pointerEvents="stroke"
                  onMouseEnter={() => setFocused(s.key)}
                  onMouseLeave={() => setFocused(null)}
                  onMouseMove={handleMove}
                />
              ))}
          </svg>

          {active !== null && (
            <div
              className="pointer-events-none absolute z-10 whitespace-nowrap rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-2.5 py-1.5 text-xs shadow-sm"
              style={{
                left: `${(x(active) / VIEW_W) * 100}%`,
                top: `${(MARGIN.top / VIEW_H) * 100}%`,
                transform: "translate(-50%, 0)",
              }}
            >
              <span className="font-serif text-[var(--ink)]">{bucketTooltipLabel(range[active], CHART_GRAN)}</span>
              {visible.map((s) => (
                <span key={s.key} className="ml-2 inline-flex items-center gap-1 font-mono tabular-nums text-[var(--ink-secondary)]">
                  <span
                    aria-hidden
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.cumulative[active]}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <PartialWeekNote show={lastBucketPartial(today)} />

      <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
        <TimeRangeToggle value={timeRange} onChange={setRange} />
        <TierToggle value={tier} onChange={setTier} />
      </div>
    </div>
  );
}
