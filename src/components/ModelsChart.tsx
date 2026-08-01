"use client";

import { useEffect, useRef, useState } from "react";
import { MODEL_FAMILIES } from "@/lib/display";
import type { MathProblem } from "@/lib/problems";

// Cumulative solves per AI-system family over time - the volume race, not
// just its final score. Same frame and hover behaviour as the other line
// charts. An entry counts toward every family named on it (see
// MODEL_FAMILIES), so the lines can sum to more than the number of problems.

// One fixed color per family - color follows the entity, never its rank.
const FAMILY_COLOR: Record<string, string> = {
  openai: "var(--accent-blue)",
  anthropic: "var(--accent-orange)",
  google: "var(--status-good)",
  harmonic: "var(--status-warning)",
  agents: "var(--ink-secondary)",
  xai: "var(--status-critical)",
  "open-weights": "var(--ink-muted)",
};

const VIEW_W = 640;
const VIEW_H = 360;
const MARGIN = { top: 20, right: 20, bottom: 40, left: 44 };
const PLOT_W = VIEW_W - MARGIN.left - MARGIN.right;
const PLOT_H = VIEW_H - MARGIN.top - MARGIN.bottom;

const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function monthKey(solveDate: string): string {
  if (/^\d{4}-\d{2}/.test(solveDate)) return solveDate.slice(0, 7);
  if (/^\d{4}$/.test(solveDate)) return `${solveDate}-06`;
  return solveDate.slice(0, 7);
}

function label(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return `${MONTH[m - 1]} '${String(y).slice(2)}`;
}

function niceMax(v: number, step: number) {
  return Math.max(step, Math.ceil(v / step) * step);
}

export function ModelsChart({ problems }: { problems: MathProblem[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  // Legend chips toggle series on and off; the y-axis rescales to what is
  // visible, so hiding the runaway leader zooms the rest into view.
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());
  const toggleSeries = (key: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const keys = problems.map((p) => monthKey(p.solveDate)).sort();
  if (keys.length === 0) return null;

  const range: string[] = [];
  let [y, m] = keys[0].split("-").map(Number);
  const [ey, em] = keys[keys.length - 1].split("-").map(Number);
  while (y < ey || (y === ey && m <= em)) {
    range.push(`${y}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }

  const series = MODEL_FAMILIES.map((f) => {
    const famKeys = problems
      .filter((p) => f.test.test(p.model))
      .map((p) => monthKey(p.solveDate));
    return {
      key: f.key,
      label: f.label,
      color: FAMILY_COLOR[f.key] ?? "var(--ink)",
      cumulative: range.map((mk) => famKeys.filter((k) => k <= mk).length),
      total: famKeys.length,
    };
  })
    .filter((s) => s.total > 0)
    .sort((a, b) => b.total - a.total);

  const visible = series.filter((s) => !hidden.has(s.key));
  const yMax = niceMax(Math.max(1, ...visible.map((s) => s.total)), 20);

  const x = (i: number) =>
    MARGIN.left + (range.length === 1 ? PLOT_W / 2 : (i / (range.length - 1)) * PLOT_W);
  const yScale = (v: number) => MARGIN.top + PLOT_H - (v / yMax) * PLOT_H;

  const xEvery = Math.ceil(range.length / 7);
  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round((i * yMax) / 4));

  function handleMove(e: React.MouseEvent<SVGRectElement>) {
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
        Problems solved by AI system, over time
      </h2>
      <p className="mt-1 text-xs text-[var(--ink-muted)]">
        Cumulative count per system family; an entry counts toward every system
        named on it.
      </p>

      {/* Legend doubles as the standings AND the visibility toggles. */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {series.map((s) => {
          const off = hidden.has(s.key);
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => toggleSeries(s.key)}
              aria-pressed={!off}
              title={off ? "Show series" : "Hide series"}
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
            aria-label="Cumulative problems solved over time, one line per AI-system family"
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
              />
            ))}

            {range.map((mk, i) =>
              i % xEvery === 0 || i === range.length - 1 ? (
                <text
                  key={mk}
                  x={x(i)}
                  y={VIEW_H - MARGIN.bottom + 18}
                  textAnchor="middle"
                  className="font-mono"
                  style={{ fontSize: 13, fill: "var(--ink-muted)" }}
                >
                  {label(mk)}
                </text>
              ) : null,
            )}

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
              <span className="font-serif text-[var(--ink)]">{label(range[active])}</span>
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
    </div>
  );
}
