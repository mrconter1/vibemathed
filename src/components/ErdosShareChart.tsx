"use client";

import { useEffect, useRef, useState } from "react";
import type { ChartProblem } from "@/lib/problems";
import {
  CHART_GRAN,
  bucketKey,
  bucketTooltipLabel,
  lastBucketPartial,
  rangeCaption,
  timeWindow,
} from "@/lib/time-buckets";
import {
  PartialWeekNote,
  TimeAxis,
  TimeRangeToggle,
} from "@/components/TimeControls";
import { useChartSettings } from "@/lib/chart-settings";

// How much of Erdős's problem collection AI has closed, as a share of the
// whole collection over time. The denominator is erdosproblems.com's own
// count, read by hand and dated below; it moves slowly (problems are still
// being transcribed) and a stale figure understates the share by a fraction
// of a percent, which the caption admits rather than hides.
//
// The numerator is the number of DISTINCT Erdős problems with a fully
// resolved entry here - by problem number, so two entries on one problem (an
// AI proof and a later independent one, say) count once, and the site's own
// candidates, partials and variants do not count at all. A "solved" share
// that counted claims under review would be the number this site exists to
// not publish.
//
// Same fixed viewBox and hover machinery as CumulativeChart.

/// erdosproblems.com, read 6 September 2026: "There are 1220 problems in the
/// database". Update the date when updating the number.
export const ERDOS_TOTAL = 1220;
export const ERDOS_TOTAL_READ = "6 September 2026";

const VIEW_W = 640;
const VIEW_H = 360;
const MARGIN = { top: 20, right: 20, bottom: 40, left: 52 };
const PLOT_H = VIEW_H - MARGIN.top - MARGIN.bottom;

interface PlotData {
  range: string[];
  /// Distinct problems solved by the end of each bucket (cumulative).
  solved: number[];
  yMaxPct: number;
  interactive: boolean;
}

const pct = (n: number) => (n / ERDOS_TOTAL) * 100;

function Plot({ data }: { data: PlotData }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const { range, solved, yMaxPct, interactive } = data;
  const plotW = VIEW_W - MARGIN.left - MARGIN.right;
  const x = (i: number) =>
    MARGIN.left +
    (range.length === 1 ? plotW / 2 : (i / (range.length - 1)) * plotW);
  const yScale = (p: number) => MARGIN.top + PLOT_H - (p / yMaxPct) * PLOT_H;
  const linePts = solved.map((n, i) => `${x(i)},${yScale(pct(n))}`).join(" ");
  const areaPts = `${x(0)},${yScale(0)} ${linePts} ${x(range.length - 1)},${yScale(0)}`;
  const yTicks = Array.from({ length: 5 }, (_, i) => (i * yMaxPct) / 4);

  function handleMove(e: React.MouseEvent<SVGRectElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * VIEW_W;
    const t = (svgX - MARGIN.left) / plotW;
    const i = Math.round(t * (range.length - 1));
    setHover(Math.min(Math.max(i, 0), range.length - 1));
  }
  const active =
    interactive && hover !== null && hover < range.length ? hover : null;
  const last = solved[solved.length - 1];

  return (
    <div className="relative" style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="h-full w-full"
        role="img"
        aria-label={`Share of Erdős problems solved with AI over time, rising to ${pct(last).toFixed(1)} percent`}
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
              style={{
                fontSize: 14,
                fill: "var(--ink-muted)",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {t % 1 === 0 ? t : t.toFixed(1)}%
            </text>
          </g>
        ))}
        <polygon
          points={areaPts}
          fill="var(--accent-orange)"
          fillOpacity={0.12}
        />
        <polyline
          points={linePts}
          fill="none"
          stroke="var(--accent-orange)"
          strokeWidth={2.5}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <TimeAxis
          range={range}
          gran={CHART_GRAN}
          x={x}
          y={VIEW_H - MARGIN.bottom + 18}
        />
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
              cy={yScale(pct(solved[active]))}
              r={4.5}
              fill="var(--accent-orange)"
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
          className="pointer-events-none absolute z-10 whitespace-nowrap rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-2.5 py-1.5 text-xs shadow-lg"
          style={{
            left: `${(x(active) / VIEW_W) * 100}%`,
            top: `${(yScale(pct(solved[active])) / VIEW_H) * 100}%`,
            transform: "translate(-50%, calc(-100% - 10px))",
          }}
        >
          <span className="font-serif text-[var(--ink)]">
            {bucketTooltipLabel(range[active], CHART_GRAN)}
          </span>
          <span className="ml-2 font-mono tabular-nums text-[var(--ink-secondary)]">
            {solved[active]} of {ERDOS_TOTAL} · {pct(solved[active]).toFixed(1)}
            %
          </span>
        </div>
      )}
    </div>
  );
}

export function ErdosShareChart({
  problems,
  today,
}: {
  /// Fully resolved entries only; the caller filters.
  problems: ChartProblem[];
  today: string;
}) {
  const [isDesktop, setIsDesktop] = useState(false);
  const { range: timeRange, setRange } = useChartSettings("erdos-share");

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // One date per problem NUMBER: the earliest resolved entry's solve date.
  const firstSolve = new Map<number, string>();
  for (const p of problems) {
    if (p.problemNumber === null) continue;
    const prev = firstSolve.get(p.problemNumber);
    if (prev === undefined || p.solveDate < prev)
      firstSolve.set(p.problemNumber, p.solveDate);
  }
  const allKeys = [...firstSolve.values()]
    .map((d) => bucketKey(d, CHART_GRAN))
    .sort();
  if (allKeys.length === 0) return null;

  // Unlike the tracked-problems curve, this one is NOT re-baselined to the
  // window: a share of the whole collection only means something as a running
  // total, so a narrow window shows the recent part of the same line.
  const { buckets: range } = timeWindow(allKeys[0], today, timeRange);
  const solved = range.map((mk) => allKeys.filter((k) => k <= mk).length);
  const total = firstSolve.size;
  const topPct = pct(solved[solved.length - 1]);
  // A round ceiling a little above the line: 1, 2, 5, 10, 20 percent steps.
  const step =
    topPct <= 1
      ? 0.25
      : topPct <= 2.5
        ? 0.5
        : topPct <= 5
          ? 1
          : topPct <= 12
            ? 2
            : 5;
  const yMaxPct = Math.max(step, Math.ceil((topPct * 1.1) / step) * step);

  return (
    <div className="flex h-full flex-col">
      <h2 className="font-serif text-lg text-[var(--ink)]">
        Share of Erdős problems solved
      </h2>
      <p className="mt-1 text-xs text-[var(--ink-muted)]">
        {total} of the {ERDOS_TOTAL.toLocaleString("en-US")} problems on
        erdosproblems.com have a fully resolved entry here, {topPct.toFixed(1)}
        %, {rangeCaption(timeRange)}. Distinct problems, by number; candidates
        and partial results not counted. Denominator read {ERDOS_TOTAL_READ}.
      </p>
      <div className="mt-3 flex flex-1 flex-col justify-center">
        <Plot data={{ range, solved, yMaxPct, interactive: isDesktop }} />
      </div>
      <PartialWeekNote show={lastBucketPartial(today)} />
      <div className="mt-2.5 flex flex-wrap items-center justify-center gap-1.5">
        <TimeRangeToggle value={timeRange} onChange={setRange} />
      </div>
    </div>
  );
}
