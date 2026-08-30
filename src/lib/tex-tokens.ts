// Splitting text into math and non-math segments, in one place.
//
// A literal dollar sign is written `\$`, exactly as in LaTeX. It must never be
// mistaken for a math delimiter, and until now it always was.
//
// The old tokenizer, duplicated here and in the comment renderer, was
//
//     /(\$\$[^$]+\$\$|\$[^$]+\$)/g
//
// which has no notion of an escape. A single `\$` in a field that also contained
// real math shifted every later delimiter by one, so text and math segments
// swapped places and the remainder of the field rendered as run-on italics.
// Twelve published entries were affected, including three Erdős prize amounts.
//
// Both halves of the pair have to be escape-aware:
//   (?<!\\)             stops an escaped dollar from OPENING a segment
//   (?:\\.|[^$\\])+     lets \$ appear INSIDE math, where KaTeX renders it,
//                       while still stopping at a genuine closing $
//
// Known limit, left alone deliberately: a text segment ending in a literal
// backslash immediately before real math still mis-parses, because the
// lookbehind cannot tell an escaped backslash from an escaping one. That costs a
// regex several times this size to fix and has never occurred in the catalog.
export const TEX_TOKENS =
  /((?<!\\)\$\$(?:\\.|[^$\\])+\$\$|(?<!\\)\$(?:\\.|[^$\\])+\$)/g;

export function isDisplayMath(part: string): boolean {
  return part.startsWith("$$") && part.endsWith("$$") && part.length > 4;
}

export function isInlineMath(part: string): boolean {
  return !isDisplayMath(part) && part.startsWith("$") && part.endsWith("$") && part.length > 2;
}

/// Turns an author's `\$` into a literal dollar.
///
/// TEXT segments only, and last: inside math KaTeX does this itself. The arrow
/// function is not decoration - a bare "$" in a replacement string is special to
/// String.replace.
export function unescapeDollars(s: string): string {
  return s.replace(/\\\$/g, () => "$");
}
