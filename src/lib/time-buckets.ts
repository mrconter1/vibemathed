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

export function bucketLabel(key: string, g: Granularity): string {
  if (g === "month") {
    const [y, m] = key.split("-").map(Number);
    return `${MONTH[m - 1]} '${String(y).slice(2)}`;
  }
  const [y, m, d] = key.split("-").map(Number);
  return `${d} ${MONTH[m - 1]} '${String(y).slice(2)}`;
}
