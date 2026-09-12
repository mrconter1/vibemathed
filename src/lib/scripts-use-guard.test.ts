import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Curator scripts write to production. For a month they did so through a bare
// PrismaClient that ran none of the rules the edit form enforces, and the
// catalog collected rows the form refuses - twelve published entries could not
// be saved by anyone on 10 September 2026. scripts/lib/guarded-prisma.ts puts
// the form's validator in the write path; this test makes using it the rule
// rather than the convention, by failing the build for any script that
// constructs its own client.
//
// The allowlist is every script that existed when the guard was introduced.
// They have all already run against production and are kept as the record of
// what was done and why; rewriting them would change history for no gain.
// Nothing is added to this list. A new script imports guardedPrisma.

const ROOT = join(__dirname, "..", "..");
const SCRIPTS = join(ROOT, "scripts");

const RAN_BEFORE_THE_GUARD = new Set([
  "add-alpoge-buckmaster-2026-09-08.ts",
  "add-ame-five-cases.ts",
  "add-erdos-501.ts",
  "add-ffd-no-degeneracies.ts",
  "add-lyons-white-2026-09-06.ts",
  "add-matmul-exponent.ts",
  "add-tilted-prime-gaps.ts",
  "amend-buffon-ai-axis.ts",
  "amend-dihedral-ramsey.ts",
  "amend-erdos-424-green.ts",
  "amend-petersen-priority.ts",
  "answer-186-report-2026-09-05.ts",
  "audit-field-lengths.ts",
  "audit-paren-delimiters.ts",
  "check-comment-render.ts",
  "check-editable-fields.ts",
  "check-field-limits.ts",
  "check-ids.ts",
  "check-notability.ts",
  "check-source-links.ts",
  "confirm-conway-2026-09-04.ts",
  "confirm-mul4-2026-09-03.ts",
  "copy-frontiers-to-production-2026-09-05.ts",
  "correct-percolation-2026-09-04.ts",
  "credit-leder-2026-09-08.ts",
  "demote-186-row-2026-09-05.ts",
  "dump-pending.ts",
  "export-problems.ts",
  "fill-significance-2026-08-12.ts",
  "fix-duplicate-source-links.ts",
  "fix-latex-titles.ts",
  "fix-link-rules.ts",
  "fix-math-shortnames.ts",
  "fix-mul4-date-2026-09-02.ts",
  "fix-percolation-tex-2026-09-08.ts",
  "fix-prime-gaps-dollar.ts",
  "fix-tooltip-math.ts",
  "fix-werner-concurrent.ts",
  "fix-ytd-method.ts",
  "frame-dynamo-variants.ts",
  "handle-invgen-v2.ts",
  "handle-zeta-report-2026-09-03.ts",
  "hold-ytd-2026-09-02.ts",
  "import-alpoge-s6.ts",
  "import-bounded-gaps-2026-09-04.ts",
  "import-elliptic-rank-30.ts",
  "import-elliptic-rank-31.ts",
  "import-sweep-2026-08-12.ts",
  "import-sweep-2026-08-13.ts",
  "import-sweep-2026-08-17.ts",
  "import-sweep-2026-08-21.ts",
  "inbox-2026-09-05.ts",
  "inbox-replies-2026-09-10.ts",
  "add-c11-frontier-2026-09-10.ts",
  "fix-c11-frontier-name-2026-09-10.ts",
  "liu-notes-2026-09-02.ts",
  "reclassify-announcements.ts",
  "reject-levy-montague.ts",
  "reject-m23.ts",
  "reject-tournament-quotients-ii.ts",
  "rename-gap-records-2026-09-04.ts",
  "reply-hiddenhawk-wiki.ts",
  "reply-vibegene-ytd-method.ts",
  "reply-zestywombat.ts",
  "restate-ssuf-part3.ts",
  "restore-latex-names.ts",
  "review-2026-09-01.ts",
  "review-2026-09-02.ts",
  "review-2026-09-03-b.ts",
  "review-2026-09-03.ts",
  "review-2026-09-04-b.ts",
  "review-2026-09-04-c.ts",
  "review-2026-09-04-d.ts",
  "review-2026-09-04.ts",
  "review-2026-09-05-b.ts",
  "review-2026-09-05.ts",
  "review-2026-09-06.ts",
  "review-2026-09-08-b.ts",
  "review-2026-09-08.ts",
  "review-2026-09-09.ts",
  "review-albertson-berman.ts",
  "review-batch-2026-08-12.ts",
  "review-batch-2026-08-17.ts",
  "review-batch-28aug-pm.ts",
  "review-batch-28aug.ts",
  "review-bounded-mass-property.ts",
  "review-buffon-full-chord.ts",
  "review-caratheodory-smooth.ts",
  "review-composites-seven-followup.ts",
  "review-dean-k5.ts",
  "review-dihedral-ramsey.ts",
  "review-dt-loop-quiver.ts",
  "review-dubickas-problem-3.ts",
  "review-erdos-270-affine.ts",
  "review-erdos-390.ts",
  "review-erdos-kac-palindromes.ts",
  "review-gamow-liquid-drop.ts",
  "review-gardner-transition.ts",
  "review-girth5-spin-mixing.ts",
  "review-gromov-volume-growth.ts",
  "review-hadamard-668.ts",
  "review-haglund-k1.ts",
  "review-intree-conjugation.ts",
  "review-keisler-generic-stability.ts",
  "review-lattice-paths.ts",
  "review-local-limits-squares.ts",
  "review-m23-resubmission.ts",
  "review-nevanlinna-half-plane.ts",
  "review-petersen-coloring.ts",
  "review-phelps-rodriguez.ts",
  "review-prime-digital-functions.ts",
  "review-rademacher-fourth-moment.ts",
  "review-rado-40c41.ts",
  "review-rado-general.ts",
  "review-ramsey-19values.ts",
  "review-ramsey-a4.ts",
  "review-random-assignment-clt.ts",
  "review-riviere-n-laplace.ts",
  "review-scl-one-relator.ts",
  "review-sendov.ts",
  "review-smooth-random-dynamo.ts",
  "review-sop23.ts",
  "review-sparse-convex-body.ts",
  "review-ssuf-part3.ts",
  "review-stein-riesz.ts",
  "review-subdl-signed-depth.ts",
  "review-talagrand-convolution.ts",
  "review-talagrand-sk.ts",
  "review-teschner.ts",
  "review-three-summand-plateau.ts",
  "review-three-summand-tu-deng.ts",
  "review-u30-autocorrelation.ts",
  "seed-record-small-gaps-2026-09-04.ts",
  "seed-records-2026-09-04.ts",
  "seed-records-batch2-2026-09-05.ts",
  "seed-relations-2026-08-13.ts",
  "set-team-2026-09-02.ts",
  "shorten-over-limit-fields.ts",
  "update-borsuk-priority.ts",
  "update-crouzeix-jin.ts",
  "update-dean-k5-replayed.ts",
  "update-gromov-third-proof.ts",
  "update-hadamard-668.ts",
  "update-haglund-replay-confirmed.ts",
  "update-prime-gaps-expert.ts",
  "update-zeta-arxiv.ts",
  // Infrastructure, not entry data: one renamed a table, one toggles the
  // CockroachDB schema lock. Neither writes a Problem or a ProblemLink.
  "rename-records-to-frontiers.mjs",
  "schema-lock.mjs",
]);

const BARE_CLIENT = /new\s+PrismaClient\s*\(/;

describe("curator scripts write through the guarded client", () => {
  const files = readdirSync(SCRIPTS).filter(
    (f) => (f.endsWith(".ts") || f.endsWith(".mjs")) && !f.startsWith("_"),
  );

  it("finds the scripts directory", () => {
    expect(files.length).toBeGreaterThan(50);
  });

  for (const f of files) {
    if (RAN_BEFORE_THE_GUARD.has(f)) continue;
    it(`${f} does not construct its own PrismaClient`, () => {
      const src = readFileSync(join(SCRIPTS, f), "utf8");
      if (BARE_CLIENT.test(src)) {
        throw new Error(
          `${f} constructs a bare PrismaClient. Import guardedPrisma from ` +
            `scripts/lib/guarded-prisma.ts instead, so the form's validation ` +
            `runs before anything is written. A script that bypasses it can ` +
            `leave an entry nobody can edit.`,
        );
      }
    });
  }

  it("the guard itself is the only place a bare client is constructed", () => {
    const src = readFileSync(join(SCRIPTS, "lib", "guarded-prisma.ts"), "utf8");
    expect(BARE_CLIENT.test(src)).toBe(true);
  });
});
