"use client";

import type { ChartProblem } from "@/lib/problems";
import { RatioPie } from "@/components/RatioPie";
import { StatusToggle, TierNote, TierToggle } from "@/components/TimeControls";
import { useChartSettings } from "@/lib/chart-settings";

// Model strings are free-form and often name several systems (see ModelsChart),
// so classification is by keyword: an entry counts as open source if ANY
// openly released (open-weights) model is credited on it, and as closed source
// otherwise - including internal research systems, which are the epitome of
// closed. The list covers the open-weights families likely to appear, not just
// the ones present today, so future submissions classify correctly.
const OPEN_WEIGHTS = /deepseek|glm|hunyuan|\bhy3\b|qwen|kimi|llama|mistral|seed prover/i;

export function OpenSourceChart({ problems }: { problems: ChartProblem[] }) {
  const { tier, setTier, status, setStatus } = useChartSettings("open-source");

  // `problems` holds resolved entries and candidate claims. A pie has no
  // second line to put the claims on, so they are either counted or not, and
  // the note under the caption says how many of the slices they make up.
  const inStatus =
    status === "claims" ? problems : problems.filter((p) => p.resolution === "resolved");
  const scoped =
    tier === "all" ? inStatus : inStatus.filter((p) => p.aiContribution === tier);
  const claims = scoped.filter((p) => p.resolution !== "resolved").length;

  const open = scoped.filter((p) =>
    OPEN_WEIGHTS.test(`${p.model} ${p.modelMaker ?? ""}`),
  ).length;

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
      title="Closed vs. open source"
      caption={`Solves where an openly released (open-weights) model contributed, across ${scoped.length} entries.`}
      rows={[
        { label: "Closed source", n: scoped.length - open, color: "var(--accent-blue)" },
        { label: "Open source", n: open, color: "var(--accent-orange)" },
      ]}
    />
  );
}
