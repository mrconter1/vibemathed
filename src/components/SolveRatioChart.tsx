import type { MathProblem } from "@/lib/problems";
import { RatioPie } from "@/components/RatioPie";

export function SolveRatioChart({ problems }: { problems: MathProblem[] }) {
  const proved = problems.filter((p) => p.solveType === "proved").length;
  const disproved = problems.filter((p) => p.solveType === "disproved").length;

  return (
    <RatioPie
      title="Proved vs. disproved"
      caption={`Across all ${proved + disproved} tracked resolutions.`}
      rows={[
        { label: "Proved", n: proved, color: "var(--accent-blue)" },
        { label: "Disproved", n: disproved, color: "var(--accent-orange)" },
      ]}
    />
  );
}
