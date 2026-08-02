// Snapshots every published entry from the database back into
// `src/data/problems.json` - the curated seed baseline and the repo's
// disaster-recovery copy of the catalog.
//
// The database is the source of truth (community edits and imports live
// there), so without periodic exports a fresh `db:seed` could only rebuild
// the original launch set. Run `npm run db:export` after significant catalog
// changes and commit the result.
//
// Round-trip safety: the seed upserts curated content by slug and never
// touches votes, comments, status or submitter linkage, so exporting and
// re-seeding a live database is a no-op for user state. On a FRESH database,
// community-submitted entries are recreated as curator entries (the
// submitter accounts don't exist there) - acceptable for recovery.

import { writeFileSync } from "fs";
import { join } from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const rows = await prisma.problem.findMany({
    where: { status: "published" },
    orderBy: { slug: "asc" },
    include: { links: { select: { label: true, url: true }, orderBy: { position: "asc" } } },
  });

  const out = rows.map((p) => {
    const entry: Record<string, unknown> = {
      slug: p.slug,
      name: p.name,
      shortName: p.shortName,
      problemNumber: p.problemNumber,
      field: p.field,
      fieldGroup: p.fieldGroup,
      resolution: p.resolution,
      statement: p.statement,
      posedBy: p.posedBy,
      yearPosed: p.yearPosed,
      solveType: p.solveType,
      solveDate: p.solveDate,
      model: p.model,
      modelMaker: p.modelMaker,
      humanCollaborators: p.humanCollaborators,
      aiRole: p.aiRole,
      verification: p.verification,
      verificationNote: p.verificationNote,
      publication: p.publication,
      resolutionMethod: p.resolutionMethod,
      citations: p.citations,
      citationsPaper: p.citationsPaper,
      citationsSource: p.citationsSource,
      citationsUrl: p.citationsUrl,
      renownLangs: p.renownLangs,
      sourceUrl: p.sourceUrl,
      sourceName: p.sourceName,
    };
    // Optional caveat fields are present only on entries that need them,
    // matching the documented JSON shape.
    if (p.renownNote !== null) entry.renownNote = p.renownNote;
    if (p.resultNote !== null) entry.resultNote = p.resultNote;
    if (p.ageNote !== null) entry.ageNote = p.ageNote;
    if (p.claimIssueNote !== null) entry.claimIssueNote = p.claimIssueNote;
    if (p.aiContribution !== null) entry.aiContribution = p.aiContribution;
    if (p.significance !== null) entry.significance = p.significance;
    if (p.significanceNote !== null) entry.significanceNote = p.significanceNote;
    if (Array.isArray(p.links) && p.links.length > 0) entry.links = p.links;
    return entry;
  });

  const path = join(__dirname, "..", "src", "data", "problems.json");
  writeFileSync(path, JSON.stringify(out, null, 2) + "\n");
  console.log(`Exported ${out.length} published entries to src/data/problems.json`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
