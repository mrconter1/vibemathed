// GoldenMongoose827 pointed out that Erdős #424 is also Problem 63 on Ben
// Green's "100 Open Problems", and guessed it might raise the score. It does.
//
// Verified from both ends rather than taken on his word:
//
//   - erdosproblems.com/424 itself closes with "See also Problem 63 of Green's
//     open problems list", linking people.maths.ox.ac.uk/greenbj/papers/open-problems.pdf;
//   - that PDF, Problem 63, reads "Let A be the smallest set containing 2 and 3
//     and such that a1a2-1 in A if a1, a2 in A. Does A have positive density?"
//     - the same question - and Green's own comment links back to
//     erdosproblems.com/424.
//
// The current significance note says "no prize attached and a modest reference
// trail, so it sits at the band's baseline". That was written without this.
// The trail is not modest: Green's list, section E31 of Guy's Unsolved Problems
// in Number Theory, OEIS A005244, a Formal Conjectures entry, two Erdős source
// citations, and Steinerberger's observation that the literal [ErGr80] phrasing
// is trivially false. The scoring prompt names "presence on recognized problem
// lists" as a raising signal, and the Erdős promotion pass is explicitly
// promotion-only on exactly this kind of evidence.
//
// Green's list is also a deliberately curated signal: he writes that he avoided
// both notorious problems and ones that are obviously hopeless, so inclusion
// means a live question someone in the field would actually take on.
//
// 10 -> 13, tying it with Erdős #390, which has a comparable trail (a paper
// devoted to it, Tao's engagement, OEIS, Formal Conjectures). Ties are
// deliberate under the v2 rubric. Still well below Erdős #1196 at 15, which
// sits in a corner of the subject with a literature organized around it.
import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { COMMENT_MAX_LENGTH } from "../src/lib/comments";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "erdos-424";
// The Buffon thread, where he asked. Reused so the answer reaches him.
const THREAD_ROOT = "be9c47d9-002a-453c-a074-9276875da27c";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const EDITS: { field: string; key: string; value: unknown }[] = [
  { field: "Significance", key: "significance", value: 13 },
  {
    field: "Significance note",
    key: "significanceNote",
    value:
      "Promoted from the numbered-Erdos baseline of 10 on a reference trail denser than most: Problem 63 of Ben Green's 100 Open Problems, section E31 of Guy's Unsolved Problems in Number Theory, OEIS A005244, a Formal Conjectures entry, two Erdos source citations, and Steinerberger's observation that the literal 1980 phrasing is trivially false. Green's list is a curated signal rather than a compendium - he says he avoided both notorious problems and ones that look hopeless - so inclusion means a live question. Level with Erdos #390 at 13, below #1196 at 15, which has a literature around it.",
  },
];

const NEW_LINK = {
  label: "Problem 63 of Ben Green's 100 Open Problems",
  url: "https://people.maths.ox.ac.uk/greenbj/papers/open-problems.pdf",
  kind: "problem-record",
};

const COMMENT = `Recording a change to this entry's score, prompted by a reader.

This problem is also Problem 63 on Ben Green's *100 Open Problems*. Both ends check out: erdosproblems.com/424 closes with "See also Problem 63 of Green's open problems list", and Problem 63 of that PDF reads "Let $A$ be the smallest set containing 2 and 3 and such that $a_1a_2-1 \\in A$ if $a_1, a_2 \\in A$. Does $A$ have positive density?" - the same question, with Green's own comment linking back here.

The significance note previously said the reference trail was modest. It is not. Together with section E31 of Guy's *Unsolved Problems in Number Theory*, OEIS A005244, the Formal Conjectures entry and two Erdős source citations, this is a well-attended problem by numbered-Erdős standards, and Green's list is a curated signal rather than a compendium - he writes that he steered clear of both notorious problems and ones that look hopeless.

Significance moves 10 to 13, level with Erdős #390 and below #1196 at 15. The score describes how much mathematics cared about the problem before it was solved, so this is a correction to an under-informed judgment, not a reaction to the solution. Green's list is now linked on the entry.`;

const REPLY = `Checked and applied - #424 is now at 13, up from 10, and Green's list is linked on the entry.

You were right on both counts. erdosproblems.com/424 closes with "See also Problem 63 of Green's open problems list", and Problem 63 in the PDF is verbatim the same question, with Green's comment pointing back at the Erdős page. The old note said the reference trail was modest, which was simply under-informed: Green's list, section E31 of Guy's Unsolved Problems in Number Theory, OEIS A005244, the Formal Conjectures entry, two Erdős citations, and Steinerberger's observation that the literal 1980 phrasing is trivially false. That is a well-attended problem by numbered-Erdős standards.

13 puts it level with Erdős #390 and below #1196 at 15, which has a literature organized around it. The reasoning is on the entry as a comment so the change is on the public record rather than just in your inbox.

Worth saying: significance is the one field readers cannot edit, precisely so nobody can score their own entry - which makes flagging evidence like this the only route in. It worked, so please keep doing it.`;

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error("no admin");

  const p = await prisma.problem.findUnique({ where: { slug: SLUG }, include: { links: true } });
  if (!p) throw new Error(`no entry ${SLUG}`);

  const root = await prisma.directMessage.findUnique({
    where: { id: THREAD_ROOT },
    select: { userId: true, senderId: true },
  });
  if (!root) throw new Error("thread root not found");
  if (root.senderId !== admin.id) throw new Error("thread root was not sent by this admin");

  if (p.links.some((l) => l.url === NEW_LINK.url)) throw new Error("Green link already present");

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
  if (NEW_LINK.label.length > 120) {
    console.log("  link label too long");
    bad++;
  }

  console.log(`${SLUG}: amend (significance)\n`);
  for (const c of changes) {
    const short = (s: string | null) => (s === null ? "(empty)" : s.length > 90 ? `${s.slice(0, 90)}...` : s);
    console.log(`  ${c.field}:\n    - ${short(c.oldValue)}\n    + ${short(c.newValue)}`);
  }
  console.log(`\n  links: ${p.links.length} -> ${p.links.length + 1} (adds Green's list)`);
  console.log(`  comment: ${COMMENT.length}/${COMMENT_MAX_LENGTH}`);
  console.log(`  reply: ${REPLY.length}/${MESSAGE_MAX} to ${root.userId}`);
  if (COMMENT.length > COMMENT_MAX_LENGTH) bad++;
  if (REPLY.length > MESSAGE_MAX) bad++;
  if (bad) throw new Error("fix the flagged fields before applying");

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  await prisma.$transaction([
    prisma.problem.update({
      where: { id: p.id },
      data: { ...data, links: { create: { ...NEW_LINK, position: p.links.length } } },
    }),
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
    prisma.comment.create({
      data: { problemId: p.id, userId: admin.id, userName: admin.pseudonym ?? null, body: COMMENT },
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

  console.log("APPLIED - #424 at 13, Green's list linked, comment and reply posted");
}

main().finally(() => prisma.$disconnect());
