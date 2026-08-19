"use client";

import { useEffect, useRef, useState } from "react";
import { MODEL_FAMILIES } from "@/lib/display";
import type { ChartProblem } from "@/lib/problems";
import { bucketKey, bucketRange, bucketTooltipLabel } from "@/lib/time-buckets";
import { GranularityToggle, TimeAxis } from "@/components/GranularityToggle";
import { useChartSettings } from "@/lib/chart-settings";

// Share of solves per AI-system family over time - who is gaining and losing
// ground, which the volume race next door cannot show. ModelsChart plots
// cumulative counts, and a cumulative count only ever rises: every vendor's
// line climbs and the reader cannot tell a vendor pulling ahead from one being
// carried by the record's overall growth. Share removes that growth from the
// picture, so a falling line means genuinely losing ground.
//
// SHARE OF WHAT. Of all solves to date, not of the bucket. Per-bucket share
// would be the more responsive measure and is unusable at this sample size:
// around ten solves a week means one entry swings a vendor by ten points, so
// the chart would be noise with a trend somewhere inside it. Cumulative share
// is smooth at every granularity, and the slope still answers the question -
// a vendor gaining ground has a rising line. The cost is honest and worth
// stating: it damps recent movement, because late entries move a running
// share less than early ones did.
//
// The shares do not sum to 100. An entry naming two systems counts toward
// both families, exactly as it does in ModelsChart - the denominator is
// entries, the numerators overlap.
//
// Colour is ModelsChart's, per family, unchanged: the same vendor must not
// change hue between two charts on one page.

const VIEW_W = 640;
const VIEW_H = 360;
const MARGIN = { top: 20, right: 20, bottom: 40, left: 44 };
const PLOT_W = VIEW_W - MARGIN.left - MARGIN.right;
const PLOT_H = VIEW_H - MARGIN.top - MARGIN.bottom;

const FAMILY_COLOR: Record<string, string> = {
  openai: "#2a78d6",
  anthropic: "#eb6834",
  google: "#2e9e4f",
  harmonic: "#8b5cf6",
  xai: "#d23b6e",
  agents: "#0f9b9b",
  "open-weights": "#b8860b",
};

export function VendorShareChart({ problems }: { problems: ChartProblem[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const { gran, setGran, hidden, toggleSeries } = useChartSettings("vendor-share");
  const [focused, setFocused] = useState<string | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const keys = problems.map((p) => bucketKey(p.solveDate, gran)).sort();
  if (keys.length === 0) return null;

  const range = bucketRange(keys[0], keys[keys.length - 1], gran);

  // The denominator: entries resolved up to and including each bucket. Every
  // entry counts once here however many systems it names, so a share is
  // "appeared on this fraction of solves", not a slice of a pie.
  const allKeys = problems.map((p) => bucketKey(p.solveDate, gran));
  const totalAt = range.map((mk) => allKeys.filter((k) => k <= mk).length);

  const series = MODEL_FAMILIES.map((f) => {
    const famKeys = problems
      .filter((p) => f.test.test(`${p.model} ${p.modelMaker ?? ""}`))
      .map((p) => bucketKey(p.solveDate, gran));
    const counts = range.map((mk) => famKeys.filter((k) => k <= mk).length);
    return {
      key: f.key,
      label: f.label,
      color: FAMILY_COLOR[f.key],
      // Percent of solves to date. Guarded at zero for the leading buckets of
      // a range that starts before this family's first solve.
      share: counts.map((n, i) => (totalAt[i] === 0 ? 0 : (100 * n) / totalAt[i])),
      total: famKeys.length,
      finalShare: totalAt.length
        ? (100 * counts[counts.length - 1]) / Math.max(1, totalAt[totalAt.length - 1])
        : 0,
    };
  }).filter((s) => s.total > 0);

  const visible = series.filter((s) => !hidden.has(s.key));

  // A fixed 0-100 axis, not one scaled to the leading vendor. The question is
  // "what fraction", and a share chart whose top is 60% invites reading a line
  // near the top as dominance it does not have.
  const yMax = 100;
  const x = (i: number) =>
    MARGIN.left + (range.length === 1 ? PLOT_W / 2 : (i / (range.length - 1)) * PLOT_W);
  const yScale = (v: number) => MARGIN.top + PLOT_H - (v / yMax) * PLOT_H;
  const yTicks = [0, 25, 50, 75, 100];

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
      <h2 className="font-serif text-lg text-[var(--ink)]">
        Share of solves per AI system, over time
      </h2>
      <p className="mt-1 text-xs text-[var(--ink-muted)]">
        Each system&apos;s percentage of all solves to date. An entry naming two
        systems counts toward both, so the shares overlap rather than summing to
        100.
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {series.map((s) => {
          const off = hidden.has(s.key);
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => toggleSeries(s.key)}
              aria-pressed={!off}
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
              <span className="font-mono tabular-nums text-[var(--ink-muted)]">
                {s.finalShare.toFixed(0)}%
              </span>
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
            aria-label={`Share of solves over time per AI system: ${series
              .map((s) => `${s.label} ${s.finalShare.toFixed(0)} percent`)
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
                  {t}%
                </text>
              </g>
            ))}

            {visible.map((s) => (
              <polyline
                key={s.key}
                points={s.share.map((v, i) => `${x(i)},${yScale(v)}`).join(" ")}
                fill="none"
                stroke={s.color}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
                pointerEvents="none"
                opacity={focused !== null && focused !== s.key ? 0.25 : 1}
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
                    key={s.key}
                    cx={x(active)}
                    cy={yScale(s.share[active])}
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
                  points={s.share.map((v, i) => `${x(i)},${yScale(v)}`).join(" ")}
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
              {/* The denominator, not decoration. Early buckets hold two or
                  three entries, where a 100% share is arithmetic rather than
                  dominance; showing "of 3" is what stops that reading. */}
              <span className="font-serif text-[var(--ink)]">
                {bucketTooltipLabel(range[active], gran)}
              </span>
              <span className="ml-1.5 text-[var(--ink-muted)]">of {totalAt[active]}</span>
              {visible.map((s) => (
                <span key={s.key} className="ml-2 inline-flex items-center gap-1 font-mono tabular-nums text-[var(--ink-secondary)]">
                  <span
                    aria-hidden
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.share[active].toFixed(0)}%
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-2.5 flex justify-center">
        <GranularityToggle value={gran} onChange={setGran} />
      </div>
    </div>
  );
}
