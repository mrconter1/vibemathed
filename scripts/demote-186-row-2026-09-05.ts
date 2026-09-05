// The 186 row on the bounded-gaps record becomes a CANDIDATE, so the record's
// frontier reads 212 - which is what the field says it is.
//
// This does NOT revisit the entry. Publishing it was right and stays right:
// it is a real AI result with a public paper and a Lean development, and the
// reason I originally held it was false. The entry keeps its page, its tier
// and its significance.
//
// What changes is narrower: whether this site tells a reader that 186 is the
// current record. A day of looking says the field does not think so yet.
//
// The evidence, gathered 5 September 2026:
//
//   - NOBODY disinterested has assessed it. Not Tao, Green, Maynard,
//     Stadlmann or Bloom. The Hacker News thread is eleven comments, none
//     mathematical, mostly confusion about the notation. The announcement
//     came from Weijie Su, who writes "our model", so it is the vendor
//     speaking.
//   - The field's own record-keepers have not moved. erdosproblems.com,
//     which Thomas Bloom maintains and which recorded the earlier GPT 5.6
//     Pro long-gaps improvement within days, still shows neither this nor
//     the Astra long-gaps result. Wikipedia's prime gap article likewise.
//   - Press coverage and the participants call 212 the world record. Shiva
//     Kintali, who held 236 for two days and has every reason to know, wrote
//     on 3 September that "Today Sep 3rd, 2026: @axiommathai announced
//     H1 <= 212" - with no mention of 186, which was dated four days earlier.
//   - Its Lean proof is conditional on three project axioms. Two rest on
//     Deligne and on Fouvry-Kowalski-Michel, so they are believed, but they
//     are assumed rather than checked.
//
// None of that is evidence the bound is wrong. It is evidence that nobody
// outside OpenAI has yet said it is right, and "current record" is a claim
// about the field's state, not about our confidence.
//
// `candidate` is the status designed for exactly this: drawn hollow on the
// chart, listed in the table, never the frontier. The record then shows 212
// as the current best and 186 as a serious unconfirmed claim above it, which
// is a truer picture than either putting 186 on top or leaving it out.
//
// Flip it back the moment a named number theorist reads it.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const RECORD = "bounded-prime-gaps";
const ENTRY = "prime-gaps-at-most-186";

const NOTE =
  "Not counted as the record here, pending anyone outside OpenAI reading it. Dated 30 August, before Stadlmann's 240, but the Lean development appeared on 2 September and the announcement later. Its formal proof is conditional on three project axioms. As of 5 September no named number theorist has assessed it, erdosproblems.com and Wikipedia have not recorded it, and the press calls 212 the record.";

const HISTORY_NOTE =
  "Rows through 2014 follow the Wikipedia article on prime gaps, with Maynard and Polymath8b cited to their own preprints. Stadlmann is arXiv 2608.31126. The 236 row is an announcement on X with no preprint identified. The 212 row is the Axiom Math paper and its formalisation site, and is the current record as the field reckons it. The 186 row is OpenAI's paper of 30 August 2026: a serious claim, catalogued as an entry, but drawn as a candidate because as of 5 September nobody outside OpenAI has assessed it and the field's record-keepers have not moved.";

async function main() {
  const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>("SELECT current_database() AS db");
  console.log(`database: ${db}\n`);

  const rec = await prisma.frontier.findUnique({ where: { slug: RECORD }, select: { id: true, name: true } });
  if (!rec) throw new Error(`record not found: ${RECORD}`);

  const row = await prisma.frontierRow.findFirst({
    where: { frontierId: rec.id, problem: { slug: ENTRY } },
    select: { id: true, status: true, valueNumeric: true },
  });
  if (!row) throw new Error("the 186 row is not on that record");

  console.log(`record : ${rec.name}`);
  console.log(`row    : ${row.valueNumeric}  status ${row.status} -> candidate`);
  console.log(`note   : ${NOTE.length}/400 chars${NOTE.length > 400 ? "  OVER" : ""}`);
  console.log(`history: ${HISTORY_NOTE.length}/600 chars${HISTORY_NOTE.length > 600 ? "  OVER" : ""}`);
  if (NOTE.length > 400 || HISTORY_NOTE.length > 600) throw new Error("field limit exceeded");

  // Show the frontier both ways, so the effect is visible before writing.
  const rows = await prisma.frontierRow.findMany({
    where: { frontierId: rec.id },
    select: { valueNumeric: true, status: true, attribution: true },
  });
  const best = (skip186: boolean) =>
    rows
      .filter((r) => (r.status === "published" || r.status === "historical") && !(skip186 && r.valueNumeric === 186))
      .sort((a, b) => (a.valueNumeric ?? Infinity) - (b.valueNumeric ?? Infinity))[0];
  console.log(`\nfrontier now  : ${best(false)?.valueNumeric}  (${best(false)?.attribution.slice(0, 40)})`);
  console.log(`frontier after: ${best(true)?.valueNumeric}  (${best(true)?.attribution.slice(0, 40)})`);

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });

  await prisma.frontierRow.update({
    where: { id: row.id },
    data: { status: "candidate", note: NOTE },
  });
  await prisma.frontier.update({ where: { id: rec.id }, data: { historyNote: HISTORY_NOTE } });
  await prisma.$executeRawUnsafe(
    `INSERT INTO "ProblemActivity" ("frontierId", "userId", "userName", "type", "field", "oldValue", "newValue") VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    rec.id,
    curator?.id ?? null,
    curator?.pseudonym ?? "Curator",
    "updated",
    "186 row status",
    row.status,
    "candidate",
  );
  console.log("\nAPPLIED");
}

main().finally(() => prisma.$disconnect());
