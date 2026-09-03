import { getPublishedProblems } from "@/lib/data";

// The reusable dataset the footer and methodology point at, served live from
// the same cached read the site renders from - so it can never go stale the
// way a checked-in JSON file would. Engagement trend windows are omitted
// (ephemeral); lifetime tallies are included as a snapshot.
//
// The `license` field names /data-license rather than a licence deed. This
// response mixes what the site wrote with material quoted from papers, and a
// flat "CC BY 4.0" here was the most consequential place the old blanket
// claim appeared: machine consumers read it and acted on it.

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
    aiContribution: p.aiContribution ?? null,
    resultNote: p.resultNote ?? null,
    claimIssueNote: p.claimIssueNote ?? null,
    solveDate: p.solveDate,
    model: p.model,
    modelMaker: p.modelMaker,
    humanCollaborators: p.humanCollaborators,
    aiRole: p.aiRole,
    verification: p.verification,
    verificationNote: p.verificationNote,
    publication: p.publication ?? null,
    resolutionMethod: p.resolutionMethod ?? null,
    citations: p.citations,
    citationsPaper: p.citationsPaper,
    citationsSource: p.citationsSource,
    citationsUrl: p.citationsUrl,
    renownLangs: p.renownLangs,
    renownNote: p.renownNote ?? null,
    significance: p.significance ?? null,
    significanceNote: p.significanceNote ?? null,
    solveCostUsd: p.solveCostUsd ?? null,
    solveCostNote: p.solveCostNote ?? null,
    sourceUrl: p.sourceUrl,
    sourceName: p.sourceName,
    links: p.links ?? [],
    // Outgoing typed edges to other entries, by slug. One direction only:
    // a relation is a single directed row, so mirroring it here would make
    // every edge appear twice in the dataset.
    relations: p.relations ?? [],
    submittedBy: p.submittedBy,
    upvotes: p.upvotes,
    downvotes: p.downvotes,
    commentCount: p.commentCount,
  }));

  return Response.json(
    {
      title: "VibeMathed - math problems solved with AI",
      url: "https://vibemathed.com",
      // NOT a blanket licence. This field used to read "CC BY 4.0" flat,
      // which told every machine consumer that quoted abstracts were ours to
      // sublicense. It points at the page that draws the line instead, and
      // names what CC BY does cover.
      license: "https://vibemathed.com/data-license",
      licenseSummary:
        "VibeMathed-authored content (classifications, scores, notes, structure) is CC BY 4.0. Quoted third-party material remains under its own rights.",
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
