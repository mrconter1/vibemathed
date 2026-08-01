import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedProblems } from "@/lib/data";
import { SIGNIFICANCE_HELP } from "@/lib/display";
import { ContributionGrowthChart } from "@/components/ContributionGrowthChart";
import { CumulativeChart } from "@/components/CumulativeChart";
import { Icon, type IconName } from "@/components/Icons";
import { ModelsChart } from "@/components/ModelsChart";
import { OpenSourceChart } from "@/components/OpenSourceChart";
import { ReferencesChart } from "@/components/ReferencesChart";
import { SignificanceChart } from "@/components/SignificanceChart";
import { SolveRatioChart } from "@/components/SolveRatioChart";
import { InfoTip } from "@/components/Tooltip";

export const metadata: Metadata = {
  title: "Stats",
  description:
    "Charts over the VibeMathed dataset: proved vs disproved, closed vs open source models, which systems solved the most problems, and more.",
  alternates: { canonical: "/stats" },
  openGraph: {
    type: "website",
    title: "Stats · VibeMathed",
    description:
      "Charts over the VibeMathed dataset: proved vs disproved, closed vs open source models, which systems solved the most problems, and more.",
    url: "/stats",
  },
};

export default async function StatsPage() {
  const problems = await getPublishedProblems();

  // The charts describe SOLVES, so they only see fully resolved entries - a
  // candidate under review, a partial advance or a retracted claim is tracked
  // but has not resolved anything. The tiles describe the whole record.
  const resolved = problems.filter((p) => p.resolution === "resolved");

  const totalVotes = problems.reduce((sum, p) => sum + p.upvotes + p.downvotes, 0);
  // The count of entries whose problem carried real weight beyond its own
  // subfield - the tail-vs-peaks story in one number.
  const major = problems.filter((p) => (p.significance ?? 0) >= 50).length;

  const tiles: { icon: IconName; label: string; value: string; help?: string }[] = [
    { icon: "layers", label: "Tracked problems", value: String(problems.length) },
    { icon: "shield", label: "Fully resolved", value: String(resolved.length) },
    {
      icon: "spark",
      label: "Significance 50+",
      value: String(major),
      help: SIGNIFICANCE_HELP,
    },
    { icon: "votes", label: "Votes cast", value: String(totalVotes) },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-4 pt-8 sm:px-8 sm:pt-10">
      <header>
        <h1 className="font-serif text-3xl tracking-tight text-[var(--ink)]">Stats</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--ink-secondary)]">
          Everything here is derived from the {problems.length} tracked entries.
          Browse them all on the{" "}
          <Link href="/" className="text-[var(--accent-blue)] hover:underline">
            entries page
          </Link>
          .
        </p>
      </header>

      <dl className="mt-6 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3"
          >
            <dt className="flex items-center gap-1.5 text-xs text-[var(--ink-muted)]">
              <Icon name={t.icon} />
              {t.label}
              {t.help && <InfoTip content={t.help} label={t.label} />}
            </dt>
            <dd className="mt-1 text-2xl font-semibold text-[var(--ink)]">{t.value}</dd>
          </div>
        ))}
      </dl>

      {/* Two-column grid, single column on mobile. The two wide SVG charts
          share the top row, the two compact ratio pies the middle row, and
          the tier-growth lines pair with the per-system bars on the bottom
          row. */}
      <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="min-w-0 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] p-4 sm:p-5">
          <CumulativeChart problems={resolved} />
        </div>
        <div className="min-w-0 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] p-4 sm:p-5">
          <ReferencesChart problems={resolved} />
        </div>
        <div className="min-w-0 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] p-4 sm:p-5">
          <SolveRatioChart problems={resolved} />
        </div>
        <div className="min-w-0 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] p-4 sm:p-5">
          <OpenSourceChart problems={resolved} />
        </div>
        <div className="min-w-0 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] p-4 sm:p-5">
          <ContributionGrowthChart problems={resolved} />
        </div>
        <div className="min-w-0 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] p-4 sm:p-5">
          <ModelsChart problems={resolved} />
        </div>
        {/* Whole record, not just resolved: significance is problem-level. */}
        <div className="min-w-0 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] p-4 sm:p-5 lg:col-span-2">
          <SignificanceChart problems={problems} />
        </div>
      </section>
    </main>
  );
}
