// Review of the two submissions pending on the evening of 8 September 2026.
// Both approved.
//
// PERCOLATION. This is the largest claim the catalog has taken, so it was
// checked at four levels rather than read:
//
//   1. Statement fidelity. Challenge.lean read line by line against Grimmett
//      §§1.3-1.4. The lattice is SimpleGraph.hasse on Fin d → ℤ, whose
//      symmetrised covering relation is exactly nearest-neighbour adjacency;
//      the measure is Mathlib's ProbabilityTheory.setBernoulli on G.edgeSet;
//      the cluster is reachability in fromEdgeSet; theta is the measure of
//      {|C(0)| = ∞}; p_c is inf {p | theta p > 0} with an explicitly declared
//      convention for the empty case. The compared claim is theta(p_c) = 0.
//   2. What setBernoulli actually means, read from Mathlib source rather than
//      taken from the docstring in the submission: "the measure on Set ι such
//      that each element of u is taken with probability p, and the elements
//      outside of u are never taken". With u = G.edgeSet that is Bernoulli
//      bond percolation. This was the last place a faithful-looking statement
//      could have been quietly wrong.
//   3. Smuggled hypotheses, the failure mode that demoted the Erdős-Borwein
//      entry earlier today: an unproven input passed as a theorem argument is
//      neither a sorry nor an axiom. Impossible here. percolation_continuity
//      takes only (d : ℕ) and (2 ≤ d), the transport `bridge` is Iff.rfl, and
//      comparator.json compares exactly those theorem names with only
//      propext, Quot.sound, Classical.choice permitted.
//   4. Counted rather than trusted: across all 251 files, no sorry outside
//      the two deliberate placeholders in Challenge.lean, zero axiom
//      declarations, zero native_decide, zero unsafe/implemented_by. Their
//      AUDIT.md's counts matched mine. Percolation/Literature/ formalises the
//      classical toolkit (Harris, Kesten, RSW, Russo, planar duality,
//      Burton-Keane, Grimmett-Marstrand, slab criticality, sharpness,
//      uniqueness) rather than assuming it.
//
// Not done: the build itself. Their run needed a 128-core node and Mathlib
// from source, which is not reproducible here, so "the kernel accepted this"
// rests on their audit record - which was accurate everywhere I could test it.
//
// Kalai is a report, not an endorsement: "If verified, this is a remarkable
// breakthrough", "not yet an official Claude document", "we still need to
// verify if the formalisation is done correctly". So Candidate, and the
// extraordinary-claims rule is satisfied through formal verification rather
// than expert review.
//
// The submitter is an anonymous account created three minutes before
// submitting, with no other history and an unverified email. That changes
// nothing: they are a courier for a first-party artifact in Anthropic's own
// repository, and nothing in the entry rests on their word. They are not
// credited, and the sourceUrl is repointed from the mutable main branch to
// the commit the submitter pinned in their note.
//
// DEPTH THREE. The sequel invited in this morning's review of the depth-two
// entry, filed as its own entry exactly as asked, with depth two linked as
// predecessor rather than as verification. Same tier and status as its
// predecessor, one point lower in significance because the architecture it
// uses was established there.
//
// Dry run by default. Pass --apply to write. Production writes are the
// curator's to run.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const LINK_LABEL_MAX = 120;

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS])
  if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const PIN = "795efb86f191735c5481675763537cfb4ff37e55";
const REPO = `https://github.com/anthropics/formal-math/tree/${PIN}/percolation`;

type LinkIn = { label: string; url: string; kind: string };
type Decision = {
  slug: string;
  action: "approve" | "reject";
  reason: string;
  message: string;
  edits?: Record<string, unknown>;
  links?: LinkIn[];
};

const DECISIONS: Decision[] = [
  {
    slug: "absence-of-critical-bernoulli-bond-percolation-on-z-d-in-every-dimension-d-2",
    action: "approve",
    reason: "other",
    message: `Listed, at the top of the catalog. Thank you for sending it, and for the framing: asking to be reviewed as a candidate rather than as an established resolution is what made this quick to act on.

Two changes, one up and one sideways.

Verification is now Lean-verified rather than Lean-checked. You were modest, and I disagree with you. The top tier wants the proof kernel-checked and the statement anchored by an audited correspondence, and both hold. I read Challenge.lean against Grimmett's definitions: hasse on Fin d → ℤ is exactly nearest-neighbour adjacency, setBernoulli on the edge set does mean each edge open independently with probability p (checked at Mathlib source, not from your docstring), theta is the measure of the infinite-cluster event, and p_c is the infimum form with its empty-set convention declared out loud.

The check that mattered most: percolation_continuity takes only a dimension and 2 ≤ d, bridge is Iff.rfl, and comparator compares exactly those theorem names under the three standard axioms. So no unproven input can enter as a theorem argument, which is the failure mode a sorry count and an axiom audit both miss. Across 251 files my own counts found no sorry outside the two deliberate placeholders, no axiom declaration, no native_decide and no unsafe, matching your AUDIT.md everywhere I could test it.

What I did not do is rebuild it: a 128-core node and Mathlib from source is beyond what I can reproduce, so kernel acceptance rests on your audit record.

Status stays Candidate, matching your own request and Kalai's position: "if verified, this is a remarkable breakthrough", "we still need to verify if the formalisation is done correctly".

I also repointed the source from the main branch to the commit you pinned in your note. An entry this size should cite something immutable.

Significance 78. For calibration: a typical Erdős problem is near 10, and the previous highest entry was 70.`,
    edits: {
      verification: "lean-verified",
      resolution: "candidate",
      significance: 78,
      sourceUrl: REPO,
      sourceName:
        "anthropics/formal-math, percolation (Lean 4 development, pinned commit 795efb8)",
      verificationNote:
        'Formalised in Lean 4 in anthropics/formal-math at commit 795efb8. Audited here on 8 September 2026 at four levels. Statement: Challenge.lean read against Grimmett §§1.3-1.4 - the lattice is SimpleGraph.hasse on Fin d → ℤ, whose symmetrised covering relation is nearest-neighbour adjacency; the measure is ProbabilityTheory.setBernoulli on the edge set, whose Mathlib definition was read at source and does mean each edge open independently with probability p; theta is the measure of {|C(0)| = ∞}; p_c is inf {p | theta p > 0} with the empty-case convention declared. Structure: percolation_continuity takes only a dimension and 2 ≤ d, the transport is Iff.rfl, and comparator.json compares exactly the two theorem names permitting only propext, Quot.sound and Classical.choice - so no unproven input can enter as a theorem argument. Counts taken independently across all 251 files and 97,574 lines: no sorry outside the two deliberate placeholders, zero axiom declarations, zero native_decide, zero unsafe. Percolation/Literature/ formalises the classical toolkit rather than assuming it. Not rebuilt here: their run needed a 128-core node and Mathlib from source, so kernel acceptance rests on their audit record, which matched every count I checked. No mathematician has read the argument. Gil Kalai reported it on 3 September with explicit caveats, writing "if verified, this is a remarkable breakthrough" and "we still need to verify if the formalisation is done correctly".',
      significanceNote:
        'Duminil-Copin lists this as Conjecture 1 of "Sixty years of percolation", his 2018 ICM survey. Known for d = 2 since Harris and Kesten and for d ≥ 11 by lace expansion since Hara-Slade 1990, it resisted in dimensions 3 to 10 for thirty-five years, precisely because neither planar duality nor the lace expansion reaches them. Resolved for every d ≥ 2 with no hypothesis beyond the dimension. Placed just below the Collatz band: a central problem of probability settled completely, held back only by the fact that no human has yet read the argument.',
    },
    links: [
      {
        label: "Challenge.lean: the trusted statement, in plain Mathlib",
        url: `https://github.com/anthropics/formal-math/blob/${PIN}/percolation/Challenge.lean`,
        kind: "lean-statement",
      },
      {
        label: "AUDIT.md: their build, axiom and comparator record",
        url: `https://github.com/anthropics/formal-math/blob/${PIN}/percolation/AUDIT.md`,
        kind: "lean-proof",
      },
      {
        label: "Gil Kalai's report, with his caveats",
        url: "https://gilkalai.wordpress.com/2026/09/03/amazing-there-is-no-percolation-at-the-critical-probability-in-all-dimensions-solved-by-ai-via-a-conjecture-of-gady-kozma-and-shahaf-nitzan/",
        kind: "discussion",
      },
    ],
  },

  {
    slug: "exact-rank-and-smith-profile-of-affine-incidence-over-mathbb-z-p-3-mathbb-z",
    action: "approve",
    reason: "other",
    message: `Listed. This is exactly what I asked for this morning, filed exactly as asked: its own entry for the next parameter case, with depth two linked as predecessor work rather than as verification, and Partial and Unreviewed both retained without an argument for a higher rung. Reviewers notice when a submitter does that.

Significance 7, one below the depth-two entry's 8. Not a criticism: the depth-two paper had to build the maximal-order and depth-transition framework, and depth three applies an architecture that already exists. A sequel in a parameterized family is worth slightly less than the case that opened it.

One thing to think about before a depth four. Consecutive cases of a parameterized problem are separate results while each needs a new idea, and become one result the moment a general argument exists. If the depth-three method suggests how to handle arbitrary k, that general theorem is worth far more than the individual cases and would supersede both of these entries. Worth aiming at.`,
    edits: {
      significance: 7,
      significanceNote:
        "The next parameter case of the Łaba-Trainor rank question, settled exactly for the depth-three plane. A point below its predecessor because the framework it applies was built there; the general problem for arbitrary depth and dimension remains open.",
    },
  },
];

async function connectWithRetry(): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>(
        "SELECT current_database() AS db",
      );
      return db;
    } catch (e) {
      lastError = e;
      console.log(`connection attempt ${attempt} failed; retrying in 5s`);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  throw lastError;
}

async function main() {
  const db = await connectWithRetry();
  console.log(
    `database: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`,
  );

  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });

  let bad = 0;
  for (const d of DECISIONS) {
    const cur = await prisma.problem.findUnique({
      where: { slug: d.slug },
      select: { id: true, status: true, name: true },
    });
    if (!cur) throw new Error(`not found on ${db}: ${d.slug}`);
    if (cur.status !== "pending")
      throw new Error(`${d.slug} is ${cur.status}, not pending`);

    console.log(
      `${d.action === "reject" ? "DECLINE" : "APPROVE"}  ${cur.name.slice(0, 58)}`,
    );
    console.log(
      `  message : ${d.message.length}/${MESSAGE_MAX}${d.message.length > MESSAGE_MAX ? "  OVER" : ""}`,
    );
    if (d.message.length > MESSAGE_MAX) bad++;
    for (const [k, v] of Object.entries(d.edits ?? {})) {
      const lim = LIMITS.get(k);
      if (typeof v === "string" && lim) {
        const over = v.length > lim;
        console.log(
          `  ${k.padEnd(17)}: ${v.length}/${lim}${over ? `  OVER BY ${v.length - lim}` : ""}`,
        );
        if (over) bad++;
      } else {
        console.log(`  ${k.padEnd(17)}: ${JSON.stringify(v).slice(0, 70)}`);
      }
    }
    for (const l of d.links ?? []) {
      console.log(
        `  link             : ${l.label.length}/${LINK_LABEL_MAX}  ${l.kind}`,
      );
      if (l.label.length > LINK_LABEL_MAX) bad++;
    }
  }
  if (bad) throw new Error(`${bad} limit violation(s)`);

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }
  if (!curator) throw new Error("curator not found on this database");

  for (const d of DECISIONS) {
    const cur = await prisma.problem.findUnique({
      where: { slug: d.slug },
      select: {
        id: true,
        submittedById: true,
        _count: { select: { links: true } },
      },
    });
    if (!cur) throw new Error(`vanished: ${d.slug}`);
    const n = cur._count.links;

    await prisma.$transaction([
      prisma.problem.update({
        where: { id: cur.id },
        data: {
          ...(d.edits ?? {}),
          ...(d.links?.length
            ? {
                links: {
                  create: d.links.map((l, i) => ({ ...l, position: n + i })),
                },
              }
            : {}),
          status: d.action === "approve" ? "published" : "rejected",
          reviewedAt: new Date(),
          reviewMessage: d.message,
          reviewReason: d.reason,
        } as never,
      }),
      prisma.directMessage.create({
        data: {
          userId: cur.submittedById!,
          senderId: curator.id,
          senderName: curator.pseudonym,
          kind: "decision",
          reason: d.reason,
          body: d.message.slice(0, MESSAGE_MAX),
          problemId: cur.id,
        },
      }),
      prisma.problemActivity.create({
        data: {
          problemId: cur.id,
          userId: curator.id,
          userName: curator.pseudonym,
          type: d.action === "approve" ? "approved" : "rejected",
        },
      }),
    ]);
    console.log(`applied: ${d.action} ${d.slug}`);
  }

  console.log(
    "\nAPPLIED. Public caches lag until the next deploy; entry pages are right immediately.",
  );
}

main().finally(() => prisma.$disconnect());
