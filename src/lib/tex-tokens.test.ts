import { describe, expect, it } from "vitest";
import { TEX_TOKENS, isDisplayMath, isInlineMath, unescapeDollars } from "@/lib/tex-tokens";
import { deTeX, texToHtml } from "@/components/TeX";

// The tokenizer is shared by the entry renderer, the comment renderer and the
// plain-text fallback for meta tags. It shipped a regression on 31 Aug 2026:
// "\$" was read as a delimiter, so an entry that mentioned a $10,000 prize had
// every later formula shifted by one and rendered as run-on italics. These
// tests pin the behaviour that fix established.

const split = (s: string) => s.split(TEX_TOKENS);

describe("TEX_TOKENS", () => {
  it("splits inline math out of prose", () => {
    const parts = split("Let $x^2$ be given.");
    expect(parts.filter(isInlineMath)).toEqual(["$x^2$"]);
    expect(parts.filter(isDisplayMath)).toEqual([]);
  });

  it("splits display math out of prose", () => {
    const parts = split("Then $$\\sum_{k\\ge1} a_k$$ converges.");
    expect(parts.filter(isDisplayMath)).toEqual(["$$\\sum_{k\\ge1} a_k$$"]);
    expect(parts.filter(isInlineMath)).toEqual([]);
  });

  it("does not treat an escaped dollar as a delimiter", () => {
    // The regression: with the old regex the "$" in "\$500" paired with the
    // opening delimiter of "$x$", swallowing the prose between them.
    const parts = split("It cost \\$500 and $x$ is math.");
    expect(parts.filter(isInlineMath)).toEqual(["$x$"]);
  });

  it("does not let an escaped dollar close a formula", () => {
    const parts = split("Price $p \\$ q$ end");
    expect(parts.filter(isInlineMath)).toEqual(["$p \\$ q$"]);
  });

  it("leaves a lone dollar alone", () => {
    const parts = split("Only one $ here");
    expect(parts.filter(isInlineMath)).toEqual([]);
  });
});

describe("unescapeDollars", () => {
  it("turns the escape into a literal dollar", () => {
    expect(unescapeDollars("\\$500")).toBe("$500");
  });
});

describe("texToHtml", () => {
  it("renders exactly the math and keeps escaped dollars literal", () => {
    const html = texToHtml("It cost \\$500 and $x^2$ is math.");
    expect(html.match(/class="katex"/g)?.length ?? 0).toBe(1);
    expect(html).toContain("$500");
    expect(html).not.toContain("\\$");
    expect(html).not.toContain("katex-error");
  });

  it("escapes HTML in prose", () => {
    const html = texToHtml("a < b & c");
    expect(html).toContain("a &lt; b &amp; c");
  });

  it("turns newlines into breaks", () => {
    expect(texToHtml("one\ntwo")).toBe("one<br>two");
  });

  it("renders a legitimate second formula after an escaped dollar", () => {
    // Two real formulas either side of a literal dollar must both render.
    const html = texToHtml("$a$ costs \\$1 while $b$ is free");
    expect(html.match(/class="katex"/g)?.length ?? 0).toBe(2);
  });
});

describe("deTeX", () => {
  it("strips delimiters and maps common commands", () => {
    expect(deTeX("Let $\\alpha \\le 2$ hold.")).toBe("Let α ≤ 2 hold.");
  });

  it("keeps an escaped dollar as a literal dollar", () => {
    expect(deTeX("a \\$10,000 prize for $n^2$")).toBe("a $10,000 prize for n^2");
  });

  it("flattens newlines for a meta tag", () => {
    expect(deTeX("one\n\ntwo")).toBe("one two");
  });
});
