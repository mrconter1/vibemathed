import katex from "katex";

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
export function texToHtml(children: string): string {
  const parts = children.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);
  return parts
    .map((part) => {
      if (part.startsWith("$$") && part.endsWith("$$") && part.length > 4) {
        return render(part.slice(2, -2), true);
      }
      if (part.startsWith("$") && part.endsWith("$") && part.length > 2) {
        return render(part.slice(1, -1), false);
      }
      return escapeHtml(part);
    })
    .join("");
}

export function TeX({ children }: { children: string }) {
  return <span dangerouslySetInnerHTML={{ __html: texToHtml(children) }} />;
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
    .replace(/[{}]/g, "")
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}
