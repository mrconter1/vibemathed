// A correction to the hold message sent on the percolation entry.
//
// The entry stays held - that part was right, and Gil Kalai's own post
// reports the claim rather than vouching for it. What was wrong is a sentence
// in the message the submitter received:
//
//   "The work has been withdrawn from the repository it was published in."
//
// It was never in that repository. Commit 795efb8 belongs to pull request #22
// of anthropics/formal-math, titled "wip: scaffold" with the body
// "placeholder", opened 28 August at 14:56 and closed just over five hours
// later without being merged. Its branch is deleted, and the default branch
// has never carried a commit touching that directory. Not retracted, then,
// but never published there.
//
// The second correction is in the submitter's favour: their verification note
// said "no sorry outside the two deliberate placeholders in Challenge.lean",
// and I read that as conceding gaps. In that repository Challenge.lean is the
// trusted statement file and its theorems are sorry-proved by design - the
// sibling zeta23 project has 27 such placeholders and its own AUDIT.md tells
// the reader to expect exactly them. They were describing a clean audit.
//
// Sends a message; changes no fields. The entry remains rejected/held.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const SLUG = "theta-p-c-0-for-bernoulli-bond-percolation-on-z-d-in-all-dimensions-d-2";

const MESSAGE = `A correction to the message I sent you on this, and a note on what has changed since.

First, the thing I got wrong. I wrote that the work "has been withdrawn from the repository it was published in". It was never in it. Commit 795efb8 comes from pull request #22 of anthropics/formal-math, titled "wip: scaffold" with the body "placeholder", opened 28 August and closed unmerged five hours later. Its branch is deleted and the default branch has never carried a commit touching that directory. Not retracted, then, but never published there. That cuts the same way, but it is not what I said, and what I said was false.

Second, something I got wrong in your favour. I read your note about "no sorry outside the two deliberate placeholders in Challenge.lean" as conceding gaps. In that repository Challenge.lean is the trusted statement file and its theorems are sorry-proved by design; the sibling zeta23 project has 27 such placeholders and its AUDIT.md tells the reader to expect exactly them. You were describing a clean audit. I withdraw the point.

What has changed: Gil Kalai blogged about this on 3 September and Wikipedia now mentions it. But read what he writes: a Claude document with a Lean verification "claims" a positive solution. He reports it; he does not say he checked it. His own links to percolation/README.md and summary.pdf 404 for the same reason yours does.

So the hold stands, on the reason that was always the real one: no stable public artefact, and no named probabilist saying they have read it. Neither is about you. If the work reappears at a public home, or Kalai or anyone comparable says they have read it, resubmit and it goes up at whatever tier it has earned.

The remaining point is unchanged: the problem is classical, not posed by Justin Leder.

This is the second correction today for the same class of mistake: saying something did not exist when I meant I could not find it. The reviewing checklist now has a rule about it.`;

async function main() {
  const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>("SELECT current_database() AS db");
  console.log(`database: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`);

  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });

  const p = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: {
      id: true,
      status: true,
      reviewReason: true,
      submittedById: true,
      submittedBy: { select: { pseudonym: true } },
    },
  });
  if (!p) throw new Error(`entry not found on ${db}: ${SLUG}`);
  if (!p.submittedById) throw new Error("no submitter to write to");

  console.log(`entry    : ${SLUG}`);
  console.log(`status   : ${p.status} / ${p.reviewReason}  (unchanged by this script)`);
  console.log(`to       : ${p.submittedBy?.pseudonym ?? "(unknown)"}`);
  console.log(`message  : ${MESSAGE.length}/${MESSAGE_MAX}${MESSAGE.length > MESSAGE_MAX ? "  OVER" : ""}`);
  if (MESSAGE.length > MESSAGE_MAX) throw new Error("message too long");

  if (!APPLY) {
    console.log("\n--- message ---\n");
    console.log(MESSAGE);
    console.log("\nDRY RUN - pass --apply to send");
    return;
  }
  if (!curator) throw new Error("curator not found on this database");

  await prisma.directMessage.create({
    data: {
      userId: p.submittedById,
      senderId: curator.id,
      senderName: curator.pseudonym,
      kind: "decision",
      reason: "held",
      body: MESSAGE,
      problemId: p.id,
    },
  });
  console.log("\nSENT");
}

main().finally(() => prisma.$disconnect());
