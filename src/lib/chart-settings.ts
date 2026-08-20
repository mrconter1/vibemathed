"use client";

// Per-chart persisted settings for the stats page: the time window and the
// hidden legend series survive reloads, one localStorage key per chart.
// Values are validated on restore; stale hidden keys simply match nothing.

import { useEffect, useState } from "react";
import { TIME_RANGES, type TimeRange } from "@/lib/time-buckets";

const RANGES = TIME_RANGES.map((r) => r.value);

export function useChartSettings(id: string): {
  range: TimeRange;
  setRange: (r: TimeRange) => void;
  hidden: ReadonlySet<string>;
  toggleSeries: (key: string) => void;
} {
  const key = `vibemathed:chart:${id}`;
  // All time by default: the record's whole shape is the honest first view,
  // and a returning reader's narrower window is restored below.
  const [range, setRange] = useState<TimeRange>("all");
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());

  /* eslint-disable react-hooks/set-state-in-effect -- syncing state in from
     localStorage after hydration is the sanctioned use; reading it during the
     first render would make server and client HTML disagree. */
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(key) ?? "null") as {
        range?: unknown;
        hidden?: unknown;
      } | null;
      if (s) {
        // A stored `gran` from the old Day/Week/Month control is simply not a
        // range, so it fails this check and the chart opens on All - no
        // migration needed, and no crash from a value that means nothing now.
        if (RANGES.includes(s.range as TimeRange)) setRange(s.range as TimeRange);
        if (Array.isArray(s.hidden)) {
          setHidden(new Set(s.hidden.filter((x): x is string => typeof x === "string")));
        }
      }
    } catch {
      // Malformed storage reads as "nothing stored".
    }
    setRestored(true);
  }, [key]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(key, JSON.stringify({ range, hidden: [...hidden] }));
    } catch {
      // Storage full or blocked - the chart still works, it just won't persist.
    }
  }, [restored, key, range, hidden]);

  const toggleSeries = (k: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  return { range, setRange, hidden, toggleSeries };
}
