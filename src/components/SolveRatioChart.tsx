"use client";

import type { ChartProblem } from "@/lib/problems";
import { RatioPie } from "@/components/RatioPie";
import { StatusToggle, TierNote, TierToggle } from "@/components/TimeControls";
import { useChartSettings } from "@/lib/chart-settings";

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
  const { tier, setTier, status, setStatus } = useChartSettings("solve-ratio");

  // Worth filtering here even though the pie has no time axis: whether
  // AI-discovered results skew toward disproofs is a different question from
  // how the record as a whole splits, and this is the chart that answers it.
  // `problems` holds resolved entries and candidate claims. A pie has no
  // second line to put the claims on, so they are either counted or not, and
  // the note under the caption says how many of the slices they make up.
  const inStatus =
    status === "claims" ? problems : problems.filter((p) => p.resolution === "resolved");
  const scoped =
    tier === "all" ? inStatus : inStatus.filter((p) => p.aiContribution === tier);
  const claims = scoped.filter((p) => p.resolution !== "resolved").length;

  const proved = scoped.filter((p) => p.solveType === "proved").length;
  const disproved = scoped.filter((p) => p.solveType === "disproved").length;
  const independent = scoped.filter((p) => p.solveType === "independent").length;

  return (
    <RatioPie
      note={
        <>
          <TierNote tier={tier} shown={scoped.length} total={inStatus.length} />
          {claims > 0 && (
            <p className="mt-1 text-xs text-[var(--ink-muted)]">
              Includes {claims} candidate {claims === 1 ? "claim" : "claims"} under
              review, not yet checked by anyone independent.
            </p>
          )}
        </>
      }
      controls={
        <>
          <TierToggle value={tier} onChange={setTier} />
          <StatusToggle value={status} onChange={setStatus} />
        </>
      }
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
