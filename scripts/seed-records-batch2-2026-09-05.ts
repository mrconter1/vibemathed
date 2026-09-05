// Three more records, chosen against one test: is this a clearly contained
// quantity that somebody can make progress on?
//
// That test rejected more candidates than it accepted. It rules out the
// sphere-packing upper bounds and the binary-code bounds, which are a
// rate-distance CURVE rather than one number; the permanent formula lower
// bound, which is a growth rate with a thin public history; and Multiway Cut,
// where an upper and a lower bound move independently, so there is no single
// frontier. Ramsey lower bounds, Shannon capacities of odd cycles and the
// Hadamard orders are each MANY records in one entry - real, but they need one
// record per parameter and a curator with an afternoon.
//
// What passed:
//
//   1. Randomized metric distortion. The cleanest staircase on the site: four
//      values in two years, three of them in 2026, with a known target the
//      field is closing on. Lower is better.
//   2. The systole constant in every large genus. Three values, and our own
//      entry already named the ladder it climbs.
//   3. The kissing number in dimension 19. A single integer. Short history -
//      see the note below - but Wikipedia maintains the table and the AI
//      result is already in it.
//
// Every historical row cites where the value was read, which for two of these
// is the 2026 paper's own account of what it improves. That is weaker than
// reading each original and the history notes say so.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const DISTORTION = "https://arxiv.org/abs/2608.29308";
const SYSTOLE = "https://arxiv.org/abs/2608.26660";
const KISSING = "https://arxiv.org/abs/2603.10425";


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

type Rec = {
  slug: string;
  name: string;
  shortName: string;
  quantity: string;
  statement: string;
  direction: "min" | "max";
  field: string;
  fieldGroup: string;
  significance: number;
  significanceNote: string;
  historyNote: string;
  rows: Row[];
};

const RECORDS: Rec[] = [
  {
    slug: "randomized-metric-distortion",
    name: "Randomized metric distortion",
    shortName: "Metric distortion",
    quantity:
      "The smallest distortion achievable by a randomized voting rule that sees only rankings: the worst-case ratio between the expected cost of the lottery it returns and the cost of the best candidate.",
    statement:
      "Voters rank candidates by distance in an unknown metric space, and a rule sees only the rankings. For deterministic rules the best achievable distortion is exactly 3. Randomized rules do better, and how much better was open: the upper bound fell three times in 2026 alone, from 2.753 to 2.5 to 2.3282, against a known lower bound of about 2.1126 that nobody has reached.",
    direction: "min",
    field: "Algorithmic game theory",
    fieldGroup: "Theoretical computer science",
    significance: 18,
    significanceNote:
      "A specific quantity in metric social choice with a live literature and a known target: the gap between the 2.3282 upper bound and the 2.1126 lower bound is what the area is working on. Narrow, and unknown outside algorithmic game theory. Level with the catalog entry for the 2026 step.",
    historyNote:
      "The values and their attributions are as stated in Shah's paper (arXiv:2608.29308), which names Charikar, Ramakrishnan, Wang and Wu for 2.753 and Frank and Ye independently for 2.5, with links to both preprints. The deterministic bound of 3 is context rather than a row: it is a different class of rule and is exactly achievable, not a record anybody is pushing.",
    rows: [
      {
        date: "2024",
        valueTex: "$2.753$",
        valueNumeric: 2.753,
        attribution: "Charikar, Ramakrishnan, Wang and Wu",
        sourceUrl: DISTORTION,
        status: "historical",
        note: "JACM 2024. The first constant separation from deterministic rules, which are stuck at exactly 3.",
      },
      {
        date: "2026-08",
        valueTex: "$2.5$",
        valueNumeric: 2.5,
        attribution: "Frank, and independently Ye",
        sourceUrl: "https://arxiv.org/abs/2608.17863",
        status: "historical",
        note: "Two independent preprints the same month, both by an equal mixture of maximal lottery and Integrated Veto. The existing arguments could not be pushed past this with any mixture of those rules.",
      },
      {
        date: "2026-08-29",
        valueTex: "$11641/5000 = 2.3282$",
        valueShortTex: "$2.3282$",
        valueNumeric: 2.3282,
        attribution: "GPT-5.6 Sol and Claude Opus 5.0, with Shah",
        problemSlug: "improving-randomized-metric-distortion-to-2-3282",
        note: "Breaks the barrier the previous two ran into, with a random-size stable lottery. Closes about 44% of the remaining gap to the lower bound.",
      },
    ],
  },
  {
    slug: "systole-every-large-genus",
    name: "Systole growth in every large genus",
    shortName: "Systoles",
    quantity:
      "The largest $c$ for which every sufficiently large genus $g$ admits a closed hyperbolic surface of systole at least $(c - o(1))\\log g$; equivalently $\\liminf_g \\max\\{\\mathrm{sys}(S) : S \\in \\mathcal{M}_g\\} / \\log g \\ge c$.",
    statement:
      "How long can the shortest closed geodesic on a hyperbolic surface be forced to be, as a multiple of $\\log g$? The constant $1$ was reached along a subsequence of genera by Petri and Walker, following Erdos and Sachs, decades ago. Doing it in EVERY sufficiently large genus is the harder question, and its constant crept from 19/120 to 2/9 before reaching 1 in 2026.",
    direction: "max",
    field: "Hyperbolic geometry",
    fieldGroup: "Geometry & topology",
    significance: 22,
    significanceNote:
      "A specific constant in the geometry of hyperbolic surfaces, with a clear ladder and a natural ceiling: the every-genus constant has now caught up with what was already known along a subsequence. Level with the catalog entry for the 2026 step. Narrow, and unknown outside the area.",
    historyNote:
      "The two earlier constants and their attributions are as stated in Cai's paper (arXiv:2608.26660), which is where they were read; the original Katz-Sabourau and Liu-Petri papers were not opened here, and the dates below are therefore left as the decade rather than invented.",
    rows: [
      {
        date: "2010",
        valueTex: "$19/120$",
        valueShortTex: "$19/120 \\approx 0.158$",
        valueNumeric: 0.1583,
        attribution: "Katz and Sabourau",
        sourceUrl: SYSTOLE,
        status: "historical",
        note: "Date approximate: recorded from the 2026 paper's account, not from the original.",
      },
      {
        date: "2020",
        valueTex: "$2/9$",
        valueShortTex: "$2/9 \\approx 0.222$",
        valueNumeric: 0.2222,
        attribution: "Liu and Petri",
        sourceUrl: SYSTOLE,
        status: "historical",
        note: "By a random construction. Date approximate, as above.",
      },
      {
        date: "2026-08-27",
        valueTex: "$1$",
        valueNumeric: 1,
        attribution: "GPT-5.6 Sol, with Cai",
        problemSlug: "large-systoles-in-every-sufficiently-large-genus",
        note: "Brings the every-genus constant up to the value already known along a subsequence. The paper says the proof \"was developed by GPT-5.6 Sol through an extended discussion with the author\".",
      },
    ],
  },
  {
    slug: "kissing-number-dimension-19",
    name: "Kissing number in dimension 19",
    shortName: "Kissing number, d=19",
    quantity:
      "The largest known $k$ such that $k$ non-overlapping unit spheres can all touch one central unit sphere in $\\mathbb{R}^{19}$: a lower bound on the kissing number $\\tau_{19}$.",
    statement:
      "The kissing number is known exactly in dimensions 1, 2, 3, 4, 8 and 24 and in no others. Dimension 19 is one of the open ones, and progress is a construction: exhibit more spheres than anyone has before. The upper bound stands at 24,417, so the true value is somewhere in a gap of more than twelve thousand.",
    direction: "max",
    field: "Discrete geometry",
    fieldGroup: "Geometry & topology",
    significance: 25,
    significanceNote:
      "One value of a classical quantity that Wikipedia and the sphere-packing literature both track by dimension. Level with the catalog entry for the 2026 step. Progress is by explicit construction, which makes it checkable but also incremental.",
    historyNote:
      "A short history on purpose. The 2026 paper states that it improves the bound of Cohn and Li by 256, which fixes the immediately preceding value at 11,692; earlier rungs exist in the sphere-packing literature but were not read here, and this site does not list values it has not seen. Wikipedia's kissing-number table already carries the new value and cites the same paper.",
    rows: [
      {
        date: "2023",
        valueTex: "$11{,}692$",
        valueNumeric: 11692,
        attribution: "Cohn and Li",
        sourceUrl: KISSING,
        status: "historical",
        note: "Recorded from the 2026 paper, which states it improves this bound by 256. Date approximate; the original was not opened here.",
      },
      {
        date: "2026-03-11",
        valueTex: "$11{,}948$",
        valueNumeric: 11948,
        attribution: "GPT-5.4 Pro, with Ho",
        problemSlug: "kissing-number-19-dimensions",
        note: "An explicit binary code of length 19 and minimum distance 5 inside the 5-punctured extended binary Golay code. Wikipedia's kissing-number table now carries this value.",
      },
    ],
  },
];

async function main() {
  const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>("SELECT current_database() AS db");
  if (db !== "vibemathed_staging") throw new Error(`refusing: connected to "${db}", not vibemathed_staging`);

  const slugs = RECORDS.flatMap((r) => r.rows.map((x) => x.problemSlug).filter((s): s is string => !!s));
  const found = await prisma.problem.findMany({
    where: { slug: { in: slugs } },
    select: { id: true, slug: true, status: true },
  });
  const missing = slugs.filter((s) => !found.some((f) => f.slug === s));
  if (missing.length) throw new Error(`entries not found: ${missing.join(", ")}`);

  for (const r of RECORDS) {
    const ai = r.rows.filter((x) => x.problemSlug).length;
    console.log(`\n${r.slug}  (${r.direction})  ${r.rows.length} rows, ${ai} entries`);
    for (const x of r.rows) {
      console.log(
        // Same default as the write below. They disagreed at first, so the dry
        // run showed entry rows as "historical" while the apply wrote them
        // "published" - the one thing a dry run must never do.
        `  ${x.date.padEnd(11)} ${(x.status ?? "published").padEnd(10)} ${String(x.valueNumeric).padStart(9)}  ${x.attribution.slice(0, 44)}`,
      );
      if (!x.problemSlug && !x.sourceUrl) throw new Error(`row without a source: ${r.slug} ${x.date}`);
    }
    if (ai === 0) throw new Error(`${r.slug} has no catalog entry on it`);
    if (r.significanceNote.length > 600) throw new Error(`${r.slug}: significanceNote over 600`);
    if (r.historyNote.length > 600) throw new Error(`${r.slug}: historyNote over 600`);
    for (const x of r.rows) if ((x.note ?? "").length > 400) throw new Error(`${r.slug} ${x.date}: note over 400`);
  }

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });

  for (const r of RECORDS) {
    const rec = await prisma.record.upsert({
      where: { slug: r.slug },
      create: {
        slug: r.slug,
        name: r.name,
        shortName: r.shortName,
        quantity: r.quantity,
        statement: r.statement,
        direction: r.direction,
        field: r.field,
        fieldGroup: r.fieldGroup,
        significance: r.significance,
        significanceNote: r.significanceNote,
        historyNote: r.historyNote,
        createdById: curator?.id ?? null,
      },
      update: {
        name: r.name,
        shortName: r.shortName,
        quantity: r.quantity,
        statement: r.statement,
        significanceNote: r.significanceNote,
        historyNote: r.historyNote,
      },
    });
    await prisma.recordRow.deleteMany({ where: { recordId: rec.id } });
    await prisma.recordRow.createMany({
      data: r.rows.map((x) => {
        const p = x.problemSlug ? found.find((f) => f.slug === x.problemSlug)! : null;
        return {
          recordId: rec.id,
          date: x.date,
          valueTex: x.valueTex,
          valueShortTex: x.valueShortTex ?? null,
          valueNumeric: x.valueNumeric ?? null,
          attribution: x.attribution,
          sourceUrl: x.sourceUrl ?? null,
          status: x.status ?? "published",
          note: x.note ?? null,
          problemId: p?.id ?? null,
        };
      }),
    });
    const already = await prisma.problemActivity.count({ where: { recordId: rec.id, type: "created" } });
    await prisma.$executeRawUnsafe(
      `INSERT INTO "ProblemActivity" ("recordId", "userId", "userName", "type") VALUES ($1, $2, $3, $4)`,
      rec.id,
      curator?.id ?? null,
      curator?.pseudonym ?? "Curator",
      already === 0 ? "created" : "updated",
    );
    console.log(`applied: ${r.slug} with ${r.rows.length} rows`);
  }
  console.log("\nAPPLIED to vibemathed_staging");
}

main().finally(() => prisma.$disconnect());
