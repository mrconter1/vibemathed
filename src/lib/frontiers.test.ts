import { describe, expect, it } from "vitest";
import {
  bestRow,
  chartScale,
  padDate,
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
