"use client";

import { TIME_RANGES, bucketLabel, type Granularity, type TimeRange } from "@/lib/time-buckets";

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
