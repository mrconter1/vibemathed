// The three AI results on the bounded-gaps record, as catalog entries.
//
// H_1 = liminf (p_{n+1} - p_n) stood at 246 from 2014 until 31 August 2026,
// then moved four times in four days. One of those four was human
// (Stadlmann's 240, which stays a cited historical row on the record); the
// other three are these.
//
// MUST RUN AGAINST PRODUCTION. The 186 row exists only there - it was
// rejected this morning, and problems.json carries published entries only, so
// staging has no copy of it to update. The script prints the database it is
// connected to before it writes anything.
//
// ---------------------------------------------------------------------------
// 1. 186 - REVERSING A HOLD OF MINE, on a reason that was wrong.
//
// Held this morning with three reasons given. Reason two was decisive and
// false: "the mathematics it formalises, 'Improved Gaps Between Primes' by
// OpenAI, is cited in the repository metadata and exists nowhere I can find".
// It exists at
//   cdn.openai.com/pdf/51126fac-.../short_gaps.pdf
// which is the SIBLING of the long-gaps PDF this site verified and published
// the same morning. Two mistakes compounded: I searched for the title the
// repository's formalization.yaml gives ("Improved Gaps Between Primes")
// rather than the paper's own ("Improved short gaps between primes"), and I
// never listed the CDN directory I had already downloaded from.
//
// The paper is 30 August 2026, by "OPENAI", and says of Theorem 1.1: "The
// proof is due to GPT 6 Astra". It establishes DHL[40,2] and applies it to an
// admissible 40-tuple of diameter 186.
//
// What still stands from the hold: the Lean development is conditional on
// three project axioms, so this is lean-checked, not lean-verified. That is a
// tier, not a bar to publication - the site publishes unreviewed preprints as
// its normal case, and it published the sibling long-gaps result the same day.
//
// 2. 212 - Axiom Math, 3 September 2026. Nine authors, human mathematics
// building on Stadlmann. The AI contribution is Appendix A: "AxiomProver, an
// AI system under development by AxiomMath, autonomously generated from
// natural-language specifications a Lean certificate of the deduction of
// Theorem 1.1", conditional on the stated equidistribution estimates. So the
// model verified rather than discovered: ai-assisted, the weakest tier, and
// the entry says so plainly.
//
// 3. 236 - Shiva Kintali, 1 September 2026, announced on X: "I showed that
// H1 <= 236 with the help of AI, building on Julia Stadlmann's work." Held
// the record for two days. No preprint, no named model, no method beyond GPY
// with the Maynard-Tao sieve. Thinnest of the three by a distance, and
// entered as Candidate / Unreviewed to say so.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient, type Prisma } from "@prisma/client";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const OPENAI_186 = "https://cdn.openai.com/pdf/51126fac-1b68-4128-9666-c908bcc16033/short_gaps.pdf";
const AXIOM_212 = "https://primegaps.axiommath.ai/bgp212.pdf";
const KINTALI_236 = "https://x.com/ShivaKintali/status/2095547543061135765";
const STADLMANN = "https://arxiv.org/abs/2608.31126";

/// The reversal: fields to set on the existing (rejected) 186 row, plus the
/// message that owns the mistake.
const REVERSE_186 = {
  slug: "prime-gaps-at-most-186",
  fields: {
    status: "published",
    reviewReason: "edited",
    verification: "lean-checked",
    resolution: "partial",
    aiContribution: "ai-discovered",
    posedBy: "Alphonse de Polignac (the twin prime conjecture); the bounded form since Goldston, Pintz and Yıldırım",
    yearPosed: 1849,
    significance: 62,
    significanceNote:
      "The closest mathematics has come to the twin prime conjecture, and the most-watched number in analytic number theory since Zhang broke it open in 2013. If this bound holds it is the current record, ahead of Axiom Math's 212 and Stadlmann's 240, both of which appeared after this paper was dated.",
    verificationNote:
      "Lean-checked, not Lean-verified, and the distinction is the whole of it. The Lean development in openai/PrimeGaps186 reports zero sorry in its three main declarations, and Comparator and Lean's kernel accept them - but all three depend on three project-specific axioms: a rank-three hyper-Kloosterman bound, a rank-two Kloosterman correlation bound, and a package of 104 outer, 45 inner and 3 cap numerical inequalities. So the kernel has checked that those three statements imply DHL[40,2] and the bound; it has not checked them. The first two are tied to established literature and the third is recomputed by a Python and FLINT certificate that does not discharge its Lean axiom. No independent expert has read the paper on the record.",
    ageNote:
      "Dated from Polignac's 1849 conjecture, the origin of the question this bounds. The modern quantitative form dates from Goldston, Pintz and Yıldırım in 2005 and became a finite bound with Zhang in 2013.",
  } as Record<string, unknown>,
  links: [
    { label: "Improved short gaps between primes (OpenAI, 30 August 2026)", url: OPENAI_186, kind: "paper" },
    { label: "Lean development, openai/PrimeGaps186", url: "https://github.com/openai/PrimeGaps186", kind: "lean-proof" },
    {
      label: "Challenge.lean, the statements the comparator checks",
      url: "https://github.com/openai/PrimeGaps186/blob/main/Challenge.lean",
      kind: "lean-statement",
    },
    { label: "Numerical certificate", url: "https://github.com/openai/PrimeGaps186/blob/main/prime_gap_186_certificate.py", kind: "code" },
    { label: "Stadlmann's 240, the bound this improves on", url: STADLMANN, kind: "independent" },
  ],
  message:
    "Reversing this morning's hold, and apologising for it: the reason I gave as decisive was wrong.\n\nI wrote that the paper the repository formalises \"exists nowhere I can find - not on arXiv, not on the OpenAI CDN, not in the repo\". It is on the OpenAI CDN, at the sibling URL of the long-gaps PDF this site verified and published a few hours earlier the same morning. Two errors compounded: I searched for the title the repository's formalization.yaml gives, \"Improved Gaps Between Primes\", rather than the paper's own title, \"Improved short gaps between primes\", and I never listed the CDN directory I had already downloaded a file from. The paper is dated 30 August 2026, is authored \"OPENAI\", and says of the main theorem: \"The proof is due to GPT 6 Astra\".\n\nSo the entry is published, at Lean-checked and Partial. The one point from the hold that survives is the tier: the Lean development really is conditional on three project axioms, so the kernel has checked that those three statements imply the bound rather than checking the bound. That is a tier, not a bar - the site's normal case is an unreviewed preprint, and it published the sibling long-gaps result the same day.\n\nYour submission was right and my review was not. It is now also the first row on a new Records page for this quantity, where it sits above Stadlmann's 240 and Axiom Math's 212, both of which appeared after your paper was dated. Thank you for filing it with the caveats in place, and sorry for the round trip.",
};

const NEW_ENTRIES: { slug: string; fields: Record<string, unknown>; links: { label: string; url: string; kind: string }[] }[] = [
  {
    slug: "bounded-prime-gaps-at-most-212",
    fields: {
      name: "A new bound for small gaps between primes: $H_1 \\le 212$",
      shortName: "Prime gaps at most 212",
      fieldGroup: "Number theory",
      field: "Analytic number theory",
      statement:
        "Write $H_1 = \\liminf_{n\\to\\infty}(p_{n+1}-p_n)$. Stadlmann had recently proved $H_1 \\le 240$, improving the bound $246$ of Polymath8b. Building on her work, this paper proves $H_1 \\le 212$: infinitely many pairs of consecutive primes are at most $212$ apart.",
      posedBy: "Alphonse de Polignac (the twin prime conjecture); the bounded form since Goldston, Pintz and Yıldırım",
      yearPosed: 1849,
      solveType: "proved",
      resolution: "partial",
      resolutionMethod: "argument",
      solveDate: "2026-09-03",
      model: "AxiomProver",
      modelMaker: "Axiom Math",
      humanCollaborators: [
        "François Charton",
        "Letong Hong",
        "Kenny Lau",
        "Ken Ono",
        "Guillaume Remy",
        "Ho Chung Siu",
        "Ashvin A. Swaminathan",
        "Jesse Thorner",
        "Yunzhou Xie",
      ],
      aiRole:
        "The mathematics is the authors'. The AI contribution is the formal certificate, and the paper is precise about it in Appendix A: \"AxiomProver, an AI system under development by AxiomMath, autonomously generated from natural-language specifications a Lean certificate of the deduction of Theorem 1.1.\" The certificate takes as hypotheses the five Type I, Type II and Type III equidistribution estimates of Section 5, the bilinear Bombieri-Vinogradov theorem below the half-level, the Harman decomposition, and the variational certificate. Nothing in the paper claims the model found the argument, and the abstract does not mention AI at all.\n\nThe same group's AxiomProver had formalised the twelve-year-old 246 bound in Lean a few weeks earlier, which is the work this builds its tooling on.",
      aiContribution: "ai-assisted",
      verification: "lean-checked",
      verificationNote:
        "A preprint one day old, not peer reviewed. Its Lean certificate was produced by AxiomProver and is conditional on the equidistribution estimates and the Bombieri-Vinogradov theorem stated in the paper, so it certifies the deduction rather than the analytic inputs. Nine authors, several of whom work on exactly this, take responsibility for the mathematics. No independent expert has read it on the record, and this site has not rebuilt the certificate.",
      resultNote:
        "$H_1 \\le 212$, improving Stadlmann's $240$ of three days earlier and the $246$ of Polymath8b that had stood since 2014. The twin prime conjecture, $H_1 = 2$, is untouched. Held the record for hours at most: OpenAI's paper claiming $186$ is dated 30 August, four days before this one, though its Lean development appeared on 2 September.",
      significance: 62,
      significanceNote:
        "The closest mathematics has come to the twin prime conjecture, and the most-watched number in analytic number theory since Zhang in 2013. Level with the site's other bounded-gaps entries: the weight is the question's, not any one step's.",
      publication: "preprint",
      sourceUrl: AXIOM_212,
      sourceName: "A new bound for small gaps between primes",
      ageNote:
        "Dated from Polignac's 1849 conjecture. The modern quantitative form dates from Goldston, Pintz and Yıldırım in 2005 and became a finite bound with Zhang in 2013.",
    },
    links: [
      { label: "PrimeGapsLib, the Lean library", url: "https://github.com/AxiomMath/PrimeGapsLib", kind: "lean-proof" },
      { label: "Blueprint of the 246 formalisation this builds on", url: "https://primegaps.axiommath.ai/", kind: "independent" },
      { label: "Stadlmann's 240, the bound this improves on", url: STADLMANN, kind: "independent" },
    ],
  },
  {
    slug: "bounded-prime-gaps-at-most-236",
    fields: {
      name: "Bounded prime gaps: $H_1 \\le 236$",
      shortName: "Prime gaps at most 236",
      fieldGroup: "Number theory",
      field: "Analytic number theory",
      statement:
        "Write $H_1 = \\liminf_{n\\to\\infty}(p_{n+1}-p_n)$. Announced on 1 September 2026: $H_1 \\le 236$, building on Stadlmann's $240$ of the previous day.",
      posedBy: "Alphonse de Polignac (the twin prime conjecture); the bounded form since Goldston, Pintz and Yıldırım",
      yearPosed: 1849,
      solveType: "proved",
      resolution: "candidate",
      resolutionMethod: "argument",
      solveDate: "2026-09-01",
      model: "unspecified AI agents",
      modelMaker: null,
      humanCollaborators: ["Shiva Kintali"],
      aiRole:
        "Kintali's own words on X: \"I showed that H1 <= 236 with the help of AI, building on Julia Stadlmann's work.\" He describes the method as the GPY approach with the Maynard-Tao sieve, and says he then stopped his AI agents and moved to another problem. That is the whole of the public disclosure: no model is named, the division of labour is not described, and there is no preprint.",
      aiContribution: "ai-assisted",
      verification: "unreviewed",
      verificationNote:
        "The thinnest source of the three 2026 bounded-gaps entries, and recorded as Candidate for that reason. An announcement on X with no preprint, no named model and no argument in public. It is recorded because a bound is a bound and this one held the record for two days between Stadlmann's 240 and Axiom Math's 212; it is not recorded as settled. If a preprint appears, this entry should be revisited.",
      resultNote:
        "$H_1 \\le 236$, between Stadlmann's $240$ of 31 August and Axiom Math's $212$ of 3 September. Superseded within two days, which Kintali noted himself.",
      significance: 62,
      significanceNote:
        "The closest mathematics has come to the twin prime conjecture. Level with the site's other bounded-gaps entries: the weight belongs to the question, and a step that stood for two days weighs the same as one that stood for twelve years in that respect.",
      publication: "announcement",
      sourceUrl: KINTALI_236,
      sourceName: "Shiva Kintali on X",
      ageNote:
        "Dated from Polignac's 1849 conjecture. The modern quantitative form dates from Goldston, Pintz and Yıldırım in 2005 and became a finite bound with Zhang in 2013.",
    },
    links: [{ label: "Stadlmann's 240, the bound this improves on", url: STADLMANN, kind: "independent" }],
  },
];

/// Writes the "approved" changelog row with raw SQL, naming only columns that
/// exist in BOTH schemas.
///
/// Why: the Records feature added a nullable `frontierId` to ProblemActivity,
/// and that schema is pushed to staging but not to production, because the
/// branch carrying the code has not merged. The generated client is built
/// from the branch schema, so `prisma.problemActivity.create()` sends
/// `frontierId` and production rejects it (P2022). Naming the columns
/// explicitly sidesteps the drift without a production DDL change ahead of
/// the code that needs it. Delete this and use the client again once the
/// records branch is merged and production has the column.
async function logApproved(problemId: string, userId: string, userName: string | null) {
  await prisma.$executeRawUnsafe(
    `INSERT INTO "ProblemActivity" ("problemId", "userId", "userName", "type") VALUES ($1, $2, $3, 'approved')`,
    problemId,
    userId,
    userName,
  );
}

async function main() {
  const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>("SELECT current_database() AS db");
  console.log(`database: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`);

  const admin = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });
  // Only needed to write. Staging has no member accounts (it is seeded from
  // problems.json, which carries entries and no users), so a dry run there
  // has to work without one.
  if (!admin && APPLY) throw new Error("curator not found on this database");

  let bad = 0;

  // --- the reversal ---
  const held = await prisma.problem.findUnique({
    where: { slug: REVERSE_186.slug },
    select: { id: true, status: true, submittedById: true, submittedBy: { select: { pseudonym: true } } },
  });
  if (!held) {
    console.log(`SKIP  ${REVERSE_186.slug}: not on this database (it is rejected, so it is not in problems.json)\n`);
  } else {
    console.log(`REVERSE  ${REVERSE_186.slug}  (${held.status} -> published, to ${held.submittedBy?.pseudonym})`);
    for (const [k, v] of Object.entries(REVERSE_186.fields)) {
      console.log(`  ${k.padEnd(17)}: ${String(v).slice(0, 70)}`);
    }
    console.log(`  message          : ${REVERSE_186.message.length}/${MESSAGE_MAX}`);
    if (REVERSE_186.message.length > MESSAGE_MAX) bad++;
    for (const l of REVERSE_186.links) if (l.label.length > 120) bad++;
  }

  // --- the two new entries ---
  for (const e of NEW_ENTRIES) {
    const exists = await prisma.problem.findUnique({ where: { slug: e.slug }, select: { id: true } });
    console.log(`\n${exists ? "EXISTS (skip)" : "CREATE"}  ${e.slug}`);
    if (exists) continue;
    for (const [k, v] of Object.entries(e.fields)) {
      const s = v === null ? "(null)" : String(v);
      console.log(`  ${k.padEnd(17)}: ${s.length > 70 ? `${s.slice(0, 70)}...` : s}`);
    }
    for (const l of e.links) if (l.label.length > 120) bad++;
  }

  if (bad) throw new Error(`${bad} limit violation(s)`);
  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  if (held) {
    const n = await prisma.problemLink.count({ where: { problemId: held.id } });
    await prisma.$transaction([
      prisma.problem.update({
        where: { id: held.id },
        data: {
          ...REVERSE_186.fields,
          reviewedAt: new Date(),
          reviewMessage: REVERSE_186.message,
          links: { create: REVERSE_186.links.map((l, i) => ({ ...l, position: n + i })) },
        } as never,
      }),
      prisma.directMessage.create({
        data: {
          userId: held.submittedById!,
          senderId: admin!.id,
          senderName: admin!.pseudonym,
          kind: "decision",
          reason: "edited",
          body: REVERSE_186.message.slice(0, MESSAGE_MAX),
          problemId: held.id,
        },
      }),
    ]);
    await logApproved(held.id, admin!.id, admin!.pseudonym);
    console.log(`applied: reversed ${REVERSE_186.slug}`);
  }

  for (const e of NEW_ENTRIES) {
    const exists = await prisma.problem.findUnique({ where: { slug: e.slug }, select: { id: true } });
    if (exists) continue;
    const created = await prisma.problem.create({
      data: {
        slug: e.slug,
        ...e.fields,
        status: "published",
        reviewedAt: new Date(),
        links: { create: e.links.map((l, position) => ({ ...l, position })) },
      } as unknown as Prisma.ProblemCreateInput,
    });
    await logApproved(created.id, admin!.id, admin!.pseudonym);
    console.log(`applied: created ${e.slug}`);
  }

  console.log(`\nAPPLIED - ${await prisma.problem.count({ where: { status: "published" } })} published entries`);
}

main().finally(() => prisma.$disconnect());
