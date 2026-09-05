import katex from "katex";
import { renderTexToHtml } from "@/lib/tex-render";
import { unescapeDollars } from "@/lib/tex-tokens";

// Server-rendered math. This is a server component, so KaTeX runs at build time
// and the rendered markup ships in the static HTML - no client JS, no flash of
// raw "$...$", and crawlers see real math. Text is split on $inline$ and
// $$display$$ delimiters; everything outside them is emitted verbatim.

function render(tex: string, display: boolean): string {
  return katex.renderToString(tex, {
    throwOnError: false,
    displayMode: display,
  });
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
export function texToHtml(
  children: string,
  opts?: { linkify?: boolean },
): string {
  return renderTexToHtml(children, render, opts);
}

export function TeX({
  children,
  linkify,
}: {
  children: string;
  linkify?: boolean;
}) {
  return (
    <span
      dangerouslySetInnerHTML={{ __html: texToHtml(children, { linkify }) }}
    />
  );
}

// Plain-text fallback for contexts that must not contain markup or "$" - meta
// descriptions, OG tags, JSON-LD. Strips math delimiters and maps common LaTeX
// commands to readable Unicode.
const REPLACEMENTS: [RegExp, string][] = [
  [/\\mathbb\{([^}]*)\}/g, "$1"],
  [/\\mathrm\{([^}]*)\}/g, "$1"],
  [/\\mathcal\{([^}]*)\}/g, "$1"],
  [/\\text\{([^}]*)\}/g, "$1"],
  [/\\tilde\{([^}]*)\}/g, "$1"],
  [/\\sqrt\{([^}]*)\}/g, "√($1)"],
  // \dfrac and \tfrac are \frac with a size forced. Without them here the
  // braces are stripped further down and the numerator runs straight into the
  // denominator: "\dfrac{\log X}{\log_4 X}" came out as "log Xlog_4 X", which
  // is not a smaller version of the formula, it is a different one.
  [/\\[dt]?frac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2"],
  [/\\lVert|\\rVert|\\\|/g, "‖"],
  [/\\langle/g, "⟨"],
  [/\\rangle/g, "⟩"],
  [/\\Omega/g, "Ω"],
  [/\\Theta/g, "Θ"],
  [/\\Delta/g, "Δ"],
  [/\\delta/g, "δ"],
  [/\\alpha/g, "α"],
  [/\\beta\b/g, "β"],
  [/\\gamma/g, "γ"],
  [/\\lambda/g, "λ"],
  [/\\pi\b/g, "π"],
  [/\\zeta/g, "ζ"],
  [/\\epsilon|\\varepsilon/g, "ε"],
  [/\\infty/g, "∞"],
  [/\\times/g, "×"],
  [/\\cdot/g, "·"],
  [/\\pm\b/g, "±"],
  [/\\leq?\b/g, "≤"],
  [/\\geq?\b/g, "≥"],
  // Before \le / \ge, which would otherwise never see them, and before the
  // catch-all that deletes unknown commands: a bound that loses its \gg stops
  // being a bound and reads as an equation.
  [/\\gg\b/g, "≫"],
  [/\\ll\b/g, "≪"],
  [/\\neq?\b/g, "≠"],
  [/\\approx/g, "≈"],
  [/\\equiv/g, "≡"],
  [/\\subseteq?\b/g, "⊆"],
  [/\\in\b/g, "∈"],
  [/\\Rightarrow|\\implies/g, "⇒"],
  [/\\Longrightarrow/g, "⟹"],
  [/\\Leftrightarrow|\\iff/g, "⇔"],
  [/\\to\b|\\rightarrow/g, "→"],
  [/\\mapsto/g, "↦"],
  [/\\sum\b/g, "∑"],
  [/\\prod\b/g, "∏"],
  [/\\int\b/g, "∫"],
  [/\\iint\b/g, "∬"],
  [/\\sqrt/g, "√"],
  [/\\sim\b/g, "~"],
  [/\\ldots|\\dots|\\cdots/g, "…"],
  [/\\lfloor/g, "⌊"],
  [/\\rfloor/g, "⌋"],
  [/\\lceil/g, "⌈"],
  [/\\rceil/g, "⌉"],
  [/\\log/g, "log"],
  [/\\lim\b/g, "lim"],
  [/\\max\b/g, "max"],
  [/\\min\b/g, "min"],
  // Spacing macros. The catch-all below only deletes commands made of letters,
  // so "\," survived it and was read aloud as a backslash.
  [/\\(?:quad|qquad)\b/g, " "],
  [/\\[,;:!]/g, " "],
  // A literal percent sign is written "\%" in TeX. Left alone it read as
  // "67.25\%" in the zeta frontier's accessible labels.
  [/\\%/g, "%"],
];

export function deTeX(s: string): string {
  // Escape-aware for the same reason the renderer is: a `\$` prize amount must
  // not pair with a real delimiter and swallow the sentence between them. A meta
  // description gets this wrong silently, which is how it went unnoticed.
  let out = s.replace(/(?<!\\)\$\$?((?:\\.|[^$\\])+)\$\$?/g, "$1");
  for (const [re, rep] of REPLACEMENTS) out = out.replace(re, rep);
  out = unescapeDollars(out);
  return (
    out
      // A literal newline in a meta description or an OG tag is not a line
      // break, it is a broken tag.
      .replace(/\s*\n\s*/g, " ")
      .replace(/[{}]/g, "")
      .replace(/\\[a-zA-Z]+/g, "")
      .replace(/\s{2,}/g, " ")
      .trim()
  );
}
