import { describe, expect, it } from "vitest";
import {
  TEX_TOKENS,
  isDisplayMath,
  isInlineMath,
  mathBody,
  unescapeDollars,
} from "@/lib/tex-tokens";
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

  // LaTeX's other delimiters, added September 2026. The 19-dimensional
  // kissing entry published with its whole statement as literal backslashes
  // because nothing here matched them.
  it("splits LaTeX's paren delimiters out of prose", () => {
    const parts = split("Let \\(D\\subseteq\\mathbb F_2^{19}\\) be the code.");
    expect(parts.filter(isInlineMath)).toEqual([
      "\\(D\\subseteq\\mathbb F_2^{19}\\)",
    ]);
    expect(parts.filter(isDisplayMath)).toEqual([]);
  });

  it("splits LaTeX's bracket delimiters as display math", () => {
    const parts = split("Then \\[\\sum_{k\\ge1} a_k\\] converges.");
    expect(parts.filter(isDisplayMath)).toEqual(["\\[\\sum_{k\\ge1} a_k\\]"]);
    expect(parts.filter(isInlineMath)).toEqual([]);
  });

  it("stops each paren segment at its OWN closing delimiter", () => {
    // The trap: an escape-aware body would eat "\)" as an escape pair and run
    // the first segment on to the last one in the field.
    const parts = split("both \\(a\\) and \\(b\\) hold");
    expect(parts.filter(isInlineMath)).toEqual(["\\(a\\)", "\\(b\\)"]);
    expect(parts.filter((p) => !isInlineMath(p) && p)).toEqual([
      "both ",
      " and ",
      " hold",
    ]);
  });

  it("mathBody strips whichever delimiters were used", () => {
    expect(mathBody("$x^2$")).toBe("x^2");
    expect(mathBody("$$x^2$$")).toBe("x^2");
    expect(mathBody("\\(x^2\\)")).toBe("x^2");
    expect(mathBody("\\[x^2\\]")).toBe("x^2");
  });

  it("renders the paren forms as math rather than as prose", () => {
    const html = texToHtml("Let \\(A\\subseteq D\\) be admissible.");
    // Exactly one formula, and the delimiters are gone from the prose. The raw
    // TeX still appears inside KaTeX's own MathML annotation, which is why
    // this counts spans instead of grepping for the command.
    expect(html.match(/class="katex"/g)?.length ?? 0).toBe(1);
    expect(html).toContain("Let ");
    expect(html).toContain(" be admissible.");
    expect(html).not.toContain("katex-error");
  });

  it("deTeX drops the paren delimiters", () => {
    // Spacing is the author's: "A\subseteq D" has no space before the command,
    // and deTeX substitutes rather than reflows, exactly as for the $ forms.
    expect(deTeX("Let \\(A\\subseteq D\\) hold")).toBe("Let A⊆ D hold");
    expect(deTeX("Then \\[x + y\\] follows")).toBe("Then x + y follows");
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
    expect(deTeX("a \\$10,000 prize for $n^2$")).toBe(
      "a $10,000 prize for n^2",
    );
  });

  it("flattens newlines for a meta tag", () => {
    expect(deTeX("one\n\ntwo")).toBe("one two");
  });
});
