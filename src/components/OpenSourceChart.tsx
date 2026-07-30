import type { MathProblem } from "@/lib/problems";
import { RatioPie } from "@/components/RatioPie";

// Model strings are free-form and often name several systems (see ModelsChart),
// so classification is by keyword: an entry counts as open source if ANY
// openly released (open-weights) model is credited on it, and as closed source
// otherwise - including internal research systems, which are the epitome of
// closed. The list covers the open-weights families likely to appear, not just
// the ones present today, so future submissions classify correctly.
const OPEN_WEIGHTS = /deepseek|glm|hunyuan|\bhy3\b|qwen|kimi|llama|mistral|seed prover/i;

export function OpenSourceChart({ problems }: { problems: MathProblem[] }) {
  const open = problems.filter((p) =>
    OPEN_WEIGHTS.test(`${p.model} ${p.modelMaker ?? ""}`),
  ).length;

  return (
    <RatioPie
      title="Closed vs. open source"
      caption={`Solves where an openly released (open-weights) model contributed, across all ${problems.length} entries.`}
      rows={[
        { label: "Closed source", n: problems.length - open, color: "var(--accent-blue)" },
        { label: "Open source", n: open, color: "var(--accent-orange)" },
      ]}
    />
  );
}
