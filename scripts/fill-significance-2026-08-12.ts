// Fill the significance fields the 12 Aug morning review batch left empty.
//
// A reader (VibeGene) pointed out that the three entries approved that
// morning - Borsuk N=63, Online Shadow Tomography, Howland-Kato - published
// without a significance value, unlike the sweep-imported entries which all
// carry one. Confirmed by query: they were the only three published entries
// with NULL significance in the catalog. It was an omission in the review
// batch, not policy. Borsuk received its value (30) in the same-day priority
// correction; this fills the other two, against the frozen anchor spine and
// its rule 3 (when torn between two values, take the lower).
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";

const FILLS: {
  slug: string;
  significance: number;
  note: string;
}[] = [
  {
    slug: "a-counterexample-to-the-howland-kato-problem-for-positive-commutators",
    significance: 25,
    note: "A named open problem of Howland and Kato in operator/spectral theory, open since the 1980s and carrying Kato's name, but tracked within one community rather than across mathematics. Placed level with Simon's extendable shellability (25), another decades-old specialist named conjecture settled by counterexample, and below the record instances of household conjectures such as Borsuk N=63 and Hadamard 668 (30). Torn between 25 and 30; rule 3 takes the lower.",
  },
  {
    slug: "online-shadow-tomography-matching-the-classical-bounds",
    significance: 15,
    note: "Closes the gap between online shadow tomography and the classical Adaptive Data Analysis rates, a question from the recent quantum learning-theory literature in Aaronson's shadow-tomography line. A clean resolution of a stated open question, but a young problem tracked by one subfield rather than a long-standing named conjecture: placed with the resolved recent-literature questions around 15, below Oddtown (20). Torn between 15 and 20; rule 3 takes the lower.",
  },
];

const REPLY_TO = "VibeGene";
const REPLY = `Good catch, and you were right that it was an omission, not policy. The morning review batch (yours, Borsuk and Shadow Tomography) edited many fields but never set significance, while the afternoon sweep imports all carried one. I confirmed by query that those three were the only published entries in the whole catalog with the field empty.

All three are now filled, each with a written rationale on the entry: your Howland-Kato entry at 25 (a decades-old named specialist problem, placed level with Simon's extendable shellability and below the record instances of household conjectures), Shadow Tomography at 15 (a clean resolution of a recent-literature question rather than a long-standing named conjecture), and Borsuk N=63 at 30 (set earlier today during its priority correction). Where I was torn between two values I took the lower, which is the site's standing rule.`;

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error(`no admin user for ${ADMIN_EMAIL}`);

  // The reply threads under the Howland-Kato decision, which is the message
  // VibeGene asked the question on.
  const hk = await prisma.problem.findUnique({
    where: { slug: FILLS[0].slug },
  });
  if (!hk?.submittedById) throw new Error("no Howland-Kato submitter");
  const submitter = await prisma.user.findUnique({ where: { id: hk.submittedById } });
  if (submitter?.pseudonym !== REPLY_TO) {
    throw new Error(`submitter is ${submitter?.pseudonym}, expected ${REPLY_TO}`);
  }
  const rootMsg = await prisma.directMessage.findFirst({
    where: { problemId: hk.id, kind: "decision", userId: hk.submittedById },
    orderBy: { createdAt: "desc" },
  });
  if (!rootMsg) throw new Error("no decision message to thread under");

  for (const f of FILLS) {
    const p = await prisma.problem.findUnique({ where: { slug: f.slug } });
    if (!p) throw new Error(`no problem ${f.slug}`);
    console.log(`${f.slug}`);
    console.log(`  significance: ${p.significance ?? "(empty)"} -> ${f.significance}`);
    if (!APPLY) continue;
    await prisma.$transaction([
      prisma.problem.update({
        where: { id: p.id },
        data: { significance: f.significance, significanceNote: f.note },
      }),
      prisma.problemActivity.createMany({
        data: [
          {
            problemId: p.id,
            userId: admin.id,
            userName: admin.pseudonym ?? null,
            type: "updated" as const,
            field: "Significance",
            oldValue: p.significance?.toString() ?? null,
            newValue: f.significance.toString(),
          },
          {
            problemId: p.id,
            userId: admin.id,
            userName: admin.pseudonym ?? null,
            type: "updated" as const,
            field: "Significance note",
            oldValue: p.significanceNote,
            newValue: f.note,
          },
        ],
      }),
    ]);
    console.log("  APPLIED");
  }

  console.log(`\nreply to ${REPLY_TO} (${REPLY.length} chars)`);
  if (APPLY) {
    await prisma.directMessage.create({
      data: {
        userId: hk.submittedById,
        senderId: admin.id,
        senderName: admin.pseudonym ?? null,
        kind: "reply",
        body: REPLY,
        problemId: hk.id,
        parentId: rootMsg.id,
      },
    });
    console.log("reply sent");
    const left = await prisma.problem.count({
      where: { status: "published", significance: null },
    });
    console.log(`published entries still missing significance: ${left}`);
  } else {
    console.log("DRY RUN - pass --apply to write");
  }
}

main().finally(() => prisma.$disconnect());
