// Review of the Gamow liquid-drop minimizer submission, 13 Aug 2026.
//
// The paper is a nine-page arXiv v1 by Chodosh (Stanford) and Gianocca (ETH).
// Its LaTeX source was pulled from arXiv and read in full, and every piece of
// its quantitative content was rederived here rather than trusted:
//
//   - V_* recovered independently by comparing E(B_V) against 2E(B_{V/2}) as
//     the separation tends to infinity, giving V > 5(1-2^{1/3})/(2^{-2/3}-1),
//     which is the paper's 5(2-2^{2/3})/(2^{2/3}-1) after clearing radicals;
//   - the constant |B_1|P(B_1)/D(B_1) = 5 checked against D(B_R)=16pi^2R^5/15;
//   - the corollary's minimisation of (36pi)^{1/3}(V^{-1/3}+V^{2/3}/5), which
//     does attain its minimum at V = 5/2 with value 3(9pi/5)^{1/3};
//   - the submitter's alternative form (9/2)(8pi/15)^{1/3}, which is NOT in
//     the paper and is genuinely equal to it (both cube to 48.6pi);
//   - both algebraic identities driving the uniqueness and nonexistence
//     arguments, the normalisation 2^{-2/3}(V_*+10) = V_*+5, the optimisation
//     max_{s>=0}(Ls-3s^3) = (V+10)^{3/2}/9, and the closing numerical claim
//     that (V+10)^3/(V-2) is nonincreasing on [6,8] with value 1024 < 1296;
//   - the case split of Proposition 2.4 (minimum V+2 for V <= 6, 4sqrt(V-2)
//     for V >= 6).
//
// Every cited paper the argument leans on was located and its DOI resolved.
// What was NOT checked is the capacitary estimate and the distributional
// Bochner lemma, which is where the new mathematics actually lives, so the
// verification tier stays Unreviewed.
//
// One axis change: Candidate -> Resolved. The submitter's reading of the
// label is literally correct, but the catalog carries 311 unrefereed
// preprints as Resolved against 8 as Candidate, and Candidate is reserved in
// practice for claims awaiting a specific arbiter (typically the Erdos
// tracker). Preprint + Unreviewed already carries the uncertainty.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "gamow-liquid-drop-minimizer-conjecture";

interface Edit {
  field: string;
  key: string;
  value: unknown;
}

const EDITS: Edit[] = [
  { field: "Status", key: "resolution", value: "resolved" },
  {
    field: "Verification note",
    key: "verificationNote",
    value:
      "Checked by this site on 13 August 2026, the day after the preprint appeared. The AI-usage statement was confirmed verbatim in two independent places: the arXiv listing comment for 2608.11517v1 and the paper's own opening section, both of which say the results were obtained by ChatGPT 5.6 Pro over a series of chats without significant assistance from the authors, that the fundamental strategy remains close to the original output, and that the article contains no AI-written text. The paper's LaTeX source was retrieved from arXiv and read in full, and its quantitative content was rederived here rather than trusted. The threshold was recovered independently by comparing the energy of one ball against two balls of half the volume as their separation tends to infinity, which gives splitting as favourable exactly when V exceeds 5(1-2^(1/3))/(2^(-2/3)-1); that is the paper's 5(2-2^(2/3))/(2^(2/3)-1) after clearing radicals, and both evaluate to 3.5121. The normalising constant |B_1|P(B_1)/D(B_1) = 5 checks against the standard D(B_R) = 16(pi^2)(R^5)/15. The corollary's minimisation of (36pi)^(1/3)(V^(-1/3) + V^(2/3)/5) does attain its minimum at V = 5/2 with value 3(9pi/5)^(1/3), and the alternative closed form (9/2)(8pi/15)^(1/3), which the submitter added and the paper does not state, is genuinely equal to it - both cube to 48.6pi. The two algebraic identities the argument turns on expand as claimed, as does the normalisation 2^(-2/3)(V_*+10) = V_*+5, the optimisation max over s >= 0 of Ls-3s^3 giving (V+10)^(3/2)/9, and the closing numerical claim that (V+10)^3/(V-2) is nonincreasing on [6,8] with value 1024 < 1296 at V = 6. The case split of Proposition 2.4 was also rederived. Every source the argument leans on is a real, locatable paper with a resolving DOI: Frank-Nam for existence up to the threshold, Frank-Killip-Nam for nonexistence above volume 8 (which is what the second proof reduces to), Agostiniani-Mazzieri for the monotonicity formula being improved, Bonacini-Cristoferi for regularity of minimizers, and Chodosh-Ruohoniemi for the previous best minimality range. What was NOT checked here is the capacitary estimate of Proposition 2.4 and the distributional Bochner lemma behind it, which is where the new mathematics actually lives; that needs a geometric analyst rather than arithmetic. The manuscript is one day old, unrefereed, and carries no public endorsement by an independent expert. The authors state they checked and reworked the proof themselves, and by this site's rule an author checking their own proof is an expert verifying their own work, not independent verification - so the tier stays Unreviewed.",
  },
  { field: "Significance", key: "significance", value: 35 },
  {
    field: "Significance note",
    key: "significanceNote",
    value:
      "The central open problem of the liquid-drop and nonlocal-isoperimetric literature: the sharp threshold separating existence from nonexistence of fixed-volume minimizers, together with uniqueness of the ball below it. Not eponymous, and with no Wikipedia article of its own. What lifts it above a single-subfield problem is reach: it is tracked across calculus of variations, mathematical physics and geometric analysis at once, it has a 2017 Notices of the AMS survey written for a general mathematical audience (Choksi-Muratov-Topaloglu, Notices 64, 1275-1283), and its partial-results literature carries names like Lieb, Otto, Figalli and Maggi. That cross-community reach is the concrete reason it is placed level with Polya's conjecture for Neumann balls (35) rather than with the HRT conjecture (33), which is the central problem of one subfield and has no comparable general-audience survey. It sits below the eponymous-famous band of Sendov and the Erdos unit distance problem (40), which have their own Wikipedia articles and are recognisable outside their fields.",
  },
  {
    field: "What was actually shown",
    key: "resultNote",
    value:
      "The complete fixed-volume picture, closing a gap that partial results had narrowed from both ends without meeting: balls uniquely minimize for every volume up to V_* = 3.51..., and above it no minimizer exists at all. Before this the best minimality range was V <= 1 (Chodosh-Ruohoniemi, 2025) and the best nonexistence bound V >= 7.5 (Schulz, posted two days earlier), so the open middle ran from 1 to 7.5. Frank-Nam had already proved existence up to V_*, and the new proof uses it; the fresh content is uniqueness of the ball across the whole range and nonexistence immediately above the threshold. A corollary settles the minimal binding energy question of Frank-Lieb: the infimum of E(Omega)/|Omega| is 3(9pi/5)^(1/3), attained exactly at balls of volume 5/2. The mechanism is a capacitary estimate that sharpens an Agostiniani-Mazzieri monotonicity formula using Gauss-Bonnet, an improvement the authors note applies only to this particular weight and only in three dimensions.",
  },
  {
    field: "Age note",
    key: "ageNote",
    value:
      "Gamow introduced the functional to model the atomic nucleus around 1930 - the paper's text says 1928 while the reference it gives is his 1930 Proc. R. Soc. A paper on the mass defect curve, a discrepancy of no consequence to the result. The sharp-threshold conjecture itself is a modern formulation with no single canonical posing: the authors say only that it has appeared in several places, citing Choksi-Peletier (2011), Frank-Lieb (2015) and Frank-Nam (2021). Year posed is left empty rather than guessed at.",
  },
  {
    field: "Posed by",
    key: "posedBy",
    value:
      "George Gamow (the functional, c. 1930); the sharp-threshold conjecture stated in the modern liquid-drop literature",
  },
  {
    field: "Renown note",
    key: "renownNote",
    value:
      "No Wikipedia article for this problem. Wikipedia's liquid drop model article covers the nuclear-physics concept rather than the minimization conjecture, so it does not count under the notability rule.",
  },
];

const LINKS = [
  {
    label: "Chodosh and Gianocca, No compromise in the liquid drop model (arXiv:2608.11517)",
    url: "https://arxiv.org/abs/2608.11517",
    kind: "paper",
  },
  {
    label: "Frank-Lieb (2015), source of the minimal binding energy question",
    url: "https://doi.org/10.1137/15M1010658",
    kind: "problem-record",
  },
  {
    label:
      "Chodosh and Ruohoniemi, On minimizers in the liquid drop model (CPAM 2025) - previous best minimality range, V <= 1",
    url: "https://doi.org/10.1002/cpa.22229",
    kind: "paper",
  },
  {
    label:
      "Frank and Nam, Existence and nonexistence in the liquid drop model (Calc. Var. 2021) - existence up to the threshold, used by the proof",
    url: "https://doi.org/10.1007/s00526-021-02072-9",
    kind: "paper",
  },
  {
    label:
      "Frank, Killip and Nam, Nonexistence of large nuclei in the liquid drop model (Lett. Math. Phys. 2016) - the V > 8 bound the nonexistence proof reduces to",
    url: "https://doi.org/10.1007/s11005-016-0860-8",
    kind: "paper",
  },
  {
    label:
      "Agostiniani and Mazzieri, Monotonicity formulas in potential theory (Calc. Var. 2020) - the estimate the capacitary argument sharpens",
    url: "https://doi.org/10.1007/s00526-019-1665-2",
    kind: "paper",
  },
  {
    label:
      "Schulz, An improved nonexistence bound for the liquid drop model (arXiv:2608.09000) - the V >= 7.5 bound from two days earlier",
    url: "https://arxiv.org/abs/2608.09000",
    kind: "paper",
  },
];

const MESSAGE = `Published as Resolved, significance 35, with a fuller set of notes.

One axis change: Candidate to Resolved. Your reading of the label is literally right, referees have not seen this. But the catalog carries 311 unrefereed preprints as Resolved against 8 as Candidate, and Candidate is used in practice where a specific arbiter is actually pending, usually the Erdos tracker. Preprint plus Unreviewed already says nobody has checked it, so Candidate on top would double-count the same uncertainty and make this look weaker than 311 comparable entries.

Everything else you sent held up. I confirmed the AI-usage statement verbatim in two places, the arXiv listing comment and the paper's own opening section. It is about as clean an ai-discovered case as that tier gets.

I pulled the LaTeX source and rederived the quantitative content rather than trusting it. V_* came out of an independent two-ball comparison as 5(1-2^(1/3))/(2^(-2/3)-1), which is the paper's expression after clearing radicals. D(B_R) = 16(pi^2)(R^5)/15 gives their constant 5. The corollary does minimise at V = 5/2 with value 3(9pi/5)^(1/3), and your alternative form (9/2)(8pi/15)^(1/3) is genuinely equal to it - both cube to 48.6pi. I checked that one specifically because it is yours and not in the paper. The identities behind the uniqueness and nonexistence arguments expand as claimed, as does 2^(-2/3)(V_*+10) = V_*+5 and the closing 1024 < 1296 on [6,8].

What I could not check is the capacitary estimate and the Bochner lemma under it, which is where the new mathematics actually is. So Unreviewed stands: the authors reworked the proof themselves, and here an author checking their own work is not independent verification.

Added significance, result, age and renown notes, and links to Chodosh-Ruohoniemi, Frank-Nam, Frank-Killip-Nam, Agostiniani-Mazzieri and Schulz.`;

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
  console.log(
    `  unchanged: verification=${p.verification}, aiContribution=${p.aiContribution}, ` +
      `publication=${p.publication}, model=${p.model}, yearPosed=${p.yearPosed}`,
  );
  console.log(`\n  message: ${MESSAGE.length} chars (max ${MESSAGE_MAX})`);
  if (MESSAGE.length > MESSAGE_MAX) {
    throw new Error(`message over by ${MESSAGE.length - MESSAGE_MAX} chars`);
  }

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
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
