// Adds the sphere-packing exponent frontier: the constant c in the best
// proved bound Delta_n <= 2^{-(c+o(1))n} on the density of sphere packings
// in R^n as n grows. Direction max: a larger c is a stronger upper bound.
//
// Asked for on 15 September, pointing at the entry
// sphere-packing-upper-bounds-cohn-elkies (partial, lean-verified, 50): the
// OpenAI "Ten advances" result that determined the exact asymptotic strength
// of the Cohn-Elkies linear program. Read in the ten-proofs PDF, Chapter 1,
// Theorem 1.1: "LP_d^{1/d} -> sqrt(e)/(2 pi)", hence "Delta_d <= 2^{-(alpha*
// + o(1))d}, where alpha* = 1/2 log2(2 pi / e) = 0.6044.... This is the
// first improvement since 1978 to the general sphere-packing exponent. The
// classical Kabatianskii-Levenshtein exponent was 0.59905576...; subsequent
// spherical-code refinements had improved only lower-order factors [CZ14,
// SZ24, Z24]." That sentence is the whole frontier.
//
// THE ROWS.
//   1929  1/2    Blichfeldt, Math. Ann. 101: Delta_n <= (n/2 + 1) 2^{-n/2}.
//   1958  1/2    Rogers, Proc. LMS: the simplex bound, a better lower-order
//                factor and no change to the exponent. Kept as a row that
//                did not move the line, since it is the bound the field
//                cites for the next twenty years.
//   1975  0.5237 Levenshtein, Math. Notes 18: read in the journal abstract,
//                "delta_n <= 2^{-n(0.5237+o(1))}".
//   1978  0.5990 Kabatiansky and Levenshtein, Problems Inform. Transmission
//                14: the bound that stood 48 years; MathNet has the record.
//   2026  0.6044 OpenAI's Astra, the entry, lean-verified.
//
// Not drawn: Sidel'nikov's 1973 bound between Rogers and Levenshtein. Its
// exponent is usually quoted as 0.5096, but that figure could not be
// confirmed at source from here, and Cohn-Elkies 2003 list only Rogers,
// Levenshtein and KL as the three best pre-LP bounds. The history note says
// so. Also not drawn: Cohn-Zhao 2014, Sardari-Zargar 2024 and Zhao 2024,
// which the AI paper itself says improved only lower-order factors.
//
// No ceiling on this axis short of c = 1 (Minkowski's lower bound gives
// packings of density 2^{-n}, so no upper-bound exponent can exceed 1);
// every row is checked against that.
//
// Frontier and FrontierRow carry no validator, only column widths; every
// width is checked before the connection opens. --lint runs that alone. Dry
// run by default. --apply writes. Production writes are the curator's.

import { guardedPrisma } from "./lib/guarded-prisma";
import { charLength, canonical } from "../src/lib/char-length";

const prisma = guardedPrisma();
const APPLY = process.argv.includes("--apply");
const LINT = process.argv.includes("--lint");

const SLUG = "sphere-packing-exponent";
const ENTRY = "sphere-packing-upper-bounds-cohn-elkies";

const FRONTIER = {
  slug: SLUG,
  name: "Upper bounds on sphere-packing density in high dimension",
  shortName: "Sphere-packing exponent",
  quantity: "the exponent $c$ in the best proved bound $\\Delta_n \\le 2^{-(c+o(1))n}$",
  statement:
    "How dense can a packing of equal balls in $\\mathbb R^n$ be as $n \\to \\infty$? Minkowski's lattices give density at least $2^{-n}$, and no construction does exponentially better; the upper bounds all have the form $2^{-(c+o(1))n}$, and the question is how large a $c$ can be proved. Blichfeldt's 1929 bound has $c = 1/2$, Levenshtein reached $0.5237$ in 1975 through spherical codes, and Kabatiansky and Levenshtein's $0.5990$ of 1978 then stood for forty-eight years while Cohn and Elkies's linear program, which reproduces the best bounds in dimensions 8 and 24, was known to be at least as strong but not whether it was stronger. In 2026 its exact asymptotic strength was determined: $c = \\tfrac12\\log_2(2\\pi/e) = 0.6044\\ldots$, the first movement of the exponent since 1978. The true exponent lies somewhere in $[0.6044, 1]$ and where is open; this frontier tracks the lower end.",
  direction: "max",
  field: "Discrete geometry; sphere packing",
  fieldGroup: "Geometry & topology",
  significance: 50,
  significanceNote:
    "The sphere-packing problem is one of the oldest in mathematics, central to geometry, coding theory and number theory alike, and the high-dimensional exponent is its asymptotic form: a number every textbook on the subject states, unchanged from 1978 until this year. Level with the union-closed frontier at 50 and Erdos #1 at 50, both problems anyone in the field would name; below Erdos-Sos at 58 and well below the dimension-8 and dimension-24 packing theorems, which are not a frontier but a finished result. The score is for the problem, not for any one step.",
  historyNote:
    "The 2026 exponent, the 1978 exponent and the fact that nothing between them moved the exponent are all stated in the ten-proofs paper, Chapter 1, and were read there. Levenshtein's 0.5237 was read in the journal abstract. Blichfeldt's and Rogers's bounds are classical and their exponent of one half is textbook; Rogers is kept as a row that did not move the line. Sidel'nikov's 1973 bound is not drawn: its exponent is usually quoted as 0.5096 but could not be confirmed at source from here. The 2026 row is published rather than a candidate because the entry is lean-verified.",
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
    date: "1929",
    valueTex: "$c = 1/2$",
    valueShortTex: "0.5",
    valueNumeric: 0.5,
    attribution: "Hans Frederick Blichfeldt",
    sourceUrl: "https://doi.org/10.1007/BF01454863",
    status: "historical",
    note: "Delta_n <= (n/2 + 1) 2^{-n/2}, Mathematische Annalen 101 (1929). The first exponential upper bound, and its exponent of one half stood for forty-six years.",
  },
  {
    date: "1958",
    valueTex: "$c = 1/2$",
    valueShortTex: "0.5",
    valueNumeric: 0.5,
    attribution: "Claude Ambrose Rogers",
    sourceUrl: "https://doi.org/10.1112/plms/s3-8.4.609",
    status: "historical",
    note: "The simplex bound, Proc. London Math. Soc. 8 (1958): a sharper lower-order factor and the bound the field cited for two decades, but the same exponent as Blichfeldt. A step that did not move the line.",
  },
  {
    date: "1975",
    valueTex: "$c = 0.5237\\ldots$",
    valueShortTex: "0.5237",
    valueNumeric: 0.5237,
    attribution: "Vladimir I. Levenshtein",
    sourceUrl: "https://doi.org/10.1007/BF01818046",
    status: "historical",
    note: "Mathematical Notes 18 (1975), read in the abstract: \"delta_n <= 2^{-n(0.5237+o(1))}\", from an improved bound on spherical codes. The first exponent above one half.",
  },
  {
    date: "1978",
    valueTex: "$c = 0.59905576\\ldots$",
    valueShortTex: "0.5990",
    valueNumeric: 0.59905576,
    attribution: "Grigory Kabatiansky and Vladimir I. Levenshtein",
    sourceUrl: "https://www.mathnet.ru/php/archive.phtml?wshow=paper&jrnid=ppi&paperid=1518&option_lang=eng",
    status: "historical",
    note: "Problems of Information Transmission 14 (1978). Delsarte's linear program on the sphere, then a geometric passage from spherical codes to packings. Stood for forty-eight years; Cohn-Zhao 2014, Sardari-Zargar 2024 and Zhao 2024 improved only the lower-order factor.",
  },
  {
    date: "2026-08-01",
    valueTex: "$c = \\tfrac12\\log_2(2\\pi/e) = 0.6044\\ldots$",
    valueShortTex: "0.6044",
    valueNumeric: 0.6044,
    attribution: "OpenAI's Astra (internal preview)",
    sourceUrl: "https://cdn.openai.com/pdf/ten-proofs-oai.pdf",
    status: "published",
    note: "The exact asymptotic strength of the Cohn-Elkies linear program: LP_d^{1/d} -> sqrt(e)/(2 pi), with a matching lower bound showing no auxiliary function can do better. Ten-proofs paper, Chapter 1, Theorem 1.1; Lean certificate in openai/ten-proofs. The first change to the exponent since 1978.",
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
  // Direction max: no later row may be below an earlier one (equal is a row
  // that did not move the line, which is allowed).
  const byDate = [...ROWS].sort((a, b) => a.date.localeCompare(b.date));
  for (let i = 1; i < byDate.length; i++) {
    if (byDate[i].valueNumeric < byDate[i - 1].valueNumeric) {
      over++;
      console.log(`  NOT MONOTONE: ${byDate[i].date} (${byDate[i].valueNumeric}) is below ${byDate[i - 1].date} (${byDate[i - 1].valueNumeric})`);
    }
  }
  // Minkowski gives density 2^{-n}, so no upper-bound exponent can reach 1.
  for (const r of ROWS) {
    if (r.valueNumeric >= 1) {
      over++;
      console.log(`  AT OR ABOVE THE CEILING: ${r.date} ${r.valueNumeric} >= 1`);
    }
  }
  console.log(over ? `${over} problem(s)` : "all field lengths ok, staircase climbs, every row under c = 1");
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
      `  ${r.date.padEnd(11)} ${String(r.valueNumeric).padEnd(12)} ${r.status.padEnd(11)} ${r.attribution.slice(0, 44)}${r.problemSlug ? "  [entry]" : ""}`,
    );
  }
  const headline = [...ROWS]
    .filter((r) => r.status !== "candidate" && r.status !== "retracted")
    .sort((a, b) => b.valueNumeric - a.valueNumeric)[0];
  console.log(`\n  headline: ${headline.valueNumeric}  ${headline.attribution}`);
  console.log(`  the true exponent is somewhere in [${headline.valueNumeric}, 1] and open`);

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
