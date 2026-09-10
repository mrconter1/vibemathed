import { describe, expect, it } from "vitest";
import {
  eligible,
  monthlyPeaks,
  recordMonths,
  runningPeak,
} from "@/lib/monthly-peak";
import type { ChartProblem } from "@/lib/problems";

const p = (
  slug: string,
  solveDate: string,
  significance: number | null,
  extra: Partial<ChartProblem> = {},
): ChartProblem =>
  ({
    slug,
    name: slug,
    shortName: slug,
    problemNumber: null,
    field: "",
    fieldGroup: "Analysis",
    solveDate,
    solveType: "proved",
    resolution: "resolved",
    resolutionMethod: "argument",
    aiContribution: "ai-discovered",
    model: "",
    modelMaker: "",
    verification: "unreviewed",
    yearPosed: 2000,
    significance,
    ...extra,
  }) as ChartProblem;

describe("eligible", () => {
  it("takes resolved and candidate entries", () => {
    expect(eligible(p("a", "2026-01-05", 10))).toBe(true);
    expect(
      eligible(p("b", "2026-01-05", 10, { resolution: "candidate" })),
    ).toBe(true);
  });

  it("rejects partials and variants, which have no moment of resolution", () => {
    expect(eligible(p("c", "2026-01-05", 10, { resolution: "partial" }))).toBe(
      false,
    );
    expect(eligible(p("d", "2026-01-05", 10, { resolution: "variant" }))).toBe(
      false,
    );
  });

  it("rejects an entry with no score or no date", () => {
    expect(eligible(p("e", "2026-01-05", null))).toBe(false);
    expect(eligible(p("f", "", 10))).toBe(false);
  });
});

describe("monthlyPeaks", () => {
  it("keeps the heaviest entry of each month", () => {
    const rows = monthlyPeaks(
      [
        p("small", "2026-01-04", 10),
        p("big", "2026-01-20", 70),
        p("mid", "2026-01-28", 40),
      ],
      "2026-01-31",
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].top?.slug).toBe("big");
    expect(rows[0].significance).toBe(70);
  });

  it("keeps empty months as gaps so the axis stays a timeline", () => {
    const rows = monthlyPeaks(
      [p("a", "2026-01-10", 20), p("b", "2026-04-10", 30)],
      "2026-04-30",
    );
    expect(rows.map((r) => r.month)).toEqual([
      "2026-01",
      "2026-02",
      "2026-03",
      "2026-04",
    ]);
    expect(rows[1].top).toBeNull();
    expect(rows[1].significance).toBe(0);
  });

  it("runs to today, not to the last solve", () => {
    // A quiet stretch is information. Ending the axis at the last result
    // would imply the record ended with it.
    const rows = monthlyPeaks([p("a", "2026-01-10", 20)], "2026-05-15");
    expect(rows[rows.length - 1].month).toBe("2026-05");
    expect(rows[rows.length - 1].top).toBeNull();
  });

  it("breaks ties towards the earlier solve", () => {
    const rows = monthlyPeaks(
      [p("later", "2026-02-20", 50), p("earlier", "2026-02-03", 50)],
      "2026-02-28",
    );
    expect(rows[0].top?.slug).toBe("earlier");
  });

  it("returns nothing when no entry qualifies", () => {
    expect(monthlyPeaks([p("a", "2026-01-01", null)], "2026-02-01")).toEqual(
      [],
    );
  });

  it("survives a solve dated after today", () => {
    // Clock skew or a mis-keyed date should not collapse the range.
    const rows = monthlyPeaks([p("a", "2027-01-10", 20)], "2026-05-15");
    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].top?.slug).toBe("a");
  });
});

describe("runningPeak", () => {
  it("never falls", () => {
    const rows = monthlyPeaks(
      [
        p("a", "2026-01-10", 30),
        p("b", "2026-02-10", 10),
        p("c", "2026-03-10", 55),
      ],
      "2026-03-31",
    );
    expect(runningPeak(rows)).toEqual([30, 30, 55]);
  });

  it("holds its level across empty months", () => {
    const rows = monthlyPeaks(
      [p("a", "2026-01-10", 30), p("b", "2026-03-10", 20)],
      "2026-03-31",
    );
    expect(runningPeak(rows)).toEqual([30, 30, 30]);
  });
});

describe("recordMonths", () => {
  it("marks only the months that set a new high", () => {
    const rows = monthlyPeaks(
      [
        p("a", "2026-01-10", 30),
        p("b", "2026-02-10", 20),
        p("c", "2026-03-10", 55),
        p("d", "2026-04-10", 55),
      ],
      "2026-04-30",
    );
    expect([...recordMonths(rows)].sort()).toEqual(["2026-01", "2026-03"]);
  });

  it("does not mark an empty month", () => {
    const rows = monthlyPeaks(
      [p("a", "2026-01-10", 30), p("b", "2026-03-10", 40)],
      "2026-03-31",
    );
    expect(recordMonths(rows).has("2026-02")).toBe(false);
  });
});
