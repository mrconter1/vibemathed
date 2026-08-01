import type { MathProblem } from "@/lib/problems";

// Model strings are free-form and often credit several systems on one entry
// (e.g. "Aristotle, GPT-5.2 Pro"). So we bucket into AI-system families by
// keyword and count co-occurrences: an entry contributes to every family named
// on it. That means the bars can sum to more than the number of problems, which
// the caption states plainly.
const FAMILIES: { label: string; test: RegExp }[] = [
  { label: "OpenAI (GPT, Codex)", test: /gpt|codex|openai|\bo[0-9]\b/i },
  { label: "Google DeepMind", test: /gemini|deepmind|alphaevolve|alphaproof/i },
  { label: "Anthropic (Claude)", test: /claude/i },
  { label: "Harmonic (Aristotle)", test: /aristotle|harmonic/i },
  { label: "xAI (Grok)", test: /grok/i },
  { label: "Open-weights (DeepSeek, GLM)", test: /deepseek|glm/i },
  {
    // Agent harnesses and systems that do not name (or do not disclose) a
    // frontier base model. Harness entries that DO name one (e.g. "Rethlas
    // (GPT-5.6 Sol)") also count toward that vendor, by design.
    label: "Agent systems / other",
    test: /aletheia|archivara|multiscalar|seed prover|axiomprover|demonstrandum|qed|tars|rethlas|archon|proofcouncil|hy3|hyra|capy/i,
  },
];

export function ModelsChart({ problems }: { problems: MathProblem[] }) {
  const rows = FAMILIES.map((f) => ({
    label: f.label,
    count: problems.filter((p) => f.test.test(p.model)).length,
  }))
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);

  const max = Math.max(1, ...rows.map((r) => r.count));

  return (
    <div>
      <h2 className="font-serif text-lg text-[var(--ink)]">Problems solved, by AI system</h2>
      <p className="mt-1 text-xs text-[var(--ink-muted)]">
        Each result credits every system named on it, so the bars can total more than the{" "}
        {problems.length} tracked problems.
      </p>
      <ul className="mt-4 flex flex-col gap-2.5">
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
