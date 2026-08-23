// Frame both fast-dynamo entries as variant cases of Arnold's general
// problem, 23 Aug 2026.
//
// Reported by VibeGene when submitting the second one: the two entries are
// different variant cases of one general problem that is still open, and
// each ought to say so on its own page rather than only in the relation
// between them.
//
// What was already right: both carry resolution "variant", both statements
// end by saying Arnold's smooth autonomous problem on T^3 remains open, and
// the `related` row between them (written when the second was published)
// spells out the complementarity. getRelations reads both directions, so
// that row renders on both pages.
//
// What was missing is the field a reader actually reads for the verdict.
// "What was actually shown" said, on the older entry, only "Lipschitz
// velocity; the smooth autonomous fast-dynamo conjecture on T^3 remains
// open" - true but too terse to place the result - and on the newer entry
// described the construction without mentioning Arnold at all. It is also
// the field that appears on the list card, so it is where a reader meets
// either entry first.
//
// Both notes now do the same three things in the same order: name Arnold's
// general problem and its three hypotheses (smooth, autonomous,
// deterministic, on T^3, fixed independently of the diffusivity), say which
// one THIS paper relaxes, and point at the sibling as the entry that relaxes
// the other. Neither paper's mathematics is restated or reinterpreted.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) {
  if (s.maxLength) LIMITS.set(s.key, s.maxLength);
}

const NIEBEL = "autonomous-lipschitz-fast-dynamo-on-the-three-torus";
const ROWAN = "smooth-random-fast-dynamo-on-the-three-torus";

const EDITS: { slug: string; resultNote: string; message: string }[] = [
  {
    slug: NIEBEL,
    resultNote:
      "One variant case of Arnold's 1994 fast-dynamo problem, not the problem itself. Arnold asks for a single velocity field on T^3 that is smooth, divergence-free, autonomous and deterministic, fixed independently of the magnetic diffusivity, and that grows the magnetic field exponentially at every small enough diffusivity. The field constructed here is all of that except smooth: it is Lipschitz, not C^1. The sibling entry on this site relaxes the opposite hypothesis, keeping a smooth field but making it random and time-dependent. Neither settles Arnold's problem as posed, which remains open.",
    message: `Small edit to your Autonomous Lipschitz Fast Dynamo entry, for framing rather than content.

A second fast-dynamo entry was published yesterday: Rowan's smooth random construction, which keeps C-infinity but gives up autonomy and determinism - the mirror image of the trade Niebel makes. The two are now cross-linked, and the submitter's point was that each entry should say on its own page that it settles one variant case of Arnold's general problem while the problem as posed stays open.

So "What was actually shown" on your entry now spells out Arnold's hypotheses, says which one this paper relaxes, and points at the sibling. Nothing about the mathematics, the resolution or the verification changed - it was already filed as a variant, and your original note said the smooth autonomous conjecture remains open. This just makes that legible to someone meeting the entry on the front page.`,
  },
  {
    slug: ROWAN,
    resultNote:
      "Constructed an explicit class of smooth random, time-dependent incompressible velocity fields on T^3, obtained by alternating smooth shear flows with iid random phases on finite time blocks. For every fixed sufficiently small resistivity, the magnetic field has an almost-sure exponential growth rate at least 1/2, together with a time-uniform lower bound whose random prefactor has a resistivity-uniform inverse-moment estimate. This is one variant case of Arnold's 1994 fast-dynamo problem, not the problem itself: Arnold asks for a field that is smooth, autonomous and deterministic all at once, and this one keeps the smoothness while giving up the other two. The sibling entry on this site relaxes the opposite hypothesis, keeping an autonomous deterministic field at Lipschitz regularity. Neither settles Arnold's problem as posed, which remains open.",
    message: `Done, and thank you - you were right that the relation between the two dynamo entries was doing work that each entry should do for itself.

Both "What was actually shown" notes now name Arnold's general problem and its three hypotheses, say which one that paper relaxes, and point at the other entry as the one relaxing the opposite hypothesis. Your entry keeps its construction description in full; the framing is appended to it. Niebel's entry got the same treatment.

The cross-link itself was already there in both directions, with a note calling them complementary halves. What it could not do was tell a reader arriving from the front page, where the result note is the only prose on the card, that they were looking at one of two variants rather than at the problem.`,
  },
];

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error(`no admin user for ${ADMIN_EMAIL}`);

  const limit = LIMITS.get("resultNote")!;
  let bad = 0;
  const planned: {
    id: string;
    slug: string;
    submittedById: string | null;
    oldValue: string | null;
    newValue: string;
    message: string;
  }[] = [];

  for (const e of EDITS) {
    const p = await prisma.problem.findUnique({
      where: { slug: e.slug },
      select: { id: true, status: true, resolution: true, resultNote: true, submittedById: true },
    });
    if (!p) throw new Error(`no problem ${e.slug}`);
    if (p.status !== "published") throw new Error(`${e.slug} is ${p.status}`);
    // The framing claims the entry is a variant case; if the axis ever said
    // otherwise the note would be contradicting the pill beside it.
    if (p.resolution !== "variant") throw new Error(`${e.slug} is resolution ${p.resolution}`);

    console.log(`${e.slug}`);
    console.log(`  resultNote ${e.resultNote.length}/${limit} chars`);
    if (e.resultNote.length > limit) {
      console.log(`  OVER BY ${e.resultNote.length - limit}`);
      bad++;
    }
    console.log(`  message ${e.message.length}/${MESSAGE_MAX} chars`);
    if (e.message.length > MESSAGE_MAX) bad++;
    console.log(`  - ${p.resultNote ?? "(empty)"}`);
    console.log(`  + ${e.resultNote}`);
    console.log(`  submitter: ${p.submittedById ?? "(none - curated)"}\n`);

    if (p.resultNote === e.resultNote) {
      console.log("  no change; skipping\n");
      continue;
    }
    planned.push({
      id: p.id,
      slug: e.slug,
      submittedById: p.submittedById,
      oldValue: p.resultNote,
      newValue: e.resultNote,
      message: e.message,
    });
  }

  if (bad) throw new Error("fix the flagged fields before applying");
  if (!APPLY) {
    console.log("DRY RUN - pass --apply to write");
    return;
  }

  await prisma.$transaction([
    ...planned.flatMap((c) => [
      prisma.problem.update({ where: { id: c.id }, data: { resultNote: c.newValue } }),
      prisma.problemActivity.create({
        data: {
          problemId: c.id,
          userId: admin.id,
          userName: admin.pseudonym ?? null,
          type: "updated" as const,
          field: "What was actually shown",
          oldValue: c.oldValue,
          newValue: c.newValue,
        },
      }),
      ...(c.submittedById
        ? [
            prisma.directMessage.create({
              data: {
                userId: c.submittedById,
                senderId: admin.id,
                senderName: admin.pseudonym ?? null,
                kind: "reply" as const,
                body: c.message,
                problemId: c.id,
              },
            }),
          ]
        : []),
    ]),
  ]);
  console.log(`APPLIED to ${planned.length} entries`);
}

main().finally(() => prisma.$disconnect());
