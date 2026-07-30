import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedProblems, getRecentActivity, getUserCount } from "@/lib/data";
import type { ProblemCardData } from "@/lib/problems";
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

  // Statement math is rendered to HTML here, on the server, so the client cards
  // can show real math without KaTeX ever reaching the browser bundle.
  const cards: ProblemCardData[] = problems.map((p) => ({
    ...p,
    statementHtml: p.statement ? texToHtml(p.statement) : null,
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
    <main className="mx-auto w-full max-w-6xl px-4 pb-4 pt-8 sm:px-8 sm:pt-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero: short and confident - the stat band right below carries the
          numbers, so the prose no longer has to. */}
      <header>
        <h1 className="font-serif text-3xl tracking-tight text-[var(--ink)] sm:text-4xl">
          Math problems solved by AI
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--ink-secondary)]">
          A community-curated record of math problems that no human had solved
          before - from famous conjectures to the numbered Erdős problems from{" "}
          <a
            href="https://www.erdosproblems.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent-blue)] hover:underline"
          >
            erdosproblems.com
          </a>{" "}
          - proved or disproved with AI in the loop. Every entry cites a
          checkable source, carries a verification label, and is open for
          votes, comments and new submissions.
        </p>
      </header>

      {/* Overview grid. On desktop: four stat tiles across the top, two larger
          highlight cards below them, and the activity feed occupying the right
          column across both rows. DOM order is what makes that auto-place
          correctly, so the feed sits between them here and is pushed last only
          on mobile. */}
      <section
        className="mt-6 grid grid-cols-2 gap-2.5 lg:grid-cols-6"
        aria-label="Overview"
      >
        <StatBand problems={problems} users={users} />
        <RecentActivity activity={activity} />
        <Highlights problems={problems} />
      </section>

      <p className="mt-2 text-xs text-[var(--ink-muted)]">
        <Link href="/stats" className="text-[var(--accent-blue)] hover:underline">
          See the charts on the stats page →
        </Link>
      </p>

      <section className="mt-10">
        <h2 className="mb-3 font-serif text-xl text-[var(--ink)]">All entries</h2>
        <ProblemCards problems={cards} />
      </section>
    </main>
  );
}
