// Adds the Multiway Cut frontier: the best proved approximation ratio for an
// arbitrary number of terminals. Direction min.
//
// Asked for on 15 September, pointing at the entry multiway-cut-rounding-
// records (Brakensiek, Huang, Potechin and Zwick with ChatGPT; partial,
// unreviewed, 15), arXiv:2603.28700, ratio 1.2787. The paper's own Table 1
// is the whole ladder for arbitrary k and was read here:
//
//   Ratio   Paper      Method
//   2       [DJP+94]   combinatorial (STOC 1992; SICOMP 1994)
//   1.5     [CKR00]    single threshold on the CKR relaxation (STOC 1998)
//   1.3438  [KKS+04]   ST + independent thresholds (STOC 1999)
//   1.3239  [BNS18]    ST + exponential clocks (STOC 2013)
//   1.3022  [SV14]     analytic; and
//   1.2965  [SV14]     computational, same paper (STOC 2014)
//   1.2970  [BSW21]    analytic, slightly worse than SV's computational
//   1.2787  here       hundreds of rounding schemes, computer-found mixture
//
// Rows below use the best ratio each paper achieved, so SV14 is one row at
// 1.2965 and BSW21 (297/229 = 1.29694, an analytic near-miss) is not a step;
// the notes say so. Dates are the conference announcements, which is when
// the community learned each number.
//
// FLOOR. Under the Unique Games Conjecture the approximability ratio equals
// the CKR integrality gap (Manokaran, Naor, Raghavendra and Schwartz 2008),
// and Berczi, Chandrasekaran, Kiraly and Madan (2020) showed that gap is at
// least 1.20016. Every row is checked against it. For k = 3 the answer is
// exactly 12/11; this frontier is the arbitrary-k ratio.
//
// The entry's row is a candidate: unreviewed arXiv v1, interval-arithmetic
// analysis not rerun here.
//
// Frontier and FrontierRow carry no validator, only column widths; every
// width is checked before the connection opens. --lint runs that alone. Dry
// run by default. --apply writes. Production writes are the curator's.

import { guardedPrisma } from "./lib/guarded-prisma";
import { charLength, canonical } from "../src/lib/char-length";

const prisma = guardedPrisma();
const APPLY = process.argv.includes("--apply");
const LINT = process.argv.includes("--lint");

const SLUG = "multiway-cut-approximation-ratio";
const ENTRY = "multiway-cut-rounding-records";

const FRONTIER = {
  slug: SLUG,
  name: "Approximation ratio for Multiway Cut",
  shortName: "Multiway Cut ratio",
  quantity: "the best proved approximation ratio for Multiway Cut with arbitrarily many terminals",
  statement:
    "Given a weighted graph and $k$ terminals, Multiway Cut asks for the cheapest set of edges whose removal separates every terminal from every other. It is APX-hard for $k \\ge 3$, so the question is the best polynomial-time approximation ratio. Dahlhaus, Johnson, Papadimitriou, Seymour and Yannakakis gave $2 - 2/k$ in 1992; the linear-programming relaxation of Calinescu, Karloff and Rabani (1998) brought it to $3/2$, and every step since has been a new way of rounding that one relaxation: $1.3438$, $1.3239$, $1.2965$ in 2014, and $1.2787$ in 2026 from a computer-found mixture of hundreds of rounding schemes. Under the Unique Games Conjecture the true answer is the relaxation's integrality gap, known to be at least $1.20016$; the gap between $1.2787$ and that floor is the frontier.",
  direction: "min",
  field: "Approximation algorithms; graph cuts",
  fieldGroup: "Theoretical computer science",
  significance: 15,
  significanceNote:
    "A textbook problem in approximation algorithms with a thirty-year ladder of rounding schemes and a matching integrality-gap story, watched by the approximation-algorithms community and few outside it. Below the community-famous band at 30 and level with the boolean Max-k-CSP entry at 15, another approximation ratio with a real literature; above the numbered Erdos problems at 10 because every theory student meets the CKR relaxation. The score is for the problem, not for any one step.",
  historyNote:
    "Every value is from Table 1 of the 2026 paper, which lists the arbitrary-k ladder with method and analysis type, read here; conference dates are the row dates. Sharma and Vondrak 2014 has an analytic 1.3022 and a computational 1.2965 and is one row at the better number; Buchbinder, Schwartz and Weizman's analytic 297/229 (2021) is a near-miss, not a step, and is not drawn. The 1.20016 floor is a Unique-Games-conditional bound from the integrality gap (Berczi, Chandrasekaran, Kiraly and Madan 2020), checked rather than drawn. The 2026 row is a candidate: unreviewed arXiv v1, not rerun here.",
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
    date: "1992",
    valueTex: "$2 - 2/k \\to 2$",
    valueShortTex: "2",
    valueNumeric: 2,
    attribution: "Dahlhaus, Johnson, Papadimitriou, Seymour and Yannakakis",
    sourceUrl: "https://doi.org/10.1137/S0097539792225297",
    status: "historical",
    note: "The complexity of multiterminal cuts: NP-hardness for k >= 3 and a combinatorial 2 - 2/k approximation from isolating cuts. STOC 1992; SIAM Journal on Computing 23 (1994).",
  },
  {
    date: "1998",
    valueTex: "$3/2 - 1/k \\to 1.5$",
    valueShortTex: "1.5",
    valueNumeric: 1.5,
    attribution: "Gruia Calinescu, Howard Karloff and Yuval Rabani",
    sourceUrl: "https://doi.org/10.1006/jcss.1999.1687",
    status: "historical",
    note: "The relaxation everything since rounds: embed the terminals at the vertices of a simplex, relax, and cut with a single random threshold. STOC 1998; JCSS 60 (2000). Under Unique Games its integrality gap is the true approximability.",
  },
  {
    date: "1999",
    valueTex: "$1.3438$",
    valueShortTex: "1.3438",
    valueNumeric: 1.3438,
    attribution: "Karger, Klein, Stein, Thorup and Young",
    sourceUrl: "https://doi.org/10.1145/301250.301430",
    status: "historical",
    note: "Single threshold mixed with independent thresholds. STOC 1999; Mathematics of Operations Research 29 (2004). Also the exact 12/11 for k = 3, and small-k ratios that stood until 2026.",
  },
  {
    date: "2013",
    valueTex: "$1.3239$",
    valueShortTex: "1.3239",
    valueNumeric: 1.3239,
    attribution: "Niv Buchbinder, Joseph Naor and Roy Schwartz",
    sourceUrl: "https://doi.org/10.1145/2488608.2488675",
    status: "historical",
    note: "Exponential clocks: a simple 4/3 - 4/(9k-6) algorithm and a slightly more complicated 1.3239 - 1/(24k). STOC 2013.",
  },
  {
    date: "2014",
    valueTex: "$1.2965$",
    valueShortTex: "1.2965",
    valueNumeric: 1.2965,
    attribution: "Ankit Sharma and Jan Vondrak",
    sourceUrl: "https://doi.org/10.1145/2591796.2591866",
    status: "historical",
    note: "Descending thresholds added to the mix. An analytic 1.3022 and, with independent thresholds too, a computer-assisted 1.2965. STOC 2014. The record for twelve years; Buchbinder, Schwartz and Weizman's analytic 297/229 = 1.29694 (2021) came close without passing it.",
  },
  {
    date: "2026-03-30",
    valueTex: "$1.2787$",
    valueShortTex: "1.2787",
    valueNumeric: 1.2787,
    attribution: "Brakensiek, Huang, Potechin and Zwick, with ChatGPT",
    sourceUrl: "https://arxiv.org/abs/2603.28700",
    status: "candidate",
    note: "A generalised Kleinberg-Tardos rounding replaces exponential clocks, and the algorithm is a computationally discovered mixture of hundreds of rounding schemes rather than two to four. Analysis by analytic bounds plus interval arithmetic; also the first small-k improvements in 25 years. Unreviewed arXiv v1, not rerun here: a candidate.",
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
  // No algorithm can beat the UGC floor without disproving Unique Games.
  const FLOOR = 1.20016;
  for (const r of ROWS) {
    if (r.valueNumeric < FLOOR) {
      over++;
      console.log(`  BELOW THE FLOOR: ${r.date} ${r.valueNumeric} < ${FLOOR}`);
    }
  }
  console.log(over ? `${over} problem(s)` : "all field lengths ok, staircase descends, every row above the 1.20016 floor");
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
      `  ${r.date.padEnd(11)} ${String(r.valueNumeric).padEnd(8)} ${r.status.padEnd(11)} ${r.attribution.slice(0, 50)}${r.problemSlug ? "  [entry]" : ""}`,
    );
  }
  const headline = [...ROWS]
    .filter((r) => r.status !== "candidate" && r.status !== "retracted")
    .sort((a, b) => a.valueNumeric - b.valueNumeric)[0];
  console.log(`\n  headline (non-candidate): ${headline.valueNumeric}  ${headline.attribution}`);
  console.log(`  floor (UGC, integrality gap): 1.20016`);

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
