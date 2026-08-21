// Public reply to VibeGene on the YTD entry, asking whether the method should
// be construction rather than argument. It should, and it now is.
//
// A thread comment, not a DirectMessage: VibeGene commented publicly and is
// not the submitter (this entry was curator-created), so the answer belongs
// where the question was asked. Mirrors src/app/actions/comments.ts, including
// the "commented" activity row.
import { PrismaClient } from "@prisma/client";
import { COMMENT_MAX_LENGTH } from "../src/lib/comments";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "yau-tian-donaldson-conjecture-csck";

const REPLY = `Changed to construction, thank you. The field records how the problem was resolved, and this one is resolved by exhibiting an explicit fivefold, so your reading of the abstract is the right one for it.

Worth saying what I checked first, because the obvious argument for the change turns out to be wrong. The catalog is not uniformly construction for counterexamples: of 192 disproved entries, 168 are construction, 15 are argument and 9 computation. Kontsevich's asphericity conjecture and Schiffer's are both disproofs filed as argument. So this entry was not an outlier, and "everything else does it this way" would have been a false justification for doing what you suggested.

What had made me file it as argument was the paper's own appendix, which separates counterexamples that reduce to a finite certificate from ones that are themselves a theorem quantified over all degenerations, and places itself in the second class: candidate manifolds of this shape have been available since 2008, and what was missing was the proof that the mechanism works. That is a claim about where the difficulty lay, not about how the problem was resolved, so it belongs in the result note rather than the method field. It is still there, reworded, since the old wording asserted the value you just talked me out of.`;

async function main() {
  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });
  if (!curator) throw new Error("curator not found");

  const p = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, resolutionMethod: true },
  });
  if (!p) throw new Error("entry not found");
  // Do not answer "changed it" unless it is actually changed.
  if (p.resolutionMethod !== "construction") {
    throw new Error(`method is ${p.resolutionMethod}, expected construction - run the fix first`);
  }

  const target = await prisma.comment.findFirst({
    where: { problemId: p.id, userName: "VibeGene" },
    orderBy: { createdAt: "asc" },
    select: { id: true, body: true, createdAt: true },
  });
  if (!target) throw new Error("no VibeGene comment on this entry");

  console.log(`replying on ${SLUG}`);
  console.log(`  to: "${target.body}" (${target.createdAt.toISOString()})`);
  console.log(`  ${REPLY.length} chars (max ${COMMENT_MAX_LENGTH})`);
  if (REPLY.length > COMMENT_MAX_LENGTH) {
    throw new Error(`over by ${REPLY.length - COMMENT_MAX_LENGTH}`);
  }

  if (!APPLY) {
    console.log("\n" + REPLY + "\n");
    console.log("DRY RUN - pass --apply to write");
    return;
  }

  await prisma.$transaction([
    prisma.comment.create({
      data: {
        problemId: p.id,
        userId: curator.id,
        userName: curator.pseudonym,
        body: REPLY,
      },
    }),
    prisma.problemActivity.create({
      data: {
        problemId: p.id,
        userId: curator.id,
        userName: curator.pseudonym,
        type: "commented",
      },
    }),
  ]);
  console.log("POSTED");
}

main().finally(() => prisma.$disconnect());
