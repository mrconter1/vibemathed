import type { MathProblem } from "@/lib/problems";

// Distribution of the AI-estimated significance scores, as horizontal band
// bars in the ModelsChart idiom. Empty bands stay visible on purpose: the gap
// between the tall tail of 5-15s and the rare 60+ strikes IS the story - AI
// is harvesting the enormous tail of real-but-unfamous mathematics.

const BANDS: { label: string; min: number; max: number }[] = [
  { label: "90-100", min: 90, max: 100 },
  { label: "80-89", min: 80, max: 89 },
  { label: "70-79", min: 70, max: 79 },
  { label: "60-69", min: 60, max: 69 },
  { label: "50-59", min: 50, max: 59 },
  { label: "40-49", min: 40, max: 49 },
  { label: "30-39", min: 30, max: 39 },
  { label: "20-29", min: 20, max: 29 },
  { label: "10-19", min: 10, max: 19 },
  { label: "0-9", min: 0, max: 9 },
];

export function SignificanceChart({ problems }: { problems: MathProblem[] }) {
  const scored = problems.filter(
    (p): p is MathProblem & { significance: number } =>
      p.significance !== null && p.significance !== undefined,
  );
  if (scored.length === 0) return null;

  const rows = BANDS.map((b) => ({
    label: b.label,
    count: scored.filter((p) => p.significance >= b.min && p.significance <= b.max).length,
  }));
  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <div>
      <h2 className="font-serif text-lg text-[var(--ink)]">Significance distribution</h2>
      <p className="mt-1 text-xs text-[var(--ink-muted)]">
        AI-estimated problem weight before the solve (see the methodology);{" "}
        {scored.length} entries assessed. Riemann would be 100.
      </p>
      <ul className="mt-4 flex flex-col gap-1.5">
        {rows.map((r) => (
          <li key={r.label} className="flex items-center gap-3 text-sm">
            <span className="w-14 shrink-0 text-right font-mono text-xs text-[var(--ink-secondary)]">
              {r.label}
            </span>
            <div className="flex flex-1 items-center gap-2">
              <div
                className="h-4 rounded-sm"
                style={{
                  width: `${(r.count / max) * 100}%`,
                  minWidth: r.count > 0 ? "3px" : "0",
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
