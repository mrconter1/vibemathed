// Adds the complex Grothendieck constant frontier: lower bounds on K_G^C.
//
// Asked for on 15 September, pointing at the entry
// lower-bound-for-the-complex-grothendieck-constant (partial, unreviewed, 30),
// which proves K_G^C > 1.35584631827168 against Davie's 1.338. The entry is a
// record on a named constant with a short but real human history, which is
// exactly a frontier.
//
// THE QUANTITY. Grothendieck's inequality says there is a universal K with
// |sum a_ij <x_i, y_j>| <= K max |sum a_ij eps_i delta_j| for every matrix and
// all unit vectors in a Hilbert space; K_G^C is the least such K over the
// complex field. Its exact value is open. The upper bound is Haagerup's
// 1.40491 (1987), and Haagerup conjectured a slightly better 1.4046. This
// frontier tracks the LOWER bound, direction max, because that is the side
// with an AI step; the upper bound is the ceiling every row must sit under.
//
// THE ROWS, read in Pisier, "Grothendieck's theorem, past and present",
// arXiv:1101.4195 (Bull. AMS 2012), Section 4, unless noted:
//
//   1953  4/pi = 1.27323..., from the Gaussian argument: "In the complex case
//         ||g||_1 = (pi/4)^{1/2}, and hence K_G^C >= 4/pi." Pisier attributes
//         the real-case computation to Grothendieck's Resume and says the
//         proof "extends immediately to the complex case". Dated to the
//         Resume, with Pisier as the source since the Resume itself states
//         the real case.
//   1984  1.338, Davie, unpublished. Pisier: "Davie (unpublished) improved the
//         lower bound to K_G^C > 1.338." Haagerup's 1987 paper reports it and
//         is the row's source; Davie's related published note is "Matrix norms
//         related to Grothendieck's inequality" (Columbia MO 1984, LNM 1166,
//         1985), which is where the 1984 date comes from. This bound stood for
//         forty-two years.
//   2026  1.35584631827168, Guo, Fang and Lu with the Odin agent, arXiv
//         2609.07000 v1 of 7 September. Candidate: unreviewed v1, interval
//         arithmetic not rerun here (see the entry's verification note).
//
// Nothing between 1984 and 2026 moved the constant itself. Konig refined the
// dimension-dependent K_G^C(d) (Pisier cites 1.1526 < K_G^C(2) < 1.2157) but
// not the constant. Three rows is the whole history.
//
// Frontier and FrontierRow carry no validator, only column widths, so every
// width is checked before the connection is opened. --lint runs that alone.
// Dry run by default. --apply writes. Production writes are the curator's.

import { guardedPrisma } from "./lib/guarded-prisma";
import { charLength, canonical } from "../src/lib/char-length";

const prisma = guardedPrisma();
const APPLY = process.argv.includes("--apply");
const LINT = process.argv.includes("--lint");

const SLUG = "complex-grothendieck-constant";
const ENTRY = "lower-bound-for-the-complex-grothendieck-constant";

const FRONTIER = {
  slug: SLUG,
  name: "Lower bounds for the complex Grothendieck constant",
  // shortName renders RAW on /frontiers, so plain text.
  shortName: "Complex Grothendieck constant",
  quantity: "the complex Grothendieck constant $K_G^{\\mathbb C}$",
  statement:
    "Grothendieck proved in 1953 that there is a universal constant $K$ with $\\bigl|\\sum_{i,j} a_{ij}\\langle x_i, y_j\\rangle\\bigr| \\le K \\max_{|\\varepsilon_i| = |\\delta_j| = 1} \\bigl|\\sum_{i,j} a_{ij}\\varepsilon_i\\delta_j\\bigr|$ for every complex matrix and all unit vectors in a complex Hilbert space. The least such $K$ is the complex Grothendieck constant $K_G^{\\mathbb C}$, and its value is open: Haagerup's 1987 upper bound is $1.40491\\ldots$, and he conjectured the truth is $1.4046\\ldots$. This frontier tracks the lower bound, which the Gaussian argument put at $4/\\pi$ and Davie lifted to $1.338$ in 1984, where it stayed for forty-two years. The ceiling is Haagerup's number; nothing here claims to be at it.",
  direction: "max",
  field: "Functional analysis; Grothendieck's inequality",
  fieldGroup: "Analysis",
  significance: 35,
  significanceNote:
    "Grothendieck's inequality is known to all of functional analysis and was rediscovered by theoretical computer science for approximation algorithms; its exact constants are classical open problems, and Krivine's conjecture for the real one was disproved in 2011. The complex constant is the quieter sibling, followed by name in a subcommunity rather than a field. Level with the C11 Shannon capacity frontier at 35, another named constant one community races on; below the de Bruijn-Newman bound at 45, whose value decides the Riemann hypothesis. The score is for the problem, not for any one step.",
  historyNote:
    "Rows read in Pisier's 2012 survey (arXiv:1101.4195, Section 4), which writes out the Gaussian bound for the complex case and reports Davie's unpublished 1.338. The 1953 row is dated to Grothendieck's Resume, whose real-case argument Pisier says extends immediately; the Resume was not opened. Davie's bound never appeared under his name: Haagerup 1987 reports it and is the source, dated to Davie's 1984 Columbia lecture. The 2026 row is a candidate, an unreviewed arXiv v1 not rerun here, so it is hollow and the headline stays 1.338. Haagerup's 1.40491 is the ceiling every row is checked against.",
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
    date: "1953",
    valueTex: "$\\ge 4/\\pi = 1.27323\\ldots$",
    valueShortTex: "4/\\pi",
    valueNumeric: 1.2732395447351628,
    attribution: "Grothendieck's Gaussian argument, complex case",
    sourceUrl: "https://arxiv.org/abs/1101.4195",
    status: "historical",
    note: "The first lower bound, from the L1 norm of a standard complex Gaussian: Pisier, Section 4, \"in the complex case ||g||_1 = (pi/4)^{1/2}, and hence K_G^C >= 4/pi\". Grothendieck's Resume proves the real-case value pi/2 and the argument carries over word for word. Dated to the Resume; the source is Pisier's survey, where the complex case is written out.",
  },
  {
    date: "1984",
    valueTex: "$> 1.338$",
    valueShortTex: "1.338",
    valueNumeric: 1.338,
    attribution: "Alexander M. Davie (unpublished)",
    sourceUrl: "https://doi.org/10.1007/BF02790792",
    status: "historical",
    note: "Never published under Davie's name. Reported in Haagerup's 1987 paper on the upper bound, which is the linked source, and in Pisier's survey: \"Davie (unpublished) improved the lower bound to K_G^C > 1.338.\" Dated to Davie's Columbia lecture of 1984 on matrix norms related to the inequality (LNM 1166). This number stood for forty-two years.",
  },
  {
    date: "2026-09-07",
    valueTex: "$> 1.35584631827168$",
    valueShortTex: "1.35584631827168",
    valueNumeric: 1.35584631827168,
    attribution: "Guo, Fang and Lu, with the Odin research agent",
    sourceUrl: "https://arxiv.org/abs/2609.07000",
    status: "candidate",
    note: "Finitely many complex Hermite projections under a common radial weight give a dimension-independent L-infinity-to-L1 estimate; the numerical inequalities are certified by Arb interval arithmetic. Closes more than a quarter of the Davie-to-Haagerup gap. Unreviewed arXiv v1, one week old, certificates not rerun here: a candidate.",
    problemSlug: ENTRY,
  },
];

// Column widths from prisma/schema.prisma. No validator covers these tables.
const WIDTHS: Record<string, number> = {
  name: 120,
  shortName: 60,
  quantity: 300,
  statement: 1500,
  field: 80,
  significanceNote: 600,
  historyNote: 600,
  "row.attribution": 200,
  "row.valueTex": 200,
  "row.note": 400,
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
  // The staircase must climb: direction "max".
  const byDate = [...ROWS].sort((a, b) => a.date.localeCompare(b.date));
  for (let i = 1; i < byDate.length; i++) {
    if (byDate[i].valueNumeric < byDate[i - 1].valueNumeric) {
      over++;
      console.log(`  NOT MONOTONE: ${byDate[i].date} (${byDate[i].valueNumeric}) is below ${byDate[i - 1].date} (${byDate[i - 1].valueNumeric})`);
    }
  }
  // Every lower bound must sit under Haagerup's upper bound.
  const CEILING = 1.40491;
  for (const r of ROWS) {
    if (r.valueNumeric >= CEILING) {
      over++;
      console.log(`  AT OR ABOVE THE CEILING: ${r.date} ${r.valueNumeric} >= ${CEILING}`);
    }
  }
  console.log(over ? `${over} problem(s)` : "all field lengths ok, staircase climbs, every row under Haagerup's ceiling");
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
  for (const r of [...ROWS].sort((a, b) => a.valueNumeric - b.valueNumeric)) {
    console.log(
      `  ${r.date.padEnd(11)} ${String(r.valueNumeric).padEnd(20)} ${r.status.padEnd(11)} ${r.attribution.slice(0, 44)}${r.problemSlug ? "  [entry]" : ""}`,
    );
  }
  const headline = [...ROWS]
    .filter((r) => r.status !== "candidate" && r.status !== "retracted")
    .sort((a, b) => b.valueNumeric - a.valueNumeric)[0];
  console.log(`\n  headline (non-candidate): ${headline.valueNumeric}  ${headline.attribution}`);
  console.log(`  ceiling (Haagerup 1987 upper bound): 1.40491`);

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
