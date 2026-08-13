// Review of the Part III unsplittable-flow submission, 13 Aug 2026.
//
// Follow-up to the published 1.28249 entry by the same author, so the axes are
// kept consistent with that one where the mathematics is the same shape.
//
// Verified here from a clean clone:
//   - all fourteen verifiers in verify/run_all.sh pass, exit 0 (Parts I & II);
//   - the headline planar record was rebuilt independently from the raw arc
//     list: DFS rediscovers two paths per terminal, the fractional arc loads
//     recompute exactly on all 21 arcs, all 64 routing overloads recompute
//     exactly, the cost rule fits all 64 of the certificate's own cost deltas,
//     42 routings are cost-preserving as claimed, and the minimum overload
//     over those is exactly 58676765987259/50000000000000;
//   - planarity by Euler (V=16, E=21, F=7) and independently by networkx;
//   - E(4) derived symbolically from the stated quartic: t* = (7-sqrt41)/4 is
//     the unique critical point in (0, 2-sqrt3) and yields (299-41sqrt41)/32;
//   - the 2,015-cell closure ledger is internally complete and consistent.
//
// Two axis corrections. The submitter set verification to site-confirmed
// themselves, which is not theirs to award - it happens to be right, but only
// because the work above was done. And ai-assisted understates their own
// disclosure: "the key ideas were provided by the LLMs" alongside contributed
// proofs and adversarial reviews is ai-co-developed, which is also where Part
// II sits.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "1-17353-planar-lower-bound-and-exact-local-envelopes-for-cost-preserving-single-";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) {
  if (s.maxLength) LIMITS.set(s.key, s.maxLength);
}

interface Edit {
  field: string;
  key: string;
  value: unknown;
}

const EDITS: Edit[] = [
  { field: "AI contribution", key: "aiContribution", value: "ai-co-developed" },
  { field: "Model", key: "model", value: "GPT-5.6 Sol, Claude Fable 5, Claude Opus 5" },
  { field: "Posed by", key: "posedBy", value: "Dinitz, Garg, Goemans" },
  {
    field: "Verification note",
    key: "verificationNote",
    value:
      "Reproduced by this site on 13 August 2026 from a clean clone, in two parts. First the repository's own suite: all fourteen verifiers in verify/run_all.sh pass, exit 0. Those cover Parts I and II only, so the headline planar record was rebuilt here independently. Reading only the raw arc list, a depth-first search rediscovers exactly two source-to-terminal paths for each of the six terminals; the fractional arc loads recompute exactly on all 21 arcs; all 64 routing overloads recompute exactly in rational arithmetic; the cost rule fits all 64 of the certificate's own cost deltas; 42 routings come out cost-preserving as claimed; and the minimum overload over those 42 is $58676765987259/50000000000000$, exactly the record. Planarity was checked independently too, by Euler ($V=16$, $E=21$, $F=7$) and by networkx. The envelope constant was derived symbolically from the stated quartic rather than read off: $t^*=(7-\\sqrt{41})/4$ is the unique critical point in $(0,2-\\sqrt3)$, giving $E(4)=(299-41\\sqrt{41})/32$. The 2,015-cell closure ledger is internally complete: five forms of 403, family counts summing to 2,015, every cell on one of nine solver-free lemmas. Not checked: the mixture characterization, the network-matrix total-unimodularity theorem and the tree-path four-colouring theorem, conventional proofs in an unreviewed preprint with no independent expert review. The tier records this site's reproduction of the certificates; the structural theory remains unreviewed.",
  },
  {
    field: "What was actually shown",
    key: "resultNote",
    value:
      "Part III of a series, and the first unconditional positive results in it. Settled exactly: the local envelope ladder $E(2)=1$, $E(3)=9/8$ and $E(4)=(299-41\\sqrt{41})/32=1.13974707\\ldots$, which recasts the earlier record constants as exact envelopes of the general theory rather than isolated instances, plus exact constants for four classes - out-trees 0, two-layer hubs 1, outerplanar two-exit interval spines 1 (sharp), series-parallel at most 1. Improved but not settled: the planar lower bound rises to $1.17353531974518$ against the known ceiling 2, and every exact-two-path instance whose rows touch at most three terminals satisfies $C\\le2$, the first unconditional constant for an unbounded class. The universal question is untouched - it reduces here to a single factor-two merger statement with certified wall $K^*\\ge2.5652\\ldots$, twice the refined general lower bound $1.28260069\\ldots$.",
  },
  { field: "Significance", key: "significance", value: 15 },
  {
    field: "Significance note",
    key: "significanceNote",
    value:
      "The residual optimal-constant question left open by the Dinitz-Garg-Goemans disproof, scored level with Part II of the same series. Specialist, but rooted in a well-known 1999 conjecture, and this instalment adds the first unconditional positive results rather than another record. Held at 15 because the universal constant is still open and the exact answers are for restricted classes.",
  },
];

const MESSAGE = `Published, with the verification tier left where you put it - but only because it now has the work behind it.

One thing to flag: site-confirmed is not a tier a submitter can set. It means this site reproduced the artifact, so on any other day it would have come down to unreviewed pending a check. It happens to be right here, because I ran the check.

From a clean clone, all fourteen verifiers in run_all.sh pass, exit 0. Those cover Parts I and II though, so I rebuilt the planar record independently. Reading only the raw arc list out of the certificate: DFS rediscovers exactly two paths per terminal, the fractional arc loads recompute exactly on all 21 arcs, all 64 routing overloads recompute exactly, your cost rule fits all 64 cost deltas, 42 routings come out cost-preserving, and the minimum overload over those is 58676765987259/50000000000000 on the nose. Planarity independently via Euler and networkx. I also derived E(4) symbolically from the quartic rather than reading it off - t* = (7-sqrt41)/4 is the unique critical point in (0, 2-sqrt3) and gives (299-41sqrt41)/32 - and checked the 2,015-cell ledger is complete: five forms of 403, family counts summing to 2,015, every cell on one of nine solver-free lemmas.

Worth saying my first rebuild had your route bits inverted and reproduced none of the 64 overloads. My convention error, not yours, and mine to resolve before reporting anything.

I raised ai-assisted to ai-co-developed. Your own disclosure says the key ideas were provided by the LLMs, alongside contributed proofs and adversarial reviews, which is that tier by our definition - and it is where Part II already sits. Say the word if your more conservative reading is right; you know the collaboration, I only know the write-up.

Also set significance 15 to match Part II, posedBy, and added Claude Opus 5 since your note credits it. Not checked: the mixture characterization, the TU theorem and the four-colouring theorem, which the note now says plainly.`;

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error(`no admin user for ${ADMIN_EMAIL}`);

  const p = await prisma.problem.findUnique({ where: { slug: SLUG }, include: { links: true } });
  if (!p) throw new Error(`no problem ${SLUG}`);
  if (p.status !== "pending") throw new Error(`${SLUG} is ${p.status}, not pending`);

  const row = p as unknown as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  const changes: { field: string; oldValue: string | null; newValue: string | null }[] = [];
  const fmt = (v: unknown) =>
    v === null || v === undefined ? null : Array.isArray(v) ? v.join(", ") : String(v);

  let bad = 0;
  for (const e of EDITS) {
    const limit = LIMITS.get(e.key);
    if (limit && typeof e.value === "string" && e.value.length > limit) {
      console.log(`  ${e.key} OVER BY ${e.value.length - limit} (${e.value.length}/${limit})`);
      bad++;
    }
    if (fmt(row[e.key]) === fmt(e.value)) continue;
    data[e.key] = e.value;
    changes.push({ field: e.field, oldValue: fmt(row[e.key]), newValue: fmt(e.value) });
  }

  console.log(`${SLUG}: approve (edited)\n`);
  for (const c of changes) {
    const short = (s: string | null) =>
      s === null ? "(empty)" : s.length > 90 ? `${s.slice(0, 90)}...` : s;
    console.log(`  ${c.field}:\n    - ${short(c.oldValue)}\n    + ${short(c.newValue)}`);
  }
  console.log(
    `\n  unchanged: verification=${p.verification} (now earned), resolution=${p.resolution}, ` +
      `publication=${p.publication}, method=${p.resolutionMethod}, yearPosed=${p.yearPosed}`,
  );
  console.log(`  links: ${p.links.length}`);
  console.log(`  message: ${MESSAGE.length} chars (max ${MESSAGE_MAX})`);
  if (MESSAGE.length > MESSAGE_MAX) bad++;
  if (bad) throw new Error("fix the flagged fields before applying");

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  await prisma.$transaction([
    prisma.problem.update({
      where: { id: p.id },
      data: {
        ...data,
        status: "published",
        reviewedAt: new Date(),
        reviewMessage: MESSAGE,
        reviewReason: "edited",
      },
    }),
    ...(changes.length
      ? [
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
        ]
      : []),
    prisma.problemActivity.create({
      data: {
        problemId: p.id,
        userId: admin.id,
        userName: admin.pseudonym ?? null,
        type: "approved",
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
              reason: "edited",
              body: MESSAGE,
              problemId: p.id,
            },
          }),
        ]
      : []),
  ]);

  const left = await prisma.problem.count({ where: { status: "pending" } });
  const published = await prisma.problem.count({ where: { status: "published" } });
  console.log(`APPLIED - ${left} pending, ${published} published`);
}

main().finally(() => prisma.$disconnect());
