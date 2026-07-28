import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedProblems } from "@/lib/data";
import { NOTABILITY_HELP } from "@/lib/display";
import { ModelsChart } from "@/components/ModelsChart";
import { ReferencesChart } from "@/components/ReferencesChart";
import { SolveRatioChart } from "@/components/SolveRatioChart";
import { SocialLinks } from "@/components/SocialLinks";
import { InfoTip } from "@/components/Tooltip";

export const metadata: Metadata = {
  title: "Stats",
  description:
    "Charts over the VibeMathed dataset: proved vs disproved, which models resolved the most problems, and how well-referenced the underlying problems are.",
  alternates: { canonical: "/stats" },
  openGraph: {
    type: "website",
    title: "Stats · VibeMathed",
    description:
      "Charts over the VibeMathed dataset: proved vs disproved, which models resolved the most problems, and how well-referenced the underlying problems are.",
    url: "/stats",
  },
};

export default async function StatsPage() {
  const problems = await getPublishedProblems();

  const totalVotes = problems.reduce((sum, p) => sum + p.upvotes + p.downvotes, 0);
  const contested = problems.filter((p) => p.verification === "contested").length;

  return (
    <div className="flex flex-1 justify-center px-3 py-6 sm:px-8 sm:py-12">
      <main className="w-full max-w-6xl rounded-lg border border-[var(--mat-border)] bg-[var(--paper)] px-4 py-8 shadow-[0_1px_2px_rgba(0,0,0,0.12),0_12px_32px_rgba(0,0,0,0.18)] sm:px-10 sm:py-12">
        <header className="mb-8">
          <Link href="/" className="text-xs text-[var(--accent-blue)] hover:underline">
            ← All entries
          </Link>
          <h1 className="mt-4 font-serif text-3xl text-[var(--ink)]">Stats</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--ink-secondary)]">
            Everything here is derived from the {problems.length} tracked entries.
            The cumulative timeline lives on the{" "}
            <Link href="/" className="text-[var(--accent-blue)] hover:underline">
              home page
            </Link>
            .
          </p>

          <dl className="mt-5 grid grid-cols-2 gap-4 border-y border-[var(--hairline)] py-4 font-mono text-sm sm:grid-cols-4">
            <div>
              <dt className="text-xs text-[var(--ink-muted)]">Tracked</dt>
              <dd className="text-lg text-[var(--ink)]">{problems.length}</dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--ink-muted)]">Contested</dt>
              <dd className="text-lg text-[var(--ink)]">{contested}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-xs text-[var(--ink-muted)]">
                Notability <InfoTip content={NOTABILITY_HELP} label="Notability" />
              </dt>
              <dd className="text-lg text-[var(--ink)]">
                {problems.filter((p) => p.renownLangs > 0).length}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-[var(--ink-muted)]">Votes cast</dt>
              <dd className="text-lg text-[var(--ink)]">{totalVotes}</dd>
            </div>
          </dl>
        </header>

        <section className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="min-w-0 rounded-lg border border-[var(--hairline)] p-4 sm:p-5">
            <ReferencesChart problems={problems} />
          </div>
          <div className="min-w-0 rounded-lg border border-[var(--hairline)] p-4 sm:p-5">
            <SolveRatioChart problems={problems} />
          </div>
          <div className="min-w-0 rounded-lg border border-[var(--hairline)] p-4 sm:p-5 lg:col-span-2">
            <ModelsChart problems={problems} />
          </div>
        </section>

        <footer className="mt-10 border-t border-[var(--hairline)] pt-6 text-xs text-[var(--ink-muted)]">
          <Link href="/" className="text-[var(--accent-blue)] hover:underline">
            All entries
          </Link>
          {" · "}
          <SocialLinks className="ml-1" />
        </footer>
      </main>
    </div>
  );
}
