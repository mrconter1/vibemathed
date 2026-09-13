// Gives the percolation entry a posed year, so it can appear on the chart it
// is currently the biggest thing missing from.
//
// absence-of-critical-bernoulli-bond-percolation-on-z-d-in-every-dimension-d-2
// carries significance 78 - the second highest in the catalog - and has
// yearPosed null. That makes it unplottable on any age axis, so the
// major-results chart added on 13 September shows 26 of the 27 entries at or
// above 40, and the one it drops is the second largest. Nothing is wrong with
// the entry; the field was simply never filled.
//
// THE DATE. 1982, and the authority is the entry's own cited source.
// Duminil-Copin's "Sixty years of percolation" (arXiv:1712.04651), which the
// significance note already names, states it and traces it in one breath:
//
//   "Conjecture 1 Show that theta(p_c) = 0 on Z^d for every d >= 3. This
//    conjecture, often referred to as the 'theta(p_c) = 0 conjecture', is one
//    of the problems that Harry Kesten was describing in the following terms
//    in his famous 1982 book [61]"
//
// [61] is Kesten, Percolation Theory for Mathematicians, Birkhauser 1982. So
// the survey the entry already leans on points at a specific book and year for
// the posing, which is the same standard used for Navier-Stokes (Leray 1934,
// via Fefferman) and Euler (Lichtenstein 1925, via Elgindi).
//
// Not 1957. Broadbent and Hammersley introduced Bernoulli percolation, and the
// survey calls it "the simplest and oldest model of bond percolation", but
// they posed no question about theta at p_c. Dating from them would be like
// dating Navier-Stokes from Navier.
//
// Not 1960 either, which is what the entry's own age note currently implies.
// Harris 1960 proved theta(1/2) = 0 on Z^2, which is NOT the same as settling
// the planar case: p_c(Z^2) = 1/2 was unknown until Kesten 1980. The survey is
// explicit - "Combined with the early work of Harris who proved theta(1/2) = 0
// on Z^2, Kesten's result directly implies that theta(p_c) = 0". So d = 2 fell
// in 1980, and 1982 is when the remaining dimensions were written down as the
// problem.
//
// AGE NOTE: REWRITTEN, NOT REPLACED, and this needs saying because the field
// is not what its name suggests. It currently opens with a COST disclosure -
// "about one week of wall time in August 2026, on cloud CPU machines for Lean
// elaboration plus API inference, with spend not tracked" - which is solve-cost
// information living in the age footnote. Exactly the trap the Euler entry
// sprang: a script that wrote a dating rationale over it would have destroyed
// the only record of that cost. It is kept here verbatim. Its second sentence,
// which says the problem had been open "since Harris settled the planar case
// in 1960", is corrected, because Harris did not settle the planar case.
//
// SIGNIFICANCE NOTE: one attribution corrected. It currently reads "for
// d >= 11 by lace expansion since Hara-Slade 1990", which compresses two
// results into one. Hara and Slade got d >= 19 in 1990; d >= 11 is Fitzner and
// van der Hofstad, arXiv:1506.07977, which appears in the survey's own
// bibliography as reference [71]. The score itself does not move.
//
// Dry run by default. Pass --apply to write. Production writes are the
// curator's to run.

import { guardedPrisma } from "./lib/guarded-prisma";
import { checkStoredEntry } from "../src/lib/field-validation";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { charLength, canonical } from "../src/lib/char-length";
import { ageAtSolve } from "../src/lib/problems";

const prisma = guardedPrisma();
const APPLY = process.argv.includes("--apply");
const SPECS = [...EDITABLE_FIELDS, ...CURATOR_FIELDS];

const SLUG =
  "absence-of-critical-bernoulli-bond-percolation-on-z-d-in-every-dimension-d-2";

const EDITS = {
  yearPosed: 1982,
  posedBy:
    "Harry Kesten, Percolation Theory for Mathematicians (1982), which is where Duminil-Copin's survey traces it; restated as Conjecture 1 of his 2018 ICM survey",
  // PLAIN TEXT, with Unicode rather than TeX. Both of these render through
  // StarNote, which does not run KaTeX, and ageNote's own help text says so:
  // "Shown in a hover bubble, so plain text only - write pi/2, not $\pi/2$."
  // The note being replaced already used "d ≥ 2" for that reason. A first
  // draft here wrote $d\ge2$ and would have put literal dollar signs and
  // backslashes on the entry page; the dry run printing before and after side
  // by side is what showed it.
  ageNote:
    "Dated from Kesten's 1982 book, where Duminil-Copin's survey traces the conjecture. Kesten settled d = 2 in 1980 using Harris's 1960 proof that θ(1/2) = 0 on Z², so the other dimensions are the problem. Cost, as the repository discloses it: about a week of wall time in August 2026 on cloud CPU machines for Lean elaboration plus API inference, spend not tracked.",
  significanceNote:
    "Conjecture 1 of Duminil-Copin's 2018 ICM survey \"Sixty years of percolation\", which traces it to Kesten's 1982 book. Settled for d = 2 by Kesten in 1980 with Harris's 1960 planar estimate, and in high dimensions by lace expansion since Hara-Slade 1990 (d ≥ 19), pushed to d ≥ 11 by Fitzner and van der Hofstad in 2015; dimensions 3 to 10 held out, reached by neither planar duality nor the lace expansion. Resolved for every d ≥ 2 with no extra hypothesis. Just below the Collatz band: a central problem of probability settled completely, held back only because no human has read the argument.",
};

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

/// Field limits and the form's own rules, with no database. Runs first, and
/// under --lint runs alone, so a value that is too long is caught here rather
/// than costing the curator a production round trip.
function lint(): number {
  const limit = new Map<string, number>();
  for (const s of SPECS) if (s.maxLength) limit.set(s.key, s.maxLength);
  let bad = 0;
  for (const [k, v] of Object.entries(EDITS)) {
    if (typeof v !== "string") {
      console.log(`  ${k.padEnd(17)}: ${JSON.stringify(v)}`);
      continue;
    }
    const n = charLength(canonical(v));
    const cap = limit.get(k);
    const over = cap !== undefined && n > cap;
    console.log(`  ${k.padEnd(17)}: ${n}${cap ? `/${cap}` : ""}${over ? `  OVER BY ${n - cap}` : ""}`);
    if (over) bad++;
  }
  const v = checkStoredEntry({ specs: SPECS, fields: EDITS });
  for (const x of v) console.log(`  RULE: ${x.field}: ${x.problem}`);
  bad += v.length;
  console.log(bad ? `${bad} local violation(s)` : "local checks ok");
  return bad;
}

async function main() {
  const localBad = lint();
  if (process.argv.includes("--lint")) {
    process.exitCode = localBad ? 1 : 0;
    return;
  }
  if (localBad) throw new Error(`${localBad} local violation(s) - nothing written`);

  const db = await connectWithRetry();
  console.log(`database: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`);

  const [before] = await prisma.$queryRawUnsafe<
    {
      yearPosed: number | null;
      posedBy: string | null;
      ageNote: string | null;
      significanceNote: string | null;
      solveDate: string;
      significance: number | null;
    }[]
  >(
    `SELECT "yearPosed", "posedBy", "ageNote", "significanceNote", "solveDate", significance
       FROM "Problem" WHERE slug = $1`,
    SLUG,
  );
  if (!before) throw new Error(`not found on ${db}: ${SLUG}`);

  const oldAge = ageAtSolve({
    yearPosed: before.yearPosed,
    solveDate: before.solveDate,
  });
  const newAge = ageAtSolve({
    yearPosed: EDITS.yearPosed,
    solveDate: before.solveDate,
  });
  console.log(`significance : ${before.significance} (unchanged)`);
  console.log(`yearPosed    : ${before.yearPosed} -> ${EDITS.yearPosed}`);
  console.log(`age          : ${oldAge ?? "none, so it cannot plot"} -> ${newAge} years\n`);

  for (const [k, v] of Object.entries(EDITS)) {
    if (typeof v !== "string") continue;
    const cur = (before as Record<string, unknown>)[k];
    console.log(`--- ${k} (${charLength(canonical(v))} chars) ---`);
    console.log(`before: ${cur ?? "(null)"}`);
    console.log(`after : ${v}\n`);
  }

  // The same check the guarded client runs on write.
  const v = checkStoredEntry({ specs: SPECS, fields: EDITS });
  console.log(`field check: ${v.length ? "FAILED" : "ok"}`);
  for (const x of v) console.log(`  - ${x.field}: ${x.problem}`);
  if (v.length) throw new Error("would be refused");

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  await prisma.problem.update({
    where: { slug: SLUG },
    data: EDITS,
    select: { id: true },
  });
  console.log("\nAPPLIED. Every public surface lags by up to an hour: this is a");
  console.log("write straight to the database, so nothing revalidates a tag.");
  console.log("A deploy clears it, and so does saving the entry once in the UI.");
  console.log("The major-results chart should then show 27 points, not 26.");
}

main().finally(() => prisma.$disconnect());
