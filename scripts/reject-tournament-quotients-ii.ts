// Reject Tournament Score-Quotients II for failing the inclusion test.
// 19 Aug 2026.
//
// Paper I by the same author is published (significance 3, the self-posed
// floor), so the consistent thing is to say precisely what separates them.
//
// Paper I answers a question: "which linear combinations of induced
// k-subtournament type-counts are score-determined?" - self-posed, but a
// question, with a classification as its answer. Paper II analyses a quantity
// the author defined. Its terminal results are the PACF law gamma_n ~ 1/(6n)
// and a fifteen-order expansion of it. Nothing is settled that anyone had
// asked.
//
// This was checked in the manuscript, not inferred from the abstract. The
// Zenodo archive (22002810, 84.5 MB) was downloaded and
// CURRENT/Tournament_Score_Quotients_Paper_II.tex read. In 378 KB of source:
// "settle" 0 occurrences, "answer" 0, "open problem" 0, "open " 1 (in "open
// unit disc"), "question" 2 - both in the closing paragraph, naming work left
// for the future. "conjectur" appears 4 times: twice in the LaTeX preamble
// declaring an environment that is never used, and twice flagging a formula
// the author marks as conjectural and does not use. The paper does not claim
// to settle anything, and the entry's resolution=resolved had nothing to
// point at.
//
// So: no-open-question, which is the reason already used for submissions that
// advance the state of the art without answering a posed question. Not a
// quality judgment, and the message says so and gives the route back.
//
// Dry run by default. Pass --apply to write.
import { PrismaClient } from "@prisma/client";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "tournament-score-quotients-ii-renewal-q-airy-edge-analysis-and-partial-autocorre";

const MESSAGE = `Not published, under "no stated open question". I read the paper, so let me be concrete.

I pulled the Zenodo archive and read the manuscript source in CURRENT/. It is a serious piece of work and the provenance apparatus is more thorough than anything else that has come through here. That is not what the decision turned on.

The inclusion test is one sentence: a precisely stated open question whose answer is now a proved or disproved theorem. Paper I met it. "Which linear combinations of induced k-subtournament type-counts are score-determined" is a question, and the classification is its answer - which is why it is published, self-posed and at the floor though it is. Paper II is a different kind of object. Its terminal results are the PACF law and the fifteen-order expansion: an analysis of a quantity you defined, not an answer to a question anyone had asked.

The manuscript agrees. In 378 KB of source, "settle" and "answer" do not appear at all, "open problem" never, and "question" twice - both in the closing paragraph, naming the three continuations you leave for later. "conjecture" appears four times, twice in the preamble declaring an environment you never use and twice beside a formula you flag as conjectural and do not rely on. The paper is careful and does not claim to settle anything; the entry's Resolved status had nothing to point at.

This is a scope call, not a verdict on the mathematics, and it applies the same way to a human-authored analysis paper.

What would change it: name a question - yours, from Paper I, or in the literature - that a terminal theorem of Paper II answers, and that was on record before this paper. Resubmit with that pointer and I will look again.

One thing unprompted. The chain from the interarrival tail through index 1/3, the n^(-2/3) renewal mass, the Fisher-Hartwig exponent and Inoue to d = 1/6 hangs together, and the normalization dictionary makes each import checkable. That is more than most submissions offer.`;

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error(`no admin user for ${ADMIN_EMAIL}`);

  const p = await prisma.problem.findUnique({ where: { slug: SLUG } });
  if (!p) throw new Error(`no entry ${SLUG}`);
  if (p.status !== "pending") throw new Error(`${SLUG} is ${p.status}, not pending`);

  console.log(`${SLUG}`);
  console.log(`  status:       ${p.status} -> rejected`);
  console.log(`  reviewReason: ${p.reviewReason} -> no-open-question`);
  console.log(`  submitter:    ${p.submittedById}`);
  console.log(`  message:      ${MESSAGE.length}/${MESSAGE_MAX}`);
  if (MESSAGE.length > MESSAGE_MAX) throw new Error(`over by ${MESSAGE.length - MESSAGE_MAX}`);

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  await prisma.$transaction([
    prisma.problem.update({
      where: { id: p.id },
      data: {
        status: "rejected",
        reviewReason: "no-open-question",
        reviewedAt: new Date(),
        reviewMessage: MESSAGE,
      },
    }),
    prisma.problemActivity.create({
      data: {
        problemId: p.id,
        userId: admin.id,
        userName: admin.pseudonym ?? null,
        type: "updated",
        field: "Status",
        oldValue: "pending",
        newValue:
          "rejected (no-open-question): the terminal results are an asymptotic law and a " +
          "fifteen-order expansion of a self-defined quantity, not the answer to a posed " +
          "question. The manuscript never uses the words settle, answer or open problem, and " +
          "declares a conjecture environment it never uses.",
      },
    }),
    ...(p.submittedById
      ? [
          prisma.directMessage.create({
            data: {
              userId: p.submittedById,
              senderId: admin.id,
              senderName: admin.pseudonym ?? null,
              kind: "decision",
              reason: "no-open-question",
              body: MESSAGE,
              problemId: p.id,
            },
          }),
        ]
      : []),
  ]);

  const left = await prisma.problem.count({ where: { status: "pending" } });
  console.log(`APPLIED - ${left} pending`);
}

main().finally(() => prisma.$disconnect());
