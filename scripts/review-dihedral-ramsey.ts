// Review of the dihedral/cyclic Ramsey submission, 13 Aug 2026.
//
// Self-submitted: the repository is the submitter's own, the work is
// AI-produced, and the paper's own adversarial review was by AI agents in
// the producing pipeline. So everything checkable was checked here.
//
// What was reproduced:
//  - The Lean file was compiled with the pinned toolchain (lean4 v4.12.0,
//    installed for this purpose). It builds clean, exit 0, and its own
//    `#print axioms` output shows all five main theorems - including
//    theoremB_lowerBound and lemma3_dih3_eq_sym3 - depending on exactly
//    [propext, Classical.choice, Quot.sound]. No Lean.ofReduceBool, so no
//    native_decide behind the scenes. With comments stripped the source
//    contains zero sorry, zero admit, zero axiom declarations and zero
//    native_decide; the 23 decide calls are kernel-reduced. The submission's
//    claim on this point is exactly right. (A naive grep says otherwise -
//    the words appear in the file's own documentation, in phrases like
//    "zero `sorry`" and "no `native_decide`".)
//  - The Python checker runs and reports what it claims: Dih(3) built by
//    generator closure has order 6 and equals Sym(3) while Dih(4) has order
//    8 of 24, lower-bound witnesses valid for b = 2..8, and b = 3 exhaustive
//    over all 1,024 colourings of K5 giving both bounds.
//  - Chvatal's 1977 tree-complete theorem gives R(T, K_n) = (|T|-1)(n-1)+1,
//    so for the 3-vertex path R(P3, K_b) = 2b-1, which is the upper bound
//    the note cites. That arithmetic is right.
//
// What could NOT be reproduced, and is recorded as such: the claimed
// DRAT-certified SAT recomputation for b = 2..7. The published repository
// has ten files and contains no CNF, no DRAT certificate and no solver log,
// so that claim rests on the author's word.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "dihedral-and-cyclic-ramsey-numbers-of-the-alternating-3-path";

interface Edit {
  field: string;
  key: string;
  value: unknown;
}

const EDITS: Edit[] = [
  { field: "Status", key: "resolution", value: "resolved" },
  { field: "Verification", key: "verification", value: "site-confirmed" },
  { field: "Publication", key: "publication", value: "preprint" },
  {
    field: "Verification note",
    key: "verificationNote",
    value:
      "Reproduced by this site on 13 August 2026. The Lean development was compiled here with the pinned toolchain (leanprover/lean4 v4.12.0, installed for the purpose; the file depends on Lean core only, no Mathlib, which is what makes an independent build cheap). It builds clean with exit 0, and its own #print axioms output shows all five main theorems - theoremB_lowerBound, theoremB_lowerBound_all_groups, lemma2_blockWitness, lemma3_dih3_eq_sym3 and noMonoCopy_completeGraph_reduce - depending on exactly propext, Classical.choice and Quot.sound. No Lean.ofReduceBool appears, so no native_decide is hiding behind the result, and with comments stripped the source has zero sorry, zero admit, zero axiom declarations and zero native_decide, its 23 decide calls being kernel-reduced. The submission's claim on this point is accurate; note that a naive grep contradicts it only because those words appear in the file's own documentation. The accompanying Python checker also runs as described: Dih(3) built by generator closure has order 6 and equals Sym(3), against Dih(4) at order 8 of 24; lower-bound witnesses are valid for b = 2..8; and b = 3 is settled exhaustively over all 1,024 colourings of K5. The upper bound for general b is not formalized anywhere and is a citation to Chvatal's 1977 tree-complete-graph theorem, which gives R(T, K_n) = (|T|-1)(n-1)+1 and hence 2b-1 for the three-vertex path; that step is standard and its arithmetic checks out. Two things this site could not confirm. The claimed DRAT-certified SAT recomputation for b = 2..7 is not backed by the published package: the repository has ten files and contains no CNF, no DRAT certificate and no solver log. And there is no human peer review - this is a self-submission of AI-produced work whose adversarial review was carried out by AI agents inside the producing pipeline, so nothing here has been read by an independent mathematician.",
  },
  { field: "Significance", key: "significance", value: 5 },
  {
    field: "Significance note",
    key: "significanceNote",
    value:
      "Small, and the preprint says so itself. This closes one slice (a = 3) of a conjecture stated about five weeks earlier, and it closes it by a group coincidence plus a citation: Dih(3) happens to equal Sym(3), so the permutational condition collapses to ordinary subgraph containment and Chvatal's 1977 theorem finishes it. The note is candid that the cyclic values for b = 3..8 were already tabulated by Basic et al. and that what is new is the closed form rather than the numbers. Scored near the bottom of the spine, with the machine-generated Graffiti conjectures, and below the Erdos problem entries at 10, which are decades-old human problems rather than weeks-old ones.",
  },
  {
    field: "What was actually shown",
    key: "resultNote",
    value:
      "The a = 3 slice is settled outright, which is why this is Resolved rather than Partial; the parent conjectures - Damnjanovic-Djordjevic Conjecture 4.9 and Basic-Damnjanovic-Stevanovic-Stosic Conjecture 4.23, both asserting 1 + (a-1)(b-1) for all a - remain open for every a >= 4, and the note is explicit that the upper bound for a >= 4 is the hard part. By the authors' own accounting the genuinely new content is the all-b closed form and its proof, particularly for the dihedral value which the companion paper never tabulates; the cyclic arithmetic for b = 3..8 already existed as computed SAT cells. The mathematics is a reduction rather than a search: Dih(3) = Sym(3) collapses dihedral embeddability to ordinary containment, after which Chvatal 1977 applies, with a block-partition construction supplying the matching lower bound for every connected pattern and every permutation group.",
  },
  {
    field: "Age note",
    key: "ageNote",
    value:
      "Both conjectures are from 2026 - Damnjanovic and Djordjevic posted arXiv:2607.06817 on 7 July 2026 and the companion Basic-Damnjanovic-Stevanovic-Stosic paper is arXiv:2604.16188 - so the a = 3 slice fell about five weeks after the conjecture was stated. This is among the shortest gaps in the catalog between a conjecture being posed and a piece of it being closed.",
  },
];

const LINKS = [
  {
    label: "Evidence repository: preprint, Lean proof, Python checker",
    url: "https://github.com/ZestyWombat854/dihedral-ramsey",
    kind: "code",
  },
  {
    label: "Damnjanovic and Djordjevic, Computation of small reflective and dihedral Ramsey numbers (Conjecture 4.9)",
    url: "https://arxiv.org/abs/2607.06817",
    kind: "problem-record",
  },
  {
    label: "Basic, Damnjanovic, Stevanovic and Stosic (Conjecture 4.23)",
    url: "https://arxiv.org/abs/2604.16188",
    kind: "problem-record",
  },
];

const MESSAGE = `Published, with two tiers moved and one claim I could not back up.

I compiled your Lean file rather than taking it on trust - it needs only Lean core, no Mathlib, so an independent build is cheap. I installed the pinned v4.12.0 toolchain and it builds clean, exit 0, and the #print axioms output shows all five main theorems depending on exactly propext, Classical.choice and Quot.sound, with no Lean.ofReduceBool. With comments stripped the source has zero sorry, zero admit, zero axiom declarations and zero native_decide. Your claim on this is accurate. Worth flagging for anyone else who checks: a naive grep says the opposite, because those words appear in the file's own documentation in phrases like "zero sorry".

Your Python checker also runs exactly as described - Dih(3) order 6 equal to Sym(3) against Dih(4) at 8 of 24, witnesses for b = 2..8, b = 3 exhaustive over all 1,024 colourings of K5. I checked the Chvatal step too: R(T, K_n) = (|T|-1)(n-1)+1 gives 2b-1 for the 3-vertex path.

So verification moves to Site-confirmed, and status to Resolved rather than Partial: the entry's statement is the a = 3 slice, and that slice is closed outright. The result note records that the parent conjectures stay open for every a >= 4.

The one thing I could not confirm is the DRAT-certified SAT recomputation for b = 2..7. Your repository has ten files and contains no CNF, no DRAT certificate and no solver log, so that claim rests on your word alone, and is now recorded that way. Push the certificates and I will re-check and amend.

Significance 5, near the bottom of the scale - not a criticism, and your own preprint makes the same case: this closes a five-week-old conjecture's slice via a group coincidence plus a 1977 citation, and you say plainly the b = 3..8 cyclic numbers were already tabulated. That candour is unusual and made the review much faster.

Also recorded: a self-submission of AI-produced work whose adversarial review was by AI agents in the producing pipeline, so no independent mathematician has read it.`;

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error(`no admin user for ${ADMIN_EMAIL}`);

  const p = await prisma.problem.findUnique({
    where: { slug: SLUG },
    include: { links: true },
  });
  if (!p) throw new Error(`no problem ${SLUG}`);
  if (p.status !== "pending") throw new Error(`${SLUG} is ${p.status}, not pending`);

  const row = p as unknown as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  const changes: { field: string; oldValue: string | null; newValue: string | null }[] = [];
  const fmt = (v: unknown) =>
    v === null || v === undefined ? null : Array.isArray(v) ? v.join(", ") : String(v);

  for (const e of EDITS) {
    if (fmt(row[e.key]) === fmt(e.value)) continue;
    data[e.key] = e.value;
    changes.push({ field: e.field, oldValue: fmt(row[e.key]), newValue: fmt(e.value) });
  }

  console.log(`${SLUG}: approve (edited)\n`);
  for (const c of changes) {
    const short = (s: string | null) =>
      s === null ? "(empty)" : s.length > 95 ? `${s.slice(0, 95)}...` : s;
    console.log(`  ${c.field}:\n    - ${short(c.oldValue)}\n    + ${short(c.newValue)}`);
  }
  console.log(`\n  links: ${p.links.length} -> ${LINKS.length}`);
  console.log(`  unchanged: aiContribution=${p.aiContribution}, model=${p.model}`);
  console.log(`\n  message (${MESSAGE.length} chars)\n`);

  if (!APPLY) {
    console.log("DRY RUN - pass --apply to write");
    return;
  }

  await prisma.$transaction([
    prisma.problem.update({
      where: { id: p.id },
      data: {
        ...data,
        links: {
          deleteMany: {},
          create: LINKS.map((l, position) => ({ ...l, position })),
        },
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
