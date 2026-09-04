// Records: one named quantity, a direction, and a staircase of best known
// values. Pure helpers only - no database, no React - so the frontier logic
// is testable and the same on the landing strip, the record page and the
// entry page.
//
// The frontier is DERIVED. A record has a stored direction and stored rows;
// which row is the current best falls out of those two things and nothing
// else. Storing a "current" flag would be a second source of truth that goes
// stale the moment a row is added, retracted or re-dated.

export type RecordDirection = "min" | "max";
export type RecordRowStatus = "published" | "candidate" | "historical" | "retracted";

export interface RecordRowLike {
  id: string;
  date: string;
  valueTex: string;
  valueNumeric: number | null;
  rank: number | null;
  status: string;
}

/// Rows that can hold the frontier: a claim under review or one that has been
/// withdrawn is drawn, but it never wins. `historical` rows do compete - the
/// frontier before the first AI step IS the historical record, and a chart
/// that pretended otherwise would misstate the history.
export function competes(status: string): boolean {
  return status === "published" || status === "historical";
}

/// Higher is better in the record's own direction. Numeric value when the row
/// has one; the curator-set rank otherwise. Mixing the two inside one record
/// is a curation error, so a record is expected to be all-numeric or all-rank;
/// when it is mixed, numeric rows sort ahead of rank rows rather than throwing.
export function score(row: RecordRowLike, direction: RecordDirection): number {
  if (row.valueNumeric !== null && Number.isFinite(row.valueNumeric)) {
    return direction === "min" ? -row.valueNumeric : row.valueNumeric;
  }
  // Rank rows: `rank` is already "higher is better", by definition.
  return row.rank === null ? Number.NEGATIVE_INFINITY : row.rank - 1e9;
}

/// Chronological order; ties broken by score so a same-day improvement lands
/// after the value it beat. Dates are ISO-prefix strings ("YYYY", "YYYY-MM",
/// "YYYY-MM-DD") and compare lexically once padded to the same shape.
export function sortRows<T extends RecordRowLike>(rows: T[], direction: RecordDirection): T[] {
  return [...rows].sort((a, b) => {
    const da = padDate(a.date);
    const db = padDate(b.date);
    if (da !== db) return da < db ? -1 : 1;
    return score(a, direction) - score(b, direction);
  });
}

/// "2024" sorts as "2024-12-31" and "2024-06" as "2024-06-31", so a
/// year-only row lands after every dated row of that year - a source that
/// gives only a year usually means "sometime that year", and putting it first
/// would invent a precision the source does not have.
export function padDate(d: string): string {
  if (d.length === 4) return `${d}-12-31`;
  if (d.length === 7) return `${d}-31`;
  return d;
}

/// The current best among competing rows, or null for a record with none.
export function frontier<T extends RecordRowLike>(rows: T[], direction: RecordDirection): T | null {
  let best: T | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const r of rows) {
    if (!competes(r.status)) continue;
    const s = score(r, direction);
    if (best === null || s > bestScore) {
      best = r;
      bestScore = s;
    }
  }
  return best;
}

/// The staircase: for each competing row in date order, whether it was the
/// best known at the moment it appeared. Rows that did not improve the record
/// when they landed are still drawn (a reader should see them) but do not
/// step the line. Candidates and retractions are never steps.
export function steps<T extends RecordRowLike>(
  rows: T[],
  direction: RecordDirection,
): { row: T; isStep: boolean }[] {
  const sorted = sortRows(rows, direction);
  let bestSoFar = Number.NEGATIVE_INFINITY;
  return sorted.map((row) => {
    if (!competes(row.status)) return { row, isStep: false };
    const s = score(row, direction);
    const isStep = s > bestSoFar;
    if (isStep) bestSoFar = s;
    return { row, isStep };
  });
}

/// Year as a number for the x axis. "YYYY-MM-DD" and friends all start with
/// the year; fractional position within the year gives same-year rows some
/// separation on the chart.
export function yearOf(date: string): number {
  const y = Number(date.slice(0, 4));
  const m = date.length >= 7 ? Number(date.slice(5, 7)) : 6;
  const d = date.length >= 10 ? Number(date.slice(8, 10)) : 15;
  return y + (m - 1) / 12 + (d - 1) / 365;
}

/// Whether every competing row carries a comparable number, which decides if
/// the chart has a real y axis or an ordinal one.
export function isNumericRecord(rows: RecordRowLike[]): boolean {
  const c = rows.filter((r) => competes(r.status));
  return c.length > 0 && c.every((r) => r.valueNumeric !== null);
}
