// Reject the M23 resubmission. 28 Aug 2026.
//
// HISTORY. This entry was published, then unpublished on 27 August after a
// reader comment, on the ground that the paper's disclosure is tooling-shaped:
// the models are credited with "searching the literature, code generation,
// testing hypotheses, ruling out other approaches, devising computational
// strategies, checking our results, and proofreading", followed by "No text in
// this article was written by AI" and "Our final results were verified in Magma
// and PARI/GP without the use of AI". No mathematical step is credited to a
// model. That decision also said nine other entries with similarly shaped
// disclosures were being read against the same bar, so it was not a rule
// invented for this entry.
//
// WHAT IS NEW. Resubmitted from szhang7@caltech.edu, an address matching the
// paper's sixth author, with one genuinely new artifact: Shaowu Zhang's
// reflection "Where to Point the Telescope: AI, Mathematical Judgment, and M23"
// (shaowuzhang.com/files/how-we-found-m23.pdf, adapted from a Zulip answer).
// That is exactly the kind of evidence that could have overturned the earlier
// call, so I read the whole thing rather than skimming for a verdict.
//
// IT POINTS THE OTHER WAY. The reflection does not credit a mathematical step to
// a model. It repeatedly credits them to the humans, and twice records the model
// being overruled at the decisive junctures:
//
//   "Our first attempt used triangle-group coordinates directly. We tried 40, 60,
//    and then 90 digits of precision. ... The AI systems suggested pushing the
//    precision higher. At that point, however, our computational resources were
//    already limited, so we stopped and asked whether the real problem was our
//    choice of coordinates."
//   "We then realized that coordinates defined using the Belyi map are equivariant
//    under the Galois action."                            <- the decisive insight
//   "The initial AI suggestion was again to increase the precision. Instead, we
//    developed a separate reduction algorithm and recovered Q from the same
//    40-digit data."
//   "Some of the most important decisions were clearly mathematical judgments made
//    by the human collaborators."
//   "We also tried more autonomous approaches at the beginning of the project. ...
//    these attempts did not make meaningful progress and did not give us much
//    guidance about what to try next."
//   "AI gave us a powerful and precise telescope, but the team's mathematical
//    knowledge told us where to point it, when further magnification would not
//    help and how to interpret what came into view."
//   "The final mathematical claims were verified rigorously in Magma and PARI/GP
//    without AI."
//
// So the new document corroborates the acknowledgement rather than supplementing
// it, and adds that the two turning points went against the model's advice. The
// bottom tier here, ai-assisted, asks for work "the authors call material to the
// result"; these authors call it acceleration and name the mathematics as theirs.
// Rejecting again is the consistent call, and the evidence for it is now better
// than it was yesterday.
//
// NOT AT ISSUE: the mathematics, the submission's accuracy, or the authors'
// candour. The submitted aiRole is an honest paraphrase of both sources and
// claims nothing the artifacts do not say. This is a scope decision about the
// site's bar, on a genuinely famous result - 37 years, the last sporadic group
// over Q - which is the reason to apply the bar strictly rather than loosely.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "the-mathieu-group-m-23-is-a-galois-group-over-mathbb-q";

const DECISION = `Turning this down again, with reasoning rather than a pointer to the earlier decision.

The reflection you linked, "Where to Point the Telescope", is new evidence and exactly the kind that could have changed the call, so I read it all. It moved me the other way.

It credits no mathematical step to a model. It credits them to the team, and twice records the model overruled at the turning points. On the coordinates: "The AI systems suggested pushing the precision higher... we stopped and asked whether the real problem was our choice of coordinates" - then "We then realized that coordinates defined using the Belyi map are equivariant under the Galois action", the insight it all turns on. On the cubic: "The initial AI suggestion was again to increase the precision. Instead, we developed a separate reduction algorithm." It adds that the most important decisions "were clearly mathematical judgments made by the human collaborators", that the autonomous attempts "did not make meaningful progress", and that the claims were verified in Magma and PARI/GP without AI.

The telescope line is the honest summary and why this falls outside. A telescope is instrumentation, however good, and the account is explicit that the team's mathematics chose where to aim it. Our lowest tier asks for work the authors call material to the result; this calls it acceleration and names the mathematics as the humans'.

None of that criticises the paper or your submission, which claims nothing the sources do not say. It is a famous result, and that is why the bar gets read strictly: this would otherwise headline the catalog on its thinnest AI claim.

What would change it: any statement from the team crediting a specific mathematical step to a model - a construction, a lemma, the coordinate change, a case ruled out on its own reasoning. Send that and I will look again the same day.

Thank you for the reflection either way. It is a better account of working with these systems than most papers manage.`;

async function main() {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true, submittedById: true },
  });
  if (!cur) throw new Error("submission not found");
  if (cur.status !== "pending") throw new Error(`status is ${cur.status}`);

  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });
  if (!curator) throw new Error("curator not found");

  console.log(`  decision: ${DECISION.length}/${MESSAGE_MAX}`);
  if (DECISION.length > MESSAGE_MAX) throw new Error(`OVER BY ${DECISION.length - MESSAGE_MAX}`);

  console.log(`\n${SLUG}`);
  console.log(`  status : ${cur.status} -> rejected`);
  console.log(`  reason : no-ai-contribution`);

  if (!APPLY) { console.log("\nDRY RUN - pass --apply to write"); return; }

  await prisma.$transaction([
    prisma.problem.update({
      where: { id: cur.id },
      data: {
        status: "rejected", reviewedAt: new Date(),
        reviewMessage: DECISION, reviewReason: "no-ai-contribution",
      } as never,
    }),
    prisma.directMessage.create({
      data: {
        userId: cur.submittedById!, senderId: curator.id, senderName: curator.pseudonym,
        kind: "decision", reason: "no-ai-contribution", body: DECISION, problemId: cur.id,
      },
    }),
  ]);
  console.log("\nREJECTED, decision sent");
}

main().finally(() => prisma.$disconnect());
