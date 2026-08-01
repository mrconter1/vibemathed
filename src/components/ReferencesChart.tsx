"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ageAtSolve, type MathProblem } from "@/lib/problems";

// This chart plots SIGNIFICANCE (the AI-estimated problem weight) against how
// long the problem stood open. The dense band at 10 is the point: almost every
// AI-resolved problem is real but unfamous, regardless of age. The labeled
// points rising above are the strikes up the ladder. (Component/file kept
// named "References*" through two metric changes to avoid import churn.)

// Categorical colors validated against the --paper chart surface (#f3efe3):
//   #2a78d6 blue (proved), #eb6834 orange (disproved).
const SOLVE_TYPE_COLOR: Record<string, string> = {
  proved: "var(--accent-blue)",
  disproved: "var(--accent-orange)",
};

const SOLVE_TYPE_LABEL: Record<string, string> = {
  proved: "Proved",
  disproved: "Disproved",
};

// Points at or above this get a name label; below it the band is too dense.
const LABEL_THRESHOLD = 35;

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

  // Resolved entries plot as filled dots; CANDIDATE entries (a full solution
  // claimed and vetted, community review pending) plot as hollow rings so a
  // day-old announcement never masquerades as a landed result. Partials stay
  // out - a bound improvement has no "age at resolution". Each point also
  // needs a posed year (for age) and a significance score.
  const enriched = problems
    .filter((p) => p.resolution === "resolved" || p.resolution === "candidate")
    .map((p) => ({
      problem: p,
      age: ageAtSolve(p),
      significance: p.significance ?? null,
      claimed: p.resolution === "candidate",
    }));
  const plottable = enriched.filter(
    (
      d,
    ): d is { problem: MathProblem; age: number; significance: number; claimed: boolean } =>
      d.age !== null && d.significance !== null,
  );
  const pending = enriched.length - plottable.length;
  const anyClaimed = plottable.some((d) => d.claimed);

  const xMax = niceMax(Math.max(1, ...plottable.map((d) => d.age)), 20);
  const yStep = 10;
  const yMax = niceMax(Math.max(1, ...plottable.map((d) => d.significance)), yStep);

  const xTicks = ticks(xMax, 20);
  const yTicks = ticks(yMax, yStep);

  const x = (age: number) => MARGIN.left + (age / xMax) * PLOT_W;
  const y = (sig: number) => MARGIN.top + PLOT_H - (sig / yMax) * PLOT_H;

  const active = plottable.find((d) => d.problem.slug === activeSlug);
  // Legend reflects only series actually drawn as points.
  const seriesPresent = Array.from(new Set(plottable.map((d) => d.problem.solveType))).filter(
    (t) => t in SOLVE_TYPE_COLOR,
  );

  // Draw the dense low band first so the labeled strikes sit on top of it.
  const drawOrder = [...plottable].sort((a, b) => a.significance - b.significance);

  // Label de-collision: several labeled points share a score band (four sit
  // at 35), so neighbouring labels would overprint. Greedy level stacking:
  // walk labeled points left to right and lift a label one 14px row for each
  // already-placed label it would collide with (close in x AND in y).
  const labelYBySlug = new Map<string, number>();
  {
    const placed: { cx: number; labelY: number }[] = [];
    const labeled = plottable
      .filter((d) => d.significance >= LABEL_THRESHOLD)
      .sort((a, b) => x(a.age) - x(b.age));
    for (const d of labeled) {
      const cx = x(d.age);
      let labelY = y(d.significance) - 12;
      // Lift until no placed label is within a label's width and line height.
      for (let guard = 0; guard < 6; guard++) {
        const hit = placed.some(
          (p) => Math.abs(p.cx - cx) < 110 && Math.abs(p.labelY - labelY) < 14,
        );
        if (!hit) break;
        labelY -= 14;
      }
      placed.push({ cx, labelY });
      labelYBySlug.set(d.problem.slug, labelY);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="font-serif text-lg text-[var(--ink)]">
          Significance vs. age at resolution
        </h2>
        <ul className="flex flex-wrap gap-4 text-sm text-[var(--ink-secondary)]">
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
          {anyClaimed && (
            <li className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="inline-block h-2.5 w-2.5 rounded-full border-2 border-[var(--ink-secondary)]"
              />
              Under review
            </li>
          )}
        </ul>
      </div>

      <p className="mt-1 text-xs text-[var(--ink-muted)]">
        AI-estimated problem weight before the solve, 0-100 (Riemann = 100).
        Hollow points are claimed solutions still under review. Click a point
        to open it.
      </p>

      <div className="relative mt-3" style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}>
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-full w-full overflow-visible"
          role="img"
          aria-label="Scatter chart of AI-estimated significance against how many years each problem was open before resolution. Most points form a band at 10; a few labeled points rise above."
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
              style={{ fontSize: 14, fill: "var(--ink-muted)", fontVariantNumeric: "tabular-nums" }}
            >
              {t}
            </text>
          ))}
          <text
            x={MARGIN.left + PLOT_W / 2}
            y={VIEW_H - 6}
            textAnchor="middle"
            style={{ fontSize: 14, fill: "var(--ink-secondary)" }}
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
              style={{ fontSize: 14, fill: "var(--ink-muted)", fontVariantNumeric: "tabular-nums" }}
            >
              {t}
            </text>
          ))}
          <text
            x={-(MARGIN.top + PLOT_H / 2)}
            y={16}
            textAnchor="middle"
            transform="rotate(-90)"
            style={{ fontSize: 14, fill: "var(--ink-secondary)" }}
          >
            Significance (0-100)
          </text>

          {/* points */}
          {drawOrder.map(({ problem, age, significance, claimed }) => {
            const cx = x(age);
            const cy = y(significance);
            const color = SOLVE_TYPE_COLOR[problem.solveType] ?? "var(--ink)";
            const isActive = activeSlug === problem.slug;
            const isOutlier = significance >= LABEL_THRESHOLD;
            // Labels near either edge anchor inward so they stay inside the
            // viewBox - the svg has overflow visible, and a centred label on
            // an edge point would poke out of the card (and on phones, widen
            // the page).
            const labelAnchor =
              cx > VIEW_W - 100 ? "end" : cx < MARGIN.left + 100 ? "start" : "middle";
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
                {claimed ? (
                  // Hollow ring: claimed, still under review.
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isActive ? 7 : isOutlier ? 6 : 4}
                    fill="var(--paper-raised)"
                    stroke={color}
                    strokeWidth={2}
                  />
                ) : (
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isActive ? 7 : isOutlier ? 6 : 4}
                    fill={color}
                    fillOpacity={isOutlier || isActive ? 1 : 0.55}
                    stroke="var(--paper)"
                    strokeWidth={isOutlier ? 2 : 1}
                  />
                )}
                {isOutlier && (
                  <text
                    x={cx}
                    y={labelYBySlug.get(problem.slug) ?? cy - 12}
                    textAnchor={labelAnchor}
                    style={{ fontSize: 14, fill: "var(--ink-secondary)" }}
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
              top: `${(y(active.significance) / VIEW_H) * 100}%`,
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
              <dt className="text-[var(--ink-muted)]">Significance</dt>
              <dd>{active.significance} / 100</dd>
              {active.claimed && (
                <>
                  <dt className="text-[var(--ink-muted)]">Status</dt>
                  <dd>under review</dd>
                </>
              )}
            </dl>
          </div>
        )}
      </div>

      {pending > 0 && (
        <p className="mt-2 text-xs text-[var(--ink-muted)]">
          {`${pending} of ${problems.length} entries lack a posed year or a score, so aren't plotted.`}
        </p>
      )}
    </div>
  );
}
