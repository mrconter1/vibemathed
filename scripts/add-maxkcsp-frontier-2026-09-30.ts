// Adds the Boolean Max-k-CSP frontier: the constant in the best proved
// approximation ratio. Direction max.
//
// Every boolean CSP of arity k has a random-assignment 2^{-k} approximation.
// The interesting quantity is the constant c in a guarantee of the form
// c * k / 2^k, since Samorodnitsky and Trevisan established k/2^k as the right
// scale. This frontier tracks c.
//
// THE ROWS, all from the introduction and reference list of Bakshi's paper
// (arXiv:2608.05331), read here:
//
//   2009  0.44      Charikar, Makarychev and Makarychev, ACM Trans. Algorithms
//                   5(3). "First showed that one can always gain a factor of
//                   Omega(k)", which is what makes the constant a meaningful
//                   axis at all.
//   2012  0.626612  Makarychev and Makarychev, APPROX. Stated in the source as
//                   (0.626612 - o_k(1)) k / 2^k.
//   2026  1         Bakshi, the catalog entry: a clean k / 2^k, removing the
//                   constant factor entirely.
//
// THE CEILING, stated and checked rather than drawn. Under the Unique Games
// Conjecture the constant cannot be pushed past 1 asymptotically:
// Austrin and Mossel (2009) gave (1 + o_k(1)) k / 2^k, and De and Mossel
// (2013) sharpened it to the statement that beating (k+1)/2^k for odd k, or
// (k+2)/2^k for even k, is NP-hard. So this frontier has essentially closed:
// the 2026 row sits at the ceiling, with only the lower-order terms and the
// UGC assumption between it and optimality. That is worth drawing precisely
// because a frontier that reaches its ceiling is the most informative kind.
//
// Every row is checked against c <= 1.
//
// Frontier and FrontierRow carry no validator, only column widths; every
// width is checked before the connection opens. --lint runs that alone. Dry
// run by default. --apply writes. Production writes are the curator's.

import { guardedPrisma } from "./lib/guarded-prisma";
import { charLength, canonical } from "../src/lib/char-length";

const prisma = guardedPrisma();
const APPLY = process.argv.includes("--apply");
const LINT = process.argv.includes("--lint");

const SLUG = "boolean-max-k-csp-constant";
const ENTRY = "boolean-max-k-csp-approximation";

/// Under UGC the constant cannot exceed 1 asymptotically (Austrin-Mossel,
/// sharpened by De-Mossel). No row may go above it.
const CEILING = 1;

const FRONTIER = {
  slug: SLUG,
  name: "The approximation constant for Boolean Max-k-CSP",
  shortName: "Boolean Max-k-CSP constant",
  quantity: "the constant $c$ in the best proved $c\\,k/2^k$ approximation for Boolean Max-$k$-CSP",
  statement:
    "Boolean Max-$k$-CSP asks for an assignment satisfying as many constraints as possible, where each constraint is an arbitrary predicate on at most $k$ bits. A constraint may accept only one of its $2^k$ local assignments, so a random assignment already gives $2^{-k}$; Samorodnitsky and Trevisan showed that $k/2^k$ is the right scale, and Charikar, Makarychev and Makarychev showed that the factor $k$ is always available. The live question is the constant in front. Raghavendra's theorem says a semidefinite program achieves the optimal ratio for every CSP under the Unique Games Conjecture, but it is existential: it names no constant and no rounding. This frontier tracks the constant, which has moved twice since 2009 and now stands at $1$, where the conditional hardness ceiling also sits.",
  direction: "max",
  field: "Approximation algorithms; constraint satisfaction",
  fieldGroup: "Algorithms & optimization",
  significance: 22,
  significanceNote:
    "The approximability of an arbitrary boolean CSP is one of the organising questions of approximation algorithms, tied to the Unique Games Conjecture and to Raghavendra's theorem, and the constant here is the concrete number that theorem declines to name. Above the Multiway Cut frontier at 15, which is one problem rather than the whole boolean family, and below the Borsuk frontier at 40. The score is for the question, not for the size of the last step.",
  historyNote:
    "All three rows, the hardness results and the scale come from the introduction and references of Bakshi's paper (arXiv:2608.05331), read here; years are as that list gives them, so Charikar-Makarychev-Makarychev is dated to the 2009 journal version, not the conference one. The ceiling is not drawn as a row because it is conditional on the Unique Games Conjecture and carries $o_k(1)$ terms: Austrin and Mossel (2009) give $(1+o_k(1))k/2^k$ and De and Mossel (2013) sharpen it to the $(k+1)/2^k$ and $(k+2)/2^k$ statements. Reaching the ceiling is why this frontier is close to complete.",
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
    date: "2009",
    valueTex: "$c = 0.44$",
    valueShortTex: "0.44",
    valueNumeric: 0.44,
    attribution: "Moses Charikar, Konstantin Makarychev and Yury Makarychev",
    sourceUrl: "https://doi.org/10.1145/1541885.1541893",
    status: "historical",
    note: "Near-optimal algorithms for maximum constraint satisfaction problems, ACM Transactions on Algorithms 5(3). The step that makes the constant a meaningful axis: the first proof that a factor of order k over the random assignment is always available, at c = 0.44.",
  },
  {
    date: "2012",
    valueTex: "$c = 0.626612$",
    valueShortTex: "0.626612",
    valueNumeric: 0.626612,
    attribution: "Konstantin Makarychev and Yury Makarychev",
    sourceUrl: "https://doi.org/10.1007/978-3-642-32512-0_22",
    status: "historical",
    note: "APPROX 2012, stated as a (0.626612 - o_k(1)) k / 2^k approximation. The record for fourteen years.",
  },
  {
    date: "2026-08-05",
    valueTex: "$c = 1$",
    valueShortTex: "1",
    valueNumeric: 1,
    attribution: "Ainesh Bakshi, with GPT-5.6 Sol Max on the computations",
    sourceUrl: "https://arxiv.org/abs/2608.05331",
    status: "candidate",
    note: "A clean k / 2^k, removing the constant factor. The technical ingredient is an extension of the Gaussian comparison inequality used to resolve the weak simplex conjecture. This sits at the conditional ceiling: under Unique Games the constant cannot pass 1 asymptotically. Days-old preprint, no review: a candidate.",
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
  // Direction max: the staircase must climb.
  const byDate = [...ROWS].sort((a, b) => a.date.localeCompare(b.date));
  for (let i = 1; i < byDate.length; i++) {
    if (byDate[i].valueNumeric < byDate[i - 1].valueNumeric) {
      over++;
      console.log(`  NOT MONOTONE: ${byDate[i].date} (${byDate[i].valueNumeric}) is below ${byDate[i - 1].date} (${byDate[i - 1].valueNumeric})`);
    }
  }
  // Under UGC the constant cannot exceed 1 asymptotically.
  for (const r of ROWS) {
    if (r.valueNumeric > CEILING) {
      over++;
      console.log(`  ABOVE THE CEILING: ${r.date} ${r.valueNumeric} > ${CEILING}`);
    }
  }
  console.log(over ? `${over} problem(s)` : `all field lengths ok, staircase climbs, every row at or below the UGC ceiling c = ${CEILING}`);
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
      `  ${r.date.padEnd(11)} ${String(r.valueNumeric).padEnd(10)} ${r.status.padEnd(11)} ${r.attribution.slice(0, 48)}${r.problemSlug ? "  [entry]" : ""}`,
    );
  }
  const headline = [...ROWS]
    .filter((r) => r.status !== "candidate" && r.status !== "retracted")
    .sort((a, b) => b.valueNumeric - a.valueNumeric)[0];
  console.log(`\n  headline (non-candidate): ${headline.valueNumeric}  ${headline.attribution}`);
  console.log(`  UGC ceiling: c = ${CEILING} asymptotically (Austrin-Mossel; De-Mossel)`);

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
