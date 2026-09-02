import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/submission";

describe("slugify", () => {
  it("lowercases, strips accents and joins on hyphens", () => {
    expect(slugify("Bugeaud's Problem 10.61")).toBe("bugeaud-s-problem-10-61");
    // NFKD splits ő into o plus a combining accent, and the accent is dropped.
    expect(slugify("Erdős Problem #4")).toBe("erdos-problem-4");
  });

  it("drops leading and trailing hyphens", () => {
    expect(slugify("  (ξαⁿ) is not uniform  ")).toBe("n-is-not-uniform");
  });

  it("cuts at 80 characters, which is why long names need a hand-set slug", () => {
    const long = "unrestricted boolean multiplicative complexity of four-term binary polynomial multiplication";
    const slug = slugify(long);
    expect(slug.length).toBe(80);
    // The documented failure mode: a cut can land mid-word.
    expect(slug.endsWith("-mu")).toBe(true);
  });
});
