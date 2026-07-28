// Renders a comment's stored plain text to HTML, on the server.
//
// Comments are stored as PLAIN TEXT, not HTML - a deliberate difference from
// wilhelm-scream-db, which stores sanitized rich-text HTML from a contentEditable
// editor. On a site about mathematics the thing people need in a comment is
// math, not bold and underline, so comments go through the same KaTeX path as
// entry statements and support `$inline$` / `$$display$$`.
//
// The security model follows from that: nothing the user writes is ever treated
// as markup. Every non-math segment is HTML-escaped, and KaTeX runs with its
// default `trust: false`, which disables \href and \includegraphics. So there is
// no sanitizer to get wrong - the text simply never reaches the DOM as HTML.

import katex from "katex";

// Only absolute http(s) URLs are linkified, so `javascript:` can never appear.
const URL_RE = /\bhttps?:\/\/[^\s<>"']+/g;
// Trailing punctuation that is almost always sentence punctuation, not the URL.
const TRAILING_PUNCT_RE = /[.,;:!?)\]]+$/;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/// Turns bare URLs into links. Runs on ALREADY-ESCAPED text, so the href cannot
/// break out of its attribute.
function linkify(escaped: string): string {
  return escaped.replace(URL_RE, (url) => {
    const match = url.match(TRAILING_PUNCT_RE);
    const tail = match ? match[0] : "";
    const href = tail ? url.slice(0, -tail.length) : url;
    return (
      `<a href="${href}" target="_blank" rel="nofollow noopener noreferrer"` +
      ` class="text-[var(--accent-blue)] hover:underline">${href}</a>${tail}`
    );
  });
}

function renderMath(tex: string, display: boolean): string {
  return katex.renderToString(tex, { throwOnError: false, displayMode: display });
}

/// Plain text in, safe HTML out. Blank lines separate paragraphs; single
/// newlines become line breaks.
export function renderCommentHtml(text: string): string {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => {
      const parts = paragraph.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);
      const inner = parts
        .map((part) => {
          if (part.startsWith("$$") && part.endsWith("$$") && part.length > 4) {
            return renderMath(part.slice(2, -2), true);
          }
          if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
            return renderMath(part.slice(1, -1), false);
          }
          return linkify(escapeHtml(part)).replace(/\n/g, "<br />");
        })
        .join("");
      return inner ? `<p>${inner}</p>` : "";
    })
    .join("");
}

/// Stable, locale-independent date for a comment. Formatted on the server and
/// shipped as a string so it cannot cause a hydration mismatch.
export function formatCommentDate(d: Date): string {
  const day = String(d.getUTCDate()).padStart(2, "0");
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  return `${day} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
