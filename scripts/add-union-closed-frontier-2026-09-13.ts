// Adds the union-closed constant frontier.
//
// This is the best-shaped frontier the site has taken. The quantity is c_0,
// the largest constant for which every finite union-closed family is known to
// have an element in at least c_0 of its sets. It improves in discrete
// published steps, it has a FINISH LINE - Frankl's conjecture is exactly
// c_0 = 1/2 - and as of this month it also has a proven CEILING, which no
// other frontier here does.
//
// The staircase, every row read at source:
//
//   1979  Frankl states the conjecture. Not a row: it is the target.
//   2022  Gilmer, arXiv 2211.09055 (16 Nov), the first constant bound at all:
//         c_0 >= 0.01. Before this there was no constant.
//   2022  (3-sqrt 5)/2 = 0.381966..., five weeks later. Gilmer conjectured
//         his method reached it; Alweiss, Huang and Sellke (arXiv 2211.11731,
//         21 Nov) are the row, and Chase-Lovett, Sawin and Pebody got it
//         independently within days. The note says so - a row that credits one
//         of four simultaneous proofs without saying the other three exist
//         would be a misrepresentation.
//   2022  Cambie, arXiv 2212.12500 (23 Dec): 0.3823455, solving Sawin's
//         question about dependent couplings exactly.
//   2023  Liu, arXiv 2306.08824 (15 Jun): 0.382709, via conditionally i.i.d.
//         coupling. The standing record.
//   2026  Moffat, 8 Sep: 0.38284, computer-assisted and conditional on two
//         numerically verified hypotheses of the same kind as Liu's. A
//         candidate row, drawn hollow, and NOT the headline.
//
// The jump is the story: 0.01 to 0.38 in five weeks, then four years to move
// the third decimal.
//
// The ceiling belongs in prose rather than as a row, because a row is a value
// the frontier reached and this is a proof that it cannot. Moffat's own
// entry - the one this frontier grew out of - shows every single-letter
// certificate using the i.i.d. protocol whose other classes admit component
// hiding certifies at most c** = 0.382885260..., so the whole method stops
// 0.117 short of Frankl. That is why the statement and the history note both
// say it: the staircase visibly converges on a wall well below its target,
// and a reader who cannot see that would misread the chart as creeping
// toward 1/2.
//
// direction is "max": a larger lower bound is better.
//
// The 2026 row links to the catalog entry so the frontier inherits its model
// and verification. Rows before it are human work and carry no entry, which
// is normal here - the C11 and de Bruijn-Newman frontiers are the same shape.
//
// Frontier and FrontierRow have NO form validator, only database column
// widths, so every one is checked before the connection is opened. --lint
// runs that check alone.
//
// Dry run by default. Pass --apply to write. Production writes are the
// curator's to run.

import { guardedPrisma } from "./lib/guarded-prisma";

const prisma = guardedPrisma();
const APPLY = process.argv.includes("--apply");
const LINT = process.argv.includes("--lint");

const SLUG = "union-closed-constant";
const ENTRY = "the-ceiling-of-the-single-letter-entropy-method-for-the-union-closed-sets-conjec";

const FRONTIER = {
  slug: SLUG,
  name: "Lower bounds for the union-closed sets constant",
  // shortName renders RAW on /frontiers, so plain text.
  shortName: "Union-closed constant",
  quantity: "the union-closed constant $c_0$",
  statement:
    "Frankl conjectured in 1979 that every finite union-closed family of sets, not all empty, has an element belonging to at least half its members. Until 2022 no constant at all was known: nobody could name a $c_0>0$ with an element in at least a $c_0$ fraction. Gilmer's entropy argument broke that, and the constant has climbed since. This frontier tracks the best proved lower bound. Its finish line is exactly $1/2$, which would settle Frankl. It also has a ceiling: the entropy method in every form used since 2022 provably cannot certify more than $0.382885260\\ldots$, so reaching $1/2$ needs a different idea rather than a better constant.",
  direction: "max",
  field: "Extremal set theory; the entropy method",
  fieldGroup: "Combinatorics",
  significance: 50,
  significanceNote:
    "Frankl's union-closed sets conjecture is one of the best-known open problems in combinatorics, elementary enough to state to a first-year student and open since 1979. The race for the constant drew a dozen researchers within weeks of Gilmer's paper. Above the de Bruijn-Newman frontier at 45, whose audience is analytic number theorists, and below the matrix multiplication exponent at 55, which the whole of theoretical computer science watches. The score is for the problem, not for any one step.",
  historyNote:
    "Steps read at source on arXiv. The (3-sqrt 5)/2 row is credited to Alweiss, Huang and Sellke, but Chase and Lovett, Sawin, and Pebody proved it independently within days; the row's note says so. The 2026 row is a candidate: computer-assisted and conditional on two numerically verified hypotheses, so it is drawn hollow and is not the headline, which stays Liu's 0.382709. The ceiling at 0.382885260 is a theorem about the method rather than a value reached, so it is stated here and in the statement rather than drawn as a step.",
};

type Row = {
  date: string;
  valueTex: string;
  valueShortTex?: string;
  valueNumeric: number;
  attribution: string;
  sourceUrl: string;
  status: string;
  note?: string;
  problemSlug?: string;
};

const ROWS: Row[] = [
  {
    date: "2022-11-16",
    valueTex: "$\\ge 0.01$",
    valueShortTex: "0.01",
    valueNumeric: 0.01,
    attribution: "Justin Gilmer",
    sourceUrl: "https://arxiv.org/abs/2211.09055",
    status: "historical",
    note: "The first constant bound of any size, by an entropy argument. Before this paper no positive constant was known at all, which is why a bound of 0.01 was the breakthrough rather than the number it names.",
  },
  {
    date: "2022-11-21",
    valueTex: "$\\ge (3-\\sqrt5)/2 = 0.381966\\ldots$",
    valueShortTex: "0.381966",
    valueNumeric: 0.3819660112501051,
    attribution: "Alweiss, Huang and Sellke",
    sourceUrl: "https://arxiv.org/abs/2211.11731",
    status: "historical",
    note: "The limit Gilmer conjectured his own method would reach, proved five weeks later. Chase and Lovett, Sawin, and Pebody obtained the same constant independently within days; this row credits one of four simultaneous proofs and the others are not disputed.",
  },
  {
    date: "2022-12-23",
    valueTex: "$\\ge 0.3823455$",
    valueShortTex: "0.3823455",
    valueNumeric: 0.3823455,
    attribution: "Stijn Cambie",
    sourceUrl: "https://arxiv.org/abs/2212.12500",
    status: "historical",
    note: "Past the barrier that (3-sqrt 5)/2 appeared to be, by using the dependent samples Sawin suggested. Solves Sawin's question exactly, and the same paper studies where the approach runs out.",
  },
  {
    date: "2023-06-15",
    valueTex: "$\\ge 0.382709$",
    valueShortTex: "0.382709",
    valueNumeric: 0.382709,
    attribution: "Jingbo Liu",
    sourceUrl: "https://arxiv.org/abs/2306.08824",
    status: "published",
    note: "Conditionally i.i.d. coupling, building on Yu, Sawin and Gilmer. The standing record, and the last movement for three years.",
  },
  {
    date: "2026-09-08",
    valueTex: "$\\ge 0.38284$",
    valueShortTex: "0.38284",
    valueNumeric: 0.38284,
    attribution: "Andrew Moffat with Claude Fable 5.1",
    sourceUrl:
      "https://github.com/moffatstudio/union-closed-constant/releases/tag/v1.2",
    status: "candidate",
    note: "Computer-assisted and conditional on two numerically verified hypotheses of the same kind as those behind Liu's record, so it is a candidate rather than the headline. The same work proves the ceiling that ends this staircase: no certificate of this form can exceed 0.382885260.",
    problemSlug: ENTRY,
  },
];

const F_LIMITS: Record<string, number> = {
  name: 120,
  shortName: 60,
  quantity: 300,
  statement: 1500,
  direction: 3,
  field: 80,
  significanceNote: 600,
  historyNote: 600,
};
const R_LIMITS: Record<string, number> = {
  date: 10,
  valueTex: 200,
  valueShortTex: 200,
  attribution: 200,
  status: 12,
  note: 400,
};

/// Column widths, checked with no database. A P2000 names no column, so
/// finding this out from the server is strictly worse than finding it here.
function checkLengths(): number {
  let over = 0;
  console.log("field lengths:");
  for (const [k, lim] of Object.entries(F_LIMITS)) {
    const v = (FRONTIER as Record<string, unknown>)[k];
    if (typeof v !== "string") continue;
    const n = [...v.normalize("NFC")].length;
    if (n > lim) over++;
    console.log(`  frontier.${k.padEnd(17)} ${n}/${lim}${n > lim ? "  OVER" : ""}`);
  }
  for (const r of ROWS) {
    for (const [k, lim] of Object.entries(R_LIMITS)) {
      const v = (r as unknown as Record<string, unknown>)[k];
      if (typeof v !== "string") continue;
      const n = [...v.normalize("NFC")].length;
      if (n > lim) {
        over++;
        console.log(`  row ${r.date} ${k}: ${n}/${lim}  OVER`);
      }
    }
  }
  // The staircase must climb: this frontier is direction "max", so a later
  // row worse than an earlier one means a step is mis-transcribed.
  const byDate = [...ROWS].sort((a, b) => a.date.localeCompare(b.date));
  for (let i = 1; i < byDate.length; i++) {
    if (byDate[i].valueNumeric < byDate[i - 1].valueNumeric) {
      over++;
      console.log(
        `  NOT MONOTONE: ${byDate[i].date} (${byDate[i].valueNumeric}) is below ${byDate[i - 1].date} (${byDate[i - 1].valueNumeric})`,
      );
    }
  }
  // Every row must sit under the proven ceiling, or the transcription is wrong.
  const CEILING = 0.38288526;
  for (const r of ROWS) {
    if (r.valueNumeric > CEILING) {
      over++;
      console.log(`  ABOVE THE CEILING: ${r.date} ${r.valueNumeric} > ${CEILING}`);
    }
  }
  console.log(over ? `${over} problem(s)` : "all field lengths ok, staircase climbs, every row under the ceiling");
  return over;
}

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
  const over = checkLengths();
  if (LINT) {
    process.exitCode = over ? 1 : 0;
    return;
  }
  if (over) throw new Error(`${over} problem(s) - nothing written`);

  const db = await connectWithRetry();
  console.log(`\ndatabase: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`);

  const exists = await prisma.$queryRawUnsafe<{ slug: string }[]>(
    `SELECT slug FROM "Frontier" WHERE slug = $1`,
    SLUG,
  );
  console.log(`frontier ${SLUG}: ${exists.length ? "EXISTS" : "free"}`);
  if (exists.length) throw new Error("slug taken");

  const ids = new Map<string, string>();
  for (const r of ROWS) {
    if (!r.problemSlug) continue;
    const p = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `SELECT id FROM "Problem" WHERE slug = $1 AND status = 'published'`,
      r.problemSlug,
    );
    if (p.length !== 1) throw new Error(`entry not found or not published: ${r.problemSlug}`);
    ids.set(r.problemSlug, p[0].id);
    console.log(`entry linked: ${r.problemSlug}`);
  }

  console.log(`\n${FRONTIER.shortName}  (${FRONTIER.direction})  sig=${FRONTIER.significance}`);
  for (const r of [...ROWS].sort((a, b) => a.valueNumeric - b.valueNumeric)) {
    console.log(
      `  ${r.date.padEnd(11)} ${String(r.valueNumeric).padEnd(20)} ${r.status.padEnd(11)} ${r.attribution.slice(0, 40)}${r.problemSlug ? "  [entry]" : ""}`,
    );
  }
  const headline = [...ROWS]
    .filter((r) => r.status !== "candidate" && r.status !== "retracted")
    .sort((a, b) => b.valueNumeric - a.valueNumeric)[0];
  console.log(`\n  headline (non-candidate): ${headline.valueNumeric}  ${headline.attribution}`);
  console.log(`  proven ceiling for this method: 0.382885260`);
  console.log(`  target (Frankl): 0.5`);

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  const created = await prisma.frontier.create({
    data: {
      ...FRONTIER,
      rows: {
        create: ROWS.map((r) => ({
          date: r.date,
          valueTex: r.valueTex,
          valueShortTex: r.valueShortTex ?? null,
          valueNumeric: r.valueNumeric,
          attribution: r.attribution,
          sourceUrl: r.sourceUrl,
          status: r.status,
          note: r.note ?? null,
          problemId: r.problemSlug ? ids.get(r.problemSlug) : null,
        })),
      },
    },
    select: { slug: true, _count: { select: { rows: true } } },
  });
  console.log(`\nAPPLIED. ${created.slug} created with ${created._count.rows} rows.`);
  console.log("The frontier list lags by up to an hour, or until a deploy.");
}

main().finally(() => prisma.$disconnect());
