// Safety check for the comment renderer: comments are stored as plain text and
// turned into HTML on read, so this asserts that nothing a user types can come
// back out as executable markup, and that math and links still work.
//
// Run with: npx tsx scripts/check-comment-render.ts

import { renderCommentHtml } from "../src/lib/comment-render";

// Tags that can execute or exfiltrate. KaTeX legitimately emits svg/path/MathML,
// so the audit targets these specifically rather than allow-listing every tag
// KaTeX might produce (and then false-failing on a tag we forgot).
const FORBIDDEN_TAGS = /^(script|iframe|object|embed|form|input|link|meta|base|style)$/i;

/// Audits only REAL tags. Escaped text like `&lt;img onerror=...&gt;` is inert
/// and correctly ignored - an earlier version of this check matched the literal
/// substring anywhere and produced false alarms on properly escaped content.
function auditTags(html: string): string[] {
  const problems: string[] = [];
  for (const m of html.matchAll(/<\/?([a-zA-Z][\w:-]*)([^>]*)>/g)) {
    const name = m[1];
    const attrs = m[2] ?? "";
    if (FORBIDDEN_TAGS.test(name)) problems.push(`executable tag <${name}>`);
    if (/\son\w+\s*=/i.test(attrs)) problems.push(`event handler on <${name}>: ${attrs.trim()}`);
    if (/(href|src|xlink:href)\s*=\s*["']?\s*javascript:/i.test(attrs)) {
      problems.push(`javascript: URL on <${name}>`);
    }
  }
  return problems;
}

const attacks: [string, string][] = [
  ["script tag", `<script>alert('xss')</script>`],
  ["img onerror", `<img src=x onerror="alert(1)">`],
  ["anchor with javascript:", `<a href="javascript:alert(1)">click</a>`],
  ["attribute breakout", `" onmouseover="alert(1)`],
  ["svg onload", `<svg/onload=alert(1)>`],
  ["katex \\href (trust:false)", `$\\href{javascript:alert(1)}{x}$`],
  ["bare javascript: url", `javascript:alert(1)`],
  ["html entity double-encode", `&lt;script&gt;alert(1)&lt;/script&gt;`],
  ["markup inside math", `$<script>alert(1)</script>$`],
];

const features: [string, string, RegExp][] = [
  ["inline math", `Euler: $e^{i\\pi}+1=0$`, /katex/],
  ["display math", `$$\\sum_{n=1}^{\\infty}\\frac{1}{n^2}$$`, /katex-display/],
  ["link", `See https://arxiv.org/abs/2501.00001 now`, /<a href="https:\/\/arxiv\.org/],
  ["link keeps sentence period out", `See https://example.com. Done`, /example\.com<\/a>\./],
  ["query-string ampersand escaped", `https://example.com/a?x=1&y=2`, /x=1&amp;y=2/],
  ["paragraphs", `one\n\ntwo`, /<p>one<\/p><p>two<\/p>/],
  ["line break", `one\ntwo`, /one<br \/>two/],
];

let failed = 0;

for (const [name, input] of attacks) {
  const out = renderCommentHtml(input);
  const problems = auditTags(out);
  // Anything the user wrote with a '<' must come back escaped.
  if (input.includes("<") && !out.includes("&lt;")) {
    problems.push("angle bracket was not escaped");
  }
  if (problems.length > 0) {
    console.error(`FAIL  ${name}\n      ${problems.join("; ")}\n      ${out}`);
    failed += 1;
  } else {
    console.log(`ok    ${name} (neutralised)`);
  }
}

for (const [name, input, expect] of features) {
  const out = renderCommentHtml(input);
  if (expect.test(out)) {
    console.log(`ok    ${name}`);
  } else {
    console.error(`FAIL  ${name} did not match ${expect}\n      ${out}`);
    failed += 1;
  }
}

if (failed > 0) {
  console.error(`\n${failed} check(s) failed`);
  process.exit(1);
}
console.log("\nAll comment-render checks passed.");
