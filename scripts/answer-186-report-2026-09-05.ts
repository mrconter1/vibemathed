// Answers CrimsonManta283's report on the 186 entry, and marks it handled.
//
// The report says: "This should not have been accepted, violates extraordinary
// claim rule for moderation." It is half right, and the half it is right about
// had already been acted on before the reply was written - the record row is
// now a candidate, so the site no longer says 186 is the current bound.
//
// Where the reporter is right: the rule as written waits for "a named expert
// with no stake in it or a formal proof", and neither holds. Nobody
// disinterested has assessed it, and the Lean development is conditional on
// three project axioms, which is why the entry is lean-CHECKED rather than
// lean-verified. When the original hold was reversed, that reversal fixed a
// false premise of mine - I had said the paper did not exist, and it did -
// and then treated fixing it as sufficient, without re-asking whether the
// rule still applied on its own terms.
//
// Where the entry stays: the rule's target is a claim that RESOLVES something
// famous. This is a record improvement on a famous problem, which the site
// publishes routinely at Unreviewed - Stadlmann's 240 would not be held, and
// nor would the matrix multiplication exponent or the elliptic curve ranks.
// The overreach was not the entry; it was the frontier claim.
//
// Uses handleReport so the report leaves the queue and the badge count, and
// the reply lands in the reporter's inbox.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ENTRY = "prime-gaps-at-most-186";

const REPLY = `Thank you - this was a good report and it changed something.

You are right on the point that matters. The rule waits for "a named expert with no stake in it or a formal proof", and neither holds. I spent this morning looking: nobody outside OpenAI has assessed this - not Tao, Green, Maynard, Stadlmann or Bloom. The Hacker News thread is eleven comments, none mathematical. The announcement came from an author who writes "our model". And erdosproblems.com, which recorded the earlier GPT 5.6 Pro prime-gap improvement within days, has recorded neither this nor OpenAI's long-gaps result.

How it got published matters to your report, so: I held it originally, and one of my stated reasons was false - I wrote that the paper "exists nowhere I can find", and it was on the OpenAI CDN at the sibling URL of a PDF this site had verified hours earlier. Correcting that was right. What I then did wrong was treat "my reason was false" as "therefore publish", without re-asking whether the rule still applied on its own terms. It did, and you caught it.

What changed: this bound is no longer presented as the current record. On the new Records page for bounded gaps it is drawn as a candidate - shown, dated, never the frontier - and the current best reads 212, which is what the field says it is.

What did not change, and why: the entry stays published at Unreviewed. The rule's target is a claim that resolves something famous, and this is a record improvement on a famous problem - the site publishes those routinely at that tier, and Stadlmann's 240 would not be held either. What was wrong was not cataloguing the claim; it was letting our own page assert it as the record when nobody outside the vendor had.

If you think that line is in the wrong place, I would like to hear it - here or on the entry's discussion. The checklist gained a rule yesterday because of a different mistake of mine, and it can gain another.`;

async function main() {
  const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>("SELECT current_database() AS db");
  console.log(`database: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`);

  const report = await prisma.problemReport.findFirst({
    where: { status: "open", problem: { slug: ENTRY } },
    select: {
      id: true,
      body: true,
      userId: true,
      createdAt: true,
      user: { select: { pseudonym: true } },
    },
  });
  if (!report) throw new Error(`no open report on ${ENTRY} in ${db}`);

  console.log(`report  : ${report.id}`);
  console.log(`from    : ${report.user?.pseudonym ?? "(deleted account)"}`);
  console.log(`at      : ${report.createdAt.toISOString().slice(0, 16)}`);
  console.log(`said    : ${report.body.slice(0, 120)}`);
  console.log(`reply   : ${REPLY.length}/${MESSAGE_MAX}${REPLY.length > MESSAGE_MAX ? "  OVER" : ""}`);
  if (REPLY.length > MESSAGE_MAX) throw new Error("reply too long");
  if (!report.userId) console.log("NOTE     : anonymous reporter - the report will be marked handled with no reply delivered");

  if (!APPLY) {
    console.log("\n--- reply ---\n");
    console.log(REPLY);
    console.log("\nDRY RUN - pass --apply to send and mark handled");
    return;
  }

  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });
  if (!curator) throw new Error("curator not found on this database");

  // `select` is not decoration: an unconstrained update RETURNS every scalar
  // column, and production does not yet have ProblemReport.recordId, which
  // this branch's generated client knows about. Third time this drift has
  // bitten a script today; it goes away when PR #22 merges and the schema
  // catches up.
  await prisma.problemReport.update({
    where: { id: report.id },
    data: { status: "handled", handledAt: new Date() },
    select: { id: true },
  });
  if (report.userId) {
    const p = await prisma.problem.findUnique({ where: { slug: ENTRY }, select: { id: true } });
    await prisma.directMessage.create({
      data: {
        userId: report.userId,
        senderId: curator.id,
        senderName: curator.pseudonym,
        kind: "report",
        body: REPLY.slice(0, MESSAGE_MAX),
        problemId: p?.id ?? null,
      },
    });
  }
  console.log("\nAPPLIED - report handled and reply sent");
}

main().finally(() => prisma.$disconnect());
