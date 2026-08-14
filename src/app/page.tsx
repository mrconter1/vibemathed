import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { getPublishedProblems, getRecentActivity, getUserCount } from "@/lib/data";
import { SETTINGS_COOKIE, readSettingsCookie, sortValue } from "@/lib/list-settings";
import type { CardEntry } from "@/lib/problems";
import { SITE_URL } from "@/lib/site";
import { Highlights } from "@/components/Highlights";
import { ProblemCards } from "@/components/ProblemCards";
import { RecentActivity } from "@/components/RecentActivity";
import { StatBand } from "@/components/StatBand";
import { deTeX, texToHtml } from "@/components/TeX";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/// The entry list, rendered from the viewer's remembered view.
///
/// Split out and wrapped in Suspense because it reads a cookie, and under
/// Cache Components a dynamic read has to sit behind a boundary or the whole
/// route stops prerendering. This way the page shell stays static and only
/// the list is per-request - and it streams inside the same response, so the
/// cards follow the shell by a server render rather than a round trip.
async function EntryList() {
  // Cached, so asking again here costs nothing beyond the cache read.
  const [problems, store] = await Promise.all([getPublishedProblems(), cookies()]);
  const initial = readSettingsCookie(store.get(SETTINGS_COOKIE)?.value);

  // Statement math is rendered to HTML here, on the server, so the client
  // cards can show real math without KaTeX ever reaching the browser bundle.
  // Only the first page ships its statements inline; the rest of the map
  // arrives via /api/statements after hydration (see CardEntry).
  const INLINE_STATEMENTS = 25;
  const cards: CardEntry[] = problems.map((p) => ({
    slug: p.slug,
    name: p.name,
    problemNumber: p.problemNumber,
    field: p.field,
    fieldGroup: p.fieldGroup,
    hasStatement: p.statement !== null,
    statementHtml: null,
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
    // Flattened: the card shows this only as a native title tooltip, which
    // renders raw text - $...$ there is LaTeX source in the reader's face.
    verificationNote: p.verificationNote ? deTeX(p.verificationNote) : null,
    publication: p.publication ?? null,
    resolutionMethod: p.resolutionMethod ?? null,
    significance: p.significance ?? null,
    significanceNote: p.significanceNote ?? null,
    solveCostUsd: p.solveCostUsd ?? null,
    // Flattened server-side: the card shows this in a two-line clamped
    // footnote where $...$ would show raw (the card component is client-side
    // and must not import KaTeX). The entry page renders the same field as
    // real math.
    resultNote: p.resultNote ? deTeX(p.resultNote) : null,
    ageNote: p.ageNote ?? null,
    upvotes: p.upvotes,
    downvotes: p.downvotes,
    score: p.score,
    score24h: p.score24h,
    score3d: p.score3d,
    score7d: p.score7d,
    score30d: p.score30d,
    comments24h: p.comments24h,
    comments3d: p.comments3d,
    comments7d: p.comments7d,
    comments30d: p.comments30d,
    commentCount: p.commentCount,
    submittedBy: p.submittedBy,
    addedAt: p.addedAt,
    sourceUrl: p.sourceUrl,
    sourceName: p.sourceName,
    links: p.links ?? [],
  }));

  // Which entries get their math inlined now depends on the reader's own
  // sort, not on the default one. Before the server knew the sort, someone
  // who ranks by significance got inline statements for the 25 most recent
  // solves - none of which they were looking at - and fetched the ones they
  // could see over the network instead.
  //
  // Sort only, not the filters: reproducing the filter pipeline here to shave
  // a request is not worth two copies of it drifting apart. A filtered view
  // simply inlines fewer of the right ones.
  const dir = initial.sortDir === "asc" ? 1 : -1;
  const order = [...cards].sort((a, b) => {
    const va = sortValue(a, initial.sortKey, initial.period);
    const vb = sortValue(b, initial.sortKey, initial.period);
    if (va === vb) return a.slug.localeCompare(b.slug);
    return (va < vb ? -1 : 1) * dir;
  });
  const inline = new Set(order.slice(0, INLINE_STATEMENTS).map((c) => c.slug));
  const byStatement = new Map(problems.map((p) => [p.slug, p.statement]));
  for (const c of cards) {
    const statement = byStatement.get(c.slug);
    if (statement && inline.has(c.slug)) c.statementHtml = texToHtml(statement);
  }

  return <ProblemCards problems={cards} initial={initial} />;
}

export default async function Home() {
  // Ten activity rows. The feed scrolls inside a capped height on both
  // layouts (max-h-36 on mobile, the absolute fill on lg), so a longer list
  // adds history without changing how tall the card is.
  const [problems, activity, users] = await Promise.all([
    getPublishedProblems(),
    getRecentActivity(10),
    getUserCount(),
  ]);

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
        sameAs: ["https://github.com/mrconter1/vibemathed"],
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
      <h1 className="sr-only">Math problems solved with AI</h1>

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
        {/* Five rows, matching the activity feed: the highlight cards then
            fill the column height the feed forces with real content instead
            of stretching four rows over blank space. */}
        <Highlights problems={problems} rows={5} />
      </section>

      <section className="mt-8">
        {/* A labeled rule separates the overview from the list. */}
        <div className="mb-4 flex items-center gap-3" role="presentation">
          <span aria-hidden className="h-px flex-1 bg-[var(--hairline)]" />
          <h2 className="font-serif text-xl text-[var(--ink)]">All entries</h2>
          <span aria-hidden className="h-px flex-1 bg-[var(--hairline)]" />
        </div>
        {/* The fallback reserves the list's shape so the streamed cards
            do not push the footer around when they land. */}
        <Suspense
          fallback={
            <div className="space-y-3" aria-hidden>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)]"
                />
              ))}
            </div>
          }
        >
          <EntryList />
        </Suspense>
      </section>
    </main>
  );
}
