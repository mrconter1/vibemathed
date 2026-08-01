"use client";

import { useEffect, useRef, useState } from "react";
import type { MathProblem } from "@/lib/problems";
import { bucketKey, bucketLabel, bucketRange, type Granularity } from "@/lib/time-buckets";
import { GranularityToggle } from "@/components/GranularityToggle";

const VIEW_W = 640;
// Matches the notability chart's aspect ratio so the two wide charts render at
// the same height when paired in the dashboard grid.
const VIEW_H = 360;
const MARGIN = { top: 20, right: 20, bottom: 40, left: 44 };
const PLOT_W = VIEW_W - MARGIN.left - MARGIN.right;
const PLOT_H = VIEW_H - MARGIN.top - MARGIN.bottom;

function niceMax(v: number, step: number) {
  return Math.max(step, Math.ceil(v / step) * step);
}

export function CumulativeChart({ problems }: { problems: MathProblem[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  // Calendar-aligned time buckets, month by default (see time-buckets.ts).
  const [gran, setGran] = useState<Granularity>("month");

  // Only wire up hover on devices with a real (mouse) pointer.
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const keys = problems.map((p) => bucketKey(p.solveDate, gran)).sort();
  if (keys.length === 0) return null;

  // Continuous bucket range from first to last solve.
  const range = bucketRange(keys[0], keys[keys.length - 1], gran);

  const cumulative = range.map((mk) => keys.filter((k) => k <= mk).length);
  const total = problems.length;
  const yMax = niceMax(total, 20);
  const yStep = yMax / 4;

  const x = (i: number) =>
    MARGIN.left + (range.length === 1 ? PLOT_W / 2 : (i / (range.length - 1)) * PLOT_W);
  const yScale = (v: number) => MARGIN.top + PLOT_H - (v / yMax) * PLOT_H;

  const linePts = cumulative.map((v, i) => `${x(i)},${yScale(v)}`).join(" ");
  const areaPts = `${x(0)},${yScale(0)} ${linePts} ${x(range.length - 1)},${yScale(0)}`;

  const xEvery = Math.ceil(range.length / 7);
  const yTicks = Array.from({ length: 5 }, (_, i) => Math.round(i * yStep));

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
      <div className="flex items-start justify-between gap-3">
        <h2 className="font-serif text-lg text-[var(--ink)]">Problems solved over time</h2>
        <GranularityToggle value={gran} onChange={setGran} />
      </div>
      <p className="mt-1 text-xs text-[var(--ink-muted)]">
        Cumulative count of tracked resolutions, {total} to date.
      </p>

      <div className="mt-3 flex flex-1 flex-col justify-center">
        <div className="relative" style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-full w-full"
          role="img"
          aria-label={`Cumulative problems solved over time, rising to ${total}`}
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
                {bucketLabel(mk, gran)}
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
              top: `${(yScale(cumulative[active]) / VIEW_H) * 100}%`,
              transform: "translate(-50%, calc(-100% - 10px))",
            }}
          >
            <span className="font-serif text-[var(--ink)]">{bucketLabel(range[active], gran)}</span>
            <span className="ml-2 font-mono tabular-nums text-[var(--ink-secondary)]">
              {cumulative[active]} solved
            </span>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
