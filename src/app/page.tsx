import type { Metadata } from "next";
import { getPublishedProblems, getRecentActivity, getUserCount } from "@/lib/data";
import type { CardEntry } from "@/lib/problems";
import { SITE_URL } from "@/lib/site";
import { Highlights } from "@/components/Highlights";
import { ProblemCards } from "@/components/ProblemCards";
import { RecentActivity } from "@/components/RecentActivity";
import { StatBand } from "@/components/StatBand";
import { texToHtml } from "@/components/TeX";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function Home() {
  // 5 activity rows, not more: on mobile the feed renders at full height in
  // its own grid row, so its length directly sets how tall that card gets.
  const [problems, activity, users] = await Promise.all([
    getPublishedProblems(),
    getRecentActivity(5),
    getUserCount(),
  ]);

  // Statement math is rendered to HTML here, on the server, so the client
  // cards can show real math without KaTeX ever reaching the browser bundle.
  // Only the first default-sort page ships its statements inline; the rest of
  // the map arrives via /api/statements after hydration (see CardEntry).
  const INLINE_STATEMENTS = 25;
  const cards: CardEntry[] = problems.map((p, i) => ({
    slug: p.slug,
    name: p.name,
    problemNumber: p.problemNumber,
    field: p.field,
    fieldGroup: p.fieldGroup,
    hasStatement: p.statement !== null,
    statementHtml:
      p.statement && i < INLINE_STATEMENTS ? texToHtml(p.statement) : null,
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
    verification: p.verification,
    verificationNote: p.verificationNote,
    significance: p.significance ?? null,
    significanceNote: p.significanceNote ?? null,
    resultNote: p.resultNote ?? null,
    ageNote: p.ageNote ?? null,
    upvotes: p.upvotes,
    downvotes: p.downvotes,
    score: p.score,
    score7d: p.score7d,
    score30d: p.score30d,
    comments7d: p.comments7d,
    comments30d: p.comments30d,
    commentCount: p.commentCount,
    submittedBy: p.submittedBy,
    addedAt: p.addedAt,
  }));

  // Two schema.org objects on the home page. WebSite is what Google reads the
  // site NAME from (the bold name above the URL in a result); Dataset
  // describes what the site is.
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "VibeMathed",
      alternateName: "vibemathed.com",
      url: SITE_URL,
    },
    {
      "@context": "https://schema.org",
      "@type": "Dataset",
      name: "VibeMathed",
      description:
        "A community-curated record of math problems no human had solved before - from famous conjectures to the Erdős problems - proved or disproved by AI, with checkable sources and verification labels.",
      url: SITE_URL,
      keywords: [
        "Erdős problems",
        "AI mathematics",
        "automated theorem proving",
        "open problems in mathematics",
      ],
      creator: {
        "@type": "Person",
        name: "Rasmus Lindahl",
        sameAs: [
          "https://github.com/mrconter1",
          "https://www.linkedin.com/in/rasmus-lindahl-6501371ba/",
        ],
      },
      isAccessibleForFree: true,
      license: "https://creativecommons.org/licenses/by/4.0/",
      variableMeasured: `${problems.length} resolved problems`,
    },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-4 pt-5 sm:px-8 sm:pt-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* No hero prose: the header tagline carries the one-line definition,
          the About page carries the paragraph, and the overview grid opens
          the page. The h1 stays for structure and search, invisibly. */}
      <h1 className="sr-only">Math problems solved by AI</h1>

      {/* Overview grid. On desktop: four stat tiles across the top, two larger
          highlight cards below them, and the activity feed occupying the right
          column across both rows. DOM order is what makes that auto-place
          correctly, so the feed sits between them here and is pushed last only
          on mobile. */}
      <section
        className="grid grid-cols-2 gap-2.5 lg:grid-cols-6"
        aria-label="Overview"
      >
        <StatBand problems={problems} users={users} />
        <RecentActivity activity={activity} />
        <Highlights problems={problems} />
      </section>

      <section className="mt-8">
        <h2 className="mb-3 font-serif text-xl text-[var(--ink)]">All entries</h2>
        <ProblemCards problems={cards} />
      </section>
    </main>
  );
}
