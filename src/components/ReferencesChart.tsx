"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ageAtSolve, type MathProblem } from "@/lib/problems";

// This chart plots NOTABILITY (Wikipedia language editions), not citations.
// Most entries score 0 - that dense band along the x-axis is the point:
// almost every AI-resolved Erdős problem is obscure, regardless of how long it
// stood open. The handful with a dedicated Wikipedia article rise above it.
// (Component/file kept named "References*" to avoid an import churn; it is a
// notability chart now.)

// Categorical colors validated against the --paper chart surface (#f3efe3):
//   #2a78d6 blue (proved), #eb6834 orange (disproved). "resolved" uses a
//   neutral grey, so it needs no hue-contrast validation.
const SOLVE_TYPE_COLOR: Record<string, string> = {
  proved: "var(--accent-blue)",
  disproved: "var(--accent-orange)",
  resolved: "var(--ink-muted)",
};

const SOLVE_TYPE_LABEL: Record<string, string> = {
  proved: "Proved",
  disproved: "Disproved",
  resolved: "Resolved",
  partial: "Partial",
};

const VIEW_W = 640;
const VIEW_H = 360;
const MARGIN = { top: 20, right: 24, bottom: 44, left: 56 };
const PLOT_W = VIEW_W - MARGIN.left - MARGIN.right;
const PLOT_H = VIEW_H - MARGIN.top - MARGIN.bottom;

function niceMax(value: number, step: number) {
  return Math.max(step, Math.ceil(value / step) * step);
}

function ticks(max: number, step: number) {
  const out: number[] = [];
  for (let v = 0; v <= max; v += step) out.push(v);
  return out;
}

export function ReferencesChart({ problems }: { problems: MathProblem[] }) {
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const router = useRouter();

  // Every entry now has a posed year, so age is always defined and all points
  // plot. Notability (y) is 0 for most - those sit on the baseline.
  const withAge = problems.map((p) => ({ problem: p, age: ageAtSolve(p) }));
  const plottable = withAge.filter(
    (d): d is { problem: (typeof d)["problem"]; age: number } => d.age !== null,
  );
  const pending = withAge.length - plottable.length;

  const xMax = niceMax(Math.max(1, ...plottable.map((d) => d.age)), 20);
  const yStep = 5;
  const yMax = niceMax(Math.max(1, ...plottable.map((d) => d.problem.renownLangs)), yStep);

  const xTicks = ticks(xMax, 20);
  const yTicks = ticks(yMax, yStep);

  const x = (age: number) => MARGIN.left + (age / xMax) * PLOT_W;
  const y = (langs: number) => MARGIN.top + PLOT_H - (langs / yMax) * PLOT_H;

  const active = plottable.find((d) => d.problem.slug === activeSlug);
  // Legend reflects only series actually drawn as points.
  const seriesPresent = Array.from(new Set(plottable.map((d) => d.problem.solveType))).filter(
    (t) => t in SOLVE_TYPE_COLOR,
  );

  // Draw the zero band first so the few notable outliers sit on top of it.
  const drawOrder = [...plottable].sort((a, b) => a.problem.renownLangs - b.problem.renownLangs);

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="font-serif text-lg text-[var(--ink)]">Notability vs. age at resolution</h2>
        <ul className="flex gap-4 text-xs text-[var(--ink-secondary)]">
          {seriesPresent.map((type) => (
            <li key={type} className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: SOLVE_TYPE_COLOR[type] }}
              />
              {SOLVE_TYPE_LABEL[type] ?? type}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-1 text-xs text-[var(--ink-muted)]">
        Notability = Wikipedia language editions with a dedicated article. Most score 0 (the
        baseline band); a few famous ones rise above. Click a point to open it.
      </p>

      <div className="relative mt-3" style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}>
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-full w-full overflow-visible"
          role="img"
          aria-label="Scatter chart of Wikipedia notability (language editions) against how many years each problem was open before resolution. Most points lie on the zero baseline; a few rise above."
        >
          {/* gridlines */}
          {yTicks.map((t) => (
            <line
              key={`gy-${t}`}
              x1={MARGIN.left}
              x2={VIEW_W - MARGIN.right}
              y1={y(t)}
              y2={y(t)}
              stroke="var(--hairline)"
              strokeWidth={1}
            />
          ))}

          {/* axes */}
          <line
            x1={MARGIN.left}
            x2={VIEW_W - MARGIN.right}
            y1={VIEW_H - MARGIN.bottom}
            y2={VIEW_H - MARGIN.bottom}
            stroke="var(--ink-muted)"
            strokeWidth={1}
          />
          <line
            x1={MARGIN.left}
            x2={MARGIN.left}
            y1={MARGIN.top}
            y2={VIEW_H - MARGIN.bottom}
            stroke="var(--ink-muted)"
            strokeWidth={1}
          />

          {/* x ticks */}
          {xTicks.map((t) => (
            <text
              key={`xt-${t}`}
              x={x(t)}
              y={VIEW_H - MARGIN.bottom + 20}
              textAnchor="middle"
              className="font-mono"
              style={{ fontSize: 11, fill: "var(--ink-muted)", fontVariantNumeric: "tabular-nums" }}
            >
              {t}
            </text>
          ))}
          <text
            x={MARGIN.left + PLOT_W / 2}
            y={VIEW_H - 6}
            textAnchor="middle"
            style={{ fontSize: 11, fill: "var(--ink-secondary)" }}
          >
            Years open when resolved
          </text>

          {/* y ticks */}
          {yTicks.map((t) => (
            <text
              key={`yt-${t}`}
              x={MARGIN.left - 10}
              y={y(t)}
              dominantBaseline="middle"
              textAnchor="end"
              className="font-mono"
              style={{ fontSize: 11, fill: "var(--ink-muted)", fontVariantNumeric: "tabular-nums" }}
            >
              {t}
            </text>
          ))}
          <text
            x={-(MARGIN.top + PLOT_H / 2)}
            y={16}
            textAnchor="middle"
            transform="rotate(-90)"
            style={{ fontSize: 11, fill: "var(--ink-secondary)" }}
          >
            Notability (Wikipedia languages)
          </text>

          {/* points */}
          {drawOrder.map(({ problem, age }) => {
            const cx = x(age);
            const cy = y(problem.renownLangs);
            const color = SOLVE_TYPE_COLOR[problem.solveType] ?? "var(--ink)";
            const isActive = activeSlug === problem.slug;
            const isOutlier = problem.renownLangs > 0;
            return (
              <g
                key={problem.slug}
                tabIndex={0}
                role="link"
                aria-label={`Open ${problem.name}`}
                onMouseEnter={() => setActiveSlug(problem.slug)}
                onMouseLeave={() => setActiveSlug(null)}
                onFocus={() => setActiveSlug(problem.slug)}
                onBlur={() => setActiveSlug(null)}
                onClick={() => router.push(`/problem/${problem.slug}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") router.push(`/problem/${problem.slug}`);
                }}
                style={{ cursor: "pointer", outline: "none" }}
              >
                {/* larger transparent hit target */}
                <circle cx={cx} cy={cy} r={14} fill="transparent" />
                <circle
                  cx={cx}
                  cy={cy}
                  r={isActive ? 7 : isOutlier ? 6 : 4}
                  fill={color}
                  fillOpacity={isOutlier || isActive ? 1 : 0.55}
                  stroke="var(--paper)"
                  strokeWidth={isOutlier ? 2 : 1}
                />
                {isOutlier && (
                  <text
                    x={cx}
                    y={cy - 12}
                    textAnchor="middle"
                    style={{ fontSize: 11, fill: "var(--ink-secondary)" }}
                  >
                    {problem.shortName}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {active && (
          <div
            className="pointer-events-none absolute z-10 w-56 rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] p-3 text-xs shadow-sm"
            style={{
              left: `${(x(active.age) / VIEW_W) * 100}%`,
              top: `${(y(active.problem.renownLangs) / VIEW_H) * 100}%`,
              transform: "translate(-50%, calc(-100% - 16px))",
            }}
          >
            <p className="font-serif text-sm text-[var(--ink)]">{active.problem.name}</p>
            <p className="mt-1 text-[var(--ink-secondary)]">
              {active.problem.field ?? SOLVE_TYPE_LABEL[active.problem.solveType] ?? active.problem.solveType}
            </p>
            <dl className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 font-mono text-[var(--ink-secondary)]">
              <dt className="text-[var(--ink-muted)]">Age</dt>
              <dd>{active.age}y</dd>
              <dt className="text-[var(--ink-muted)]">Notability</dt>
              <dd>{active.problem.renownLangs} langs</dd>
            </dl>
          </div>
        )}
      </div>

      {pending > 0 && (
        <p className="mt-2 text-xs text-[var(--ink-muted)]">
          {`${pending} of ${problems.length} entries have no posed year, so aren't plotted.`}
        </p>
      )}
    </div>
  );
}
