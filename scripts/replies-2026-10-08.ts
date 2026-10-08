// 8 October 2026: curator replies to two open questions in entry comments.
//
// 1. QUASI-RIEMANN HYPOTHESIS. CosmicTapir681 (7 Oct) asked whether the entry
//    is really Lean-checked, linking ComparatorChallenges/QuasiRiemannHypothesis.lean,
//    whose proof is `sorry`. That file is the challenge: it states the theorem
//    and is meant to be unproved. Checked here at fd4aeeb: the json's
//    solution_module OAI.NumberTheory.DirichletL.Nonvanishing proves the same
//    declaration; its import closure is 2,924 OAI modules, all under
//    NumberTheory/DirichletL, with no sorry, axiom declarations, native_decide,
//    implemented_by or unsafe; permitted axioms are the standard three. Not
//    rebuilt here. The tier stands.
//
// 2. PRODUCTS OF K3 SURFACES. QuietNarwhal605 (8 Oct) said the proof is
//    invalid, linking two posts. OpenAI withdrew the manuscript on 6 October;
//    the entry is Retracted and Contested since the re-sync of 8 October.
//
// Idempotent: a reply is skipped when the curator has already replied under
// that comment. Dry run by default; --apply writes.

import { guardedPrisma } from "./lib/guarded-prisma";
import { COMMENT_MAX_LENGTH } from "../src/lib/comments";

const APPLY = process.argv.includes("--apply");

const REPLIES = [
  {
    slug: "quasi-riemann-hypothesis",
    parentBy: "CosmicTapir681",
    body: `Good question, and yes. The file you linked is the challenge, and the \`sorry\` in it is by design: it states the theorem and nothing else, so that a checker can confirm a separate proof establishes exactly that statement.

The proof is elsewhere. QuasiRiemannHypothesis.json names the solution module OAI.NumberTheory.DirichletL.Nonvanishing, which proves the same declaration (riemannZeta s ≠ 0 for 7/8 < Re s) and permits only the three standard axioms (propext, Quot.sound, Classical.choice). Leanprover's Comparator then checks that the solution's theorem has the challenge's exact statement and uses nothing else.

Checked here on 8 October, at the release's current commit fd4aeeb: the solution module's import closure is 2,924 Lean files, all under NumberTheory/DirichletL, and none contains sorry, an axiom declaration, native_decide, implemented_by or unsafe.

What this tier does and does not mean: Lean-checked says a formal proof exists whose headline statement we have read. We have not rebuilt it ourselves, and nobody independent has audited the statement against the problem, which is why it is not Lean-verified, and why the resolution stays Candidate.`,
  },
  {
    slug: "hodge-conjecture-products-of-k3-surfaces",
    parentBy: "QuietNarwhal605",
    body: `Thanks for flagging it. OpenAI withdrew this manuscript on 6 October, together with the Kuga-Satake paper and the split abelian eightfold paper it builds on: a sign error in the eightfold stabilization-trace argument breaks the signed double-point cancellation the construction needs. The entry is now Retracted and Contested, with OpenAI's notice quoted in the claim issue and linked. As their notice says, the withdrawal concerns the proof; it does not show the statement is false, so the question is open again.`,
  },
];

async function main() {
  for (const r of REPLIES) {
    if (r.body.length > COMMENT_MAX_LENGTH) throw new Error(`${r.slug}: reply over ${COMMENT_MAX_LENGTH}`);
    if (/—/.test(r.body)) throw new Error(`${r.slug}: em dash`);
  }
  const prisma = guardedPrisma();
  try {
    const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>("SELECT current_database() AS db");
    console.log(`database: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`);
    const curator = await prisma.user.findFirst({ where: { pseudonym: "Rasmus Lindahl" }, select: { id: true, pseudonym: true } });
    if (!curator) throw new Error("curator not found");

    const plan = [];
    for (const r of REPLIES) {
      const p = await prisma.problem.findUnique({ where: { slug: r.slug }, select: { id: true } });
      if (!p) throw new Error(`${r.slug} missing`);
      const parent = await prisma.comment.findFirst({
        where: { problemId: p.id, userName: r.parentBy, deletedAt: null, parentId: null },
        orderBy: { createdAt: "desc" },
        select: { id: true, createdAt: true },
      });
      if (!parent) throw new Error(`${r.slug}: no top-level comment by ${r.parentBy}`);
      const already = await prisma.comment.findFirst({ where: { parentId: parent.id, userId: curator.id }, select: { id: true } });
      console.log(`${r.slug}: reply under ${r.parentBy} ${parent.createdAt.toISOString()} (${r.body.length} chars)${already ? "  ALREADY REPLIED - skip" : ""}`);
      if (!already) plan.push({ problemId: p.id, parentId: parent.id, body: r.body });
    }
    if (!APPLY) {
      console.log("\nDRY RUN - pass --apply to write");
      return;
    }
    for (const x of plan) {
      await prisma.comment.create({
        data: { problemId: x.problemId, parentId: x.parentId, userId: curator.id, userName: curator.pseudonym, body: x.body },
      });
    }
    console.log(`\nAPPLIED: ${plan.length} repl${plan.length === 1 ? "y" : "ies"}`);
  } finally {
    await prisma.$disconnect();
  }
}

main();
