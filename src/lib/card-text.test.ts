import { describe, expect, it } from "vitest";
import { cardText, clip } from "@/lib/card-text";
import { deTeX } from "@/components/TeX";

// These two helpers exist because of two defects seen on real cards, and the
// tests below are those defects.

describe("cardText", () => {
  it("replaces the glyphs next/og cannot draw", () => {
    // The long-prime-gaps card rendered a tofu box here. next/og named the set
    // itself: Failed to load dynamic font for "≫≪⊆⊂∈".
    expect(cardText("≫ log X")).toBe(">> log X");
    expect(cardText("≪ 1")).toBe("<< 1");
    for (const c of "≫≪⊆⊂⊇⊃∈∉≅") {
      expect(cardText(c)).not.toContain(c);
    }
  });

  it("leaves the glyphs the font does have", () => {
    // Substituting these would be a regression in the other direction: they
    // render, and ASCII stand-ins read worse.
    const safe = "≤ ≥ ≠ ≈ ∞ ∑ ∏ ∫ √ α π Ω · … → × ÷ ±";
    expect(cardText(safe)).toBe(safe);
  });

  it("lifts sub- and superscript digits out of TeX source", () => {
    expect(cardText("(log_2 X)^2")).toBe("(log₂ X)²");
    expect(cardText("x^{10}")).toBe("x¹⁰");
    expect(cardText("a_{12}")).toBe("a₁₂");
  });

  it("handles the whole long-prime-gaps bound end to end", () => {
    // The exact value that first exposed both problems, taken through the same
    // path the card uses.
    const out = cardText(
      deTeX("$\\gg \\log X (\\log_2 X)^2 \\log_4 X / (\\log_3 X)^2$"),
    );
    expect(out).toContain(">>");
    expect(out).toContain("log₂");
    expect(out).toContain(")²");
    expect(out).not.toContain("^");
    expect(out).not.toContain("_");
  });

  it("leaves a plain number alone", () => {
    expect(cardText("2.371177")).toBe("2.371177");
    expect(cardText("> 67.25%")).toBe("> 67.25%");
  });
});

describe("clip", () => {
  it("returns a short string untouched", () => {
    expect(clip("GPT 6 Astra", 58)).toBe("GPT 6 Astra");
  });

  it("cuts on a word boundary, not mid-name", () => {
    // The bounded-prime-gaps card shipped "... Thorner and Xie (Axio," before
    // this existed.
    const long =
      "Charton, Hong, Lau, Ono, Remy, Siu, Swaminathan, Thorner and Xie (Axiom)";
    const out = clip(long, 58);
    expect(out.length).toBeLessThanOrEqual(59);
    expect(out.endsWith("…")).toBe(true);
    expect(out).not.toContain("(Axio");
    // Whatever survives is whole words of the original.
    expect(long.startsWith(out.slice(0, -1))).toBe(true);
  });

  it("drops a dangling separator before the ellipsis", () => {
    expect(clip("Alice, Bob, Carol, Dave", 12)).toBe("Alice, Bob…");
  });

  it("hard-cuts a single token with no space to break on", () => {
    expect(clip("a".repeat(80), 20)).toBe(`${"a".repeat(20)}…`);
  });
});
