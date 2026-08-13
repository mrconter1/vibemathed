// Unpublish the M23 entry for failing the inclusion test. 13 Aug 2026.
//
// A reader (StormyBeetle822) commented that including this entry is
// dishonest. Reading the paper's acknowledgement back, they are right, and
// the mistake was made here at review rather than by the submitter.
//
// The acknowledgement says, in full: the authors used Claude Fable 5, Claude
// Opus 4.8 and ChatGPT 5.6 Sol "for searching the literature, code
// generation, testing hypotheses, ruling out other approaches, devising
// computational strategies, checking our results, and proofreading our
// manuscript"; that "No text in this article was written by AI"; and that
// "Our final results were verified in Magma and PARI/GP without the use of
// AI". No mathematical step is credited to a model anywhere in the paper.
//
// The site's inclusion test asks for "an AI model substantively in the loop",
// and the bottom tier, ai-assisted, asks for work "the authors call material
// to the result". These authors call it tooling and say the result was
// verified without it. That is below the bottom tier, which the methodology
// says is out of scope - so the entry goes, with the reason already used for
// four other rejections.
//
// This entry was the worst case rather than the only one, and it is the most
// prominent: significance 55, five upvotes, a celebrated result. Pulling it
// while leaving similar entries up would be reacting to the complaint rather
// than applying the rule, so the other nine tooling-flavoured entries are
// audited separately.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "the-mathieu-group-m23-as-a-galois-group-over-q";
const COMMENTER = "StormyBeetle822";

/// To the submitter, who did nothing wrong.
const TO_SUBMITTER = `Your M23 entry has been unpublished, and I want to be clear that the error was mine, not yours.

Your submission was accurate. You classified it ai-assisted, which was the most conservative tier available, and every fact you gave checked out against the paper - I said so when I approved it. What I failed to do was ask the prior question: whether the disclosure clears the inclusion bar at all.

Reading it back, it does not. The acknowledgement lists the models under "searching the literature, code generation, testing hypotheses, ruling out other approaches, devising computational strategies, checking our results, and proofreading our manuscript", then says "No text in this article was written by AI" and "Our final results were verified in Magma and PARI/GP without the use of AI". No mathematical step is credited to a model anywhere in the paper. The site's test is an AI model substantively in the loop, and the bottom tier asks for work the authors themselves call material to the result. These authors call it tooling and say the result was checked without it.

A reader pointed this out in a comment and they were right. The entry being one of the most prominent in the catalog - the last sporadic group over Q, 37 years open - is exactly why it needed the stricter reading, not a looser one. An entry like that trading on the paper's fame while the AI claim is the thinnest in the catalog is the failure mode the inclusion test exists to prevent.

Your record is unaffected: this counts as a review error here, not a bad submission. Nine other published entries have similarly tooling-shaped disclosures and are being read against the same bar now, so this is not a rule invented for your entry. Please do keep submitting.`;

/// To the reader who raised it.
const TO_COMMENTER = `You were right, and the entry has been unpublished.

I went back to the paper's acknowledgement. It credits Claude Fable 5, Claude Opus 4.8 and ChatGPT 5.6 Sol with "searching the literature, code generation, testing hypotheses, ruling out other approaches, devising computational strategies, checking our results, and proofreading our manuscript", and then says two things that settle it: "No text in this article was written by AI" and "Our final results were verified in Magma and PARI/GP without the use of AI". No mathematical step is credited to a model anywhere in it.

The site's inclusion test asks for an AI model substantively in the loop, and the lowest tier asks for work the authors themselves call material to the result. These authors call it tooling. That is below the bottom tier, which the methodology already says is out of scope - so the entry failed a rule that existed, and I applied it wrongly at review. The submitter is not at fault; they classified it at the most conservative tier and disclosed accurately.

It was also the worst case to get wrong, being one of the most prominent entries here, which is your point about dishonesty and I am not going to argue with it.

One thing I would rather do than just fix the single entry you found: nine other published entries have similarly tooling-shaped disclosures, and they are being read against the same bar now. If you spot others, the report button and comments both reach me, and this is the kind of correction the catalog needs more of.`;

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error(`no admin user for ${ADMIN_EMAIL}`);

  const p = await prisma.problem.findUnique({ where: { slug: SLUG } });
  if (!p) throw new Error(`no entry ${SLUG}`);
  if (p.status !== "published") throw new Error(`${SLUG} is ${p.status}, not published`);

  const commenter = await prisma.user.findFirst({ where: { pseudonym: COMMENTER } });
  if (!commenter) throw new Error(`no user ${COMMENTER}`);

  for (const [who, body] of [
    ["submitter", TO_SUBMITTER],
    ["commenter", TO_COMMENTER],
  ] as const) {
    console.log(`  message to ${who}: ${body.length} chars (max ${MESSAGE_MAX})`);
    if (body.length > MESSAGE_MAX) throw new Error(`over by ${body.length - MESSAGE_MAX}`);
  }

  console.log(`\n${SLUG}`);
  console.log(`  status:       published -> rejected`);
  console.log(`  reviewReason: ${p.reviewReason} -> no-ai-contribution`);
  console.log(`  significance ${p.significance}, +${p.upvotes}/-${p.downvotes}`);
  console.log(`  submitter:    ${p.submittedById}`);
  console.log(`  commenter:    ${commenter.pseudonym} (${commenter.id})`);

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  await prisma.$transaction([
    prisma.problem.update({
      where: { id: p.id },
      data: {
        status: "rejected",
        reviewReason: "no-ai-contribution",
        reviewedAt: new Date(),
        reviewMessage: TO_SUBMITTER,
      },
    }),
    prisma.problemActivity.create({
      data: {
        problemId: p.id,
        userId: admin.id,
        userName: admin.pseudonym ?? null,
        type: "updated",
        field: "Status",
        oldValue: "published",
        newValue:
          "rejected (no-ai-contribution): the acknowledgement credits the models with tooling only, " +
          "states no text was AI-written, and reports the final results were verified without AI, " +
          "so no mathematical step is credited to a model. Below the ai-assisted tier, hence out of scope.",
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
              reason: "no-ai-contribution",
              body: TO_SUBMITTER,
              problemId: p.id,
            },
          }),
        ]
      : []),
    prisma.directMessage.create({
      data: {
        userId: commenter.id,
        senderId: admin.id,
        senderName: admin.pseudonym ?? null,
        kind: "reply",
        body: TO_COMMENTER,
        problemId: p.id,
      },
    }),
  ]);

  const published = await prisma.problem.count({ where: { status: "published" } });
  console.log(`APPLIED - ${published} published`);
}

main().finally(() => prisma.$disconnect());
