import { describe, expect, it } from "vitest";
import {
  bestRow,
  chartScale,
  dodge,
  fmtTick,
  niceTicks,
  offScale,
  padDate,
  yAxis,
  yPos,
  sortRows,
  steps,
  yearOf,
  type FrontierRowLike,
} from "./frontiers";

const row = (
  o: Partial<FrontierRowLike> & { id: string },
): FrontierRowLike => ({
  date: "2000",
  valueTex: "",
  valueNumeric: null,
  rank: null,
  status: "historical",
  ...o,
});

describe("frontier", () => {
  it("picks the smallest value when lower is better", () => {
    const rows = [
      row({ id: "a", date: "1969", valueNumeric: 2.8074 }),
      row({ id: "b", date: "1990", valueNumeric: 2.3755 }),
      row({
        id: "c",
        date: "2026",
        valueNumeric: 2.371177,
        status: "published",
      }),
    ];
    expect(bestRow(rows, "min")?.id).toBe("c");
  });

  it("picks the largest value when higher is better", () => {
    const rows = [
      row({ id: "a", date: "2006", valueNumeric: 28 }),
      row({ id: "b", date: "2026", valueNumeric: 31, status: "published" }),
      row({ id: "c", date: "2026", valueNumeric: 30, status: "published" }),
    ];
    expect(bestRow(rows, "max")?.id).toBe("b");
  });

  it("never lets a candidate or retracted row win", () => {
    const rows = [
      row({ id: "a", date: "2014", valueNumeric: 246, status: "historical" }),
      row({ id: "b", date: "2026", valueNumeric: 186, status: "candidate" }),
      row({ id: "c", date: "2026", valueNumeric: 100, status: "retracted" }),
    ];
    expect(bestRow(rows, "min")?.id).toBe("a");
  });

  it("uses rank when there is no numeric value", () => {
    const rows = [
      row({ id: "rankin", date: "1938", rank: 1 }),
      row({ id: "fgkmt", date: "2018", rank: 2 }),
      row({ id: "astra", date: "2026", rank: 4, status: "published" }),
      row({ id: "tilted", date: "2026-08", rank: 3, status: "published" }),
    ];
    expect(bestRow(rows, "max")?.id).toBe("astra");
  });

  it("returns null when nothing competes", () => {
    expect(
      bestRow([row({ id: "x", status: "candidate", valueNumeric: 1 })], "max"),
    ).toBeNull();
    expect(bestRow([], "max")).toBeNull();
  });
});

describe("steps", () => {
  it("marks only rows that improved the record at the time", () => {
    const rows = [
      row({ id: "a", date: "1969", valueNumeric: 2.8 }),
      row({ id: "b", date: "1981", valueNumeric: 2.52 }),
      // Same year, slightly worse: sorts first within the year (worse before
      // better on a tie), so it is a step too - the staircase then ends the
      // year at the best value, which is what happened in 1981 for real.
      row({ id: "b2", date: "1981", valueNumeric: 2.53 }),
      row({ id: "c", date: "2026", valueNumeric: 2.37, status: "published" }),
      row({ id: "d", date: "2026", valueNumeric: 2.39, status: "candidate" }),
    ];
    const out = steps(rows, "min");
    expect(out.map((s) => [s.row.id, s.isStep])).toEqual([
      ["a", true],
      ["b2", true],
      ["b", true],
      // Same year again: the candidate sorts first (worse on a tie) and is
      // never a step whatever its position.
      ["d", false],
      ["c", true],
    ]);
  });
});

describe("dates", () => {
  it("pads so a year-only row sorts after dated rows of that year", () => {
    expect(padDate("2024")).toBe("2024-12-31");
    expect(padDate("2024-06")).toBe("2024-06-31");
    expect(padDate("2024-06-15")).toBe("2024-06-15");
    const rows = [
      row({ id: "y", date: "2024", rank: 1 }),
      row({ id: "m", date: "2024-03-01", rank: 1 }),
    ];
    expect(sortRows(rows, "max").map((r) => r.id)).toEqual(["m", "y"]);
  });

  it("maps dates to fractional years", () => {
    expect(yearOf("2024")).toBeCloseTo(2024.45, 1);
    expect(yearOf("2024-01-01")).toBeCloseTo(2024, 3);
    expect(yearOf("2024-12-31")).toBeCloseTo(2024.999, 2);
  });
});

describe("chartScale", () => {
  it("is numeric as soon as one competing row has a number", () => {
    expect(
      chartScale([
        row({ id: "a", valueNumeric: 1 }),
        row({ id: "b", valueNumeric: 2 }),
      ]).numeric,
    ).toBe(true);
    // The zeta-zeros case: two early qualitative steps, then numbers. The chart
    // used to fall back to ranks here and lose every numeric row.
    expect(
      chartScale([
        row({ id: "hardy", rank: 1 }),
        row({ id: "selberg", rank: 2 }),
        row({ id: "levinson", valueNumeric: 0.3333, valueTex: "$> 1/3$" }),
      ]).numeric,
    ).toBe(true);
    expect(
      chartScale([row({ id: "a", rank: 1 }), row({ id: "b", rank: 2 })])
        .numeric,
    ).toBe(false);
    expect(chartScale([]).numeric).toBe(false);
  });

  it("ignores rows that do not compete", () => {
    // A numeric candidate alone does not make a rank frontier numeric.
    expect(
      chartScale([
        row({ id: "a", rank: 1 }),
        row({ id: "b", valueNumeric: 5, status: "candidate" }),
      ]).numeric,
    ).toBe(false);
  });

  it("reads a percent sign in any value as a proportion axis (yAxis pins it to 0..100%)", () => {
    const axis = yAxis([0.3333, 0.4, 0.6725], true);
    expect([axis.lo, axis.hi, axis.log]).toEqual([0, 1, false]);
    expect(axis.ticks.map((t) => fmtTick(t, axis, true))).toEqual([
      "0%",
      "25%",
      "50%",
      "75%",
      "100%",
    ]);
  });

  it("leaves a value a hundred times off the rest of the data off the axis", () => {
    // Bounded gaps: Zhang's 70,000,000 is four decades above Polymath8a's
    // 4,680. Everything else is within a factor of 25.
    const gaps = [70000000, 4680, 600, 246, 240, 236, 212, 186];
    const { kept, excluded } = offScale(gaps, "min");
    expect(excluded).toEqual([70000000]);
    expect(kept).toHaveLength(7);
    // Nothing else on the site is split: ranks, exponents, kissing numbers.
    expect(offScale([12, 15, 19, 21, 24, 28, 29, 31], "max").excluded).toEqual(
      [],
    );
    expect(offScale([11692, 11948], "max").excluded).toEqual([]);
    // A tie between groups keeps the one holding the current best.
    expect(offScale([1, 1000], "min").kept).toEqual([1]);
    expect(offScale([1, 1000], "max").kept).toEqual([1000]);
    // A non-positive value disables the rule rather than dividing by it.
    expect(offScale([0, 500], "max").excluded).toEqual([]);
  });

  it("goes logarithmic from one order of magnitude, with 1-2-5 ticks while legible", () => {
    const axis = yAxis([4680, 600, 246, 240, 236, 212, 186], false);
    expect(axis.log).toBe(true);
    expect(axis.lo).toBeLessThan(186);
    expect(axis.hi).toBeGreaterThan(4680);
    expect(axis.ticks.map((t) => fmtTick(t, axis, false))).toEqual([
      "200",
      "500",
      "1k",
      "2k",
    ]);
    // Lower is better on this frontier, so 186 draws at the top and 4,680 at
    // the bottom, and the 246 -> 186 history is spread over the top tenth
    // rather than a pixel.
    expect(yPos(axis, 186, "min")).toBeGreaterThan(0.9);
    expect(yPos(axis, 4680, "min")).toBeLessThan(0.1);
    expect(yPos(axis, 186, "min") - yPos(axis, 246, "min")).toBeGreaterThan(
      0.07,
    );
    // Many decades fall back to powers of ten alone.
    const wide = yAxis([100, 1e8], false);
    expect(wide.ticks.map((t) => fmtTick(t, wide, false))).toEqual([
      "100",
      "1k",
      "10k",
      "100k",
      "1M",
      "10M",
      "100M",
    ]);
  });

  it("uses whole-number ticks for a whole-number frontier", () => {
    // Elliptic curve rank, 12..31.
    const axis = yAxis([12, 15, 19, 21, 24, 28, 29, 31], false);
    expect(axis.log).toBe(false);
    expect(axis.ticks.map((t) => fmtTick(t, axis, false))).toEqual([
      "15",
      "20",
      "25",
      "30",
    ]);
    // Kissing number in dimension 19: a narrow band of five-digit values keeps
    // its digits, separated, rather than collapsing to "11.7k".
    const k = yAxis([11692, 11948], false);
    expect(k.ticks.map((t) => fmtTick(t, k, false))).toEqual([
      "11,700",
      "11,800",
      "11,900",
    ]);
  });

  it("shows only the decimals the step needs", () => {
    // Matrix multiplication exponent, 2.371..2.807: a step of 0.1 means one
    // decimal, not "2.3728596".
    const axis = yAxis([2.8074, 2.522, 2.3755, 2.371177], false);
    expect(axis.ticks.map((t) => fmtTick(t, axis, false))).toEqual([
      "2.4",
      "2.5",
      "2.6",
      "2.7",
      "2.8",
    ]);
    // Systole constants: in (0, 1) but NOT percentages.
    const s = yAxis([0.1583, 0.5, 1], false);
    expect(s.ticks.map((t) => fmtTick(t, s, false))).toEqual([
      "0.2",
      "0.4",
      "0.6",
      "0.8",
      "1.0",
    ]);
  });

  it("places the data at the edges with a margin", () => {
    const axis = yAxis([12, 31], false);
    expect(axis.lo).toBeLessThan(12);
    expect(axis.lo).toBeGreaterThan(9);
    expect(axis.hi).toBeGreaterThan(31);
    expect(axis.hi).toBeLessThan(34);
    expect(yPos(axis, 31, "max")).toBeGreaterThan(0.9);
    expect(yPos(axis, 12, "max")).toBeLessThan(0.1);
  });

  it("dodge nudges overlapping dots apart and leaves the rest alone", () => {
    // The four 2026 bounded-gaps rows as rendered: same x, a few px apart.
    const dots = [
      { id: "240", cx: 573.6, cy: 50.0, r: 3.5 },
      { id: "236", cx: 573.7, cy: 48.9, r: 5.5 },
      { id: "212", cx: 573.9, cy: 41.8, r: 5.5 },
      { id: "186", cx: 573.5, cy: 33.1, r: 5.5 },
    ];
    const out = dodge(dots, 64, 620);
    // Every pair now clears the other by at least the gap.
    for (let i = 0; i < out.length; i++)
      for (let j = 0; j < i; j++) {
        const d = Math.hypot(out[i].cx - out[j].cx, out[i].cy - out[j].cy);
        expect(d).toBeGreaterThanOrEqual(out[i].r + out[j].r + 2 - 1e-6);
      }
    // The first-painted dot never moves; y never moves.
    expect(out[0].cx).toBe(573.6);
    expect(out.map((d) => d.cy)).toEqual(dots.map((d) => d.cy));
    // Nothing leaves the plot.
    for (const d of out) {
      expect(d.cx - d.r).toBeGreaterThanOrEqual(64);
      expect(d.cx + d.r).toBeLessThanOrEqual(620);
    }
    // Dots already apart are untouched.
    const apart = [
      { cx: 100, cy: 100, r: 3 },
      { cx: 200, cy: 100, r: 3 },
    ];
    expect(dodge(apart, 0, 640)).toEqual(apart);
  });

  it("niceTicks steps by 1, 2 or 5 times a power of ten", () => {
    expect(niceTicks(0, 100, 4)).toEqual([0, 20, 40, 60, 80, 100]);
    expect(niceTicks(0, 10, 4)).toEqual([0, 2, 4, 6, 8, 10]);
    expect(niceTicks(0.9, 3.1, 4)).toEqual([1, 1.5, 2, 2.5, 3]);
  });

  it("reads a percent sign in any value as a proportion axis", () => {
    expect(
      chartScale([
        row({ id: "a", valueNumeric: 0.4, valueTex: "$> 2/5$" }),
        row({ id: "b", valueNumeric: 0.6725, valueTex: "$> 67.25\\%$" }),
      ]).proportion,
    ).toBe(true);
    // Values inside [0, 1] are not enough on their own: the systole constants
    // are there and are not percentages.
    expect(
      chartScale([
        row({ id: "a", valueNumeric: 0.1583, valueTex: "$0.1583$" }),
        row({ id: "b", valueNumeric: 1, valueTex: "$1$" }),
      ]).proportion,
    ).toBe(false);
  });
});
