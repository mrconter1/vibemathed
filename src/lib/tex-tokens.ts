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
//
// LaTeX's OTHER delimiters, `\(…\)` and `\[…\]`, are accepted too, since
// September 2026. They are what someone who writes papers types, KaTeX's own
// auto-render accepts them by default, and a submitter used them: the
// 19-dimensional kissing entry published with its whole statement as literal
// backslashes on screen, because nothing matched and the text fell through to
// be escaped as prose. The site takes submissions from anyone, so this was
// going to recur.
//
// These two use a lazy any-character run to the first closing delimiter
// rather than the escape-aware body the dollar forms use. `(?:\\.|[^$\\])+`
// would let `\)` be eaten as an escape pair and run the segment on to the
// LAST `\)` in the field. Inside real math nobody writes `\)` for anything
// but closing, so first-match is the right reading.
export const TEX_TOKENS =
  /((?<!\\)\$\$(?:\\.|[^$\\])+\$\$|(?<!\\)\$(?:\\.|[^$\\])+\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g;

export function isDisplayMath(part: string): boolean {
  return (
    (part.startsWith("$$") && part.endsWith("$$") && part.length > 4) ||
    (part.startsWith("\\[") && part.endsWith("\\]") && part.length > 4)
  );
}

export function isInlineMath(part: string): boolean {
  if (isDisplayMath(part)) return false;
  return (
    (part.startsWith("$") && part.endsWith("$") && part.length > 2) ||
    (part.startsWith("\\(") && part.endsWith("\\)") && part.length > 4)
  );
}

/// The TeX inside a math segment, with whichever delimiters it arrived in
/// removed. Shared because the two renderers used to slice by hand, and a
/// hand-written `slice(1, -1)` is wrong the moment a two-character delimiter
/// exists.
export function mathBody(part: string): string {
  if (part.startsWith("$") && !part.startsWith("$$")) return part.slice(1, -1);
  return part.slice(2, -2);
}

/// Turns an author's `\$` into a literal dollar.
///
/// TEXT segments only, and last: inside math KaTeX does this itself. The arrow
/// function is not decoration - a bare "$" in a replacement string is special to
/// String.replace.
export function unescapeDollars(s: string): string {
  return s.replace(/\\\$/g, () => "$");
}
