"use client";

import type { Granularity } from "@/lib/time-buckets";

// The tiny D / W / M segmented control the time charts share. Deliberately
// quiet: three ten-pixel letters, no labels, sitting at the end of a header
// or legend row.

const OPTIONS: { value: Granularity; short: string; title: string }[] = [
  { value: "day", short: "D", title: "Per day" },
  { value: "week", short: "W", title: "Per calendar week" },
  { value: "month", short: "M", title: "Per month" },
];

export function GranularityToggle({
  value,
  onChange,
}: {
  value: Granularity;
  onChange: (g: Granularity) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Time granularity"
      className="inline-flex shrink-0 overflow-hidden rounded border border-[var(--hairline)]"
    >
      {OPTIONS.map((o, i) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          title={o.title}
          className={`px-1.5 py-0.5 text-[10px] transition-colors ${
            i > 0 ? "border-l border-[var(--hairline)]" : ""
          } ${
            value === o.value
              ? "bg-[color-mix(in_srgb,var(--accent-blue)_12%,transparent)] font-medium text-[var(--accent-blue)]"
              : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
          }`}
        >
          {o.short}
        </button>
      ))}
    </div>
  );
}
