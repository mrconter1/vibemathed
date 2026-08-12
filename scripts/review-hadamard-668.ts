// Review of the "Hadamard Matrix of Order 668" submission, 12 Aug 2026.
//
// Same shape as scripts/review-albertson-berman.ts.
//
// What was done here: the announcement is a single X long-post containing
// 23,828 characters of "+" and "-" and nothing else - no prose, no code, no
// separators. Epoch AI describes it as "posted in the form of a puzzle" and
// says it encodes matrices for every previously-open admissible order below
// 2000, which is why its length is not a multiple of 668.
//
// Decoding it partially succeeded. Three consecutive Goethals-Seidel
// quadruples sit at offsets 1376, 2268 and 3400, giving Hadamard matrices of
// orders 892, 1132 and 1244 - all previously open. All three were built
// explicitly and checked exactly in integer arithmetic: entries in {-1,+1}
// and H H^T = nI on the nose.
//
// Order 668 itself was NOT found, in any of the four standard seed shapes:
// Goethals-Seidel/Williamson quadruple (4 circulants of order 167),
// two-circulant core / Legendre pair (length 333), base sequences (total
// length 334), or negacyclic quadruple. Every offset was scanned for each.
// That absence is expected rather than damning - if order 668 were a
// classical GS quadruple it would have been found decades ago, which is
// precisely why it was the smallest open case - but it does mean the entry's
// own claim is the one part of the announcement that could not be checked.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";

interface Edit {
  field: string;
  key: string;
  value: unknown;
}

const SLUG = "hadamard-matrix-of-order-668";

const EDITS: Edit[] = [
  { field: "Posed by", key: "posedBy", value: "Raymond Paley" },
  { field: "Year posed", key: "yearPosed", value: 1933 },
  {
    field: "Field",
    key: "field",
    value: "Combinatorial design theory",
  },
  {
    field: "AI role",
    key: "aiRole",
    value:
      "The announcement is a bare string of 23,828 plus and minus signs with no accompanying text, so it carries no disclosure of its own. Epoch AI's record of it credits a team of three humans working with Claude, and the submission names Levent Alpöge (the poster), Philippe Voinov and Saul Reynolds-Haertle. Which mathematical, computational or search steps came from Claude is not stated anywhere, and no model version is given. The tier is therefore set at the floor the methodology prescribes for an unspecific disclosure rather than at what the framing suggests.",
  },
  {
    field: "Verification note",
    key: "verificationNote",
    value:
      "Partially reproduced by this site on 12 August 2026, with the entry's own claim the part that did not reproduce. The announcement is a single X long-post holding 23,828 characters of \"+\" and \"-\" and nothing else: no prose, no code, no separators. Epoch AI describes it as posted in the form of a puzzle and says it encodes matrices for every previously-open admissible order below 2000, which explains why its length is not a multiple of 668. Decoding it here succeeded in part. Three consecutive Goethals-Seidel quadruples sit at offsets 1376, 2268 and 3400, and the matrices they generate were built explicitly and checked in exact integer arithmetic: all entries in {-1,+1} and H H^T equal to nI exactly, for n = 892, 1132 and 1244. All three of those orders were previously open, so the announcement demonstrably contains genuine new Hadamard matrices, and the odds of a random sign string satisfying the Goethals-Seidel autocorrelation condition even once are negligible. Order 668 was not located. Every offset in the string was scanned for each of the four standard seed shapes - a Goethals-Seidel or Williamson quadruple of four circulants of order 167, a two-circulant core or Legendre pair of length 333, base sequences of total length 334, and a negacyclic quadruple - and none occurs anywhere. That absence is expected rather than suspicious: had order 668 been a classical quadruple of this kind it would have been found decades ago, which is exactly why it was the smallest open case. Roughly 19,000 of the 23,828 characters remain undecoded here. So: the announcement is real and contains verified new matrices, the specific order-668 claim is unverified, and no independent expert review or published construction exists.",
  },
  {
    field: "Claim issue",
    key: "claimIssueNote",
    value:
      "The announcement cannot be checked as posted. It is an undocumented sign string with no construction, code or prose attached, and the order-668 seed is not present in any standard encoding, so the central claim of this entry rests on the author's word plus Epoch AI's provisional record. Epoch itself hedges twice, marking the solve as AI-attributed only provisionally and noting it is unclear whether the result is an improved search or a general construction. Other trackers (TheoremDB, EmergentMind) still list order 668 as open, though their records predate the announcement.",
  },
  {
    field: "Result note",
    key: "resultNote",
    value:
      "Claimed construction of the smallest previously unresolved Hadamard order; the general Hadamard conjecture remains open. The same announcement is reported to cover every previously-open admissible order below 2000, and this site independently confirmed three of them - orders 892, 1132 and 1244 - by exact arithmetic. Order 668 itself has not been extracted from the announcement by anyone publicly, including here.",
  },
  { field: "Significance", key: "significance", value: 30 },
  {
    field: "Significance note",
    key: "significanceNote",
    value:
      "Order 668 has been the smallest open case of the Hadamard conjecture since order 428 was settled in 2004, and it is a named target in the design-theory literature and a listed FrontierMath open problem. Scored as one hard instance of a famous 1933 conjecture rather than the conjecture itself, which would sit far higher; placed level with a well-tracked specialist problem and below the household combinatorics conjectures.",
  },
  {
    field: "Age note",
    key: "ageNote",
    value:
      "The Hadamard conjecture dates to Paley in 1933. Order 668 became the smallest open admissible order in 2004, when Kharaghani and Tayfeh-Rezaie settled order 428; before that the record fell in 1985.",
  },
  {
    field: "Renown note",
    key: "renownNote",
    value:
      "The Hadamard conjecture has a Wikipedia article; order 668 as a specific target does not, but it is tracked by name on Epoch AI's FrontierMath open-problem list, TheoremDB and EmergentMind, and is standard background in combinatorial design theory.",
  },
];

const LINKS = [
  {
    label: "Epoch AI - FrontierMath open problem (records the solve)",
    url: "https://epoch.ai/frontiermath/open-problems/hadamard",
    kind: "problem-record",
  },
  {
    label: "Eliahou, A 64-modular Hadamard matrix of order 668 (2025)",
    url: "https://ajc.maths.uq.edu.au/pdf/93/ajc_v93_p422.pdf",
    kind: "paper",
  },
  {
    label: "Recent Legendre-pair work on order 668",
    url: "https://arxiv.org/abs/2607.20765",
    kind: "paper",
  },
  {
    label: "TheoremDB record for order 668",
    url: "https://theoremdb.org/statements/hadamard-order-668/",
    kind: "problem-record",
  },
];

const MESSAGE = `Published as a Candidate, and I got further with the announcement than I expected to - though not all the way to 668.

The post is 23,828 characters of "+" and "-" with no prose, code or separators, so I could not take it on trust. I decoded what I could. Three consecutive Goethals-Seidel quadruples sit at offsets 1376, 2268 and 3400. I built the matrices they generate and checked them in exact integer arithmetic: entries in {-1,+1} and H H^T = nI exactly, for n = 892, 1132 and 1244, all previously open orders. A random sign string does not satisfy that autocorrelation condition even once, let alone three times running, so the announcement is real and does contain new Hadamard matrices.

Order 668 I could not find. I scanned every offset for all four standard seed shapes - a Goethals-Seidel or Williamson quadruple of four circulants of order 167, a two-circulant core or Legendre pair of length 333, base sequences of total length 334, and a negacyclic quadruple - and none occurs anywhere in the string. I read that as expected rather than damning: if 668 were a classical quadruple it would have been found decades ago, which is why it was the smallest open case. But it does mean this entry's own claim is the one part I cannot confirm.

So it stays Candidate and Unreviewed, with a claim-issue flag saying the announcement cannot be checked as posted. Everything I ran is in the verification note.

Two corrections. Your note said the announcement "supplies an explicit executable construction" - it does not; there is nothing but the sign string, and Epoch describes it as posted as a puzzle. And the AI role now says plainly that no disclosure of Claude's specific contribution exists, which is what holds this at AI-assisted.

I kept your three collaborator names, but could not corroborate the two besides Alpöge anywhere reachable - the post names nobody. If they came from a reply, fine; I just could not read the thread.

Significance 30, plus history notes. Good find.`;

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
      s === null ? "(empty)" : s.length > 100 ? `${s.slice(0, 100)}...` : s;
    console.log(`  ${c.field}:\n    - ${short(c.oldValue)}\n    + ${short(c.newValue)}`);
  }
  console.log(`\n  links: ${p.links.length} -> ${LINKS.length}`);
  console.log(`  unchanged: resolution=${p.resolution}, verification=${p.verification}, aiContribution=${p.aiContribution}`);
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
