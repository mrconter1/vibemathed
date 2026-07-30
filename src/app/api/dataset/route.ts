import { getPublishedProblems } from "@/lib/data";

// The reusable dataset the footer and methodology promise (CC BY 4.0), served
// live from the same cached read the site renders from - so it can never go
// stale the way a checked-in JSON file would. Engagement trend windows are
// omitted (ephemeral); lifetime tallies are included as a snapshot.

export async function GET() {
  const problems = await getPublishedProblems();

  const data = problems.map((p) => ({
    slug: p.slug,
    name: p.name,
    shortName: p.shortName,
    problemNumber: p.problemNumber,
    field: p.field,
    fieldGroup: p.fieldGroup,
    statement: p.statement,
    posedBy: p.posedBy,
    yearPosed: p.yearPosed,
    ageNote: p.ageNote ?? null,
    solveType: p.solveType,
    resolution: p.resolution,
    resultNote: p.resultNote ?? null,
    claimIssueNote: p.claimIssueNote ?? null,
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
    sourceUrl: p.sourceUrl,
    sourceName: p.sourceName,
    links: p.links ?? [],
    submittedBy: p.submittedBy,
    upvotes: p.upvotes,
    downvotes: p.downvotes,
    commentCount: p.commentCount,
  }));

  return Response.json(
    {
      title: "VibeMathed - math problems solved by AI",
      url: "https://vibemathed.com",
      license: "CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/)",
      methodology: "https://vibemathed.com/methodology",
      generated: new Date().toISOString(),
      count: data.length,
      problems: data,
    },
    {
      headers: {
        // Let intermediaries cache briefly; the underlying read is already
        // cached per-minute server-side.
        "Cache-Control": "public, max-age=60, s-maxage=300",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
