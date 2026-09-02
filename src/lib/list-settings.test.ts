import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  joinSelection,
  normalizeListSettings,
  parseSelection,
  selectionMatches,
  solveDateSortKey,
  toggleSelection,
} from "@/lib/list-settings";

describe("solveDateSortKey", () => {
  it("leaves a full date alone", () => {
    expect(solveDateSortKey("2026-08-31")).toBe("2026-08-31");
  });

  it("pads a month to its last day so it sorts inside its month", () => {
    const key = solveDateSortKey("2026-08");
    expect(key > "2026-07-31").toBe(true);
    expect(key >= "2026-08-30").toBe(true);
    expect(key < "2026-09-01").toBe(true);
  });

  it("pads a year to its last day", () => {
    const key = solveDateSortKey("2025");
    expect(key > "2025-11-30").toBe(true);
    expect(key < "2026-01-01").toBe(true);
  });

  it("orders a month-precision August above all of July, in one sort", () => {
    // Newest first, the list's default. Before the fix "2026-08" came last.
    const dates = ["2026-08-29", "2026-08", "2026-07-31"];
    const sorted = dates.slice().sort((a, b) => solveDateSortKey(b).localeCompare(solveDateSortKey(a)));
    expect(sorted).toEqual(["2026-08", "2026-08-29", "2026-07-31"]);
  });
});

describe("selections", () => {
  it("reads 'all' and nothing as no condition", () => {
    expect(parseSelection("all")).toEqual([]);
    expect(parseSelection(undefined)).toEqual([]);
    expect(joinSelection([])).toBe("all");
  });

  it("toggles an option in and out", () => {
    const one = toggleSelection("all", "arxiv");
    expect(one).toBe("arxiv");
    const two = toggleSelection(one, "repo");
    expect(parseSelection(two)).toEqual(["arxiv", "repo"]);
    expect(toggleSelection(two, "arxiv")).toBe("repo");
    expect(toggleSelection("repo", "repo")).toBe("all");
  });

  it("ORs options within a facet and passes everything when empty", () => {
    expect(selectionMatches("all", "x")).toBe(true);
    expect(selectionMatches("a,b", "b")).toBe(true);
    expect(selectionMatches("a,b", "c")).toBe(false);
    expect(selectionMatches("a", null)).toBe(false);
  });
});

describe("normalizeListSettings", () => {
  it("falls back to defaults for garbage", () => {
    expect(normalizeListSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(normalizeListSettings("nonsense")).toEqual(DEFAULT_SETTINGS);
  });

  it("drops unknown options one by one rather than resetting the facet", () => {
    const s = normalizeListSettings({ fieldFilter: "Number theory,Astrology,Combinatorics" });
    expect(s.fieldFilter).toBe("Number theory,Combinatorics");
  });

  it("collapses duplicates so one condition cannot count twice", () => {
    const s = normalizeListSettings({ sourceFilter: "arxiv,arxiv,repo" });
    expect(s.sourceFilter).toBe("arxiv,repo");
  });

  it("rejects an unknown sort key and direction", () => {
    const s = normalizeListSettings({ sortKey: "vibes", sortDir: "sideways" });
    expect(s.sortKey).toBe(DEFAULT_SETTINGS.sortKey);
    expect(s.sortDir).toBe(DEFAULT_SETTINGS.sortDir);
  });

  it("keeps a valid source filter", () => {
    expect(normalizeListSettings({ sourceFilter: "erdos" }).sourceFilter).toBe("erdos");
  });
});
