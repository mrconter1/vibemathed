"use client";

import { TIME_RANGES, bucketLabel, type Granularity, type TimeRange } from "@/lib/time-buckets";
import type { TierFilter } from "@/lib/chart-settings";

// The pieces every time chart shares: the tiny 1M / 3M / All segmented control
// (rendered below each plot) and the TimeAxis tick row.

/// X-axis tick labels for a bucketed time range. Density scales with how
/// short the granularity's labels are (day numbers pack tighter than month
/// names), context only renders on change (see bucketLabel), and a trailing
/// tick that would crowd its neighbour is dropped - so labels never overlap.
export function TimeAxis({
  range,
  gran,
  x,
  y,
  scale = 1,
}: {
  range: string[];
  gran: Granularity;
  x: (i: number) => number;
  y: number;
  /// viewBox width relative to the standard 640: a plot drawn twice as wide
  /// fits proportionally more ticks at the same rendered spacing.
  scale?: number;
}) {
  const target = Math.round((gran === "month" ? 7 : gran === "week" ? 9 : 10) * scale);
  const every = Math.ceil(range.length / target);
  const idx = range.map((_, i) => i).filter((i) => i % every === 0 || i === range.length - 1);
  if (idx.length >= 2 && x(idx[idx.length - 1]) - x(idx[idx.length - 2]) < 44) {
    idx.splice(idx.length - 2, 1);
  }
  // Pure: each label's context key is the previous RENDERED tick's key.
  const labels = idx.map((i, k) =>
    bucketLabel(range[i], gran, k === 0 ? null : range[idx[k - 1]]),
  );
  return (
    <>
      {idx.map((i, k) => (
        <text
          key={range[i]}
          x={x(i)}
          y={y}
          textAnchor="middle"
          className="font-mono"
          style={{ fontSize: 13, fill: "var(--ink-muted)" }}
        >
          {labels[k]}
        </text>
      ))}
    </>
  );
}

/// Short labels, because this control sits beside the range toggle under a
/// half-width card and the written-out tiers ("AI co-developed") do not fit on
/// one row. The full names stay one hover away in the title attribute.
const TIER_OPTIONS: { value: TierFilter; label: string; title: string }[] = [
  { value: "all", label: "Any", title: "Every entry, including those with no contribution tier recorded" },
  { value: "ai-discovered", label: "Discovered", title: "AI-discovered" },
  { value: "ai-co-developed", label: "Co-developed", title: "AI co-developed" },
  { value: "ai-assisted", label: "Assisted", title: "AI-assisted" },
];

/// "[Any | Discovered | Co-developed | Assisted]" - which AI-contribution tier
/// a chart counts. Selecting a tier necessarily drops entries with no tier
/// recorded, so charts using this say how many that was.
export function TierToggle({
  value,
  onChange,
}: {
  value: TierFilter;
  onChange: (t: TierFilter) => void;
}) {
  return (
    <div
      role="group"
      aria-label="AI contribution tier"
      className="inline-flex overflow-hidden rounded border border-[var(--hairline)] bg-[var(--paper)]"
    >
      {TIER_OPTIONS.map((o, i) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          title={o.title}
          className={`px-2.5 py-1 text-xs transition-colors ${
            i > 0 ? "border-l border-[var(--hairline)]" : ""
          } ${
            value === o.value
              ? "bg-[color-mix(in_srgb,var(--accent-blue)_12%,transparent)] font-medium text-[var(--accent-blue)]"
              : "text-[var(--ink-secondary)] hover:text-[var(--ink)]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/// Says what a tier selection excluded, and only when one is active.
///
/// Without this a filtered chart is indistinguishable from a shrinking record:
/// the totals drop, the lines flatten, and nothing on screen explains why. The
/// unclassified entries matter most - a tier filter silently discards every
/// entry whose tier was never recorded, which is not a small share.
export function TierNote({
  tier,
  shown,
  total,
}: {
  tier: TierFilter;
  /// Entries the chart is counting after the tier filter.
  shown: number;
  /// Entries it would count with the filter off.
  total: number;
}) {
  if (tier === "all") return null;
  const label = TIER_OPTIONS.find((o) => o.value === tier)?.title ?? tier;
  return (
    <p className="mt-1 text-xs text-[var(--accent-orange)]">
      {label} only: {shown} of {total} entries. The rest sit in another tier or
      have none recorded.
    </p>
  );
}

/// "[1M | 3M | All]", centered below each time chart's plot - the same
/// segmented-control styling as the list's period picker, one size down.
export function TimeRangeToggle({
  value,
  onChange,
}: {
  value: TimeRange;
  onChange: (r: TimeRange) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Time range"
      className="inline-flex overflow-hidden rounded border border-[var(--hairline)] bg-[var(--paper)]"
    >
      {TIME_RANGES.map((o, i) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={`px-2.5 py-1 text-xs transition-colors ${
            i > 0 ? "border-l border-[var(--hairline)]" : ""
          } ${
            value === o.value
              ? "bg-[color-mix(in_srgb,var(--accent-blue)_12%,transparent)] font-medium text-[var(--accent-blue)]"
              : "text-[var(--ink-secondary)] hover:text-[var(--ink)]"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
