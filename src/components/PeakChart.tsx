"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ChartProblem } from "@/lib/problems";
import { deTeX } from "@/components/TeX";
import { TimeAxis } from "@/components/TimeControls";
import {
  monthlyPeaks,
  recordMonths,
  runningPeak,
  type MonthPeak,
} from "@/lib/monthly-peak";
import { labelWidth, placeLabels } from "@/lib/scatter-labels";

// The heaviest problem resolved in each month, from the first solve to today.
//
// Every other time chart here counts things, so every other time chart goes up
// as the catalog grows. This one cannot: a month is worth its best result, so
// the line only moves when something genuinely bigger lands. It is the one
// view on the page that shows the ceiling rising rather than the pile
// deepening.
//
// No time-range toggle, unlike its siblings. "From the first entry to today"
// is the whole point - a windowed version would hide the early flat stretch
// that gives the recent jumps their meaning.

const VIEW_W = 640;
const VIEW_H = 360;
const MARGIN = { top: 30, right: 20, bottom: 40, left: 44 };
const PLOT_W = VIEW_W - MARGIN.left - MARGIN.right;
const PLOT_H = VIEW_H - MARGIN.top - MARGIN.bottom;

function niceMax(v: number, step: number) {
  return Math.max(step, Math.ceil(v / step) * step);
}

export function PeakChart({
  problems,
  today,
}: {
  problems: ChartProblem[];
  today: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const router = useRouter();

  const rows: MonthPeak[] = monthlyPeaks(problems, today);
  if (rows.length === 0) return null;

  const records = recordMonths(rows);
  const running = runningPeak(rows);
  const yMax = niceMax(Math.max(10, ...rows.map((r) => r.significance)), 10);

  const months = rows.map((r) => r.month);
  const x = (i: number) =>
    MARGIN.left +
    (rows.length === 1 ? PLOT_W / 2 : (i / (rows.length - 1)) * PLOT_W);
  const y = (v: number) => MARGIN.top + PLOT_H - (v / yMax) * PLOT_H;

  // Bars thin enough that a long timeline does not turn into a solid block,
  // and never wider than the gap between months.
  const barW = Math.max(
    2,
    Math.min(14, (PLOT_W / Math.max(1, rows.length)) * 0.6),
  );

  // Only record-setting months are labelled: on a running-maximum chart every
  // other month is by definition below a line the reader can already see.
  // Reuses the scatter's packer, so a run of records in consecutive months
  // cannot overprint - which is exactly what August and September 2026 are.
  const placed = placeLabels(
    rows
      .map((r, i) => ({ r, i }))
      .filter(({ r }) => records.has(r.month) && r.top)
      .reverse()
      .map(({ r, i }) => ({
        key: r.month,
        cx: x(i),
        cy: y(r.significance),
        width: labelWidth(deTeX(r.top!.shortName)),
        anchor:
          x(i) > VIEW_W - 110
            ? ("end" as const)
            : x(i) < MARGIN.left + 110
              ? ("start" as const)
              : ("middle" as const),
      })),
    {
      minY: MARGIN.top,
      maxY: MARGIN.top + PLOT_H,
      minX: MARGIN.left,
      maxX: VIEW_W - MARGIN.right,
    },
  );

  const ticks: number[] = [];
  for (let v = 0; v <= yMax; v += yMax / 3) ticks.push(Math.round(v));

  const active = hover !== null ? rows[hover] : null;
  // The record line as a step: it holds its level through empty months rather
  // than sloping between results, because nothing happened in between.
  const stepPath = running
    .map((v, i) => {
      const px = x(i);
      const py = y(v);
      return i === 0
        ? `M ${px} ${py}`
        : `L ${px} ${y(running[i - 1])} L ${px} ${py}`;
    })
    .join(" ");

  return (
    <div>
      <h2 className="font-serif text-lg text-[var(--ink)]">
        Most significant result per month
      </h2>
      <p className="mt-1 text-xs text-[var(--ink-muted)]">
        The heaviest problem resolved in each month since the record begins.
        Unlike the other charts here this one does not rise with volume: it
        moves only when something bigger lands. The line is the running best.
      </p>

      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="mt-3 w-full overflow-visible"
        role="img"
        aria-label="Bar chart of the highest significance resolved in each month, with a running-best line that steps up when a new record lands."
      >
        {ticks.map((t) => (
          <g key={t}>
            <line
              x1={MARGIN.left}
              x2={VIEW_W - MARGIN.right}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--rule)"
              strokeWidth={1}
            />
            <text
              x={MARGIN.left - 8}
              y={y(t) + 4}
              textAnchor="end"
              style={{ fontSize: 11, fill: "var(--ink-muted)" }}
            >
              {t}
            </text>
          </g>
        ))}

        {/* 18px below the baseline, the same offset every sibling chart uses.
            Passing the baseline itself drew the month labels through the
            bottoms of the bars. */}
        <TimeAxis
          range={months}
          gran="month"
          x={x}
          y={VIEW_H - MARGIN.bottom + 18}
        />

        {/* The running best, drawn under the bars so a record month's bar
            sits on top of the step it created. */}
        <path
          d={stepPath}
          fill="none"
          stroke="var(--accent-orange)"
          strokeWidth={1.5}
          strokeOpacity={0.65}
        />

        {rows.map((r, i) => {
          if (!r.top) return null;
          const isRecord = records.has(r.month);
          const h = MARGIN.top + PLOT_H - y(r.significance);
          return (
            <rect
              key={r.month}
              x={x(i) - barW / 2}
              y={y(r.significance)}
              width={barW}
              height={Math.max(1, h)}
              rx={1}
              fill="var(--accent-blue)"
              fillOpacity={hover === i ? 1 : isRecord ? 0.95 : 0.5}
            />
          );
        })}

        {/* Hit strips: one per month, full height, so hovering anywhere in a
            column works rather than only on a two-pixel bar. */}
        {rows.map((r, i) => (
          <rect
            key={`hit-${r.month}`}
            x={x(i) - PLOT_W / Math.max(1, rows.length) / 2}
            y={MARGIN.top}
            width={Math.max(4, PLOT_W / Math.max(1, rows.length))}
            height={PLOT_H}
            fill="transparent"
            style={{ cursor: r.top ? "pointer" : "default" }}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
            onClick={() => r.top && router.push(`/problem/${r.top.slug}`)}
          />
        ))}

        {rows.map((r, i) => {
          const label = placed.get(r.month);
          if (!label || !r.top) return null;
          return (
            <text
              key={`lab-${r.month}`}
              x={label.x}
              y={label.y}
              textAnchor={label.anchor}
              style={{ fontSize: 11, fill: "var(--ink)" }}
            >
              {deTeX(r.top.shortName)}
            </text>
          );
        })}
      </svg>

      <p className="mt-2 min-h-[2.5rem] text-xs text-[var(--ink-secondary)]">
        {active?.top ? (
          <>
            <span className="text-[var(--ink)]">
              {deTeX(active.top.shortName)}
            </span>{" "}
            &middot; {active.significance}/100 &middot; {active.month}
          </>
        ) : (
          <>
            {records.size} months set a new record. Hover a month for its
            result, click to open it.
          </>
        )}
      </p>
    </div>
  );
}
