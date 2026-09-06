// Text preparation for the OpenGraph cards, which are rendered by Satori and
// so have neither KaTeX nor a full font behind them.
//
// This lives in lib/ rather than inside the route because the glyph list below
// is a measured fact about next/og that will go stale, and a stale fact needs
// a test holding it.

// next/og bundles a Noto Sans subset. A glyph missing from it does NOT fall
// back to another face: next/og tries to fetch a font that has it and, when
// that fails, draws a tofu box. That is how the long-prime-gaps card first
// rendered its "much greater than" - the server log read
//   Failed to load dynamic font for "≫≪⊆⊂∈". Status: 400
// naming the exact set below.
//
// A probe card rendered in September 2026 fixed the boundary. Present and safe
// to emit: the Greek alphabet, ≤ ≥ ≠ ≈ ∞, the big operators ∑ ∏ ∫ √,
// · … → × ÷ ±, and superscript digits. Subscript digits render at full size
// rather than small, which is a blemish and not a box, so they stay.
//
// Re-run that probe before trusting this list against a newer next/og.
const TOFU: Record<string, string> = {
  "≫": ">>",
  "≪": "<<",
  "≳": ">~",
  "≲": "<~",
  "⊆": "⊂=",
  "⊂": "in",
  "⊇": "=⊃",
  "⊃": "contains",
  "∈": "in",
  "∉": "not in",
  "≅": "~=",
};

const SUP = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const SUB = "₀₁₂₃₄₅₆₇₈₉";

/**
 * Make a string safe and legible on a Satori-rendered card.
 *
 * deTeX leaves "x^2" and "log_2" as source, because on a page KaTeX sets them.
 * On a card there is no KaTeX, so a raw caret reads as code rather than as
 * mathematics; lift the digits instead. Then swap anything the bundled font
 * cannot draw for an ASCII stand-in.
 */
export function cardText(s: string): string {
  return s
    .replace(/\^\{?(\d+)\}?/g, (_, d: string) =>
      [...d].map((c) => SUP[Number(c)]).join(""),
    )
    .replace(/_\{?(\d+)\}?/g, (_, d: string) =>
      [...d].map((c) => SUB[Number(c)]).join(""),
    )
    .replace(/[≫≪≳≲⊆⊂⊇⊃∈∉≅]/g, (c) => TOFU[c] ?? c);
}

/**
 * Shorten to fit one line, cutting on a word boundary.
 *
 * A nine-author attribution plus the model's name runs past the canvas. A
 * fixed-length slice cuts mid-name: the first render of the bounded-prime-gaps
 * card ended "... Thorner and Xie (Axio,". Falls back to a hard cut when the
 * tail holds no space at all, so a single very long token still shortens.
 */
export function clip(s: string, n: number): string {
  if (s.length <= n) return s;
  const cut = s.slice(0, n);
  const at = cut.lastIndexOf(" ");
  return `${(at > n / 2 ? cut.slice(0, at) : cut).replace(/[,;:]$/, "")}…`;
}
