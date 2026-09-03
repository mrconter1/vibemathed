import { linkifyEscaped } from "@/lib/linkify";
import { TEX_TOKENS, isDisplayMath, isInlineMath, unescapeDollars } from "@/lib/tex-tokens";

export type MathRenderer = (tex: string, display: boolean) => string;

// Non-math segments become raw HTML too, so they must be escaped here - React
// is no longer doing it for us.
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/// The shared prose-and-math pipeline. The published renderer supplies the
/// server KaTeX instance; the submission preview supplies a lazily loaded
/// browser instance. Keeping the splitting and escaping here means the preview
/// cannot quietly accept syntax that the published entry renders differently.
export function renderTexToHtml(
  children: string,
  renderMath: MathRenderer,
  opts?: { linkify?: boolean },
): string {
  const parts = children.split(TEX_TOKENS);
  return parts
    .map((part, i) => {
      if (isDisplayMath(part)) return renderMath(part.slice(2, -2), true);
      if (isInlineMath(part)) return renderMath(part.slice(1, -1), false);

      // Display math is already a block, so discard a newline touching it
      // rather than rendering a duplicate gap.
      let text = part;
      if (isDisplayMath(parts[i - 1] ?? "")) text = text.replace(/^\n/, "");
      if (isDisplayMath(parts[i + 1] ?? "")) text = text.replace(/\n$/, "");
      const escaped = escapeHtml(text);
      const linked = opts?.linkify ? linkifyEscaped(escaped) : escaped;
      return unescapeDollars(linked).replace(/\n/g, "<br>");
    })
    .join("");
}
