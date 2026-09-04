// The bounded-gaps record: H_1 = liminf (p_{n+1} - p_n).
//
// The companion to the long-gaps record already seeded. Same problem family,
// opposite direction: long gaps asks how far apart consecutive primes can be
// forced to get, this asks how close they keep coming back. Lower is better.
//
// Why this record is worth having beyond symmetry: it is the sharpest example
// on the site of what the catalog is trying to record. The bound stood at 246
// from 2014 until 31 August 2026, and then moved FOUR TIMES IN FOUR DAYS -
// 240, 236, 212, and a held claim of 186 - three of those four with AI in the
// loop. No prose in a significance note conveys that; the staircase does.
//
// Every row's source was opened and read. Values, dates and attributions are
// from those sources, not from memory.
//
// Apply AFTER scripts/import-bounded-gaps-2026-09-04.ts has run against
// production and staging has been reseeded from a fresh export - the three AI
// rows point at catalog entries by slug, and this script refuses to run until
// they resolve. What follows is the reasoning that produced them:
//
//   1. The 186 row was HELD on the morning of 4 September, partly on my
//      finding that the paper behind it was not public. That finding was
//      wrong - the paper is "Improved short gaps between primes" (OpenAI,
//      30 August 2026), at the sibling URL of the long-gaps PDF this site
//      verified the same day. The import script reverses that hold, so the
//      row is `published` here and, on value, the frontier.
//   2. The 212 and 236 results had no catalog entry; the import script
//      creates both, so every AI row on this record is an entry. The human
//      rungs - Zhang, Polymath8a, Maynard, Polymath8b, Stadlmann - stay
//      cited historical rows, because the catalog records AI-in-the-loop
//      results and Zhang 2013 is not one.
//   3. Hence no row here is an AI result without an entry, which is the rule
//      a record is meant to satisfy.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const WIKI_GAP = "https://en.wikipedia.org/wiki/Prime_gap";
const STADLMANN = "https://arxiv.org/abs/2608.31126";
const KINTALI = "https://x.com/ShivaKintali/status/2095547543061135765";
const AXIOM = "https://primegaps.axiommath.ai/";
const OPENAI_186 = "https://cdn.openai.com/pdf/51126fac-1b68-4128-9666-c908bcc16033/short_gaps.pdf";

type Row = {
  date: string;
  valueTex: string;
  valueShortTex?: string;
  valueNumeric?: number;
  attribution: string;
  sourceUrl?: string;
  status?: "published" | "candidate" | "historical" | "retracted";
  note?: string;
  problemSlug?: string;
};

const SLUG = "bounded-prime-gaps";

const NAME = "Smallest proved bound on infinitely recurring prime gaps";
const SHORT = "Bounded prime gaps";
const QUANTITY =
  "$H_1 = \\liminf_{n \\to \\infty} (p_{n+1} - p_n)$: the smallest $H$ for which infinitely many pairs of consecutive primes are at most $H$ apart.";
const STATEMENT =
  "The twin prime conjecture says $H_1 = 2$. Every approach descends from Goldston, Pintz and Yildirim, who in 2005 showed the gap is infinitely often smaller than any fixed multiple of $\\log p_n$ without producing a finite bound. Zhang gave the first finite one in 2013, and the Polymath and Maynard work brought it to 246 within eighteen months. There it stayed for twelve years. Between 31 August and 3 September 2026 it moved four times, three of them with AI in the loop.";

const ROWS: Row[] = [
  {
    date: "2013",
    valueTex: "$7 \\times 10^{7}$",
    valueShortTex: "$7 \\times 10^{7}$",
    valueNumeric: 70000000,
    attribution: "Zhang",
    sourceUrl: WIKI_GAP,
    status: "historical",
    note: "The first finite bound. Seventy million, and the point was that it was finite at all.",
  },
  {
    date: "2013-07-20",
    valueTex: "$4680$",
    valueNumeric: 4680,
    attribution: "Polymath8a",
    sourceUrl: WIKI_GAP,
    status: "historical",
    note: "A collaborative optimisation of Zhang's argument, in under two months.",
  },
  {
    date: "2013-11",
    valueTex: "$600$",
    valueNumeric: 600,
    attribution: "Maynard",
    sourceUrl: "https://arxiv.org/abs/1311.4600",
    status: "historical",
    note: "A new multidimensional refinement of the GPY sieve, independent of Zhang's equidistribution work.",
  },
  {
    date: "2014",
    valueTex: "$246$",
    valueNumeric: 246,
    attribution: "Polymath8b",
    sourceUrl: "https://arxiv.org/abs/1407.4897",
    status: "historical",
    note: "Stood as the record for twelve years. AxiomProver's Lean formalisation of this bound was completed in August 2026.",
  },
  {
    date: "2026-08-31",
    valueTex: "$240$",
    valueNumeric: 240,
    attribution: "Stadlmann",
    sourceUrl: STADLMANN,
    status: "historical",
    note: "No AI involved. Combines Bombieri-Vinogradov with newer equidistribution estimates for smooth moduli. The row that ended twelve years of stasis.",
  },
  {
    date: "2026-09-01",
    valueTex: "$236$",
    valueNumeric: 236,
    attribution: "Kintali, with AI",
    status: "published",
    problemSlug: "bounded-prime-gaps-at-most-236",
    note: "Announced on X, building on Stadlmann's work. Held the record for two days.",
  },
  {
    date: "2026-09-03",
    valueTex: "$212$",
    valueNumeric: 212,
    attribution: "Charton, Hong, Lau, Ono, Remy, Siu, Swaminathan, Thorner and Xie (Axiom Math)",
    status: "published",
    problemSlug: "bounded-prime-gaps-at-most-212",
    note: "Builds on Stadlmann. AxiomProver generated the Lean certificate of the deduction; the mathematics is the authors'.",
  },
  {
    date: "2026-08-30",
    valueTex: "$186$",
    valueNumeric: 186,
    attribution: "GPT 6 Astra (OpenAI)",
    status: "published",
    problemSlug: "prime-gaps-at-most-186",
    note: "The paper is dated 30 August, before Stadlmann's 240, though the Lean development and repository appeared on 2 September. Its formal proof is conditional on three unformalised inputs: two Kloosterman-type bounds and a package of numerical inequalities, so the entry is Lean-checked rather than Lean-verified.",
  },
];

async function main() {
  const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>("SELECT current_database() AS db");
  if (db !== "vibemathed_staging") throw new Error(`refusing: connected to "${db}", not vibemathed_staging`);

  const slugs = ROWS.map((r) => r.problemSlug).filter((s): s is string => !!s);
  const found = await prisma.problem.findMany({ where: { slug: { in: slugs } }, select: { id: true, slug: true } });
  const missing = slugs.filter((s) => !found.some((f) => f.slug === s));
  if (missing.length) throw new Error(`entries not found: ${missing.join(", ")}`);

  console.log(`${SLUG}  (min: lower is better)\n`);
  for (const r of ROWS) {
    const st = r.status ?? "historical";
    console.log(
      `  ${r.date.padEnd(11)} ${st.padEnd(10)} ${String(r.valueNumeric ?? "?").padStart(9)}  ${r.attribution.slice(0, 46).padEnd(46)} ${r.problemSlug ?? ""}`,
    );
    if (!r.problemSlug && !r.sourceUrl) throw new Error(`row without a source: ${r.date}`);
  }
  const entryRows = ROWS.filter((r) => r.problemSlug).length;
  console.log(`\n  ${ROWS.length} rows, ${entryRows} of them catalog entries`);
  if (entryRows === 0) {
    console.log(
      "  WARNING: no catalog entry sits on this record. Under the rule agreed on\n" +
        "  4 September a record exists only once one does, so this is exactly the\n" +
        "  case the operator has to decide before --apply is meaningful.",
    );
  }

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true },
  });

  const rec = await prisma.record.upsert({
    where: { slug: SLUG },
    create: {
      slug: SLUG,
      name: NAME,
      shortName: SHORT,
      quantity: QUANTITY,
      statement: STATEMENT,
      direction: "min",
      field: "Analytic number theory",
      fieldGroup: "Number theory",
      significance: 62,
      significanceNote:
        "The closest mathematics has come to the twin prime conjecture, and the most-watched number in analytic number theory since Zhang in 2013. Slightly above the long-gaps record at 60: same family, but this one is the approach to a famous conjecture rather than a quantitative question of Erdos, and it has moved four times in four days.",
      historyNote:
        "Rows through 2014 follow the Wikipedia article on prime gaps, with Maynard and Polymath8b cited to their own preprints. Stadlmann is arXiv 2608.31126. The 236 row is an announcement on X with no preprint identified. The 212 row is the Axiom Math announcement and its formalisation site. The 186 row is OpenAI's paper of 30 August 2026, held from publication here pending review and therefore not counted as the record.",
      createdById: curator?.id ?? null,
    },
    update: { statement: STATEMENT, quantity: QUANTITY },
  });

  await prisma.recordRow.deleteMany({ where: { recordId: rec.id } });
  await prisma.recordRow.createMany({
    data: ROWS.map((r) => {
      const p = r.problemSlug ? found.find((f) => f.slug === r.problemSlug)! : null;
      return {
        recordId: rec.id,
        date: r.date,
        valueTex: r.valueTex,
        valueShortTex: r.valueShortTex ?? null,
        valueNumeric: r.valueNumeric ?? null,
        attribution: r.attribution,
        sourceUrl: r.sourceUrl ?? null,
        status: r.status ?? "historical",
        note: r.note ?? null,
        problemId: p?.id ?? null,
      };
    }),
  });

  const already = await prisma.problemActivity.count({ where: { recordId: rec.id, type: "created" } });
  await prisma.problemActivity.create({
    data: {
      recordId: rec.id,
      userId: curator?.id ?? null,
      userName: curator ? "Rasmus Lindahl" : "Curator",
      type: already === 0 ? "created" : "updated",
    },
  });

  console.log(`\nAPPLIED: ${SLUG} with ${ROWS.length} rows`);
}

main().finally(() => prisma.$disconnect());
