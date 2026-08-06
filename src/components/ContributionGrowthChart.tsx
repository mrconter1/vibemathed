"use client";

import { useEffect, useRef, useState } from "react";
import { AI_CONTRIBUTIONS, type AiContribution, type ChartProblem } from "@/lib/problems";
import { AI_CONTRIBUTION } from "@/lib/display";
import { bucketKey, bucketRange, bucketTooltipLabel } from "@/lib/time-buckets";
import { GranularityToggle, TimeAxis } from "@/components/GranularityToggle";
import { useChartSettings } from "@/lib/chart-settings";

// Cumulative solves over time, one line per AI-contribution tier. Same frame,
// scales and hover behaviour as CumulativeChart, so the two read as siblings.

const VIEW_W = 640;
// Same frame as CumulativeChart, so the two line charts render at matching
// heights when they share a dashboard row.
const VIEW_H = 360;
const MARGIN = { top: 20, right: 20, bottom: 40, left: 44 };
const PLOT_W = VIEW_W - MARGIN.left - MARGIN.right;
const PLOT_H = VIEW_H - MARGIN.top - MARGIN.bottom;

// The display record only carries line colors for the pills; the chart needs
// three DISTINCT hues, so the two gray pills get chart-specific colors here.
const SERIES_COLOR: Record<AiContribution, string> = {
  "ai-discovered": "var(--accent-blue)",
  "ai-co-developed": "var(--accent-orange)",
  "ai-assisted": "var(--status-good)",
};

function niceMax(v: number, step: number) {
  return Math.max(step, Math.ceil(v / step) * step);
}

export function ContributionGrowthChart({ problems }: { problems: ChartProblem[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  // Granularity and hidden series survive reloads (see useChartSettings).
  const { gran, setGran, hidden, toggleSeries } = useChartSettings("contribution");
  // Hovering a line (or its legend chip) highlights it and fades the rest.
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Unclassified entries (null tier) have nothing to say here.
  const classified = problems.filter((p) => p.aiContribution != null);
  const keys = classified.map((p) => bucketKey(p.solveDate, gran)).sort();
  if (keys.length === 0) return null;

  const range = bucketRange(keys[0], keys[keys.length - 1], gran);

  const series = AI_CONTRIBUTIONS.map((tier) => {
    const tierKeys = classified
      .filter((p) => p.aiContribution === tier)
      .map((p) => bucketKey(p.solveDate, gran));
    return {
      tier,
      label: AI_CONTRIBUTION[tier].label,
      color: SERIES_COLOR[tier],
      cumulative: range.map((mk) => tierKeys.filter((k) => k <= mk).length),
      total: tierKeys.length,
    };
  }).filter((s) => s.total > 0);

  const visible = series.filter((s) => !hidden.has(s.tier));
  const yMax = niceMax(Math.max(1, ...visible.map((s) => s.total)), 20);

  const x = (i: number) =>
    MARGIN.left + (range.length === 1 ? PLOT_W / 2 : (i / (range.length - 1)) * PLOT_W);
  const yScale = (v: number) => MARGIN.top + PLOT_H - (v / yMax) * PLOT_H;

  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round((i * yMax) / 4));

  // Element type is irrelevant: only clientX and the svg ref are used.
  function handleMove(e: React.MouseEvent<SVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * VIEW_W;
    const t = (svgX - MARGIN.left) / PLOT_W;
    const i = Math.round(t * (range.length - 1));
    setHover(Math.min(Math.max(i, 0), range.length - 1));
  }

  const active = isDesktop && hover !== null ? hover : null;

  return (
    <div className="flex h-full flex-col">
      <h2 className="font-serif text-lg text-[var(--ink)]">
        Growth per AI-contribution tier
      </h2>
      <p className="mt-1 text-xs text-[var(--ink-muted)]">
        Cumulative resolved entries by how much the model contributed;{" "}
        {classified.length} classified to date.
      </p>

      {/* Legend doubles as the current totals AND the visibility toggles. */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {series.map((s) => {
          const off = hidden.has(s.tier);
          return (
            <button
              key={s.tier}
              type="button"
              onClick={() => toggleSeries(s.tier)}
              aria-pressed={!off}
              onMouseEnter={() => setFocused(s.tier)}
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
            aria-label="Cumulative resolved entries over time, one line per AI-contribution tier"
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
                key={s.tier}
                points={s.cumulative.map((v, i) => `${x(i)},${yScale(v)}`).join(" ")}
                fill="none"
                stroke={s.color}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
                pointerEvents="none"
                opacity={focused !== null && focused !== s.tier ? 0.25 : 1}
              />
            ))}

            <TimeAxis range={range} gran={gran} x={x} y={VIEW_H - MARGIN.bottom + 18} />

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
                    key={s.tier}
                    cx={x(active)}
                    cy={yScale(s.cumulative[active])}
                    r={4}
                    fill={s.color}
                    stroke="var(--paper)"
                    strokeWidth={2}
                    opacity={focused !== null && focused !== s.tier ? 0.25 : 1}
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

            {/* Invisible wide strokes on top: hovering a line focuses its
                series. They forward mousemove so the crosshair keeps
                tracking while tracing a line. */}
            {isDesktop &&
              visible.map((s) => (
                <polyline
                  key={`hover-${s.tier}`}
                  points={s.cumulative.map((v, i) => `${x(i)},${yScale(v)}`).join(" ")}
                  fill="none"
                  stroke="transparent"
                  strokeWidth={12}
                  pointerEvents="stroke"
                  onMouseEnter={() => setFocused(s.tier)}
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
              <span className="font-serif text-[var(--ink)]">{bucketTooltipLabel(range[active], gran)}</span>
              {visible.map((s) => (
                <span key={s.tier} className="ml-2 inline-flex items-center gap-1 font-mono tabular-nums text-[var(--ink-secondary)]">
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

      {/* Bucket picker, centered below the plot on every time chart;
          persisted per chart (see useChartSettings). */}
      <div className="mt-2.5 flex justify-center">
        <GranularityToggle value={gran} onChange={setGran} />
      </div>
    </div>
  );
}
