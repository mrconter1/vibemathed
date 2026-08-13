// Review of the Sendov's conjecture submission, 13 Aug 2026.
//
// The submission arrived unusually well-researched: correct statement,
// correct tier, and a submitter note pointing at Tao's digestion. Both the
// mathematics and the note were checked here rather than taken on trust.
//
// Verified independently before approving:
//  - Tao's post of 12 Aug 2026, "A digestion of the proof of Sendov's
//    conjecture", says in his own words that "Lech Mazur was able to use an
//    AI tool to resolve Sendov's conjecture for all n >= 2", that he
//    formalized the whole argument himself in Lean (~15,000 lines against
//    the original's ~90,000), and that the argument "resolves both the
//    Sendov conjecture and the Phelps-Rodriguez conjecture in full
//    generality". That is independent expert verification by the person who
//    proved the large-degree case in 2020.
//  - Mazur's Lean package was downloaded and audited here. `SendovConjecture`
//    in Sendov/Statement.lean is exactly the conjecture, correctly
//    quantified, defined once and never shadowed. Across all 1,160 first-party
//    Lean files there are zero `sorry`, zero `admit`, zero custom `axiom`
//    declarations and - the one that matters - zero `native_decide`; the
//    1,117 `decide` calls are kernel-checked. The recorded axiom profile is
//    exactly propext, Classical.choice, Quot.sound. Every one of the 1,160
//    file hashes in the published evidence record matches the downloaded
//    bundle byte for byte, as does Theorem.lean against the pinned artifact
//    hash.
//  - What could NOT be checked here, and is recorded as such: the build. The
//    published bundle ships no lakefile and no lake-manifest.json and
//    excludes Mathlib, so it cannot be rebuilt as distributed, and
//    ProofAtlas's own evidence file records buildTranscriptRecorded: false,
//    collectionProvenanceRecorded: false and
//    publicationReview.status: accountable_review_not_recorded. Tao's
//    independent formalization is what carries the tier, not ProofAtlas's
//    internal record - exactly the distinction the submitter asked for.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "sendov-s-conjecture";

interface Edit {
  field: string;
  key: string;
  value: unknown;
}

const EDITS: Edit[] = [
  { field: "Year posed", key: "yearPosed", value: 1959 },
  {
    field: "Verification note",
    key: "verificationNote",
    value:
      "Independently verified twice over, and this site audited the formal artifact itself on 13 August 2026. The decisive external check is Terence Tao's post of 12 August 2026, \"A digestion of the proof of Sendov's conjecture\": he writes that \"Lech Mazur was able to use an AI tool to resolve Sendov's conjecture for all n >= 2\", reports formalizing the entire argument in Lean himself at about 15,000 lines against the original's roughly 90,000, and concludes that the argument \"resolves both the Sendov conjecture and the Phelps-Rodriguez conjecture in full generality\". Tao proved the sufficiently-large-degree case in 2020, so this is expert verification by the person best placed to give it, and it is what carries the tier here. Separately, this site downloaded and audited Mazur's Lean package. The definition SendovConjecture in Sendov/Statement.lean is exactly the conjecture, correctly quantified over every nonzero complex polynomial of degree at least two and every zero, declared once and shadowed nowhere. Across all 1,160 first-party Lean files there are zero sorry, zero admit and zero custom axiom declarations, and - the one that matters for an autonomous prover - zero uses of native_decide; the 1,117 decide calls are kernel-checked. The recorded axiom profile is exactly propext, Classical.choice and Quot.sound. All 1,160 file hashes in the published evidence record match the downloaded bundle byte for byte, as does Theorem.lean against its pinned artifact hash. What this site could not check is the build itself: the published bundle ships no lakefile and no lake-manifest, and excludes Mathlib, so it cannot be recompiled as distributed. ProofAtlas's own evidence file is candid about the same gap, recording buildTranscriptRecorded false, collectionProvenanceRecorded false and a publication review status of accountable_review_not_recorded. That internal status is not what this entry rests on; Tao's independent digestion and independent formalization are.",
  },
  {
    field: "What was actually shown",
    key: "resultNote",
    value:
      "Sendov's conjecture is resolved for every degree n >= 2, closing a gap that had stood since 1959: degrees up to eight were settled piecemeal between 1969 and 1999, and Tao's 2020 result covered all sufficiently large degrees without ever specifying the threshold, leaving the middle range open. Tao's digestion establishes the stronger interior form of the statement, which resolves the Phelps-Rodriguez conjecture in full generality as a consequence - a second conjecture falling out of the same argument, and one that likely merits its own entry. Two independent Lean developments now exist: Mazur's original at roughly 90,000 lines and Tao's streamlined version at about 15,000.",
  },
  { field: "Significance", key: "significance", value: 40 },
  {
    field: "Significance note",
    key: "significanceNote",
    value:
      "A named conjecture from 1959 with a Wikipedia article in four languages, a 67-year history of partial results, and enough standing that Terence Tao wrote a paper on the large-degree case in 2020 and a full digestion of the solution in 2026. Placed level with the Erdos unit distance problem: a genuinely famous problem within its area and recognisable outside it, below the household conjectures such as cycle double cover (55) and well above the specialist named conjectures around 25 to 30. The Phelps-Rodriguez corollary adds to the case rather than being scored here.",
  },
  {
    field: "Age note",
    key: "ageNote",
    value:
      "Sendov described the conjecture to Nikola Obreshkov in 1959, and it was misattributed to Ljubomir Iliev in 1967; sources variously date it 1958, 1959 or 1962. Open for 67 years. Degrees below nine were settled between 1969 and 1999 (Meir-Sharma, Brown, Borcea, Brown-Xiang), and Tao proved it for all sufficiently high degrees in 2020, leaving the unbounded middle range that this result closes.",
  },
  { field: "Wikipedia languages", key: "renownLangs", value: 4 },
  {
    field: "Renown note",
    key: "renownNote",
    value:
      "Wikipedia articles in English, German, French and Yoruba. The article still described the conjecture as open in general when checked on 13 August 2026, the day after Tao's digestion appeared.",
  },
];

const LINKS = [
  {
    label: "Terence Tao, A digestion of the proof of Sendov's conjecture (12 Aug 2026)",
    url: "https://terrytao.wordpress.com/2026/08/12/a-digestion-of-the-proof-of-sendovs-conjecture/",
    kind: "independent",
  },
  {
    label: "ProofAtlas formalization page: exact theorem, evidence and build record",
    url: "https://proofatlas.ai/formalizations/sendov-conjecture/",
    kind: "lean-proof",
  },
  {
    label: "Mazur's Lean package, checked source bundle (1,160 files, ~93k lines)",
    url: "https://proofatlas.ai/papers/sendov-conjecture/SENDOV_CONJECTURE_PROOF_PUBLIC_BUNDLE_2026-08-05.zip",
    kind: "code",
  },
  {
    label: "Tao, Sendov's conjecture for sufficiently high degree polynomials (2020)",
    url: "https://arxiv.org/abs/2012.04125",
    kind: "paper",
  },
  {
    label: "Wikipedia: Sendov's conjecture",
    url: "https://en.wikipedia.org/wiki/Sendov%27s_conjecture",
    kind: "wikipedia",
  },
];

const MESSAGE = `Published as submitted, essentially - this is the best-researched submission the site has had, and the parts I checked all held.

Your note about Tao was the important claim and it checks out. His 12 August post says in his own words that "Lech Mazur was able to use an AI tool to resolve Sendov's conjecture for all n >= 2", that he formalized the entire argument himself in Lean at ~15,000 lines against the original's ~90,000, and that it "resolves both the Sendov conjecture and the Phelps-Rodriguez conjecture in full generality". Coming from the person who proved the large-degree case in 2020, that is as good as expert verification gets, and it is what your Lean-verified tier now rests on.

I also audited Mazur's Lean package here rather than trusting the site. SendovConjecture in Statement.lean is exactly the conjecture, correctly quantified, declared once and shadowed nowhere. Across all 1,160 first-party files: zero sorry, zero admit, zero custom axiom declarations, and zero native_decide - the 1,117 decide calls are kernel-checked, which is the safe one. Axiom profile is exactly propext, Classical.choice, Quot.sound. All 1,160 file hashes in the published evidence match the downloaded bundle byte for byte.

One gap worth recording, and it is the distinction you asked for. I could not rebuild the package: the bundle ships no lakefile and no lake-manifest and excludes Mathlib, so it is not recompilable as distributed. ProofAtlas's own evidence file is candid about the same thing - buildTranscriptRecorded false, collectionProvenanceRecorded false, publication review accountable_review_not_recorded. The verification note now states plainly that the entry rests on Tao, not on ProofAtlas's internal status.

Edits: year posed 1958 to 1959, with the note recording that sources vary. Significance 40, level with the Erdos unit distance problem. Wikipedia languages 4. Added result, age and renown notes, and links including Tao's post.

Agreed that Phelps-Rodriguez merits its own entry - please do submit it.`;

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
  console.log(`  unchanged: resolution=${p.resolution}, verification=${p.verification}, `
    + `aiContribution=${p.aiContribution}, model=${p.model}`);
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
