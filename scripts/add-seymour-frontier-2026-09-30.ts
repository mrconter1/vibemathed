// Adds the Seymour second-neighborhood frontier: the best proved lower bound
// on the order of a counterexample. Direction max.
//
// Seymour conjectured in 1990 that every finite oriented graph has a vertex x
// with |N^{++}(x)| >= |N^{+}(x)|. It is open. The quantity a reader can watch
// is how large any counterexample must be: every partial result pushes that
// floor up, and if it ever reached infinity the conjecture would be proved.
//
// WHY THIS AXIS. Two other axes were considered and rejected. The minimum
// out-degree threshold (Kaneko-Locke's 6 in 2001, then 7 in 2026) gives only
// two rows. The constant gamma with |N^{++}| >= gamma|N^{+}|, which Chen, Shen
// and Yuster put at 0.657, has a longer history but NEITHER catalog entry
// moves it, so the frontier's top row would not be an AI result and the
// frontier would not do its job. The counterexample order is the axis both
// entries actually move, and the 2026 dense-case paper states its own gain in
// exactly those terms.
//
// THE ROWS, all three figures taken from the dense-case paper
// (arXiv:2608.11530), which states the prior value and both of its own:
//
//   (prior)     16  Kaneko and Locke settled minimum out-degree at most 6 in
//                   2001, so a counterexample needs out-degree at least 7;
//                   with the earlier dense-case results that forced order at
//                   least 16. The dense-case paper names 16 as the figure it
//                   improves, which is the source for this row.
//   2026-08-12  17  Brukhman proves the conjecture for every oriented graph
//                   with n = 2*delta + 2 and, with Fisher's tournament
//                   theorem, for every n <= 2*delta + 2. With delta >= 7 that
//                   puts a counterexample at order at least 17. Unconditional.
//   2026-08-12  19  The same combination run with delta >= 8, which needs the
//                   out-degree-7 case. That is the other catalog entry,
//                   Sadhukhan, Sandeep and Sen (arXiv:2606.30588). The row is
//                   a candidate because it is conditional on a preprint.
//
// So both catalog entries hang on this frontier, and the top row exists only
// because of the two together - which is the honest picture and the reason the
// frontier is worth drawing rather than leaving the two entries unconnected.
//
// THE CEILING is infinity: no finite bound is known to be best possible, and
// proving the conjecture would send this to infinity. Nothing to check a row
// against on the upper side, so the script only checks that the staircase
// climbs and that every row is an integer at least 2.
//
// Frontier and FrontierRow carry no validator, only column widths; every
// width is checked before the connection opens. --lint runs that alone. Dry
// run by default. --apply writes. Production writes are the curator's.

import { guardedPrisma } from "./lib/guarded-prisma";
import { charLength, canonical } from "../src/lib/char-length";

const prisma = guardedPrisma();
const APPLY = process.argv.includes("--apply");
const LINT = process.argv.includes("--lint");

const SLUG = "seymour-second-neighborhood-counterexample-order";
const DENSE = "seymour-second-neighborhood-conjecture-dense-case";
const DEGREE = "seymour-second-neighborhood-outdegree-7";

const FRONTIER = {
  slug: SLUG,
  name: "How large must a counterexample to Seymour's second-neighborhood conjecture be?",
  shortName: "Seymour counterexample order",
  quantity: "the best proved lower bound on the order of a counterexample to Seymour's conjecture",
  statement:
    "Seymour conjectured in 1990 that every finite oriented graph has a vertex $x$ whose second out-neighbourhood is at least as large as its first, $|N^{++}(x)| \\ge |N^{+}(x)|$. It is open. Fisher proved it for tournaments in 1996, Kaneko and Locke for minimum out-degree at most six in 2001, and a line of work has settled dense graphs under conditions on the missing edges. Each such result forces any counterexample to be larger, so the size of the smallest possible counterexample is a number that only moves upward and would go to infinity if the conjecture were proved. This frontier tracks it.",
  direction: "max",
  field: "Digraph theory",
  fieldGroup: "Combinatorics",
  significance: 32,
  significanceNote:
    "A named conjecture of Seymour's, thirty-six years old, standard in digraph theory and in the Bang-Jensen-Gutin literature, with Dean's tournament case settled by Fisher and the general case untouched. Level with the catalog's own out-degree-7 entry at 32, and below the Borsuk frontier at 40 for a smaller field. The score is for the conjecture, not for the size of the last step.",
  historyNote:
    "All three figures are stated in the dense-case paper (arXiv:2608.11530), read here: it names 16 as the bound it improves, 17 as its own unconditional consequence, and 19 as what follows if the out-degree-7 preprint stands. The 19 row is therefore conditional and is drawn as a candidate. Two other axes were rejected: the out-degree threshold gives only two rows, and the Chen-Shen-Yuster constant 0.657 has a longer history but neither entry moves it. No ceiling is drawn, because proving the conjecture would send this quantity to infinity.",
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
    date: "2001",
    valueTex: "$n \\ge 16$",
    valueShortTex: "16",
    valueNumeric: 16,
    attribution: "Kaneko and Locke's out-degree bound with the earlier dense-case results",
    sourceUrl: "https://arxiv.org/abs/2608.11530",
    status: "historical",
    note: "Kaneko and Locke settled minimum out-degree at most six in 2001, so any counterexample has out-degree at least seven; with the dense-case results available then, that forced order at least 16. The figure is as the 2026 dense-case paper states it, naming 16 as the bound it improves.",
  },
  {
    date: "2026-08-12",
    valueTex: "$n \\ge 17$",
    valueShortTex: "17",
    valueNumeric: 17,
    attribution: "Jake Brukhman, with the GPT-5 family and Claude",
    sourceUrl: "https://arxiv.org/abs/2608.11530",
    status: "historical",
    note: "The conjecture holds for every oriented graph of order n = 2*delta + 2 with no condition on the missing edges, and with Fisher's tournament theorem for every n <= 2*delta + 2. With out-degree at least seven that puts a counterexample at order at least 17. Unconditional.",
    problemSlug: DENSE,
  },
  {
    date: "2026-08-13",
    valueTex: "$n \\ge 19$",
    valueShortTex: "19",
    valueNumeric: 19,
    attribution: "The same bound with the out-degree-7 case of Sadhukhan, Sandeep and Sen",
    sourceUrl: "https://arxiv.org/abs/2606.30588",
    status: "candidate",
    note: "Running the same n <= 2*delta + 2 result with out-degree at least eight, which needs the out-degree-7 case. That case is the catalog's other Seymour entry, an unreviewed preprint leaning on a CP-SAT computation, so this row is conditional on it and drawn as a candidate. Dated one day later to keep the staircase readable; both figures are in the same paper.",
    problemSlug: DEGREE,
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
  // Direction max: the staircase must climb.
  const byDate = [...ROWS].sort((a, b) => a.date.localeCompare(b.date));
  for (let i = 1; i < byDate.length; i++) {
    if (byDate[i].valueNumeric < byDate[i - 1].valueNumeric) {
      over++;
      console.log(`  NOT MONOTONE: ${byDate[i].date} (${byDate[i].valueNumeric}) is below ${byDate[i - 1].date} (${byDate[i - 1].valueNumeric})`);
    }
  }
  // An order is a whole number of vertices, and the conjecture is trivial below 2.
  for (const r of ROWS) {
    if (!Number.isInteger(r.valueNumeric) || r.valueNumeric < 2) {
      over++;
      console.log(`  NOT A VALID ORDER: ${r.date} ${r.valueNumeric}`);
    }
  }
  console.log(over ? `${over} problem(s)` : "all field lengths ok, staircase climbs, every row a whole order at least 2");
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
      `  ${r.date.padEnd(11)} ${String(r.valueNumeric).padEnd(4)} ${r.status.padEnd(11)} ${r.attribution.slice(0, 54)}${r.problemSlug ? "  [entry]" : ""}`,
    );
  }
  const headline = [...ROWS]
    .filter((r) => r.status !== "candidate" && r.status !== "retracted")
    .sort((a, b) => b.valueNumeric - a.valueNumeric)[0];
  console.log(`\n  headline (non-candidate): ${headline.valueNumeric}  ${headline.attribution.slice(0, 50)}`);
  console.log(`  no ceiling: proving the conjecture sends this to infinity`);

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
