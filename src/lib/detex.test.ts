// deTeX turns TeX into a readable line of plain text. It has three jobs on this
// site: meta descriptions, OG tags and JSON-LD, and now the accessible name of
// a point on a frontier chart. All three are read by something that cannot
// render math, so what it drops matters as much as what it keeps.
//
// These cases all come from the long-gaps frontier, which is the site's most
// punishing formula and the one that exposed each bug below.

import { describe, expect, it } from "vitest";
import { deTeX } from "@/components/TeX";

describe("deTeX", () => {
  it("keeps a fraction's two halves apart", () => {
    // The bug: \dfrac was not in the replacement table, so the braces were
    // stripped further down and the halves were concatenated into a product
    // that says something entirely different.
    expect(deTeX("$\\dfrac{\\log X}{\\log_4 X}$")).toBe("log X/log_4 X");
    expect(deTeX("$\\frac{a}{b}$")).toBe("a/b");
    expect(deTeX("$\\tfrac{a}{b}$")).toBe("a/b");
  });

  it("keeps the inequality that makes a bound a bound", () => {
    // \gg is letters, so the catch-all that deletes unknown commands ate it and
    // left a statement of equality.
    expect(deTeX("$G(X) \\gg \\log X$")).toBe("G(X) ≫ log X");
    expect(deTeX("$p \\ll X$")).toBe("p ≪ X");
  });

  it("does not read spacing macros aloud", () => {
    // "\," is punctuation, not letters, so it slipped past the catch-all and
    // survived into the text verbatim.
    expect(deTeX("$\\log X \\, \\log_2 X$")).toBe("log X log_2 X");
    expect(deTeX("$a \\quad b$")).toBe("a b");
  });

  it("leaves plain prose alone", () => {
    expect(deTeX("Bounded gaps between primes")).toBe("Bounded gaps between primes");
  });

  it("still handles the whole long-gaps expression", () => {
    const out = deTeX("$\\gg \\dfrac{\\log X \\, \\log_2 X}{\\log_4 X}$");
    expect(out).toBe("≫ log X log_2 X/log_4 X");
    expect(out).not.toContain("\\");
  });
});
