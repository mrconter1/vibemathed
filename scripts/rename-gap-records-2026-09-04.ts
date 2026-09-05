// Renames the two prime-gap records to the names the field actually uses.
//
// I invented both, and they do not communicate:
//
//   "Smallest proved bound on infinitely recurring prime gaps"
//   "Lower bound for the largest prime gap"
//
// Searching the first of those returns an AI overview that answers 246,
// misses everything since 31 August, and then has to ask the searcher which
// of two problems they meant. That is the test a name has to pass and this
// one failed it.
//
// The literature's names are shorter and unambiguous, and they make the two
// records read as the pair they are:
//
//   Bounded gaps between primes   - Wikipedia's section title, the Polymath
//                                   project's own phrasing, and what Axiom
//                                   Math calls "the BGP246 theorem".
//   Long gaps between primes      - the title of Ford, Green, Konyagin,
//                                   Maynard and Tao's paper, and of OpenAI's
//                                   "Improved long gaps between primes".
//
// The short names, the quantity and the statement are unchanged; they were
// already doing the disambiguating work the long name should have done.
//
// A general lesson worth keeping: name a record what its field calls it, not
// what it does. The three other records already did this by accident
// ("Exponent of matrix multiplication", "Proportion of zeta zeros on the
// critical line", "Largest known rank of an elliptic curve over Q") which is
// why only these two needed fixing.
//
// Slugs are NOT changed. They are stored data the moment a link to one
// exists, and both are already accurate.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

const RENAMES: { slug: string; name: string }[] = [
  { slug: "bounded-prime-gaps", name: "Bounded gaps between primes" },
  { slug: "long-prime-gaps", name: "Long gaps between primes" },
];

async function main() {
  const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>("SELECT current_database() AS db");
  console.log(`database: ${db}\n`);

  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });

  const found: { id: string; slug: string; oldName: string; name: string }[] = [];
  for (const r of RENAMES) {
    const rec = await prisma.frontier.findUnique({ where: { slug: r.slug }, select: { id: true, name: true } });
    if (!rec) throw new Error(`record not found: ${r.slug}`);
    console.log(`${r.slug}`);
    console.log(`  from: ${rec.name}`);
    console.log(`  to  : ${r.name}`);
    found.push({ id: rec.id, slug: r.slug, oldName: rec.name, name: r.name });
  }

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  for (const r of found) {
    await prisma.frontier.update({ where: { id: r.id }, data: { name: r.name } });
    // The record's changelog: a rename is exactly the kind of curator edit it
    // exists to hold. Explicit columns, because production may not yet have
    // ProblemActivity.frontierId (see PR #22).
    await prisma.$executeRawUnsafe(
      `INSERT INTO "ProblemActivity" ("frontierId", "userId", "userName", "type", "field", "oldValue", "newValue") VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      r.id,
      curator?.id ?? null,
      curator?.pseudonym ?? "Curator",
      "updated",
      "name",
      r.oldName,
      r.name,
    );
    console.log(`applied: ${r.slug}`);
  }
  console.log("\nAPPLIED");
}

main().finally(() => prisma.$disconnect());
