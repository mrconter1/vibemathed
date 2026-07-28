import Link from "next/link";
import { getPublishedProblems } from "@/lib/data";
import type { ProblemCardData } from "@/lib/problems";
import { SITE_URL } from "@/lib/site";
import { CumulativeChart } from "@/components/CumulativeChart";
import { ProblemCards } from "@/components/ProblemCards";
import { StatBand } from "@/components/StatBand";
import { texToHtml } from "@/components/TeX";

export default async function Home() {
  const problems = await getPublishedProblems();

  // Statement math is rendered to HTML here, on the server, so the client cards
  // can show real math without KaTeX ever reaching the browser bundle.
  const cards: ProblemCardData[] = problems.map((p) => ({
    ...p,
    statementHtml: p.statement ? texToHtml(p.statement) : null,
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "VibeMathed",
    description:
      "A website tracking math problems solved by AI models - famous conjectures and the Erdős problems from erdosproblems.com - each with a checkable source, a verification label, and a notability score.",
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
    variableMeasured: `${problems.length} resolved problems`,
  };

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
          A hand-curated record of mathematical problems - famous conjectures and
          the numbered Erdős problems from{" "}
          <a
            href="https://www.erdosproblems.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent-blue)] hover:underline"
          >
            erdosproblems.com
          </a>{" "}
          - proved or disproved with a model in the loop. Every entry links a
          checkable source and is labeled by how strongly it&apos;s verified.
        </p>
      </header>

      <section className="mt-6" aria-label="Key figures">
        <StatBand problems={problems} />
      </section>

      <section className="mt-6" aria-label="Solves over time">
        <div className="min-w-0 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] p-4 sm:p-5">
          <CumulativeChart problems={problems} />
        </div>
        <p className="mt-2 text-xs text-[var(--ink-muted)]">
          <Link href="/stats" className="text-[var(--accent-blue)] hover:underline">
            More charts on the stats page →
          </Link>
        </p>
      </section>

      <section className="mt-10">
        <h2 className="mb-3 font-serif text-xl text-[var(--ink)]">All entries</h2>
        <ProblemCards problems={cards} />
      </section>
    </main>
  );
}
