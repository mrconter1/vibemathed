// Adds the lonely runner frontier: the number of runners for which the
// conjecture is proved. Direction max.
//
// Wills (1967) and Cusick (1974) conjectured that n runners on a unit track
// at distinct constant speeds are each, at some moment, at least 1/n from
// every other. Trivial for n <= 3; the cases since have fallen one or a few
// at a time, and from 2025 by a computer-assisted method that several
// people have been extending in quick succession. The catalog entry
// lonely-runner-nine-ten (Trakulthongchai with GPT-5, partial, unreviewed,
// 30) is the 9-and-10 step.
//
// THE ROWS, from the Wikipedia article's "For specific n" section and its
// works-cited list, each reference then checked at Crossref or arXiv:
//   1972        4   Betke and Wills, Monatshefte 76
//   1984        5   Cusick and Pomerance, J. Number Theory 19 (computer-
//                   assisted; elementary proofs came later)
//   2001        6   Bohman, Holzman and Kleitman, EJC 8
//   2008        7   Barajas and Serra, EJC 15
//   2025-09-17  8   Rosenfeld, arXiv:2509.14111, the new computational method
//   2025-11-27  10  Trakulthongchai with GPT-5, arXiv:2511.22427: the entry,
//                   9 and 10 by a sieve refinement. Candidate: unreviewed.
//   2025-12-01  9   Rosenfeld, arXiv:2512.01912, independently, four days
//                   later. Drawn as a step that did not move the line past
//                   the candidate, but it is the standing reviewed-track
//                   record until the next row.
//   2026-04-26  13  Sungkawichai and Trakulthongchai, arXiv:2604.23906,
//                   11, 12 and 13. Read here: "the development of our code
//                   was assisted by AI-based tools", and Lemma with "Proof
//                   sketch (from ChatGPT-5.6 Pro)". An AI-in-the-loop
//                   result that is NOT in the catalog; flagged separately.
//                   Drawn historical, since it is a cited result and not a
//                   claim of this site.
//
// The monotone check skips candidate rows, because a candidate never moves
// the line and Rosenfeld's 9 legitimately follows the candidate 10 in time.
//
// Frontier and FrontierRow carry no validator, only column widths; every
// width is checked before the connection opens. --lint runs that alone. Dry
// run by default. --apply writes. Production writes are the curator's.

import { guardedPrisma } from "./lib/guarded-prisma";
import { charLength, canonical } from "../src/lib/char-length";

const prisma = guardedPrisma();
const APPLY = process.argv.includes("--apply");
const LINT = process.argv.includes("--lint");

const SLUG = "lonely-runner-runners";
const ENTRY = "lonely-runner-nine-ten";

const FRONTIER = {
  slug: SLUG,
  name: "Runners for which the lonely runner conjecture is proved",
  shortName: "Lonely runner: runners settled",
  quantity: "the largest $n$ such that the lonely runner conjecture holds for every $n' \\le n$ runners",
  statement:
    "Wills in 1967, and Cusick independently in 1974, conjectured that if $n$ runners start together on a circular track of unit length at pairwise distinct constant speeds, then each runner is at some time at distance at least $1/n$ from all the others. Trivial for $n \\le 3$, it has fallen one or a few runners at a time: 4 in 1972, 5 in 1984, 6 in 2001, 7 in 2008, then, after a seventeen-year pause, a computer-assisted method built on Tao's finite-checking reduction settled 8 in September 2025 and has been extended almost monthly since, to 9 and 10, and to 13 by April 2026. The conjecture for all $n$ is open; this frontier tracks how far the case-by-case verification has reached.",
  direction: "max",
  field: "Diophantine approximation; view-obstruction",
  fieldGroup: "Number theory",
  significance: 30,
  significanceNote:
    "A named conjecture with a sixty-year history, elementary to state, with a picture everyone remembers and consequences for view-obstruction problems and circulant chromatic numbers. Famous within combinatorial number theory rather than across mathematics: level with the community-famous band at 30, below the unit-distance problem and Sendov at 40, above the numbered Erdos problems at 10. The score is for the conjecture, not for any one case.",
  historyNote:
    "Rows from the Wikipedia article's per-n account and its works-cited list, each reference then checked at Crossref or arXiv; the four 2025-2026 papers were opened and their abstracts and AI disclosures read. Rosenfeld's 9 (1 December 2025) came four days after the entry's 9 and 10 and is drawn as a row that did not move the line, since the entry's row is a candidate: unreviewed, so hollow. The April 2026 paper reaching 13 discloses AI-assisted code and a lemma sketched by ChatGPT-5.6 Pro; it is drawn as a cited historical row because it has no catalog entry yet, and it should get one.",
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
    date: "1972",
    valueTex: "$n = 4$",
    valueShortTex: "4",
    valueNumeric: 4,
    attribution: "Ulrich Betke and Jorg M. Wills",
    sourceUrl: "https://doi.org/10.1007/BF01322924",
    status: "historical",
    note: "Monatshefte fur Mathematik 76 (1972), in the Diophantine-approximation language Wills posed the conjecture in five years earlier. The cases n <= 3 are elementary.",
  },
  {
    date: "1984",
    valueTex: "$n = 5$",
    valueShortTex: "5",
    valueNumeric: 5,
    attribution: "Thomas W. Cusick and Carl Pomerance",
    sourceUrl: "https://doi.org/10.1016/0022-314X(84)90097-0",
    status: "historical",
    note: "View-obstruction problems III, Journal of Number Theory 19 (1984). Computer-assisted at the time; Bienia, Goddyn, Gvozdjak, Sebo and Tarsi gave an elementary proof in 1998.",
  },
  {
    date: "2001",
    valueTex: "$n = 6$",
    valueShortTex: "6",
    valueNumeric: 6,
    attribution: "Tom Bohman, Ron Holzman and Daniel Kleitman",
    sourceUrl: "https://doi.org/10.37236/1602",
    status: "historical",
    note: "Six lonely runners, Electronic Journal of Combinatorics 8 (2001). Seventeen years after five.",
  },
  {
    date: "2008",
    valueTex: "$n = 7$",
    valueShortTex: "7",
    valueNumeric: 7,
    attribution: "Javier Barajas and Oriol Serra",
    sourceUrl: "https://doi.org/10.37236/772",
    status: "historical",
    note: "The lonely runner with seven runners, Electronic Journal of Combinatorics 15 (2008). The record for seventeen years.",
  },
  {
    date: "2025-09-17",
    valueTex: "$n = 8$",
    valueShortTex: "8",
    valueNumeric: 8,
    attribution: "Matthieu Rosenfeld",
    sourceUrl: "https://arxiv.org/abs/2509.14111",
    status: "historical",
    note: "The method every later row uses: Tao's 2018 reduction to a finite check, sharpened by Malikiosis, Santos and Schymura in 2025, then a computer verification. Rosenfeld's abstract predicted that minor improvements would reach 9 or 10; they did within ten weeks.",
  },
  {
    date: "2025-11-27",
    valueTex: "$n = 10$",
    valueShortTex: "10",
    valueNumeric: 10,
    attribution: "Tanupat Trakulthongchai, with GPT-5",
    sourceUrl: "https://arxiv.org/abs/2511.22427",
    status: "candidate",
    note: "Nine and ten runners, by adding a sieve to Rosenfeld's verification; GPT-5 assisted the C++ implementation, per the paper's Section 6. Code and result receipts are public; no independent rerun has appeared, so the entry is unreviewed and this row is a candidate.",
    problemSlug: ENTRY,
  },
  {
    date: "2025-12-01",
    valueTex: "$n = 9$",
    valueShortTex: "9",
    valueNumeric: 9,
    attribution: "Matthieu Rosenfeld",
    sourceUrl: "https://arxiv.org/abs/2512.01912",
    status: "historical",
    note: "Nine runners, independently, four days after the entry's nine and ten, by improvements to his own eight-runner method. On the reviewed track this is the record until April 2026.",
  },
  {
    date: "2026-04-26",
    valueTex: "$n = 13$",
    valueShortTex: "13",
    valueNumeric: 13,
    attribution: "Touch Sungkawichai and Tanupat Trakulthongchai, with AI-assisted code and one lemma sketched by ChatGPT-5.6 Pro",
    sourceUrl: "https://arxiv.org/abs/2604.23906",
    status: "historical",
    note: "Eleven, twelve and thirteen runners, extending the same computational method with parallel execution and stronger pruning. The paper says its code development was AI-assisted and prints a proof sketch it attributes to ChatGPT-5.6 Pro, so this is an AI-in-the-loop result without a catalog entry yet. Drawn as a cited row until it has one.",
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
  // Direction max on the competing rows; candidates never move the line and
  // are skipped, which is how Rosenfeld's 9 may follow the candidate 10.
  const competing = ROWS.filter((r) => r.status !== "candidate" && r.status !== "retracted")
    .sort((a, b) => a.date.localeCompare(b.date));
  for (let i = 1; i < competing.length; i++) {
    if (competing[i].valueNumeric < competing[i - 1].valueNumeric) {
      over++;
      console.log(`  NOT MONOTONE: ${competing[i].date} (${competing[i].valueNumeric}) is below ${competing[i - 1].date} (${competing[i - 1].valueNumeric})`);
    }
  }
  console.log(over ? `${over} problem(s)` : "all field lengths ok, the reviewed staircase climbs");
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
      `  ${r.date.padEnd(11)} ${String(r.valueNumeric).padEnd(4)} ${r.status.padEnd(11)} ${r.attribution.slice(0, 50)}${r.problemSlug ? "  [entry]" : ""}`,
    );
  }
  const headline = [...ROWS]
    .filter((r) => r.status !== "candidate" && r.status !== "retracted")
    .sort((a, b) => b.valueNumeric - a.valueNumeric)[0];
  console.log(`\n  headline (non-candidate): ${headline.valueNumeric}  ${headline.attribution.slice(0, 60)}`);

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
