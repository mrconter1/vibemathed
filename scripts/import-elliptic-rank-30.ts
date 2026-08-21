// The rank >= 30 elliptic curve, from the ICARM rank leaderboard.
//
// Entered as PARTIAL, not resolved. The open question is whether the ranks of
// elliptic curves over Q are unbounded, and a new record does not settle it -
// the same reading the catalog already applies to the matrix multiplication
// exponent and to the sphere-packing upper bounds.
//
// The result has two tiers and the entry says so: rank >= 30 is unconditional,
// exhibited by thirty independent points, while rank EXACTLY 30 needs GRH and
// BSD via Bober's bound. Only the unconditional half is what the record claims.
//
// Provenance is weaker than everything else in the catalog and is labelled as
// such. The AI credit is a comment edit on a leaderboard page, not a
// disclosure statement in a paper, so the wording is quoted rather than
// paraphrased and the note says where it came from.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "elliptic-curve-rank-record-thirty";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const FIELDS: Record<string, unknown> = {
  name: "Record Rank for an Elliptic Curve over $\\mathbb{Q}$",
  shortName: "Elliptic curve rank record",
  fieldGroup: "Number theory",
  field: "Elliptic curves",
  statement:
    "How large can the Mordell-Weil rank of an elliptic curve over $\\mathbb{Q}$ be? Whether ranks are unbounded is open, and progress is measured by explicit records, tabulated by Dujella: rank $\\ge 28$ from 2006, raised to $\\ge 29$ by Elkies and Klagsbrun in 2024. Now $\\ge 30$, witnessed by an explicit curve $y^2 + xy = x^3 + a_4 x + a_6$ with $a_4$ of 63 digits and $a_6$ of 94, carrying thirty independent rational points.",
  posedBy: "Classical; rank records tabulated by Andrej Dujella",
  yearPosed: null,
  solveType: "proved",
  resolution: "partial",
  resolutionMethod: "construction",
  solveDate: "2026-08-20",
  model: "Claude",
  modelMaker: "Anthropic",
  humanCollaborators: ["Levent Alpöge", "Ava Howell"],
  aiRole:
    "The credit, in full, is a comment on the leaderboard entry: \"it was Claude, with Levent Alpöge and Ava Howell!\" Bartosz Naskręcki, who works on these curves, congratulated \"Ava Howell, Levent Alpöge and the team Anthropic\" publicly. That is the whole of the disclosure: no paper, no statement of division of labour, and no account of what the model searched or proposed. The tier below is inferred from the wording rather than read off an author's description, which is weaker evidence than every arXiv entry in this catalog.",
  aiContribution: "ai-co-developed",
  verification: "unreviewed",
  verificationNote:
    "Recomputed by this site on 21 August 2026 from the leaderboard's own JSON, in exact rational arithmetic: all thirty witness points satisfy the curve equation with residual exactly zero, all thirty are distinct, nineteen are integral, and the discriminant recomputed from the a-invariants matches the published value, with all fourteen listed bad primes dividing it and together factoring it completely. What was NOT checked here is the one thing the record actually asserts - that the thirty points are independent in $E(\\mathbb{Q})$ modulo torsion. The leaderboard states it certifies independence by exact 2-descent with no floating point in the decision; that computation was not reproduced. The page is also living data: its commentary records that the original submission silently dropped a witness point through a parser bug, corrected three hours later.",
  significance: 50,
  significanceNote:
    "A closely watched benchmark: the record moved to 28 in 2006 and to 29 only in 2024, so it advances about once a decade, and the unbounded-ranks question behind it is a real problem in arithmetic geometry tied to BSD. Placed level with the sphere-packing upper bounds at 50 and just under the matrix multiplication exponent at 55, which is the same kind of ladder on a constant with wider consequences.",
  resultNote:
    "Two tiers, and only the first is the record. Rank $\\ge 30$ is unconditional, being thirty explicit independent points. Rank exactly 30 is conditional: applying Bober's bound (arXiv:1112.1503) with $\\Delta = 4.25$ gives an analytic rank of at most 31, and the root number is $+1$ so the rank is even, hence 30 - but that argument assumes GRH, and equating analytic rank with rank assumes BSD. The entry is a partial result because the open question is whether ranks are unbounded at all, which no single record answers.",
  publication: "announcement",
  sourceUrl: "https://elliptic-rank.icarm.cloud/curve/273",
  sourceName: "Elliptic Curve Rank Leaderboard, curve #273",
  renownLangs: 0,
};

const LINKS = [
  { label: "ICARM: new record-breaking elliptic curve reported", url: "https://icarm.io/news/new-record-breaking-elliptic-curve-reported/", kind: "announcement" },
  { label: "Curve data as JSON, including all thirty witness points", url: "https://elliptic-rank.icarm.cloud/curve/273.json", kind: "code" },
  { label: "Dujella's history of elliptic curve rank records", url: "https://web.math.pmf.unizg.hr/~duje/tors/rankhist.html", kind: "problem-record" },
  { label: "Bober, conditionally bounding analytic ranks", url: "https://arxiv.org/abs/1112.1503", kind: "paper" },
  { label: "Hacker News discussion", url: "https://news.ycombinator.com/item?id=49374873", kind: "discussion" },
];

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error("no admin");

  let bad = 0;
  for (const [k, v] of Object.entries(FIELDS)) {
    const lim = LIMITS.get(k);
    if (lim && typeof v === "string" && v.length > lim) {
      console.log(`  ${k} OVER BY ${v.length - lim} (${v.length}/${lim})`);
      bad++;
    }
  }
  if (bad) throw new Error("limits exceeded");

  const existing = await prisma.problem.findUnique({ where: { slug: SLUG } });
  console.log(`### ${SLUG}${existing ? "  (EXISTS - skip)" : ""}`);
  console.log(`    ${FIELDS.name}`);
  console.log(
    `    ${FIELDS.solveType}/${FIELDS.resolution}  sig=${FIELDS.significance}  ` +
    `ai=${FIELDS.aiContribution}  ver=${FIELDS.verification}  ` +
    `method=${FIELDS.resolutionMethod}  pub=${FIELDS.publication}`,
  );
  console.log(`    ${LINKS.length} links`);

  if (existing) return;
  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  await prisma.$transaction([
    prisma.problem.create({
      data: {
        slug: SLUG,
        ...(FIELDS as object),
        status: "published",
        links: { create: LINKS.map((l, position) => ({ ...l, position })) },
      } as never,
    }),
    prisma.problemActivity.create({
      data: {
        problem: { connect: { slug: SLUG } },
        user: { connect: { id: admin.id } },
        userName: admin.pseudonym ?? null,
        type: "created",
      },
    }),
  ]);
  const published = await prisma.problem.count({ where: { status: "published" } });
  console.log(`    CREATED - ${published} published`);
}

main().finally(() => prisma.$disconnect());
