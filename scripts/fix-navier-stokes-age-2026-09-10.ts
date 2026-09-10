// The Navier-Stokes entry dated the problem to its prize, not its posing.
//
// It went in with yearPosed 2000 and posedBy "Charles L. Fefferman, Clay
// Mathematics Institute", so the site reported the problem as 26 years old.
// Every primary source dates it to Leray:
//
//   Fefferman's own Clay description cites [5] J. Leray, "Sur le mouvement
//   d'un liquide visqueux emplissant l'espace", Acta Math. 63 (1934), and
//   builds its whole weak-solution discussion from it: "Starting with Leray
//   [5], important progress has been made".
//
//   OpenAI's paper, section 1: "In 1934, Leray constructed global
//   finite-energy weak solutions of the three-dimensional equations
//   satisfying an energy inequality. Whether solutions starting from smooth
//   data remain smooth was left unresolved."
//
//   OpenAI's announcement: "In 1934, Jean Leray proved that solutions exist
//   in a generalized sense, but whether they always remain smooth became a
//   central unanswered question. In 2000, the Clay Mathematics Institute
//   named [it] one of seven Millennium Prize Problems" - and separately,
//   "unresolved for roughly 90 years".
//
// So 1934, and the true age at resolution is 92 years rather than 26. That
// is not cosmetic: ageAtSolve is solveYear - yearPosed, and it places the
// point on the significance-vs-age scatter. At 26 the entry sat in the
// crowded left-hand band with results from the 2000s; at 92 it sits out
// where problems of that vintage belong.
//
// The 2000 date is kept where it belongs - in posedBy and ageNote - because
// the Clay statement is what fixed alternatives (C) and (D), the precise
// propositions this result settles. It formalised the question; it did not
// pose it.
//
// Noticed because the duplicate submission I declined had dated it 1934 and
// I said so in the decline message, then did not apply it to the entry that
// was kept.
//
// Dry run by default. Pass --apply to write. Production writes are the
// curator's to run.

import { guardedPrisma } from "./lib/guarded-prisma";
import { checkStoredEntry } from "../src/lib/field-validation";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { ageAtSolve } from "../src/lib/problems";

const prisma = guardedPrisma();
const APPLY = process.argv.includes("--apply");
const SPECS = [...EDITABLE_FIELDS, ...CURATOR_FIELDS];

const SLUG =
  "navier-stokes-millennium-prize-problem-finite-time-breakdown-with-smooth-forcing";

const EDITS = {
  yearPosed: 1934,
  posedBy:
    "Jean Leray (1934), whose weak solutions left smoothness open; stated as Millennium alternatives (C) and (D) by Charles Fefferman for the Clay Mathematics Institute in 2000",
  ageNote:
    "Dated from Leray's 1934 paper, which constructed global weak solutions and left smoothness open, rather than from the 2000 Clay formulation. Fefferman's own problem description builds from Leray, and OpenAI's paper and announcement both date the question to 1934. The Clay statement fixed alternatives (C) and (D), the propositions this result settles; it did not pose the question.",
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

async function main() {
  const db = await connectWithRetry();
  console.log(
    `database: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`,
  );

  const [before] = await prisma.$queryRawUnsafe<
    {
      yearPosed: number | null;
      posedBy: string | null;
      ageNote: string | null;
      solveDate: string;
    }[]
  >(
    `SELECT "yearPosed", "posedBy", "ageNote", "solveDate" FROM "Problem" WHERE slug = $1`,
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

  console.log(`yearPosed : ${before.yearPosed} -> ${EDITS.yearPosed}`);
  console.log(`age        : ${oldAge} years -> ${newAge} years`);
  console.log(`\nposedBy before: ${before.posedBy}`);
  console.log(`posedBy after : ${EDITS.posedBy}`);
  console.log(`\nageNote before: ${before.ageNote ?? "(null)"}`);
  console.log(`ageNote after : ${EDITS.ageNote}`);

  // The guarded client checks this again on write; running it here means the
  // dry run reports the same answer the write would, rather than promising
  // success and failing later.
  const v = checkStoredEntry({ specs: SPECS, fields: EDITS });
  console.log(`\nfield check: ${v.length ? "FAILED" : "ok"}`);
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
  // Not "the entry page is right immediately". That is only true for a NEW
  // entry, whose page has nothing cached yet. This is an edit, and the entry
  // page is behind cacheLife("hours") with cacheTag (src/lib/data.ts) that a
  // direct database write never revalidates.
  console.log("\nAPPLIED. Every public surface lags by up to an hour: this is a");
  console.log("write straight to the database, so nothing revalidates a tag.");
  console.log("A deploy clears it, and so does saving the entry once in the UI.");
}

main().finally(() => prisma.$disconnect());
