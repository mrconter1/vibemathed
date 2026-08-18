// GoldenMongoose827 answered the question the review asked.
//
// The review dropped the Buffon entry to AI-assisted because the paper's
// acknowledgement names no mathematical step as the model's - it credits
// GPT-5.5 with "the detailed computations and preparing an initial draft" and
// reserves the proof idea and direction for the author - and the methodology
// says a disclosure that names no step gets the lower tier. The message closed
// with "If specific lemmas were GPT's, say which and I will move it up."
//
// He did, in the thread:
//
//   "I told GPT that the ABN bound and Schmidt's rectangle discrepancy bound
//    likely could be applied in the weighted fashions used in the paper, but
//    all the real technical work was done by GPT afterwards making these
//    intuitions actually work."
//
// That is the co-developed definition almost verbatim: subproblems the author
// formulated and the model solved. The two weighted adaptations are named
// theorems in the paper - the weighted Schmidt rectangle lower bound and the
// support form of Aistleitner-Bilyk-Nikolov, together with the Koksma-Hlawka
// and Hardy-Krause variation machinery that makes the chord-length function
// usable. So the axis goes back to AI co-developed and aiRole records the
// sharper account rather than the acknowledgement's vaguer one.
//
// Nothing else moves. Partial still stands: it is about what the theorems
// settle, not about who proved them, and he agreed with the o(log L)
// correction in the same message.
import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "polylogarithmic-full-chord-buffon-discrepancy";
const THREAD_ROOT = "be9c47d9-002a-453c-a074-9276875da27c";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const EDITS: { field: string; key: string; value: unknown }[] = [
  { field: "How much the AI did", key: "aiContribution", value: "ai-co-developed" },
  {
    field: "What the AI did",
    key: "aiRole",
    value:
      "The published acknowledgement credits GPT-5.5 with \"assistance in performing the detailed computations and preparing an initial draft of this preprint\", and reserves the proof idea and the direction of the argument for the author.\n\nThe author sharpened that for this record after review. He told the model that the Aistleitner-Bilyk-Nikolov star-discrepancy bound and Schmidt's rectangle lower bound could likely be applied in the weighted forms the paper needs, and the model did the technical work of making those intuitions work. Those weighted adaptations are named results in the note - the support form of Aistleitner-Bilyk-Nikolov, the weighted Schmidt rectangle lower bound, and the Hardy-Krause variation bound on the chord-length function that lets Koksma-Hlawka control the length. The strategy is the author's, the machinery that realizes it is the model's, which is what this site means by co-developed.",
  },
];

const REPLY = `Moved back to AI co-developed - thank you, that is exactly the disclosure the tier needs.

The reason it dropped in the first place is that the acknowledgement names no mathematical step as GPT's; it credits detailed computations and a draft, and reserves the proof idea and direction for you. The rule here is that a disclosure naming no step gets the lower tier, precisely so that "assisted with computations" cannot quietly become "co-developed" by generous reading. What you have now described is different in kind: you formulated two subproblems - make ABN and Schmidt work in the weighted forms the argument needs - and the model solved them. Those are named results in the note (the ABN support form, the weighted Schmidt rectangle bound, and the Hardy-Krause bound on the chord-length function that lets Koksma-Hlawka control the length), so the entry can say which steps were the model's rather than gesturing. The role field now records your account alongside the published one.

Partial does not move with it. That axis is about what the theorems settle - question 3 yes, question 1 untouched, and the order pinned only between log L and (log L)^(3/2) - not about who proved them.

On editing: any signed-in reader can edit a published entry directly. Open the entry and click the pencil icon in the top corner - it opens a form, and your change goes straight into the changelog under your pseudonym, with no review queue. Result, significance, the Erdos number and the slug are curator-only; everything else, verification tier included, is yours to correct. So the note about Ben Green's list is yours to add to #424 whenever you like - but I am looking at it now anyway, and will come back to you on the significance in that entry's thread.`;

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error("no admin");

  const p = await prisma.problem.findUnique({ where: { slug: SLUG } });
  if (!p) throw new Error(`no entry ${SLUG}`);

  const root = await prisma.directMessage.findUnique({
    where: { id: THREAD_ROOT },
    select: { userId: true, senderId: true, problemId: true },
  });
  if (!root) throw new Error("thread root not found");
  if (root.problemId !== p.id) throw new Error("thread root belongs to a different entry");
  if (root.senderId !== admin.id) throw new Error("thread root was not sent by this admin");

  const row = p as unknown as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  const changes: { field: string; oldValue: string | null; newValue: string | null }[] = [];
  const fmt = (v: unknown) => (v === null || v === undefined ? null : String(v));

  let bad = 0;
  for (const e of EDITS) {
    const lim = LIMITS.get(e.key);
    if (lim && typeof e.value === "string" && e.value.length > lim) {
      console.log(`  ${e.key} OVER BY ${e.value.length - lim} (${e.value.length}/${lim})`);
      bad++;
    }
    if (fmt(row[e.key]) === fmt(e.value)) continue;
    data[e.key] = e.value;
    changes.push({ field: e.field, oldValue: fmt(row[e.key]), newValue: fmt(e.value) });
  }

  console.log(`${SLUG}: amend (AI axis)\n`);
  for (const c of changes) {
    const short = (s: string | null) => (s === null ? "(empty)" : s.length > 90 ? `${s.slice(0, 90)}...` : s);
    console.log(`  ${c.field}:\n    - ${short(c.oldValue)}\n    + ${short(c.newValue)}`);
  }
  console.log(`\n  unchanged: resolution=${p.resolution}, verification=${p.verification}, significance=${p.significance}`);
  console.log(`  reply: ${REPLY.length}/${MESSAGE_MAX} to ${root.userId}`);
  if (REPLY.length > MESSAGE_MAX) bad++;
  if (bad) throw new Error("fix the flagged fields before applying");

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  await prisma.$transaction([
    prisma.problem.update({ where: { id: p.id }, data }),
    prisma.problemActivity.createMany({
      data: changes.map((c) => ({
        problemId: p.id,
        userId: admin.id,
        userName: admin.pseudonym ?? null,
        type: "updated" as const,
        field: c.field,
        oldValue: c.oldValue,
        newValue: c.newValue,
      })),
    }),
    prisma.directMessage.create({
      data: {
        userId: root.userId,
        senderId: admin.id,
        senderName: admin.pseudonym ?? null,
        kind: "reply",
        parentId: THREAD_ROOT,
        body: REPLY,
        problemId: p.id,
      },
    }),
  ]);

  console.log("APPLIED - axis restored to ai-co-developed, reply posted");
}

main().finally(() => prisma.$disconnect());
