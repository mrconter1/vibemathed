"use client";

import { useEffect, useRef, useState } from "react";
import { MODEL_FAMILIES } from "@/lib/display";
import type { ChartProblem } from "@/lib/problems";
import { bucketKey, bucketRange, bucketTooltipLabel } from "@/lib/time-buckets";
import { GranularityToggle, TimeAxis } from "@/components/GranularityToggle";
import { useChartSettings } from "@/lib/chart-settings";

// Composition of solves per vendor over time, as a 100% stacked column per
// bucket. ModelsChart next door plots cumulative counts, where every line only
// rises and a vendor gaining ground looks the same as one carried by the
// record's growth. This shows the mix instead: a segment that narrows is a
// vendor losing ground, whatever the totals did.
//
// ATTRIBUTION, and why it had to change. A stacked bar is a part-to-whole
// form, so the parts must actually make a whole. The volume chart counts an
// entry toward EVERY system it names, which is right for "how many solves did
// Anthropic appear on" but sums to about 127% across vendors - stacking that
// would draw a whole that does not exist. So credit is split here instead: an
// entry naming k vendors gives 1/k to each, and every column sums to exactly
// 100%. The two charts therefore answer different questions on purpose, and
// this one's numbers are lower for any vendor that often shares a paper.
//
// Four resolved entries name a system no family matches ("Co-Mathematician",
// "Unspecified", an unnamed agent). They are the gray band at the base rather
// than being dropped, because a part-to-whole chart that quietly discards its
// remainder is drawing a different denominator than it claims.
//
// PER BUCKET, not cumulative. A stacked share chart is about the mix at a
// moment; a running mix would barely move and the form would be wasted. The
// cost is real at fine granularity - a week holding three solves gives a very
// coarse mix - which is why the tooltip carries the bucket's entry count and
// why Month exists on the toggle.
//
// CONTINUOUS, not columns. Drawn first as separate columns, which put a hole
// in the ribbon at every quiet week; early 2025 has enough of them that the
// chart read as noise rather than as a trend. A composition does not stop
// existing in a week nobody published, so each bucket's mix now holds until
// the next bucket that has entries - a step area, filled edge to edge. The
// steps are the honest shape: the mix is only ever measured at buckets that
// have data, so interpolating a smooth curve between them would draw
// intermediate mixes that were never observed.
//
// SORTED, largest band at the base, by whole-record share rather than by the
// bucket's - a per-bucket sort would have bands swapping places every step and
// nothing would be traceable across the chart.
//
// COLOR follows the vendor, unchanged from ModelsChart: the same vendor must
// not change hue between two charts on one page. Because the band ORDER is
// data-derived, no fixed adjacency can be validated once and relied on - the
// order shifts as the record grows. So separation here does not lean on hue:
// every band is drawn with a surface-coloured edge, which keeps two touching
// bands distinct whatever hues the sort puts side by side, and the legend and
// tooltip both name every vendor beside its colour.

const VIEW_W = 640;
const VIEW_H = 360;
const MARGIN = { top: 20, right: 20, bottom: 40, left: 44 };
const PLOT_W = VIEW_W - MARGIN.left - MARGIN.right;
const PLOT_H = VIEW_H - MARGIN.top - MARGIN.bottom;

/// Width of the surface-coloured edge drawn around each band, in viewBox
/// units. This is what separates two touching bands, in place of relying on
/// their hues being far apart - which a data-derived sort order cannot
/// promise. Stroke rather than gap: a gap would make the column stop short of
/// 100% and the stack would no longer be a whole.
const EDGE = 1.25;

const UNATTRIBUTED = "unattributed";

/// The fixed hue per vendor. Order here is irrelevant - the stack is sorted by
/// size below - but the colour must never move between vendors.
const COLOR: Record<string, string> = {
  [UNATTRIBUTED]: "#8c8578",
  openai: "#2a78d6",
  google: "#2e9e4f",
  anthropic: "#eb6834",
  harmonic: "#8b5cf6",
  xai: "#d23b6e",
  "open-weights": "#b8860b",
  agents: "#0f9b9b",
};

const KEYS = [UNATTRIBUTED, ...MODEL_FAMILIES.map((f) => f.key)];

const LABEL: Record<string, string> = {
  ...Object.fromEntries(MODEL_FAMILIES.map((f) => [f.key, f.label])),
  [UNATTRIBUTED]: "Unattributed",
};

export function VendorShareChart({ problems }: { problems: ChartProblem[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  // Only the granularity is persisted. A 100% stack has no per-series
  // visibility toggle by design: hiding a band would either leave a hole in
  // the whole or renormalize the rest, and both draw a mix that is not the
  // data. Hovering a legend chip isolates a vendor instead.
  const { gran, setGran } = useChartSettings("vendor-share", "month");
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
  const index = new Map(range.map((k, i) => [k, i]));

  // Fractional credit, so each entry contributes exactly 1 across the stack.
  const credit = new Map(KEYS.map((k) => [k, range.map(() => 0)]));
  const perBucket = range.map(() => 0);
  for (const p of problems) {
    const i = index.get(bucketKey(p.solveDate, gran));
    if (i === undefined) continue;
    perBucket[i] += 1;
    const s = `${p.model} ${p.modelMaker ?? ""}`;
    const hits = MODEL_FAMILIES.filter((f) => f.test.test(s)).map((f) => f.key);
    const share = hits.length === 0 ? [UNATTRIBUTED] : hits;
    for (const key of share) credit.get(key)![i] += 1 / share.length;
  }

  // Forward fill: the bucket whose mix is in force at i, which is i itself
  // unless nothing was published then, in which case the last one that was.
  // range[0] always has entries (the range starts at the first solve), so this
  // is defined everywhere.
  const source = range.map(() => 0);
  for (let i = 0, last = 0; i < range.length; i++) {
    if (perBucket[i] > 0) last = i;
    source[i] = last;
  }

  const shareAt = (key: string, i: number) => {
    const src = source[i];
    return perBucket[src] === 0 ? 0 : (100 * credit.get(key)![src]) / perBucket[src];
  };

  // Whole-record totals, and the band order they imply: biggest at the base,
  // fixed for the whole chart so a band never swaps places mid-flight.
  const totals = new Map(
    KEYS.map((k) => [k, credit.get(k)!.reduce((a, b) => a + b, 0)]),
  );
  const grandTotal = perBucket.reduce((a, b) => a + b, 0);
  const bands = KEYS.filter((k) => totals.get(k)! >= 0.5).sort(
    (a, b) => totals.get(b)! - totals.get(a)! || a.localeCompare(b),
  );

  const step = PLOT_W / range.length;
  const xLeft = (i: number) => MARGIN.left + step * i;
  const cx = (i: number) => MARGIN.left + step * i + step / 2;
  const yScale = (v: number) => MARGIN.top + PLOT_H - (v / 100) * PLOT_H;
  const yTicks = [0, 25, 50, 75, 100];

  // One filled step polygon per band: along the top edge left to right, back
  // along the bottom edge. Stacking is bottom-up in `bands` order, so each
  // band's bottom is the running total of the bands below it.
  const below = range.map(() => 0);
  const bandPaths = bands.map((key) => {
    const top: string[] = [];
    const bottom: string[] = [];
    for (let i = 0; i < range.length; i++) {
      const y0 = yScale(below[i]);
      const y1 = yScale(below[i] + shareAt(key, i));
      const l = xLeft(i);
      const r = xLeft(i + 1);
      top.push(`${l},${y1}`, `${r},${y1}`);
      // Pushed left-then-right so that reversing the whole list walks the
      // bottom edge right-to-left with each step's own corners in order.
      bottom.push(`${l},${y0}`, `${r},${y0}`);
      below[i] += shareAt(key, i);
    }
    return { key, points: [...top, ...bottom.reverse()].join(" ") };
  });

  function handleMove(e: React.MouseEvent<SVGElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * VIEW_W;
    const i = Math.floor((svgX - MARGIN.left) / step);
    setHover(Math.min(Math.max(i, 0), range.length - 1));
  }

  // No "has entries" condition: the ribbon is continuous, so every x has a mix
  // to report, and the tooltip says when that mix is held over from earlier.
  const active = isDesktop && hover !== null && hover < range.length ? hover : null;

  return (
    <div className="flex h-full flex-col">
      <h2 className="font-serif text-lg text-[var(--ink)]">
        Share of solves per vendor, over time
      </h2>
      <p className="mt-1 text-xs text-[var(--ink-muted)]">
        The mix of solves in each period. An entry naming several vendors splits
        its credit between them, so every column totals 100%.
      </p>

      {/* A key, not a set of toggles - see the note on the settings hook.
          Listed in stack order, so the legend reads bottom-up like the bands. */}
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {bands.map((key) => (
          <span
            key={key}
            onMouseEnter={() => setFocused(key)}
            onMouseLeave={() => setFocused(null)}
            className="inline-flex cursor-default items-center gap-1.5 rounded px-1 py-0.5"
          >
            <span
              aria-hidden
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: COLOR[key] }}
            />
            <span className="text-[var(--ink-secondary)]">{LABEL[key]}</span>
            <span className="font-mono tabular-nums text-[var(--ink-muted)]">
              {grandTotal === 0 ? 0 : Math.round((100 * totals.get(key)!) / grandTotal)}%
            </span>
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-1 flex-col justify-center">
        <div className="relative" style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="h-full w-full"
            role="img"
            aria-label={`Stacked share of solves per vendor over time. Across the whole record: ${bands
              .map(
                (key) =>
                  `${LABEL[key]} ${grandTotal === 0 ? 0 : Math.round((100 * totals.get(key)!) / grandTotal)} percent`,
              )
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

            {bandPaths.map((b) => (
              <polygon
                key={b.key}
                points={b.points}
                fill={COLOR[b.key]}
                // The edge is the separator between touching bands, drawn in
                // the surface colour so it reads as a seam rather than an
                // outline. Painted on both sides of the boundary by the two
                // neighbours, which is why it is half the intended width.
                stroke="var(--paper-raised)"
                strokeWidth={EDGE}
                strokeLinejoin="round"
                opacity={focused !== null && focused !== b.key ? 0.25 : 1}
              />
            ))}

            {active !== null && (
              <line
                pointerEvents="none"
                x1={cx(active)}
                x2={cx(active)}
                y1={MARGIN.top}
                y2={yScale(0)}
                stroke="var(--ink)"
                strokeWidth={1}
                strokeDasharray="3 3"
              />
            )}

            <TimeAxis range={range} gran={gran} x={cx} y={VIEW_H - MARGIN.bottom + 18} />

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
                left: `${(cx(active) / VIEW_W) * 100}%`,
                top: `${(MARGIN.top / VIEW_H) * 100}%`,
                transform: "translate(-50%, 0)",
              }}
            >
              <span className="font-serif text-[var(--ink)]">
                {bucketTooltipLabel(range[active], gran)}
              </span>
              {/* The denominator, and which bucket the mix actually came from.
                  A single-entry week is one solid band, and "1 entry" is what
                  stops that reading as dominance; on a quiet week the mix on
                  screen is held over from an earlier one, and saying so is the
                  difference between a forward fill and a fabrication. */}
              <span className="ml-1.5 text-[var(--ink-muted)]">
                {source[active] === active
                  ? `${perBucket[active]} ${perBucket[active] === 1 ? "entry" : "entries"}`
                  : `no entries; mix held from ${bucketTooltipLabel(range[source[active]], gran)}`}
              </span>
              {bands.map((key) =>
                shareAt(key, active) <= 0 ? null : (
                  <span
                    key={key}
                    className="ml-2 inline-flex items-center gap-1 font-mono tabular-nums text-[var(--ink-secondary)]"
                  >
                    <span
                      aria-hidden
                      className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: COLOR[key] }}
                    />
                    {Math.round(shareAt(key, active))}%
                  </span>
                ),
              )}
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
