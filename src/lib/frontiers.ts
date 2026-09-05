// Records: one named quantity, a direction, and a staircase of best known
// values. Pure helpers only - no database, no React - so the frontier logic
// is testable and the same on the landing strip, the record page and the
// entry page.
//
// The frontier is DERIVED. A record has a stored direction and stored rows;
// which row is the current best falls out of those two things and nothing
// else. Storing a "current" flag would be a second source of truth that goes
// stale the moment a row is added, retracted or re-dated.

export type FrontierDirection = "min" | "max";
export type FrontierRowStatus =
  "published" | "candidate" | "historical" | "retracted";

export interface FrontierRowLike {
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
export function score(
  row: FrontierRowLike,
  direction: FrontierDirection,
): number {
  if (row.valueNumeric !== null && Number.isFinite(row.valueNumeric)) {
    return direction === "min" ? -row.valueNumeric : row.valueNumeric;
  }
  // Rank rows: `rank` is already "higher is better", by definition.
  return row.rank === null ? Number.NEGATIVE_INFINITY : row.rank - 1e9;
}

/// Chronological order; ties broken by score so a same-day improvement lands
/// after the value it beat. Dates are ISO-prefix strings ("YYYY", "YYYY-MM",
/// "YYYY-MM-DD") and compare lexically once padded to the same shape.
export function sortRows<T extends FrontierRowLike>(
  rows: T[],
  direction: FrontierDirection,
): T[] {
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

/// The current best among competing rows, or null for a frontier with none.
export function bestRow<T extends FrontierRowLike>(
  rows: T[],
  direction: FrontierDirection,
): T | null {
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
export function steps<T extends FrontierRowLike>(
  rows: T[],
  direction: FrontierDirection,
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

/// What kind of y axis a frontier's chart gets.
///
/// `numeric` as soon as ANY competing row carries a number. The earlier rule
/// demanded that every row have one, and the proportion-of-zeta-zeros frontier
/// showed why that is wrong: Hardy's "infinitely many" (1914) and Selberg's "a
/// positive proportion" (1942) are real steps in the history and have no
/// number, so the whole chart fell back to ranks, where Levinson's 1/3 and
/// everything after it became NaN and vanished. A history that starts before
/// its quantity was quantified is the normal case, not a curation error. The
/// rows without a number are drawn by the chart as markers on the baseline,
/// off the line.
///
/// `proportion` when a curator has written at least one value as a percentage.
/// That is the one honest signal: a value range inside [0, 1] is not, because
/// the systole frontier's constants live there and are not percentages. A
/// proportion axis is pinned to 0..100%, since the scale has a meaning of its
/// own (100% is the Riemann hypothesis) that a data-fitted range would hide.
export interface FrontierScale {
  numeric: boolean;
  proportion: boolean;
}
export function chartScale(rows: FrontierRowLike[]): FrontierScale {
  const c = rows.filter((r) => competes(r.status));
  const nums = c.filter(
    (r) => r.valueNumeric !== null && Number.isFinite(r.valueNumeric),
  );
  return {
    numeric: nums.length > 0,
    proportion: nums.some((r) => /%/.test(r.valueTex)),
  };
}

/// The y axis of a numeric frontier: its extent, whether it is logarithmic,
/// and where the ticks go. Pure so the chart and the sparkline draw the same
/// axis and so the tick choices are testable without rendering SVG.
///
/// Three regimes:
///   - a proportion is pinned to 0..1 (see chartScale);
///   - data spanning an order of magnitude or more is logarithmic. The
///     bounded-gaps frontier runs from Polymath8a's 4,680 to 212; on a linear
///     axis everything after 2014 is one flat line at the top, which is the
///     opposite of what the chart is for. (Zhang's 70,000,000 is not on the
///     axis at all - see offScale);
///   - everything else is linear, fitted to the data with a small margin, and
///     ticked at round numbers.
///
/// Ticks are "nice" (1, 2 or 5 times a power of ten, or powers of ten on a log
/// axis) rather than quarter-points of the range, because "4700146.94" is not
/// a number anyone reads and "15, 20, 25, 30" is.
export interface YAxis {
  lo: number;
  hi: number;
  log: boolean;
  ticks: number[];
}

/// Values the axis should not be made to reach. Sorted values are split
/// wherever two neighbours are a hundred times or more apart, and only the
/// largest group stays on the axis; on a tie, the group holding the current
/// best, because the recent history is what the reader came for.
///
/// Bounded gaps is the case this exists for. Zhang's 70,000,000 (2013) sits
/// four orders of magnitude above Polymath8a's 4,680 of two months later, and
/// with it on the axis - even a logarithmic one - the twelve years from 246 to
/// 186 are a few pixels. Starting the axis at 4,680 shows that history; the
/// chart then has to SAY that Zhang is not on it, which it does under the
/// plot, by name and value. A reader is told, never left to notice.
///
/// Anything at or below zero disables the rule: the split is measured in
/// ratios and a ratio with a non-positive value means nothing.
export function offScale(
  values: number[],
  direction: FrontierDirection,
): { kept: number[]; excluded: number[] } {
  const vals = values.filter((v) => Number.isFinite(v));
  if (vals.length < 2 || vals.some((v) => v <= 0))
    return { kept: vals, excluded: [] };
  const sorted = [...vals].sort((a, b) => a - b);
  const groups: number[][] = [[sorted[0]]];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] / sorted[i - 1] >= 100) groups.push([]);
    groups[groups.length - 1].push(sorted[i]);
  }
  if (groups.length === 1) return { kept: vals, excluded: [] };
  const best = direction === "min" ? sorted[0] : sorted[sorted.length - 1];
  const keep = groups.reduce((a, b) =>
    b.length > a.length || (b.length === a.length && b.includes(best)) ? b : a,
  );
  return {
    kept: vals.filter((v) => keep.includes(v)),
    excluded: vals.filter((v) => !keep.includes(v)),
  };
}

export function yAxis(values: number[], proportion: boolean): YAxis {
  const vals = values.filter((v) => Number.isFinite(v));
  if (vals.length === 0) return { lo: 0, hi: 1, log: false, ticks: [] };
  if (proportion)
    return { lo: 0, hi: 1, log: false, ticks: [0, 0.25, 0.5, 0.75, 1] };

  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const MARGIN = 0.08;

  // Logarithmic from one order of magnitude up. Bounded gaps without Zhang runs
  // 4,680 to 186, a factor of 25; linear, everything since 2014 is the top 2%
  // of the plot, five pixels for the frontier's whole recent history.
  if (min > 0 && max / min >= 10) {
    const decades = Math.log10(max / min);
    const lo = min / 10 ** (decades * MARGIN);
    const hi = max * 10 ** (decades * MARGIN);
    // Ticks inside the DATA, not the margin: a tick at 100M above a maximum
    // of 70M labels empty space. 1-2-5 per decade while that stays legible,
    // powers of ten alone once it would not.
    const fine: number[] = [];
    for (let e = Math.floor(Math.log10(min)); 10 ** e <= max; e++) {
      for (const m of [1, 2, 5]) {
        const t = m * 10 ** e;
        if (t >= min && t <= max) fine.push(t);
      }
    }
    const coarse = fine.filter((t) => Number.isInteger(Math.log10(t)));
    return { lo, hi, log: true, ticks: fine.length <= 6 ? fine : coarse };
  }

  let lo = min;
  let hi = max;
  if (lo === hi) {
    lo -= 1;
    hi += 1;
  }
  const span = hi - lo;
  lo -= span * MARGIN;
  hi += span * MARGIN;
  return { lo, hi, log: false, ticks: niceTicks(lo, hi, 4) };
}

/// Round ticks inside [lo, hi], about `n` of them: a step of 1, 2 or 5 times
/// a power of ten, the classic axis rule.
export function niceTicks(lo: number, hi: number, n: number): number[] {
  const raw = (hi - lo) / n;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const dec = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
  const out: number[] = [];
  for (let k = Math.ceil(lo / step - 1e-9); k * step <= hi + 1e-9; k++) {
    out.push(Number((k * step).toFixed(dec)));
  }
  return out;
}

/// Where a value sits on the axis, 0 at the bottom of the plot and 1 at the
/// top, with "up" always meaning better: a "min" frontier is drawn inverted so
/// an improvement rises on every chart alike.
export function yPos(
  axis: YAxis,
  v: number,
  direction: FrontierDirection,
): number {
  const t = axis.log
    ? (Math.log10(v) - Math.log10(axis.lo)) /
      (Math.log10(axis.hi) - Math.log10(axis.lo))
    : (v - axis.lo) / (axis.hi - axis.lo);
  return direction === "max" ? t : 1 - t;
}

/// Nudge overlapping dots apart horizontally, in paint order, so every row is
/// visible and hoverable. Bounded gaps moved four times between 30 August and
/// 3 September 2026; on an axis spanning fifteen years those four days are
/// less than half a pixel, so four dots sat on one spot and the last painted
/// hid the rest - which is how the 186 candidate went missing under the 212.
///
/// Each dot is moved sideways by the least amount that clears every dot
/// placed before it, to the right when there is room and to the left when the
/// plot edge is closer. A nudge of ten pixels is a few weeks on that axis: a
/// small lie about the date, told to avoid a large one about existence. The
/// legend says the dots are nudged.
export interface Dot {
  cx: number;
  cy: number;
  r: number;
}
export function dodge<T extends Dot>(
  dots: T[],
  minX: number,
  maxX: number,
  gap = 2,
): T[] {
  const placed: T[] = [];
  for (const d of dots) {
    let cx = d.cx;
    for (let pass = 0; pass < 4; pass++) {
      let moved = false;
      for (const q of placed) {
        const need = d.r + q.r + gap;
        const dy = d.cy - q.cy;
        if (Math.abs(dy) >= need) continue;
        const dx = cx - q.cx;
        const wantDx = Math.sqrt(need * need - dy * dy);
        if (Math.abs(dx) >= wantDx) continue;
        const right = q.cx + wantDx;
        const left = q.cx - wantDx;
        cx = right + d.r <= maxX ? right : Math.max(minX + d.r, left);
        moved = true;
      }
      if (!moved) break;
    }
    placed.push({ ...d, cx });
  }
  return placed;
}

/// Tick text. Only the decimals the tick step needs (a frontier of whole
/// numbers gets none), thousands separated, and compact once the ticks
/// themselves are in thousands or millions so a label never overruns the
/// margin: "70,000,000" does not fit in 56 pixels and "70M" does.
export function fmtTick(v: number, axis: YAxis, proportion: boolean): string {
  if (proportion) return `${Math.round(v * 100)}%`;
  const strip = (s: string) => s.replace(/\.?0+$/, "");
  if (axis.log) {
    if (v >= 1e6) return `${strip((v / 1e6).toFixed(2))}M`;
    if (v >= 1e3) return `${strip((v / 1e3).toFixed(2))}k`;
    return strip(v.toFixed(4));
  }
  const step = axis.ticks.length > 1 ? axis.ticks[1] - axis.ticks[0] : 1;
  if (step >= 1e6) return `${strip((v / 1e6).toFixed(2))}M`;
  if (step >= 1e3) return `${strip((v / 1e3).toFixed(2))}k`;
  const dec = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
  return v.toLocaleString("en-US", {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });
}
