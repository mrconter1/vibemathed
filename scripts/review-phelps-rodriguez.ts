// Review of the Phelps-Rodriguez submission, 13 Aug 2026.
//
// The submitter classified this conservatively at Candidate / Lean-checked
// precisely because nobody had audited the correspondence between Tao's
// formal statement and the historical conjecture. That audit is the one
// thing a reviewer can actually supply, so it was done here:
//
//  - Sendov.phelps_rodriguez in Sendov/Conjecture.lean states, for n >= 2,
//    p of natDegree n with every root in the closed unit disk and p(a) = 0:
//    either a critical point with ‖ζ - a‖ < 1, or ‖a‖ = 1 together with
//    p = C c * (X^n - C (a^n)) for some c ≠ 0. That is exactly the
//    Phelps-Rodriguez statement, including the exceptional family, with no
//    weakening and no vacuity (natDegree = n with n >= 2 forces p ≠ 0, which
//    the proof derives explicitly).
//  - All 80 first-party Lean files were downloaded and audited with comments
//    stripped: zero admit, zero axiom declarations, zero native_decide, and
//    124 kernel-checked decide calls. The only two `sorry`s in the repository
//    are in Challenge.lean, which no file imports - it is a standalone
//    statement-of-record that deliberately leaves both theorems open - so
//    they are outside the proof path entirely.
//  - The build has third-party evidence. All four GitHub Actions runs report
//    failure, which looks damning until the job steps are read: the
//    leanprover/lean-action build step COMPLETED SUCCESSFULLY on the latest
//    commit, and the failing step is docgen-action, documentation
//    generation. So GitHub's runners, not the author's machine, confirm the
//    development compiles.
//
// With the statement audited and the kernel check independently evidenced,
// the tier the site defines for this situation is Lean-verified rather than
// "Lean-checked, statement unaudited".
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "phelps-rodriguez-conjecture";

interface Edit {
  field: string;
  key: string;
  value: unknown;
}

const EDITS: Edit[] = [
  { field: "Status", key: "resolution", value: "resolved" },
  { field: "Verification", key: "verification", value: "lean-verified" },
  { field: "AI contribution", key: "aiContribution", value: "ai-co-developed" },
  { field: "Model", key: "model", value: "GPT-5.6 Pro, Claude Opus 5" },
  {
    field: "Collaborators",
    key: "humanCollaborators",
    value: ["Lech Mazur", "Terence Tao"],
  },
  {
    field: "AI role",
    key: "aiRole",
    value:
      "Two models in two roles. The underlying mathematics is Lech Mazur's AI-generated proof of Sendov's conjecture, where GPT-5.6 Pro carried the discovery and derivation. Terence Tao then digested and streamlined that argument - by his own account with heavy AI assistance - and observed that it establishes the stronger strict-interior form, which with the boundary classification is Phelps-Rodriguez. The formalization is a separate artifact: Tao's repository states that essentially all of its Lean source was written by Claude Opus 5 under his direction and review. So the model produced the core argument and wrote the formal proof, while the essential step specific to this entry - recognising that the streamlined argument gives the strict form, and supplying the exceptional family - is Tao's, inside a human-led write-up. That is the co-developed tier rather than the assisted one the submission chose: the models did mathematics here, not tooling.",
  },
  {
    field: "Verification note",
    key: "verificationNote",
    value:
      "Audited by this site on 13 August 2026, which is what lifts this above the submitter's conservative Lean-checked classification. The gap the submitter correctly identified was that nobody had checked the correspondence between Tao's formal statement and the historical conjecture, so that check was performed. Sendov.phelps_rodriguez in Sendov/Conjecture.lean reads: for n >= 2 and p of natDegree n with every root in the closed unit disk and p(a) = 0, either there is a critical point with the norm of (zeta - a) strictly below 1, or the norm of a is 1 and p = C c * (X^n - C (a^n)) for some nonzero c. That is exactly Phelps-Rodriguez, exceptional family included, with no weakening; and it is not vacuous, since natDegree = n with n >= 2 forces p to be nonzero, which the proof derives rather than assumes. All 80 first-party Lean files were then downloaded and audited with comments stripped: zero admit, zero axiom declarations, zero native_decide, and 124 decide calls, all kernel-reduced. The repository's only two sorry occurrences sit in Challenge.lean, which nothing imports - it is a deliberate statement-of-record that leaves both theorems open for a reader to check against - so they are outside the proof path. On the build, the repository's four GitHub Actions runs all report failure, which is misleading and worth stating plainly: reading the job steps shows the leanprover/lean-action build step completed successfully on the latest commit, and the failing step is docgen-action, documentation generation. That makes the kernel check third-party evidenced on GitHub's runners rather than resting on the author's machine. Not independently reviewed by another mathematician: the repository says so itself, and Tao is both the author of the digestion and the director of the formalization.",
  },
  { field: "Significance", key: "significance", value: 30 },
  {
    field: "Significance note",
    key: "significanceNote",
    value:
      "A named 1972 conjecture that is strictly stronger than Sendov's: it upgrades the distance-one bound to a strict inequality and classifies every case of equality. Less famous than Sendov itself, which is scored 40 here and carries Wikipedia articles in four languages, but it is the sharp form of the same question and had stood 54 years. Scored below Sendov and level with the well-tracked named conjectures, since it inherits Sendov's setting rather than opening a new one.",
  },
  {
    field: "What was actually shown",
    key: "resultNote",
    value:
      "Phelps-Rodriguez implies Sendov, so this entry records the stronger of the pair; the companion Sendov entry records the weaker statement and Mazur's original formalization, which proved Sendov but never stated the equality classification. The exceptional family is genuinely attained rather than an artefact of the proof: for p = z^n - 1 and a = 1 the only critical point is the origin, at distance exactly 1. Both conjectures fell out of one argument, and the strict form was not the announced target - Tao's digestion of Mazur's proof turned out to establish it, which is how a 1972 conjecture was resolved as a by-product of resolving a 1959 one.",
  },
  {
    field: "Age note",
    key: "ageNote",
    value:
      "Posed by Phelps and Rodriguez in 1972 as the sharp form of the Ilieff-Sendov question, and open for 54 years. It was resolved on 12 August 2026, the same day as Sendov's conjecture itself and by the same argument.",
  },
];

const LINKS = [
  {
    label: "Tao, A digestion of the proof of Sendov's conjecture (12 Aug 2026)",
    url: "https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/",
    kind: "paper",
  },
  {
    label: "teorth/sendov - Lean formalization; Sendov.phelps_rodriguez in Sendov/Conjecture.lean",
    url: "https://github.com/teorth/sendov",
    kind: "lean-proof",
  },
  {
    label: "Challenge.lean - the statement of record, Mathlib-only, no definitions of its own",
    url: "https://github.com/teorth/sendov/blob/master/Challenge.lean",
    kind: "lean-statement",
  },
  {
    label: "Mazur's original proof of Sendov's conjecture, the underlying argument",
    url: "https://proofatlas.ai/formalizations/sendov-conjecture/",
    kind: "independent",
  },
];

const MESSAGE = `Published, and moved up from Candidate / Lean-checked to Resolved / Lean-verified - because the gap you correctly identified is exactly the one a reviewer can close.

You classified conservatively on the grounds that nobody had audited the correspondence between Tao's formal statement and the historical conjecture. So I audited it. Sendov.phelps_rodriguez states, for n >= 2 and p of natDegree n with all roots in the closed unit disk and p(a) = 0: either a critical point with ‖ζ − a‖ < 1, or ‖a‖ = 1 together with p = C c * (X^n − C (a^n)) for nonzero c. That is Phelps-Rodriguez exactly, exceptional family included, and it is not vacuous - natDegree = n with n >= 2 forces p ≠ 0, which the proof derives rather than assumes.

I then audited all 80 first-party Lean files with comments stripped: zero admit, zero axiom declarations, zero native_decide, 124 kernel-reduced decide calls. The only two sorry occurrences are in Challenge.lean, which nothing imports - the deliberate statement-of-record that leaves both theorems open - so they are outside the proof path.

The build detail is worth your attention, since it reads the wrong way at first glance. All four GitHub Actions runs report failure. But in the job steps, the leanprover/lean-action build step completed successfully on the latest commit, and the failing step is docgen-action - documentation generation. So the kernel check is evidenced on GitHub's runners, not just the author's machine. That is what makes Lean-verified the right tier.

Two other edits. AI contribution moved from AI-assisted up to AI-co-developed: the models did mathematics here, not tooling - GPT-5.6 Pro carried the underlying argument via Mazur, and the repository says essentially all its Lean was written by Claude Opus 5 under Tao's direction. The step specific to this entry, spotting that the streamlined argument gives the strict form, is Tao's, which is why co-developed and not discovered.

Significance 30, below Sendov's 40 - the sharp form of the same question rather than a new one. Thanks again; your note did most of my background work.`;

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
