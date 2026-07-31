// Seeds the curated baseline from `src/data/problems.json` into Postgres.
//
// The JSON file stays the source of record for curation: it goes through the
// same `assertProblem` validation as before (importing `src/lib/problems`
// runs it), so a malformed entry still fails loudly rather than reaching the
// database. Re-running this is safe and idempotent - it refreshes curated
// content by slug and never touches votes, comments, submission status or
// anything else users produced.

import { PrismaClient, type Prisma } from "@prisma/client";
import { problems } from "../src/lib/curated";
import type { MathProblem } from "../src/lib/problems";

const prisma = new PrismaClient();

/// Curated fields only. Excludes votes, status, submittedById and timestamps
/// so re-seeding a live database cannot clobber user-generated state.
function contentOf(p: MathProblem) {
  return {
    name: p.name,
    shortName: p.shortName,
    problemNumber: p.problemNumber,
    field: p.field,
    fieldGroup: p.fieldGroup,
    statement: p.statement,
    posedBy: p.posedBy,
    yearPosed: p.yearPosed,
    solveType: p.solveType,
    resolution: p.resolution,
    claimIssueNote: p.claimIssueNote ?? null,
    aiContribution: p.aiContribution ?? null,
    solveDate: p.solveDate,
    model: p.model,
    modelMaker: p.modelMaker,
    humanCollaborators: p.humanCollaborators,
    aiRole: p.aiRole,
    verification: p.verification,
    verificationNote: p.verificationNote,
    citations: p.citations,
    citationsPaper: p.citationsPaper,
    citationsSource: p.citationsSource,
    citationsUrl: p.citationsUrl,
    renownLangs: p.renownLangs,
    renownNote: p.renownNote ?? null,
    resultNote: p.resultNote ?? null,
    ageNote: p.ageNote ?? null,
    sourceUrl: p.sourceUrl,
    sourceName: p.sourceName,
    // Links are their own table: replace the set wholesale so re-seeding is
    // idempotent rather than accumulating duplicates.
    links: {
      deleteMany: {},
      create: (p.links ?? []).map((l, position) => ({ ...l, position })),
    },
  } satisfies Prisma.ProblemUpdateInput;
}

async function main() {
  let created = 0;
  let updated = 0;

  for (const p of problems) {
    const existing = await prisma.problem.findUnique({
      where: { slug: p.slug },
      select: { id: true },
    });

    if (existing) {
      await prisma.problem.update({ where: { id: existing.id }, data: contentOf(p) });
      updated += 1;
      continue;
    }

    const problem = await prisma.problem.create({
      data: { slug: p.slug, ...contentOf(p) },
    });

    // Seeded entries are curator-authored, so there is no user to attribute.
    // A null `userName` renders as "Curator" in the activity feed.
    await prisma.problemActivity.create({
      data: { problemId: problem.id, type: "created" },
    });
    created += 1;
  }

  const total = await prisma.problem.count();
  console.log(
    `Seed complete: ${created} created, ${updated} refreshed, ${total} problems in database.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
