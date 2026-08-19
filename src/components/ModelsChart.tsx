"use client";

import { useEffect, useRef, useState } from "react";
import { MODEL_FAMILIES } from "@/lib/display";
import type { ChartProblem } from "@/lib/problems";
import { bucketKey, bucketRange, bucketTooltipLabel } from "@/lib/time-buckets";
import { GranularityToggle, TimeAxis } from "@/components/GranularityToggle";
import { useChartSettings } from "@/lib/chart-settings";

// Cumulative solves per vendor over time - the volume race, not just its
// final score. Same frame and hover behaviour as the other line charts. An
// entry counts toward every vendor named on it (see MODEL_FAMILIES), so the
// lines can sum to more than the number of problems.
//
// "Vendor" rather than "AI system family": the series ARE vendors - OpenAI,
// Anthropic, Google DeepMind - and the two rows that are not a company,
// open-weights and agent systems, are labelled for what they are in the
// legend.

// One fixed color per family - color follows the entity, never its rank.
// Seven series outgrow the theme's accent pair, so this chart carries its own
// categorical palette: distinct hues, all dark enough for the cream surface.
const FAMILY_COLOR: Record<string, string> = {
  openai: "#2a78d6", // blue
  anthropic: "#eb6834", // orange
  google: "#2e9e4f", // green
  harmonic: "#8b5cf6", // violet
  xai: "#d23b6e", // magenta
  agents: "#0f9b9b", // teal
  "open-weights": "#b8860b", // mustard
};

/// How many models an opened row lists before it says how many it left out.
/// Sized to the ones that carry the row: past this the counts are 1s, and a
/// list of 174 single-entry model strings is a data dump, not an answer.
const PARTS_SHOWN = 18;

const VIEW_W = 640;
const VIEW_H = 360;
const MARGIN = { top: 20, right: 20, bottom: 40, left: 44 };
const PLOT_W = VIEW_W - MARGIN.left - MARGIN.right;
const PLOT_H = VIEW_H - MARGIN.top - MARGIN.bottom;

function niceMax(v: number, step: number) {
  return Math.max(step, Math.ceil(v / step) * step);
}

export function ModelsChart({ problems }: { problems: ChartProblem[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  // Granularity and hidden series survive reloads (see useChartSettings).
  const { gran, setGran, hidden, toggleSeries } = useChartSettings("systems");
  // Hovering a line (or its legend chip) highlights it and fades the rest.
  const [focused, setFocused] = useState<string | null>(null);
  // Which composite row has its contents open, if any. Deliberately one at a
  // time and deliberately NOT persisted: it is a "what is in there?" answer,
  // not a display preference the reader wants restored next visit.
  const [expanded, setExpanded] = useState<string | null>(null);

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

  const series = MODEL_FAMILIES.map((f) => {
    const mine = problems.filter((p) => f.test.test(p.model));
    const famKeys = mine.map((p) => bucketKey(p.solveDate, gran));
    // What a row is actually made of. Every row here is a bag: "Agent systems
    // / other" is two dozen harnesses, but so is OpenAI, whose 349 entries
    // name 174 distinct model strings. Splitting any of it into its own line
    // is the wrong answer - the largest agent harness has a fortieth of
    // OpenAI's count, so its line would sit on the axis, and no chart carries
    // that many hues - so the detail lives behind a disclosure instead.
    const counts = new Map<string, number>();
    for (const p of mine) counts.set(p.model, (counts.get(p.model) ?? 0) + 1);
    const parts = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    return {
      key: f.key,
      label: f.label,
      color: FAMILY_COLOR[f.key] ?? "var(--ink)",
      cumulative: range.map((mk) => famKeys.filter((k) => k <= mk).length),
      total: famKeys.length,
      // Only worth offering when the row covers more than one model string.
      parts: parts.length > 1 ? parts : null,
    };
  })
    .filter((s) => s.total > 0)
    .sort((a, b) => b.total - a.total);

  const visible = series.filter((s) => !hidden.has(s.key));
  // Resolved after `series`, so a row that stops being composite (or vanishes)
  // cannot leave a stale panel open.
  const expandedParts = series.find((s) => s.key === expanded)?.parts ?? null;
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

  const active = isDesktop && hover !== null && hover < range.length ? hover : null;

  return (
    <div className="flex h-full flex-col">
      <h2 className="font-serif text-lg text-[var(--ink)]">
        Problems solved per vendor, over time
      </h2>
      <p className="mt-1 text-xs text-[var(--ink-muted)]">
        Cumulative count per vendor; an entry counts toward every vendor named
        on it, so the lines sum to more than the number of problems.
      </p>

      {/* Legend doubles as the standings AND the visibility toggles. */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {series.map((s) => {
          const off = hidden.has(s.key);
          const open = expanded === s.key;
          return (
            <span key={s.key} className="inline-flex items-center">
              <button
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
                <span className="font-mono tabular-nums text-[var(--ink-muted)]">{s.total}</span>
              </button>
              {/* A second control, not a bigger one: the chip itself already
                  means "show/hide this line", and overloading it to also mean
                  "tell me what is in it" would make one of the two a surprise.
                  Only rows that are a bag of several systems get it. */}
              {s.parts && (
                <button
                  type="button"
                  onClick={() => setExpanded(open ? null : s.key)}
                  aria-expanded={open}
                  aria-label={`${open ? "Hide" : "Show"} the models counted as ${s.label}`}
                  title={`${open ? "Hide" : "Show"} the ${s.parts.length} models in this row`}
                  className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded text-[var(--ink-muted)] transition-colors hover:text-[var(--accent-blue)]"
                >
                  <svg
                    width="9"
                    height="9"
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden
                    style={{ transform: open ? "rotate(180deg)" : undefined }}
                  >
                    <path d="M3.5 6L8 10.5 12.5 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </span>
          );
        })}
      </div>

      {/* Collapsed by default: these lists are long - OpenAI's row alone names
          174 distinct models - and spending the card on them before anyone
          asks would cost the plot the room it needs. Opened, the panel pushes
          the plot down rather than covering it, which is why only one row
          opens at a time, and why it is capped and scrolls: the whole point is
          to answer a question, not to become the chart. */}
      {expandedParts && (
        <div className="mt-1.5 max-h-24 overflow-y-auto rounded-md border border-[var(--hairline)] bg-[color-mix(in_srgb,var(--ink)_2%,transparent)] px-2 py-1.5">
          <ul className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
            {expandedParts.slice(0, PARTS_SHOWN).map(([model, n]) => (
              <li key={model} className="text-[var(--ink-secondary)]">
                {model}{" "}
                <span className="font-mono tabular-nums text-[var(--ink-muted)]">{n}</span>
              </li>
            ))}
            {/* The cap says so rather than trailing off, so a reader can tell a
                short row from a truncated one. */}
            {expandedParts.length > PARTS_SHOWN && (
              <li className="text-[var(--ink-muted)]">
                +{expandedParts.length - PARTS_SHOWN} more
              </li>
            )}
          </ul>
        </div>
      )}

      <div className="mt-3 flex flex-1 flex-col justify-center">
        <div className="relative" style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="h-full w-full"
            role="img"
            aria-label="Cumulative problems solved over time, one line per vendor"
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

            {/* Invisible wide strokes on top: hovering a line focuses its
                series. They forward mousemove so the crosshair keeps
                tracking while tracing a line. */}
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
              <span className="font-serif text-[var(--ink)]">{bucketTooltipLabel(range[active], gran)}</span>
              {visible.map((s) => (
                <span
                  key={s.key}
                  className="ml-2 inline-flex items-center gap-1 font-mono tabular-nums text-[var(--ink-secondary)]"
                >
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
