// Adds the Borsuk frontier: the smallest dimension in which Borsuk's
// conjecture is known to fail.
//
// Borsuk asked in 1933 whether every bounded set in R^n splits into n+1 parts
// of smaller diameter. Kahn and Kalai showed in 1993 that it fails for
// n = 1325, and the race since has been to push the failing dimension down.
// It is true for n <= 3, so the target interval is 4..62 and the frontier is
// direction min. Tao's optimisation-problems ledger tracks it as C_28 and
// carries every row below; that file (constants/28a.md, Ivanisvili and
// others, 2026) was read and is the source of the dates, values and
// references, each checked against the linked paper's own metadata.
//
//   1993     1325  Kahn and Kalai, Bull. AMS 29, arXiv:math/9307229
//   1994      946  Nilli, Jerusalem Combinatorics '93, Contemp. Math. 178
//   1997      561  Raigorodskii, Russian Math. Surveys 52
//   2000      560  Weissbach, Beitr. Algebra Geom. 41
//   2002-01   323  Hinrichs, Discrete Math. 243 (spherical codes)
//   2002-02   321  Pikhurko, arXiv:math/0202112 (321 and 322)
//   2003      298  Hinrichs and Richter, Discrete Math. 270
//   2013-05    65  Bondarenko, arXiv:1305.2584 (DCG 2014): two-distance set
//   2013-08    64  Jenrich and Brouwer, arXiv:1308.0206 (EJC 2014)
//   2026-05-26 63  Grinsztajn with GPT-5.5 Pro: the catalog entry,
//                  site-confirmed on 12 August (verifier rerun here),
//                  independently found again by Konz with Claude in August.
//
// The two 2013 rows are dated to their arXiv postings rather than their 2014
// journal issues, since the frontier records when a bound was announced;
// the notes say both.
//
// The entry's row is "published", not "candidate": its verification is
// site-confirmed, the strongest level a computational construction can have
// short of a formal proof, so it moves the line. First frontier whose AI
// step counts as a step.
//
// Frontier and FrontierRow carry no validator, only column widths; every
// width is checked before the connection opens. --lint runs that alone. Dry
// run by default. --apply writes. Production writes are the curator's.

import { guardedPrisma } from "./lib/guarded-prisma";
import { charLength, canonical } from "../src/lib/char-length";

const prisma = guardedPrisma();
const APPLY = process.argv.includes("--apply");
const LINT = process.argv.includes("--lint");

const SLUG = "borsuk-counterexample-dimension";
const ENTRY = "borsuk-conjecture-lowest-ever-counterexample-n-63";

const FRONTIER = {
  slug: SLUG,
  name: "Smallest dimension where Borsuk's conjecture fails",
  shortName: "Borsuk counterexample dimension",
  quantity: "the smallest $n$ with a known counterexample to Borsuk's conjecture in $\\mathbb R^n$",
  statement:
    "Borsuk asked in 1933 whether every bounded set in $\\mathbb R^n$ can be partitioned into $n+1$ subsets of strictly smaller diameter. True for $n \\le 3$; false in general, as Kahn and Kalai showed in 1993 with a counterexample in dimension 1325. Since then the question has been where it first fails, and the race has been to lower the dimension of an explicit counterexample: 946, 561, 560, 323, 321, 298, then Bondarenko's two-distance construction at 65 in 2013, Jenrich and Brouwer's 64, and 63 in 2026. The first failing dimension is open everywhere in $4 \\le n \\le 62$, so the finish line is unknown; this frontier tracks the ceiling on it.",
  direction: "min",
  field: "Combinatorial geometry",
  fieldGroup: "Geometry & topology",
  significance: 40,
  significanceNote:
    "A named 1933 conjecture whose 1993 disproof is one of the celebrated results of combinatorial geometry, with a sixty-year history before it and a thirty-year race after. Level with the planar unit-distance problem, Sendov's conjecture and Petersen colouring at 40, all named problems famous inside their communities and known by name outside them; below the union-closed frontier at 50, which is elementary enough to state to anyone. Tao's optimisation list tracks it as $C_{28}$. The score is for the problem, not for any one step.",
  historyNote:
    "Every row is on Tao's optimisation-problems ledger (constants/28a.md), read here; each reference was then checked against the linked paper's own metadata, and Bondarenko's paper cites the 1994 to 2003 values as well. The two 2013 rows are dated to their arXiv postings, not their 2014 journal issues. Weissbach's paper is linked at the EMIS journal archive, which refused automated access from here; that row rests on Bondarenko's and Tao's citations. The 2026 row is published rather than a candidate because the entry is site-confirmed: its exact verifier was rerun here on 12 August.",
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
    date: "1993",
    valueTex: "$n = 1325$",
    valueShortTex: "1325",
    valueNumeric: 1325,
    attribution: "Jeff Kahn and Gil Kalai",
    sourceUrl: "https://arxiv.org/abs/math/9307229",
    status: "historical",
    note: "The disproof. Kahn and Kalai showed the Borsuk number grows at least like exp(c sqrt n), so the conjecture fails in every sufficiently large dimension, and exhibited the failure explicitly at n = 1325. Bulletin of the AMS 29 (1993). Everything below is the race to bring that number down.",
  },
  {
    date: "1994",
    valueTex: "$n = 946$",
    valueShortTex: "946",
    valueNumeric: 946,
    attribution: "A. Nilli",
    sourceUrl: "https://doi.org/10.1090/conm/178/01901",
    status: "historical",
    note: "Jerusalem Combinatorics '93, Contemporary Mathematics 178. A sharpening of the Kahn-Kalai construction; Nilli is a pseudonym of Noga Alon.",
  },
  {
    date: "1997",
    valueTex: "$n = 561$",
    valueShortTex: "561",
    valueNumeric: 561,
    attribution: "Andrei M. Raigorodskii",
    sourceUrl: "https://doi.org/10.1070/RM1997v052n06ABEH002184",
    status: "historical",
    note: "Russian Mathematical Surveys 52 (1997), a two-page note.",
  },
  {
    date: "2000",
    valueTex: "$n = 560$",
    valueShortTex: "560",
    valueNumeric: 560,
    attribution: "Bernulf Weissbach",
    sourceUrl: "https://www.emis.de/journals/BAG/vol.41/no.2/b41h2wb1.pdf",
    status: "historical",
    note: "Beitraege zur Algebra und Geometrie 41 (2000), 417-423, one dimension below Raigorodskii. The EMIS archive refused automated access from here; the value is as cited by Bondarenko and by Tao's ledger.",
  },
  {
    date: "2002-01",
    valueTex: "$n = 323$",
    valueShortTex: "323",
    valueNumeric: 323,
    attribution: "Aicke Hinrichs",
    sourceUrl: "https://doi.org/10.1016/S0012-365X(01)00202-3",
    status: "historical",
    note: "Discrete Mathematics 243 (2002). A construction from spherical codes, which is the idea the next three steps refine.",
  },
  {
    date: "2002-02",
    valueTex: "$n = 321$",
    valueShortTex: "321",
    valueNumeric: 321,
    attribution: "Oleg Pikhurko",
    sourceUrl: "https://arxiv.org/abs/math/0202112",
    status: "historical",
    note: "Counterexamples in dimensions 321 and 322, one month after Hinrichs.",
  },
  {
    date: "2003",
    valueTex: "$n = 298$",
    valueShortTex: "298",
    valueNumeric: 298,
    attribution: "Aicke Hinrichs and Christian Richter",
    sourceUrl: "https://doi.org/10.1016/S0012-365X(02)00833-6",
    status: "historical",
    note: "Discrete Mathematics 270 (2003). The record for ten years.",
  },
  {
    date: "2013-05",
    valueTex: "$n = 65$",
    valueShortTex: "65",
    valueNumeric: 65,
    attribution: "Andriy Bondarenko",
    sourceUrl: "https://arxiv.org/abs/1305.2584",
    status: "historical",
    note: "The big drop: a 416-point two-distance set on the sphere in R^65, from the G2(4) strongly regular graph, that cannot be split into 83 parts of smaller diameter. Discrete and Computational Geometry 51 (2014); dated here to the May 2013 arXiv posting.",
  },
  {
    date: "2013-08",
    valueTex: "$n = 64$",
    valueShortTex: "64",
    valueNumeric: 64,
    attribution: "Thomas Jenrich and Andries E. Brouwer",
    sourceUrl: "https://arxiv.org/abs/1308.0206",
    status: "historical",
    note: "A 352-point two-distance subset of Bondarenko's configuration, needing at least 71 parts, three months after his paper. Electronic Journal of Combinatorics 21 (2014); dated to the arXiv posting.",
  },
  {
    date: "2026-05-26",
    valueTex: "$n = 63$",
    valueShortTex: "63",
    valueNumeric: 63,
    attribution: "Max Grinsztajn, with GPT-5.5 Pro",
    sourceUrl: "https://github.com/maaxgrin/borsuk-63-counterexample",
    status: "published",
    note: "A 321-point subset of R^63 whose smaller-diameter subsets have at most 5 points, so at least 65 > 64 parts are needed: a 320-point rank-63 piece of the G2(4) set plus one scaled projected point. The repository's exact verifier was rerun here on 12 August. Found again independently by Nicholas Konz with Claude in August 2026. On Tao's ledger as the current best.",
    problemSlug: ENTRY,
  },
];

const WIDTHS: Record<string, number> = {
  name: 120, shortName: 60, quantity: 300, statement: 1500, field: 80,
  significanceNote: 600, historyNote: 600,
  "row.attribution": 200, "row.valueTex": 200, "row.note": 400,
};

function checkLengths(): number {
  let over = 0;
  const show = (label: string, v: string, cap: number) => {
    const n = charLength(canonical(v));
    const bad = n > cap;
    console.log(`  ${label.padEnd(24)} ${String(n).padStart(4)}/${cap}${bad ? "  OVER" : ""}`);
    if (bad) over++;
  };
  console.log("frontier:");
  for (const k of ["name", "shortName", "quantity", "statement", "field", "significanceNote", "historyNote"] as const) {
    show(k, FRONTIER[k], WIDTHS[k]);
  }
  for (const r of ROWS) {
    console.log(`row ${r.date}:`);
    show("attribution", r.attribution, WIDTHS["row.attribution"]);
    show("valueTex", r.valueTex, WIDTHS["row.valueTex"]);
    if (r.note) show("note", r.note, WIDTHS["row.note"]);
  }
  // Direction min: the staircase must descend.
  const byDate = [...ROWS].sort((a, b) => a.date.localeCompare(b.date));
  for (let i = 1; i < byDate.length; i++) {
    if (byDate[i].valueNumeric > byDate[i - 1].valueNumeric) {
      over++;
      console.log(`  NOT MONOTONE: ${byDate[i].date} (${byDate[i].valueNumeric}) is above ${byDate[i - 1].date} (${byDate[i - 1].valueNumeric})`);
    }
  }
  // Borsuk is true for n <= 3, so no row may claim a failure below 4.
  for (const r of ROWS) {
    if (r.valueNumeric < 4) {
      over++;
      console.log(`  BELOW THE FLOOR: ${r.date} ${r.valueNumeric} < 4`);
    }
  }
  console.log(over ? `${over} problem(s)` : "all field lengths ok, staircase descends, every row above the n = 3 floor");
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
    const p = await prisma.$queryRawUnsafe<{ id: string; resolution: string; verification: string }[]>(
      `SELECT id, resolution, verification FROM "Problem" WHERE slug = $1 AND status = 'published'`,
      r.problemSlug,
    );
    if (p.length !== 1) throw new Error(`entry not found or not published: ${r.problemSlug}`);
    ids.set(r.problemSlug, p[0].id);
    console.log(`entry linked: ${r.problemSlug} [${p[0].resolution}, ${p[0].verification}]`);
  }

  console.log(`\n${FRONTIER.shortName}  (${FRONTIER.direction})  sig=${FRONTIER.significance}`);
  for (const r of [...ROWS].sort((a, b) => a.date.localeCompare(b.date))) {
    console.log(
      `  ${r.date.padEnd(11)} ${String(r.valueNumeric).padEnd(6)} ${r.status.padEnd(11)} ${r.attribution.slice(0, 44)}${r.problemSlug ? "  [entry]" : ""}`,
    );
  }
  const headline = [...ROWS]
    .filter((r) => r.status !== "candidate" && r.status !== "retracted")
    .sort((a, b) => a.valueNumeric - b.valueNumeric)[0];
  console.log(`\n  headline: ${headline.valueNumeric}  ${headline.attribution}`);
  console.log(`  floor: Borsuk holds for n <= 3, so the first failing dimension is in 4..${headline.valueNumeric - 1} or is ${headline.valueNumeric}`);

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
