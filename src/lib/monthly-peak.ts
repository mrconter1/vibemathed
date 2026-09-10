// "Most significant per month": for every month from the first solve to
// today, the single heaviest problem resolved in it.
//
// The other time charts on /stats count things - entries per week, cumulative
// totals, share by area - and all of them go up simply because the catalog
// grows. This one cannot: a month's value is the weight of its best result,
// so it only rises when something genuinely bigger lands. That makes it the
// one chart on the page that shows a ceiling moving rather than a pile
// getting taller, which is the actual claim the site exists to document.
//
// Months with nothing in them are kept as gaps rather than dropped, so the
// x axis stays a real timeline: the run of empty months early on is part of
// the story, not noise to be compressed away.

import { bucketKey, bucketRange } from "@/lib/time-buckets";
import type { ChartProblem } from "@/lib/problems";

export interface MonthPeak {
  /// "YYYY-MM".
  month: string;
  /// The heaviest entry resolved this month, or null if the month is empty.
  top: ChartProblem | null;
  /// Its significance, or 0 for an empty month.
  significance: number;
}

/// Entries that can appear on this chart at all: a resolution that means the
/// problem is actually settled, a solve date to place it, and a score to
/// plot. Partials and variants are excluded for the same reason they are
/// excluded from the age scatter - a bound improvement has no single moment
/// of resolution - and candidates are kept because a claimed solution under
/// review is still the biggest thing that happened that month.
export function eligible(p: ChartProblem): boolean {
  return (
    (p.resolution === "resolved" || p.resolution === "candidate") &&
    typeof p.solveDate === "string" &&
    p.solveDate.length >= 7 &&
    typeof p.significance === "number"
  );
}

/**
 * Bucket problems by solve month and keep the heaviest of each.
 *
 * `today` bounds the right edge so the axis ends at the present rather than
 * at the last solve, which matters when nothing has landed for a few weeks:
 * a chart that stops at the last result implies the record stopped too.
 */
export function monthlyPeaks(
  problems: ChartProblem[],
  today: string,
): MonthPeak[] {
  const usable = problems.filter(eligible);
  if (usable.length === 0) return [];

  const best = new Map<string, ChartProblem>();
  for (const p of usable) {
    const key = bucketKey(p.solveDate as string, "month");
    const prev = best.get(key);
    // Ties break towards the earlier solve date, so the month credits
    // whichever result got there first.
    if (
      !prev ||
      (p.significance as number) > (prev.significance as number) ||
      ((p.significance as number) === (prev.significance as number) &&
        (p.solveDate as string) < (prev.solveDate as string))
    ) {
      best.set(key, p);
    }
  }

  const first = [...best.keys()].sort()[0];
  const last = bucketKey(today, "month");
  // A solve dated in the future would otherwise produce an empty range.
  const end = last >= first ? last : [...best.keys()].sort().slice(-1)[0];

  return bucketRange(first, end, "month").map((month) => {
    const top = best.get(month) ?? null;
    return {
      month,
      top,
      significance: top ? (top.significance as number) : 0,
    };
  });
}

/// The running maximum, so the chart can draw the record line: the highest
/// significance seen up to and including each month. Never falls.
export function runningPeak(rows: MonthPeak[]): number[] {
  let best = 0;
  return rows.map((r) => {
    best = Math.max(best, r.significance);
    return best;
  });
}

/// Months whose peak set a new all-time high. These are the only months worth
/// labelling: everything else is noise against the record line.
export function recordMonths(rows: MonthPeak[]): Set<string> {
  const out = new Set<string>();
  let best = 0;
  for (const r of rows) {
    if (r.top && r.significance > best) {
      best = r.significance;
      out.add(r.month);
    }
  }
  return out;
}
