import { MODEL_FAMILIES } from "@/lib/display";
import type { MathProblem } from "@/lib/problems";

// Counts per AI-system family (shared with the list's model filter - see
// MODEL_FAMILIES). An entry contributes to every family named on it, so the
// bars can sum to more than the number of problems, which the caption states
// plainly.

export function ModelsChart({ problems }: { problems: MathProblem[] }) {
  const rows = MODEL_FAMILIES.map((f) => ({
    label: f.label,
    count: problems.filter((p) => f.test.test(p.model)).length,
  }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);

  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    // Full-height column so the bar list centers in whatever height the grid
    // row gives the card (its row-mate line chart is usually taller) - same
    // pattern as the SVG charts.
    <div className="flex h-full flex-col">
      <h2 className="font-serif text-lg text-[var(--ink)]">Problems solved, by AI system</h2>
      <p className="mt-1 text-xs text-[var(--ink-muted)]">
        Each result credits every system named on it, so the bars can total more than the{" "}
        {problems.length} tracked problems.
      </p>
      <ul className="my-auto flex flex-col gap-2.5 py-4">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-3 text-sm">
            <span className="w-32 shrink-0 text-right text-[var(--ink-secondary)] sm:w-40">
              {r.label}
            </span>
            <div className="flex flex-1 items-center gap-2">
              <div
                className="h-5 rounded-sm"
                style={{
                  width: `${(r.count / max) * 100}%`,
                  minWidth: "3px",
                  backgroundColor: "var(--accent-blue)",
                }}
              />
              <span className="font-mono text-xs tabular-nums text-[var(--ink-secondary)]">
                {r.count}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
