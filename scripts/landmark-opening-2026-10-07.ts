// Landmark Candidates listed before 7 October 2026 get the opening sentence
// the landmark rule now requires (docs/reviewing.md, step 4): the verification
// note opens with "No independent mathematician has checked this yet." until
// that stops being true. The release entries got it at import; these did not.
//
// Scope: every published Candidate outside the OpenAI release with
// significance 45 or more, which is where the catalog's landmark claims sit.
// Lean-verified entries are included on purpose: an audited formal statement is
// not a mathematician reading the argument, and the rule says so.
//
// The percolation note already said "No mathematician has read the argument."
// near its end; that sentence goes, since the opening now says it, and the note
// would otherwise run over its 1500-character limit.
//
//   bash scripts/prod.sh scripts/landmark-opening-2026-10-07.ts            # dry run
//   bash scripts/prod.sh scripts/landmark-opening-2026-10-07.ts --apply

import { guardedPrisma } from "./lib/guarded-prisma";
import { charLength, canonical } from "../src/lib/char-length";

const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const OPENING = "No independent mathematician has checked this yet.";
const LIMIT = 1500;
const MIN_SIGNIFICANCE = 45;

/// Sentences that the opening makes redundant, removed per entry.
const DROP: Record<string, string> = {
  "absence-of-critical-bernoulli-bond-percolation-on-z-d-in-every-dimension-d-2": " No mathematician has read the argument.",
};

async function main() {
  const prisma = guardedPrisma();
  try {
    const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>("SELECT current_database() AS db");
    console.log(`database: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`);
    const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
    if (!admin) throw new Error("no admin");

    const rows = await prisma.problem.findMany({
      where: {
        status: "published",
        resolution: "candidate",
        significance: { gte: MIN_SIGNIFICANCE },
        OR: [{ collection: null }, { collection: { not: "openai-math-2026-10" } }],
      },
      select: { id: true, slug: true, significance: true, verificationNote: true },
      orderBy: { significance: "desc" },
    });

    const plan: { id: string; slug: string; old: string; next: string }[] = [];
    let bad = 0;
    for (const r of rows) {
      const old = r.verificationNote ?? "";
      if (old.startsWith(OPENING)) {
        console.log(`SKIP   ${r.slug} (already opens with the sentence)`);
        continue;
      }
      let body = old;
      const drop = DROP[r.slug];
      if (drop) {
        if (!body.includes(drop)) throw new Error(`${r.slug}: expected sentence to drop not found`);
        body = body.replace(drop, "");
      }
      const next = canonical(body ? `${OPENING} ${body}` : OPENING);
      const n = charLength(next);
      const over = n > LIMIT;
      if (over) bad++;
      console.log(`UPDATE ${r.slug}  [sig ${r.significance}]  ${charLength(old)} -> ${n}/${LIMIT}${over ? "  OVER" : ""}`);
      plan.push({ id: r.id, slug: r.slug, old, next });
    }
    if (bad) throw new Error(`${bad} over the limit - nothing written`);
    console.log(`\n${plan.length} to update`);
    if (!APPLY) {
      console.log("DRY RUN - pass --apply to write");
      return;
    }

    for (const p of plan) {
      await prisma.$transaction([
        prisma.problem.update({ where: { id: p.id }, data: { verificationNote: p.next } }),
        prisma.problemActivity.create({
          data: {
            problemId: p.id,
            userId: admin.id,
            userName: admin.pseudonym ?? null,
            type: "updated",
            field: "Verification note",
            oldValue: p.old,
            newValue: p.next,
          },
        }),
      ]);
      console.log(`updated ${p.slug}`);
    }
    console.log("\nAPPLIED");
  } finally {
    await prisma.$disconnect();
  }
}

main();
