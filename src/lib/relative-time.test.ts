import { describe, expect, it } from "vitest";
import { freshRelative, relativeTime } from "@/lib/relative-time";

const NOW = Date.parse("2026-09-02T12:00:00Z");
const ago = (ms: number) => new Date(NOW - ms).toISOString();
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe("relativeTime", () => {
  it("says just now under 45 seconds, and for the future", () => {
    expect(relativeTime(ago(10_000), NOW)).toBe("just now");
    expect(relativeTime(ago(-HOUR), NOW)).toBe("just now");
  });

  it("uses singular and plural correctly", () => {
    expect(relativeTime(ago(MIN), NOW)).toBe("1 minute ago");
    expect(relativeTime(ago(5 * MIN), NOW)).toBe("5 minutes ago");
    expect(relativeTime(ago(HOUR), NOW)).toBe("1 hour ago");
    expect(relativeTime(ago(23 * HOUR), NOW)).toBe("23 hours ago");
    expect(relativeTime(ago(DAY), NOW)).toBe("1 day ago");
    expect(relativeTime(ago(7 * DAY), NOW)).toBe("7 days ago");
  });

  it("gives up past a week so callers fall back to the date", () => {
    expect(relativeTime(ago(8 * DAY), NOW)).toBeNull();
  });

  it("returns null for an unparseable stamp", () => {
    expect(relativeTime("not a date", NOW)).toBeNull();
  });
});

describe("freshRelative", () => {
  it("only speaks within the first day", () => {
    expect(freshRelative(ago(3 * HOUR), NOW)).toBe("3 hours ago");
    expect(freshRelative(ago(DAY), NOW)).toBeNull();
  });

  it("says nothing about a date in the future", () => {
    // Solve dates arrive in the source's timezone; a day ahead is ordinary.
    expect(freshRelative(ago(-HOUR), NOW)).toBeNull();
  });
});
