// Checks that no entry lists its own primary source again as a link, and that
// no entry lists the same document twice. Read-only: it prints and exits
// non-zero, so it can gate a batch import without deciding which of the two
// rows to keep.
//
// Run it after any curation batch:
//   npx tsx scripts/check-source-links.ts
//
// Why this exists: `sourceUrl` is a column on Problem and the links are rows
// in their own table, so "the paper" had two possible homes and no rule for
// choosing. Two entries drifted into using both, which rendered as a source
// line above a Paper bucket holding the same PDF, and read as though the site
// had two different notions of a paper link. The rule is that the source is
// the citation and the links are everything else.
//
// The form paths enforce this at write time (`parseLinks` on submission,
// `updateProblem` on edit). This exists because curation batches do not go
// through those paths - they are ad-hoc scripts against the database, which is
// exactly how both duplicates got in.

import { PrismaClient } from "@prisma/client";
import { sameDocument } from "../src/lib/editable";

const db = new PrismaClient();

async function main() {
  const problems = await db.problem.findMany({
    select: {
      slug: true,
      status: true,
      sourceUrl: true,
      sourceName: true,
      links: { select: { label: true, url: true }, orderBy: { position: "asc" } },
    },
  });

  let bad = 0;

  for (const p of problems) {
    const repeatsSource = p.links.filter((l) => sameDocument(l.url, p.sourceUrl));

    // Compared pairwise rather than through a Set: `sameDocument` normalises,
    // so two rows can be the same document without being the same string.
    const repeatsEachOther = p.links.filter((l, i) =>
      p.links.slice(0, i).some((earlier) => sameDocument(earlier.url, l.url)),
    );

    if (!repeatsSource.length && !repeatsEachOther.length) continue;
    bad++;

    console.log(`\n${p.status}  ${p.slug}`);
    for (const l of repeatsSource) {
      console.log(`  repeats the primary source (${p.sourceName})`);
      console.log(`    "${l.label}"  ${l.url}`);
    }
    for (const l of repeatsEachOther) {
      console.log(`  listed twice: "${l.label}"  ${l.url}`);
    }
  }

  console.log(
    bad === 0
      ? `\nOK - ${problems.length} entries, no link repeats its source or another link.`
      : `\n${bad} entr${bad === 1 ? "y" : "ies"} with a duplicated source link.`,
  );

  await db.$disconnect();
  if (bad > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
