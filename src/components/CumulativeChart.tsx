"use client";

import { useEffect, useRef, useState } from "react";
import type { ChartProblem } from "@/lib/problems";
import {
  CHART_GRAN,
  bucketKey,
  bucketTooltipLabel,
  rangeCaption,
  timeWindow,
} from "@/lib/time-buckets";
import { TimeAxis, TimeRangeToggle } from "@/components/TimeControls";
import { useChartSettings } from "@/lib/chart-settings";

// The whole record over time, in the same half-width column as every other
// chart on the page - a fixed 640 viewBox like its siblings, not a special
// wide one. It used to be a full-width hero row with its own 1360-wide
// variant so labels rendered at the sibling charts' size; now that its card
// is an ordinary column, a still-1360 viewBox would render into a
// half-width container and shrink every label and stroke by half - which is
// exactly the "zoomed out" bug this fixed.

const VIEW_W = 640;
const VIEW_H = 360;
const MARGIN = { top: 20, right: 20, bottom: 40, left: 44 };
const PLOT_H = VIEW_H - MARGIN.top - MARGIN.bottom;

function niceMax(v: number, step: number) {
  return Math.max(step, Math.ceil(v / step) * step);
}

interface PlotData {
  range: string[];
  cumulative: number[];
  yMax: number;
  // Hover is only wired on devices with a real (mouse) pointer.
  interactive: boolean;
}

function Plot({ data }: { data: PlotData }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const { range, cumulative, yMax, interactive } = data;

  const plotW = VIEW_W - MARGIN.left - MARGIN.right;
  const x = (i: number) =>
    MARGIN.left + (range.length === 1 ? plotW / 2 : (i / (range.length - 1)) * plotW);
  const yScale = (v: number) => MARGIN.top + PLOT_H - (v / yMax) * PLOT_H;

  const linePts = cumulative.map((v, i) => `${x(i)},${yScale(v)}`).join(" ");
  const areaPts = `${x(0)},${yScale(0)} ${linePts} ${x(range.length - 1)},${yScale(0)}`;

  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round((i * yMax) / 4));
  const total = cumulative[cumulative.length - 1];

  function handleMove(e: React.MouseEvent<SVGRectElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * VIEW_W;
    const t = (svgX - MARGIN.left) / plotW;
    const i = Math.round(t * (range.length - 1));
    setHover(Math.min(Math.max(i, 0), range.length - 1));
  }

  // Clamped against the CURRENT range: narrowing the window (All -> 1M)
  // shrinks range from ~57 buckets to ~5 without resetting a stale hover
  // index, and range[active]/cumulative[active] going undefined fed straight
  // into bucketTooltipLabel's key.split("-"), crashing the render.
  const active = interactive && hover !== null && hover < range.length ? hover : null;

  return (
    <div className="relative" style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-full w-full"
        role="img"
        aria-label={`Cumulative tracked problems over time, rising to ${total}`}
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

        <polygon points={areaPts} fill="var(--accent-blue)" fillOpacity={0.12} />
        <polyline
          points={linePts}
          fill="none"
          stroke="var(--accent-blue)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />

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
            <circle
              cx={x(active)}
              cy={yScale(cumulative[active])}
              r={4.5}
              fill="var(--accent-blue)"
              stroke="var(--paper)"
              strokeWidth={2}
            />
          </g>
        )}

        {interactive && (
          <rect
            x={MARGIN.left}
            y={MARGIN.top}
            width={plotW}
            height={PLOT_H}
            fill="transparent"
            onMouseMove={handleMove}
            onMouseLeave={() => setHover(null)}
          />
        )}
      </svg>

      {active !== null && (
        <div
          className="pointer-events-none absolute z-10 whitespace-nowrap rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-2.5 py-1.5 text-xs shadow-sm"
          style={{
            left: `${(x(active) / VIEW_W) * 100}%`,
            top: `${(yScale(cumulative[active]) / VIEW_H) * 100}%`,
            transform: "translate(-50%, calc(-100% - 10px))",
          }}
        >
          <span className="font-serif text-[var(--ink)]">
            {bucketTooltipLabel(range[active], CHART_GRAN)}
          </span>
          <span className="ml-2 font-mono tabular-nums text-[var(--ink-secondary)]">
            {cumulative[active]} tracked
          </span>
        </div>
      )}
    </div>
  );
}

export function CumulativeChart({
  problems,
  today,
}: {
  problems: ChartProblem[];
  /// Today's date from the server, so the window's end is the same on both
  /// sides of hydration. Reading the clock during a client render would put a
  /// different last bucket in the client HTML than the server produced.
  today: string;
}) {
  const [isDesktop, setIsDesktop] = useState(false);
  // The window survives reloads (see useChartSettings).
  const { range: timeRange, setRange } = useChartSettings("cumulative");

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const allKeys = problems.map((p) => bucketKey(p.solveDate, CHART_GRAN)).sort();
  if (allKeys.length === 0) return null;

  const { buckets: range, from } = timeWindow(allKeys[0], today, timeRange);

  // Counted from the window's own start, not from the record's. A cumulative
  // line that kept the running total would open a 1M view near 600 and climb
  // to 620: a flat line pinned to the top of the plot, where the whole reason
  // to narrow the window was to see the recent shape. Re-baselining makes the
  // narrow views read as "added since", which the caption states outright.
  const keys = allKeys.filter((k) => k >= from);
  const cumulative = range.map((mk) => keys.filter((k) => k <= mk).length);
  const total = keys.length;

  const data: PlotData = {
    range,
    cumulative,
    yMax: niceMax(total, total > 60 ? 20 : 5),
    interactive: isDesktop,
  };

  return (
    <div className="flex h-full flex-col">
      <h2 className="font-serif text-lg text-[var(--ink)]">Problems over time</h2>
      <p className="mt-1 text-xs text-[var(--ink-muted)]">
        Cumulative count of all tracked entries, {total} {rangeCaption(timeRange)},
        candidates and partial results included.
      </p>

      <div className="mt-3 flex flex-1 flex-col justify-center">
        <Plot data={data} />
      </div>

      {/* Window picker, centered below the plot on every time chart;
          persisted per chart (see useChartSettings). */}
      <div className="mt-2.5 flex justify-center">
        <TimeRangeToggle value={timeRange} onChange={setRange} />
      </div>
    </div>
  );
}
