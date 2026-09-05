// The one line an entry page gains from Frontiers: which frontier(s) this entry is
// a step on, and whether it is the current best. Async server component that
// fetches for itself so the entry page's own data fan-out is untouched; it
// renders nothing for the ~98% of entries that sit on no frontier, which is why
// the lookup behind it has to be one indexed query.

import Link from "next/link";
import { getFrontiersForProblem } from "@/lib/data";
import { bestRow, steps } from "@/lib/frontiers";
import { TeX } from "@/components/TeX";

export async function FrontierMembership({ slug }: { slug: string }) {
  const frontiers = await getFrontiersForProblem(slug);
  if (frontiers.length === 0) return null;

  return (
    <section className="mt-6 rounded-lg border border-[var(--accent-orange)]/40 bg-[var(--paper-raised)] px-4 py-3">
      {frontiers.map((r) => {
        const best = bestRow(r.rows, r.direction);
        const mine = r.rows.find((x) => x.id === r.rowId);
        const isBest = best?.id === r.rowId;
        const isStep = steps(r.rows, r.direction).find((s) => s.row.id === r.rowId)?.isStep ?? false;
        const label = isBest
          ? "current best"
          : isStep
            ? "a step on the frontier, since improved"
            : mine?.status === "candidate"
              ? "candidate, under review"
              : "on the frontier, not a step";
        return (
          <p key={r.slug} className="text-sm text-[var(--ink-secondary)]">
            <span className="mr-2 rounded border border-[var(--accent-orange)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-orange)]">
              Frontier
            </span>
            Step on{" "}
            <Link href={`/frontier/${r.slug}`} className="font-medium text-[var(--ink)] hover:underline">
              {r.shortName}
            </Link>
            {mine && (
              <>
                {" · "}
                <span className="text-[var(--ink)]">
                  <TeX>{mine.valueShortTex ?? mine.valueTex}</TeX>
                </span>
              </>
            )}
            {" · "}
            <span className={isBest ? "text-[var(--accent-orange)]" : ""}>{label}</span>
          </p>
        );
      })}
    </section>
  );
}
