import type { ChartProblem } from "@/lib/problems";
import { RatioPie } from "@/components/RatioPie";

// Two slices, not three, now that `independent` exists as a third result.
//
// A pie is a part-to-whole form, so the honest options were a third slice or a
// caption that stops claiming to cover everything. The third slice loses:
// independence results are a handful against several hundred, so the wedge
// would be a sliver nobody can read, and it would need a hue separable from
// both blue and orange on both surfaces, which the validator says does not
// exist here. Violet collides with blue for a deuteranope on the light theme;
// teal collides with the lightened blue on the dark one.
//
// So the pie keeps answering the question it is good at, which is which way
// the results that went one way or the other actually went, and the caption
// carries the remainder rather than hiding it.
export function SolveRatioChart({ problems }: { problems: ChartProblem[] }) {
  const proved = problems.filter((p) => p.solveType === "proved").length;
  const disproved = problems.filter((p) => p.solveType === "disproved").length;
  const independent = problems.filter((p) => p.solveType === "independent").length;

  return (
    <RatioPie
      title="Proved vs. disproved"
      caption={
        independent === 0
          ? `Across all ${proved + disproved} tracked resolutions.`
          : `Across the ${proved + disproved} resolutions that went one way or the other. ` +
            `${independent} more ${independent === 1 ? "was" : "were"} shown independent of the ambient axioms, so ${independent === 1 ? "it is" : "they are"} in neither slice.`
      }
      rows={[
        { label: "Proved", n: proved, color: "var(--accent-blue)" },
        { label: "Disproved", n: disproved, color: "var(--accent-orange)" },
      ]}
    />
  );
}
