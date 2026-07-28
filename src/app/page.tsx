import Link from "next/link";
import { getPublishedProblems } from "@/lib/data";
import type { ProblemCardData } from "@/lib/problems";
import { SITE_URL } from "@/lib/site";
import { CumulativeChart } from "@/components/CumulativeChart";
import { ProblemCards } from "@/components/ProblemCards";
import { SocialLinks } from "@/components/SocialLinks";
import { texToHtml } from "@/components/TeX";

export default async function Home() {
  const problems = await getPublishedProblems();

  // Statement math is rendered to HTML here, on the server, so the client cards
  // can show real math without KaTeX ever reaching the browser bundle.
  const cards: ProblemCardData[] = problems.map((p) => ({
    ...p,
    statementHtml: p.statement ? texToHtml(p.statement) : null,
  }));

  const erdosCount = problems.filter((p) => p.problemNumber !== null).length;
  const leanVerified = problems.filter((p) => p.verification === "lean-verified").length;

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
    <div className="flex flex-1 justify-center px-3 py-6 sm:px-8 sm:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="w-full max-w-6xl rounded-lg border border-[var(--mat-border)] bg-[var(--paper)] px-4 py-8 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_12px_32px_rgba(0,0,0,0.18)] sm:px-10 sm:py-12">
        <header className="mb-10">
          <h1 className="font-serif text-3xl text-[var(--ink)] sm:text-4xl">VibeMathed</h1>
          <div className="mt-4 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
            <p className="max-w-2xl text-sm leading-relaxed text-[var(--ink-secondary)]">
              A website tracking mathematical problems solved by AI models - proved
              or disproved with a model in the loop. It spans problems of every
              kind, from famous conjectures like the Jacobian conjecture to the
              numbered Erdős problems catalogued at{" "}
              <a
                href="https://www.erdosproblems.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent-blue)] hover:underline"
              >
                erdosproblems.com
              </a>
              . Every entry links a checkable source, is labeled by how strongly
              it&apos;s verified (Lean-checked, expert-reviewed, or site-confirmed),
              and carries a{" "}
              <strong className="font-medium text-[var(--ink)]">notability</strong>{" "}
              score - the number of Wikipedia language editions with a dedicated
              article - so you can tell the household names from the niche ones.
            </p>

            <dl className="grid shrink-0 grid-cols-3 gap-4 border-y border-[var(--hairline)] py-4 font-mono text-sm lg:grid-cols-1 lg:gap-4 lg:border-y-0 lg:border-l lg:py-0 lg:pl-8">
              <div>
                <dt className="text-xs text-[var(--ink-muted)]">Tracked</dt>
                <dd className="text-lg text-[var(--ink)]">{problems.length}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--ink-muted)]">Erdős problems</dt>
                <dd className="text-lg text-[var(--ink)]">{erdosCount}</dd>
              </div>
              <div>
                <dt className="text-xs text-[var(--ink-muted)]">Lean-verified</dt>
                <dd className="text-lg text-[var(--ink)]">{leanVerified}</dd>
              </div>
            </dl>
          </div>
        </header>

        {/* One chart here - the narrative one. The rest of the dashboard moved to
            /stats so the entries people came to read and vote on are not sitting
            below a wall of charts. */}
        <section className="mb-10">
          <div className="min-w-0 rounded-lg border border-[var(--hairline)] p-4 sm:p-5">
            <CumulativeChart problems={problems} />
          </div>
          <p className="mt-2 text-xs text-[var(--ink-muted)]">
            <Link href="/stats" className="text-[var(--accent-blue)] hover:underline">
              More charts on the stats page →
            </Link>
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-serif text-lg text-[var(--ink)]">All entries</h2>
          <ProblemCards problems={cards} />
        </section>

        <footer className="mt-10 border-t border-[var(--hairline)] pt-6 text-xs text-[var(--ink-muted)]">
          <p>
            Marquee entries are hand-curated; Erdős entries come from Tao&apos;s
            AI-contributions wiki (full solutions only, not partial or candidate
            progress) and were each verified against their erdosproblems.com page.
            Posed year is the earliest cited reference, so ages are close estimates.
          </p>
          <p className="mt-3">
            Spotted an error or a solved problem we&apos;re missing?{" "}
            <a
              href="mailto:rasmus.lindahl1996@gmail.com?subject=VibeMathed"
              className="text-[var(--accent-blue)] hover:underline"
            >
              Contact me
            </a>
            .
          </p>
          <div className="mt-3">
            <SocialLinks />
          </div>
        </footer>
      </main>
    </div>
  );
}
