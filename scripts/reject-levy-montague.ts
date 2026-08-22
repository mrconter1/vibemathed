// Reject the Lévy-Montague conservativity submission on scope.
//
// Not a quality judgement and not an AI judgement. The disclosure is one of
// the best the queue has seen - a full paragraph on how the collaboration
// actually ran, with the model proposing constructions and the author
// supplying direction. ai-co-developed would have been right.
//
// It fails the inclusion test, which is a precisely stated open question whose
// answer is now a proved or disproved theorem. This paper answers no posed
// question. Its own introduction says the investigation started somewhere
// else: "The starting problem for the AI-driven investigation was to calibrate
// the strength of the collection scheme over theories like RCA_0 and WKL_0",
// and the author writes that he "was not at all expecting a principle like
// that to be conservative". The submitter half-knew - posedBy arrived as the
// literal string "-" because there was no proposer to name.
//
// Reason code no-open-question, which exists for exactly this.
//
// Dry run by default. Pass --apply to write.
import { PrismaClient } from "@prisma/client";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "levy-montague-reflection-is-pi-1-1-conservative-over-mathsf-wkl-0";
const REASON = "no-open-question";

const MESSAGE = `Turning this one down, and I want to be clear it is not about the quality of the paper or the AI disclosure - the disclosure is among the best I have read here. The paragraph on the collaboration with Fable 5 says exactly what the model did and what the author did, which is more than most published statements manage.

It is a scope decision. The inclusion test is a precisely stated open question whose answer is now a proved or disproved theorem. Pakhomov's paper answers no posed question. Its introduction says the investigation began elsewhere - "the starting problem for the AI-driven investigation was to calibrate the strength of the collection scheme over theories like RCA_0 and WKL_0" - and he writes that he was not at all expecting a principle like that to be conservative. The conservation theorem is a discovery rather than a resolution.

I think you sensed this: posedBy arrived as "-" and the year was blank, because there was nobody to name.

The distinction matters more than one entry. If a new theorem with good AI provenance qualifies, the record becomes a list of AI-assisted mathematics papers, which is a much larger and much less interesting thing than a list of problems that stood open and fell. That is the site's whole point, and a paper this good is a better reason to hold the line than to bend it.

Two things that would change my mind. If someone had asked in print whether a reflection scheme of this shape is conservative over WKL_0, that is the entry, and I would take it with the citation. And if a later paper uses this to settle a question someone did pose - the Feferman formalization avenue the abstract mentions looks like a candidate - send that one.`;

async function main() {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true, name: true, submittedById: true },
  });
  if (!cur) throw new Error("submission not found");
  if (cur.status !== "pending") throw new Error(`status is ${cur.status}`);

  const submitter = cur.submittedById
    ? await prisma.user.findUnique({ where: { id: cur.submittedById }, select: { pseudonym: true } })
    : null;
  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });
  if (!curator) throw new Error("curator not found");

  console.log(`${SLUG}`);
  console.log(`  ${cur.name}`);
  console.log(`  submitter: ${submitter?.pseudonym ?? "(none)"}`);
  console.log(`  reason   : ${REASON}`);
  console.log(`  message  : ${MESSAGE.length}/${MESSAGE_MAX} chars`);
  if (MESSAGE.length > MESSAGE_MAX) throw new Error(`over by ${MESSAGE.length - MESSAGE_MAX}`);

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  await prisma.$transaction([
    prisma.problem.update({
      where: { id: cur.id },
      data: {
        status: "rejected",
        reviewedAt: new Date(),
        reviewMessage: MESSAGE,
        reviewReason: REASON,
      },
    }),
    prisma.problemActivity.create({
      data: { problemId: cur.id, userId: curator.id, userName: curator.pseudonym, type: "rejected" },
    }),
    prisma.directMessage.create({
      data: {
        userId: cur.submittedById!,
        senderId: curator.id,
        senderName: curator.pseudonym,
        kind: "decision",
        reason: REASON,
        body: MESSAGE,
        problemId: cur.id,
      },
    }),
  ]);
  console.log("\nREJECTED");
}

main().finally(() => prisma.$disconnect());
