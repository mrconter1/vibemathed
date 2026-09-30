// Adds the dimer-constant frontier: upper bounds on the dimer constant of
// the cubic lattice. Direction min.
//
// The dimer constant l_3 is the exponential growth rate of the number of
// perfect matchings of Z^3. Hammersley proved in 1966 that the limit exists
// and does not depend on the box sequence. The two-dimensional analogue has a
// closed form, Kasteleyn-Fisher-Temperley's exp(2G/pi) with Catalan's
// constant; in three dimensions no closed form is known and the constant is
// pinned only between bounds. That is exactly a frontier.
//
// THE ROWS, all upper bounds, read at source:
//
//   1998  0.463107  Ciucu, Duke Math. J. 94, 1-11. The transfer-matrix
//                   scheme: decompose a toroidal box into m x n cross
//                   sections parallel to a coordinate plane, bound l_3 by the
//                   spectral radius of a 2^(mn) x 2^(mn) matrix, compress
//                   under a symmetry group. Ciucu reached (m,n) = (4,4).
//                   The VALUE is not in the 2026 paper, which cites Ciucu
//                   only as the method; it comes from Finch's survey
//                   "Several constants arising in statistical mechanics"
//                   (arXiv:math/9810155, October 1998), read here: "The
//                   current best rigorous bounds are 0.419989 <= lambda <=
//                   0.463107", citing Ciucu for the upper.
//   2001  0.457547  Lundow, same scheme pushed to (m,n) = (4,6). Stood for
//                   twenty-five years; further upscaling is prohibitive, as
//                   Friedland-Peled and Lundow-Markstrom both discuss.
//   2026  0.452130  He, arXiv:2607.28810, the catalog entry. Diagonal
//                   transfer layers rather than coordinate-plane ones, so
//                   every lattice edge joins consecutive layers and no parity
//                   restriction on m, n is needed; Csikvari's 2017 inequality
//                   relating a bipartite matching polynomial to its 2-lifts
//                   does the comparison, and a Collatz-Wielandt variant from
//                   Friedland-Schneider (1980) gives a monotone sequence of
//                   computable upper bounds.
//
// THE FLOOR, stated and checked rather than drawn: the best rigorous lower
// bound is (1/2) log(5^5 / 6^4) = 0.440075..., which Minc noted in 1978 as a
// consequence of what was then the Schrijver-Valiant conjecture and is now
// Schrijver's theorem on perfect matchings in regular bipartite graphs. Every
// upper-bound row must sit above it, and the script checks that.
//
// THE TARGET: Nagle's 1966 series expansion gave the heuristic l_3 ~ 0.446,
// and Beichl and Sullivan's importance sampling put the estimate at 0.4466.
// Neither is rigorous, so neither is a row; the statement names them so a
// reader can see the remaining gap is about 0.0055 wide on the upper side.
//
// NOT A ROW: Chen, Golin and Yong claimed in 2019 to beat Lundow's bound by a
// different method but, as the 2026 paper notes in a footnote, stopped short
// of reporting a numerical value. A frontier row needs a number.
//
// Frontier and FrontierRow carry no validator, only column widths; every
// width is checked before the connection opens. --lint runs that alone. Dry
// run by default. --apply writes. Production writes are the curator's.

import { guardedPrisma } from "./lib/guarded-prisma";
import { charLength, canonical } from "../src/lib/char-length";

const prisma = guardedPrisma();
const APPLY = process.argv.includes("--apply");
const LINT = process.argv.includes("--lint");

const SLUG = "dimer-constant-cubic-lattice-bound";
const ENTRY = "dimer-constant-cubic-lattice";

/// The rigorous lower bound, from Schrijver's theorem. No upper bound may
/// cross it.
const FLOOR = 0.440075;

const FRONTIER = {
  slug: SLUG,
  name: "Upper bounds on the dimer constant of the cubic lattice",
  shortName: "Dimer constant of the cubic lattice",
  quantity: "the best proved upper bound on the dimer constant $\\ell_3$ of $\\mathbb Z^3$",
  statement:
    "The dimer constant $\\ell_3$ is the exponential growth rate of the number of perfect matchings of boxes in $\\mathbb Z^3$; Hammersley proved in 1966 that the limit exists and is independent of the box sequence. In two dimensions the analogous constant has the closed form $\\exp(2G/\\pi)$ of Kasteleyn, Fisher and Temperley, with $G$ Catalan's constant. In three dimensions no closed form is known and $\\ell_3$ is pinned only between bounds. The rigorous lower bound has been $\\tfrac12\\log(5^5/6^4) = 0.440075\\ldots$ since Minc drew it in 1978 from what is now Schrijver's theorem, while non-rigorous estimates put the truth near $0.4466$. This frontier tracks the upper bound, which has moved three times in sixty years.",
  direction: "min",
  field: "Statistical mechanics; enumerative combinatorics",
  fieldGroup: "Combinatorics",
  significance: 30,
  significanceNote:
    "A named classical constant of lattice statistics, solved exactly in two dimensions by Kasteleyn, Fisher and Temperley and unknown in three since the problem was posed in the 1960s; it appears in surveys of mathematical constants and in the asymptotic matching-conjecture literature. Level with the lonely runner frontier at 30, a named problem its own community follows closely, and below the Grothendieck and Shannon-capacity frontiers at 35 for a smaller audience. The score is for the problem, not for any one bound.",
  historyNote:
    "Lundow's 0.457547 and He's 0.452130 are both stated in He's 2026 paper, read here, which credits Ciucu with the method only. Ciucu's numeric value is not there; it comes from Finch's survey of constants in statistical mechanics (arXiv:math/9810155, October 1998), read here, recording the rigorous bounds of the day as 0.419989 and 0.463107 and citing Ciucu for the upper. The lower bound and the Nagle and Beichl-Sullivan estimates are as in He's introduction. Chen, Golin and Yong's 2019 claim to beat Lundow is not a row: He's footnote records that they gave no number.",
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
    date: "1998",
    valueTex: "$\\ell_3 \\le 0.463107$",
    valueShortTex: "0.463107",
    valueNumeric: 0.463107,
    attribution: "Mihai Ciucu",
    sourceUrl: "https://doi.org/10.1215/S0012-7094-98-09401-7",
    status: "historical",
    note: "Duke Mathematical Journal 94 (1998), 1-11. The transfer-matrix scheme every later bound uses: coordinate-plane cross sections, the constant bounded by the spectral radius of a 2^(mn) matrix, compressed by symmetry. Ciucu reached (m,n) = (4,4). The value is from Finch's October 1998 survey, which records the bounds of the day as 0.419989 and 0.463107.",
  },
  {
    date: "2001",
    valueTex: "$\\ell_3 \\le 0.457547$",
    valueShortTex: "0.457547",
    valueNumeric: 0.457547,
    attribution: "Per Hakan Lundow",
    sourceUrl: "https://arxiv.org/abs/2607.28810",
    status: "historical",
    note: "Ciucu's scheme pushed to (m,n) = (4,6), which needs both dimensions even because the comparison uses even powers. Stood for twenty-five years; Friedland-Peled and Lundow-Markstrom discuss why further upscaling is prohibitive. Value quoted from He's 2026 paper as the previous best.",
  },
  {
    date: "2026-07-30",
    valueTex: "$\\ell_3 \\le 0.452130$",
    valueShortTex: "0.452130",
    valueNumeric: 0.452130,
    attribution: "Qidong He, with AI assistance",
    sourceUrl: "https://arxiv.org/abs/2607.28810",
    status: "candidate",
    note: "Diagonal transfer layers on x1+x2+x3 = h rather than coordinate planes, so every edge joins consecutive layers and m, n need no parity restriction; Csikvari's 2017 inequality between a bipartite matching polynomial and its 2-lifts does the comparison, and a Collatz-Wielandt variant gives monotone computable bounds. Closes about half the gap Lundow left. Unreviewed preprint: a candidate.",
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
  // No upper bound may fall below the rigorous lower bound.
  for (const r of ROWS) {
    if (r.valueNumeric <= FLOOR) {
      over++;
      console.log(`  BELOW THE FLOOR: ${r.date} ${r.valueNumeric} <= ${FLOOR}`);
    }
  }
  console.log(over ? `${over} problem(s)` : `all field lengths ok, staircase descends, every row above the ${FLOOR} lower bound`);
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
      `  ${r.date.padEnd(11)} ${String(r.valueNumeric).padEnd(10)} ${r.status.padEnd(11)} ${r.attribution.slice(0, 44)}${r.problemSlug ? "  [entry]" : ""}`,
    );
  }
  const headline = [...ROWS]
    .filter((r) => r.status !== "candidate" && r.status !== "retracted")
    .sort((a, b) => a.valueNumeric - b.valueNumeric)[0];
  console.log(`\n  headline (non-candidate): ${headline.valueNumeric}  ${headline.attribution}`);
  console.log(`  rigorous lower bound: ${FLOOR} (Minc 1978 from Schrijver's theorem)`);
  console.log(`  non-rigorous estimate: about 0.4466 (Nagle 1966; Beichl-Sullivan)`);

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
