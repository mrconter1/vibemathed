import katex from "katex";
import { linkifyEscaped } from "@/lib/linkify";

// Server-rendered math. This is a server component, so KaTeX runs at build time
// and the rendered markup ships in the static HTML - no client JS, no flash of
// raw "$...$", and crawlers see real math. Text is split on $inline$ and
// $$display$$ delimiters; everything outside them is emitted verbatim.

function render(tex: string, display: boolean): string {
  return katex.renderToString(tex, { throwOnError: false, displayMode: display });
}

// Non-math segments become raw HTML too, so they must be escaped here - React
// is no longer doing it for us.
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/// Renders `$inline$` / `$$display$$` math to an HTML string, escaping
/// everything around it.
///
/// Exported so server components can hand pre-rendered math to *client*
/// components (the entry cards) without pulling KaTeX into the browser bundle -
/// which is the whole point of doing this at build time.
/// `linkify` turns bare URLs in the prose into anchors. Opt-in rather than
/// always-on: this same function renders entry TITLES, which the list draws
/// inside a stretched <a>, and an anchor nested in an anchor is invalid HTML.
/// Prose fields ask for it; titles do not.
export function texToHtml(children: string, opts?: { linkify?: boolean }): string {
  const parts = children.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);
  const isDisplay = (p: string) => p.startsWith("$$") && p.endsWith("$$") && p.length > 4;
  return parts
    .map((part, i) => {
      if (isDisplay(part)) return render(part.slice(2, -2), true);
      if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
        return render(part.slice(1, -1), false);
      }
      // Newlines are meaningful here, and used to vanish: HTML collapses them,
      // so a statement written as a list rendered as one run-on paragraph.
      // Thirteen statements, ten AI-role notes and eight verification notes
      // were affected. A blank line yields two breaks, which reads as a
      // paragraph gap without nesting a <p> inside the <p> these render in.
      //
      // KaTeX display math is already a block, so a newline touching one would
      // add a second gap - those get dropped rather than doubled.
      let text = part;
      if (isDisplay(parts[i - 1] ?? "")) text = text.replace(/^\n/, "");
      if (isDisplay(parts[i + 1] ?? "")) text = text.replace(/\n$/, "");
      const escaped = escapeHtml(text);
      return (opts?.linkify ? linkifyEscaped(escaped) : escaped).replace(/\n/g, "<br>");
    })
    .join("");
}

export function TeX({ children, linkify }: { children: string; linkify?: boolean }) {
  return <span dangerouslySetInnerHTML={{ __html: texToHtml(children, { linkify }) }} />;
}

// Plain-text fallback for contexts that must not contain markup or "$" - meta
// descriptions, OG tags, JSON-LD. Strips math delimiters and maps common LaTeX
// commands to readable Unicode.
const REPLACEMENTS: [RegExp, string][] = [
  [/\\mathbb\{([^}]*)\}/g, "$1"],
  [/\\mathrm\{([^}]*)\}/g, "$1"],
  [/\\text\{([^}]*)\}/g, "$1"],
  [/\\tilde\{([^}]*)\}/g, "$1"],
  [/\\sqrt\{([^}]*)\}/g, "√($1)"],
  [/\\Omega/g, "Ω"],
  [/\\Theta/g, "Θ"],
  [/\\varepsilon/g, "ε"],
  [/\\times/g, "×"],
  [/\\cdot/g, "·"],
  [/\\le\b/g, "≤"],
  [/\\ge\b/g, "≥"],
  [/\\to\b/g, "→"],
  [/\\sum/g, "∑"],
  [/\\sqrt/g, "√"],
  [/\\sim/g, "~"],
  [/\\log/g, "log"],
];

export function deTeX(s: string): string {
  let out = s.replace(/\$\$?([^$]+)\$\$?/g, "$1");
  for (const [re, rep] of REPLACEMENTS) out = out.replace(re, rep);
  return out
    // A literal newline in a meta description or an OG tag is not a line
    // break, it is a broken tag.
    .replace(/\s*\n\s*/g, " ")
    .replace(/[{}]/g, "")
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
