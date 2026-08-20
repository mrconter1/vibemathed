// Calendar-aligned time buckets for the stats line charts: days, ISO Monday
// weeks, and calendar months. All keys are sortable strings (dates for
// day/week, "YYYY-MM" for months). Imprecise solve dates place mid-period:
// "YYYY-MM" on the 15th, a bare "YYYY" mid-year - same convention the charts
// always used for month bucketing.

export type Granularity = "day" | "week" | "month";

const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parts(solveDate: string): { y: number; m: number; d: number } {
  const [y, m, d] = solveDate.split("-").map(Number);
  if (!m) return { y, m: 6, d: 15 };
  if (!d) return { y, m, d: 15 };
  return { y, m, d };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function fmt(y: number, m: number, d: number): string {
  return `${y}-${pad(m)}-${pad(d)}`;
}

/// The Monday starting the ISO calendar week containing the given date.
function mondayOf(y: number, m: number, d: number): string {
  const dt = new Date(Date.UTC(y, m - 1, d));
  const sinceMonday = (dt.getUTCDay() + 6) % 7;
  dt.setUTCDate(dt.getUTCDate() - sinceMonday);
  return fmt(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

export function bucketKey(solveDate: string, g: Granularity): string {
  const { y, m, d } = parts(solveDate);
  if (g === "month") return `${y}-${pad(m)}`;
  if (g === "week") return mondayOf(y, m, d);
  return fmt(y, m, d);
}

/// Continuous run of bucket keys from `first` to `last` inclusive.
export function bucketRange(first: string, last: string, g: Granularity): string[] {
  const out: string[] = [];
  if (g === "month") {
    let [y, m] = first.split("-").map(Number);
    const [ey, em] = last.split("-").map(Number);
    while (y < ey || (y === ey && m <= em)) {
      out.push(`${y}-${pad(m)}`);
      m += 1;
      if (m > 12) {
        m = 1;
        y += 1;
      }
    }
    return out;
  }
  const step = g === "week" ? 7 : 1;
  const cur = new Date(`${first}T00:00:00Z`);
  const end = new Date(`${last}T00:00:00Z`);
  while (cur <= end) {
    out.push(fmt(cur.getUTCFullYear(), cur.getUTCMonth() + 1, cur.getUTCDate()));
    cur.setUTCDate(cur.getUTCDate() + step);
  }
  return out;
}

/// ISO week number and week-year for a week's Monday key.
export function isoWeek(mondayKey: string): { week: number; year: number } {
  const monday = new Date(`${mondayKey}T00:00:00Z`);
  const thursday = new Date(monday);
  thursday.setUTCDate(monday.getUTCDate() + 3);
  const year = thursday.getUTCFullYear();
  const jan1 = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(((thursday.getTime() - jan1.getTime()) / 86400000 + 1) / 7);
  return { week, year };
}

/// Axis tick label, context-aware: repeated context (the month on day ticks,
/// the year on week and month ticks) only renders when it CHANGES relative to
/// the previously rendered tick, keeping the short form the common case so
/// dense tick rows never overlap.
export function bucketLabel(key: string, g: Granularity, prev: string | null): string {
  if (g === "month") {
    const [y, m] = key.split("-").map(Number);
    const py = prev ? Number(prev.split("-")[0]) : null;
    return py === y ? MONTH[m - 1] : `${MONTH[m - 1]} '${String(y).slice(2)}`;
  }
  if (g === "week") {
    const { week, year } = isoWeek(key);
    const prevYear = prev ? isoWeek(prev).year : null;
    return prevYear === year ? `W${week}` : `W${week} '${String(year).slice(2)}`;
  }
  const [y, m, d] = key.split("-").map(Number);
  const [py, pm] = prev ? prev.split("-").map(Number) : [null, null];
  if (py === y && pm === m) return String(d);
  if (py === y) return `${d} ${MONTH[m - 1]}`;
  return `${d} ${MONTH[m - 1]}${prev ? ` '${String(y).slice(2)}` : ""}`;
}

// ---------------------------------------------------------------------------
// Time windows.
//
// The charts used to offer Day / Week / Month, which only changed how finely
// the same full history was sliced - a rendering preference dressed up as a
// question about the data. What a reader actually wants to ask is "how much of
// this happened recently", so the control now picks a WINDOW and the
// resolution stays fixed at one week.
//
// No "last week" option, deliberately: at weekly resolution that is a single
// point, which is a number and not a line. One month is the shortest window
// that still draws a shape.

export type TimeRange = "1m" | "3m" | "all";

/// `months` is how far back the window reaches; null means the whole record.
/// `caption` completes a sentence like "142 entries <caption>", so every
/// windowed chart states which window its numbers describe.
export const TIME_RANGES: {
  value: TimeRange;
  label: string;
  months: number | null;
  caption: string;
}[] = [
  { value: "1m", label: "1M", months: 1, caption: "in the last month" },
  { value: "3m", label: "3M", months: 3, caption: "in the last three months" },
  { value: "all", label: "All", months: null, caption: "to date" },
];

export function rangeCaption(range: TimeRange): string {
  return TIME_RANGES.find((r) => r.value === range)?.caption ?? "to date";
}

/// The fixed resolution every time chart now draws at.
export const CHART_GRAN: Granularity = "week";

/// The first week key inside a window ending today, or null for "all".
///
/// Month arithmetic is calendar-based and inherits JS's overflow behaviour, so
/// one month back from 31 March lands in early March rather than on the 31st
/// of a month that has no 31st. Irrelevant at week resolution, where both fall
/// in the same bucket or one either side of it.
export function rangeStart(today: string, range: TimeRange): string | null {
  const months = TIME_RANGES.find((r) => r.value === range)?.months ?? null;
  if (months == null) return null;
  const { y, m, d } = parts(today);
  const dt = new Date(Date.UTC(y, m - 1 - months, d));
  return mondayOf(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

/// The x axis for a windowed chart: every week from the window's start (or the
/// first entry, whichever is later) through the week containing today.
///
/// Ending at TODAY rather than at the last entry is the point of a window. A
/// range that stopped at the final solve would silently crop a quiet fortnight
/// and redraw "nothing happened lately" as "the chart ends here".
export function timeWindow(
  firstKey: string,
  today: string,
  range: TimeRange,
): { buckets: string[]; from: string } {
  const todayKey = bucketKey(today, CHART_GRAN);
  const start = rangeStart(today, range);
  const from = start && start > firstKey ? start : firstKey;
  // A window entirely in the future of the data (an empty catalog, or a clock
  // skewed backwards) still has to produce one drawable bucket.
  const buckets = from > todayKey ? [todayKey] : bucketRange(from, todayKey, CHART_GRAN);
  return { buckets, from };
}

/// The full, self-contained form for tooltips.
export function bucketTooltipLabel(key: string, g: Granularity): string {
  if (g === "month") {
    const [y, m] = key.split("-").map(Number);
    return `${MONTH[m - 1]} '${String(y).slice(2)}`;
  }
  if (g === "week") {
    const { week, year } = isoWeek(key);
    return `W${week} '${String(year).slice(2)}`;
  }
  const [y, m, d] = key.split("-").map(Number);
  return `${d} ${MONTH[m - 1]} '${String(y).slice(2)}`;
}
