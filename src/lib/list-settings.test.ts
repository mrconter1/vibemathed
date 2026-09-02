import { describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  joinSelection,
  normalizeListSettings,
  parseSelection,
  selectionMatches,
  toggleSelection,
} from "@/lib/list-settings";

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
