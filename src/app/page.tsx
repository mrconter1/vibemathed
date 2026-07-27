import { problems } from "@/lib/problems";
import { SITE_URL } from "@/lib/site";
import { ReferencesChart } from "@/components/ReferencesChart";
import { ModelsChart } from "@/components/ModelsChart";
import { CumulativeChart } from "@/components/CumulativeChart";
import { SolveRatioChart } from "@/components/SolveRatioChart";
import { ProblemsTable } from "@/components/ProblemsTable";
import { SocialLinks } from "@/components/SocialLinks";

export default function Home() {
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
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--ink-secondary)]">
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

          <dl className="mt-6 grid grid-cols-3 gap-4 border-y border-[var(--hairline)] py-4 font-mono text-sm">
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
        </header>

        {/* Charts dashboard: wide SVG charts paired in row 1, compact stat charts
            in row 2 on desktop; single column ordered by importance on mobile. */}
        <section className="mb-10 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="order-1 flex flex-col justify-center min-w-0 rounded-lg border border-[var(--hairline)] p-4 sm:p-5">
            <CumulativeChart problems={problems} />
          </div>
          <div className="order-2 flex flex-col justify-center min-w-0 rounded-lg border border-[var(--hairline)] p-4 sm:p-5 lg:order-3">
            <SolveRatioChart problems={problems} />
          </div>
          <div className="order-3 flex flex-col justify-center min-w-0 rounded-lg border border-[var(--hairline)] p-4 sm:p-5 lg:order-4">
            <ModelsChart problems={problems} />
          </div>
          <div className="order-4 flex flex-col justify-center min-w-0 rounded-lg border border-[var(--hairline)] p-4 sm:p-5 lg:order-2">
            <ReferencesChart problems={problems} />
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-serif text-lg text-[var(--ink)]">All entries</h2>
          <ProblemsTable problems={problems} />
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
