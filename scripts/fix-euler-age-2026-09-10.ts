// The Euler entry dated a classical problem to a document that excludes it.
//
// It went in with yearPosed 2000 and posedBy "Classical; the breakdown
// question is recorded in Fefferman's official Clay problem description", so
// the site reported it as 26 years old - younger than most of the catalog -
// on the strength of a document whose own text says the Euler equation "is
// not on the Clay Institute's list of prize problems". Recording that a
// problem is open is not posing it, and the record chosen here does not even
// claim it.
//
// The sources agree on where the question actually starts. Elgindi's Annals
// paper, cited by this work as [10] and the nearest precedent for blowup in
// 3D Euler, opens: "It has been known since work of Lichtenstein [43] and
// Gunther [30] in the 1920's that the 3D incompressible Euler equation is
// locally well-posed in the class of velocity fields with Holder continuous
// gradient and suitable decay at infinity. It is shown here that these local
// solutions can develop singularities in finite time." That is the gap: local
// existence proved, global regularity left open. It opens with Lichtenstein
// 1925 (Math. Z. 23, 89-154); Gunther 1927 confirms it.
//
// Elgindi also states the question in the exact form this entry asks it,
// forcing included:
//
//   Question 1.1. Given a solution u in C-infinity(R^3 x [0,T)) ... and
//   external force f in (C-infinity intersect L^2)(R^3 x [0,T]), is it
//   possible that lim sup |grad u| = +infinity?
//
// and calls it "the well-known global regularity problem for the
// incompressible Euler equation". So the smooth force is not a weaker
// side-question invented later; it is how the problem is posed. He adds that
// the C^{1,alpha} case he settles is "the context within which the classical
// well-posedness theory of the Euler equation has been considered starting
// with the works of Lichtenstein and Gunther".
//
// 1925, then, and 101 years rather than 26.
//
// The literature carries a second framing - Chen and Hou's PNAS paper dates
// the problem to "Leonhard Euler introduced the equations in 1757" - but that
// dates the equations, not the question. In 1757 there was no local existence
// theory for it to leave a gap in. Taking it would be the same choice as
// dating Navier-Stokes to Navier in 1822 rather than to Leray in 1934, and
// this catalog dates that one from Leray.
//
// Sibling of scripts/fix-navier-stokes-age-2026-09-10.ts, and found the same
// way: the two entries sit next to each other on the significance-vs-age
// scatter, one at 92 years and this one at 26.
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

const SLUG = "euler-blowup-smooth-forcing";

// ageNote is deliberately NOT touched, and the first draft of this script got
// that wrong. It planned to write the dating rationale there, the way the
// Navier-Stokes fix did - but Navier-Stokes had no ageNote to lose, and this
// entry does: a curator-written note on the release ("Released 8 September
// 2026, earlier than the authors intended... Buckmaster calls the Euler
// writeup 'AI slop', apologises for its state, and attributes the early
// release to outside pressure"). The dry run printed it, which is the whole
// reason dry runs print the before value. Writing over it would have destroyed
// the only record of that on the entry.
//
// posedBy carries the dating on its own, and it is the more prominent field:
// it renders on the card and on the entry page, where ageNote renders on
// neither - ageNote is only the asterisk on "Open Ny" in the card list
// (ProblemCards.tsx). The full argument lives in this file's header and in the
// Elgindi link added below.
//
// Worth a separate decision by the curator: that existing ageNote explains the
// SOLVE date, so it is currently the footnote on the wrong number. Moving it
// is a rewrite of curator prose, not a correction, so it is not done here.
const EDITS = {
  yearPosed: 1925,
  posedBy:
    "Leon Lichtenstein (1925) and Nikolai Gunther (1927), whose local existence left global regularity open; Elgindi states the smooth-force form as his Question 1.1",
};

// The entry asserts a posing it cannot cite: its only problem record is
// Fefferman's Clay description, which is the source for the Clay caveat
// rather than for the question. Elgindi's paper is where the question is
// written down in the form this entry asks it.
const NEW_LINK = {
  label: "Elgindi, Annals 2021: Question 1.1, the problem in the form asked here",
  url: "https://arxiv.org/abs/1904.04795",
  kind: "problem-record",
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
  console.log(`database: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`);

  const [before] = await prisma.$queryRawUnsafe<
    {
      id: string;
      yearPosed: number | null;
      posedBy: string | null;
      ageNote: string | null;
      solveDate: string;
      sourceUrl: string | null;
    }[]
  >(
    `SELECT id, "yearPosed", "posedBy", "ageNote", "solveDate", "sourceUrl"
       FROM "Problem" WHERE slug = $1`,
    SLUG,
  );
  if (!before) throw new Error(`not found on ${db}: ${SLUG}`);

  const links = await prisma.$queryRawUnsafe<
    { label: string; url: string; kind: string; position: number }[]
  >(
    `SELECT label, url, kind, position FROM "ProblemLink"
      WHERE "problemId" = $1 ORDER BY position`,
    before.id,
  );

  const oldAge = ageAtSolve({
    yearPosed: before.yearPosed,
    solveDate: before.solveDate,
  });
  const newAge = ageAtSolve({
    yearPosed: EDITS.yearPosed,
    solveDate: before.solveDate,
  });

  console.log(`yearPosed : ${before.yearPosed} -> ${EDITS.yearPosed}`);
  console.log(`age       : ${oldAge} years -> ${newAge} years`);
  console.log(`\nposedBy before: ${before.posedBy}`);
  console.log(`posedBy after : ${EDITS.posedBy}`);
  console.log(`                (${charLength(canonical(EDITS.posedBy))}/200)`);
  console.log(`\nageNote  : NOT TOUCHED, and it is not about the age. It reads:`);
  console.log(`             ${before.ageNote ?? "(null)"}`);
  console.log(`           That is the release story, and it is the footnote on`);
  console.log(`           "Open Ny". Moving it is the curator's call, not this`);
  console.log(`           script's.`);

  console.log(`\nexisting links (${links.length}), source = ${before.sourceUrl}`);
  for (const l of links) console.log(`  [${l.kind}] ${l.label}\n      ${l.url}`);
  console.log(`\nadd link: [${NEW_LINK.kind}] ${NEW_LINK.label}`);
  console.log(`      ${NEW_LINK.url}   (label ${NEW_LINK.label.length}/120)`);

  // The same check the guarded client runs on write, so the dry run gives the
  // answer the write would rather than promising success and failing later.
  const merged = [...links, NEW_LINK];
  const v = [
    ...checkStoredEntry({ specs: SPECS, fields: EDITS }),
    ...checkStoredEntry({
      specs: SPECS,
      links: merged,
      sourceUrl: before.sourceUrl,
    }),
  ];
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
  await prisma.problemLink.create({
    data: {
      problemId: before.id,
      label: NEW_LINK.label,
      url: NEW_LINK.url,
      kind: NEW_LINK.kind,
      position: links.length ? Math.max(...links.map((l) => l.position)) + 1 : 0,
    },
    select: { id: true },
  });
  console.log("\nAPPLIED. The entry page is right immediately; the stats page");
  console.log("and any cached list lag by up to an hour, or until a deploy.");
}

main().finally(() => prisma.$disconnect());
