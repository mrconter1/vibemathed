"use client";

// Per-chart persisted settings for the stats page: the time granularity and
// the hidden legend series survive reloads, one localStorage key per chart.
// Values are validated on restore; stale hidden keys simply match nothing.

import { useEffect, useState } from "react";
import type { Granularity } from "@/lib/time-buckets";

const GRANS: Granularity[] = ["day", "week", "month"];

/// `defaultGran` is the bucket a chart opens on before the reader has chosen
/// one. Week suits the growth curves, where a cumulative line is smooth at any
/// bucket; a composition chart is not, because a week holding three entries
/// gives a mix of thirds, so those open on Month. A stored choice always wins.
export function useChartSettings(
  id: string,
  defaultGran: Granularity = "week",
): {
  gran: Granularity;
  setGran: (g: Granularity) => void;
  hidden: ReadonlySet<string>;
  toggleSeries: (key: string) => void;
} {
  const key = `vibemathed:chart:${id}`;
  const [gran, setGran] = useState<Granularity>(defaultGran);
  const [hidden, setHidden] = useState<ReadonlySet<string>>(new Set());

  /* eslint-disable react-hooks/set-state-in-effect -- syncing state in from
     localStorage after hydration is the sanctioned use; reading it during the
     first render would make server and client HTML disagree. */
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    try {
      const s = JSON.parse(localStorage.getItem(key) ?? "null") as {
        gran?: unknown;
        hidden?: unknown;
      } | null;
      if (s) {
        if (GRANS.includes(s.gran as Granularity)) setGran(s.gran as Granularity);
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
      localStorage.setItem(key, JSON.stringify({ gran, hidden: [...hidden] }));
    } catch {
      // Storage full or blocked - the chart still works, it just won't persist.
    }
  }, [restored, key, gran, hidden]);

  const toggleSeries = (k: string) =>
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });

  return { gran, setGran, hidden, toggleSeries };
}
