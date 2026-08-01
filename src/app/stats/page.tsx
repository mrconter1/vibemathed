import type { Metadata } from "next";
import { getPublishedProblems } from "@/lib/data";
import { SIGNIFICANCE_HELP } from "@/lib/display";
import { ContributionGrowthChart } from "@/components/ContributionGrowthChart";
import { CumulativeChart } from "@/components/CumulativeChart";
import { MethodGrowthChart } from "@/components/MethodGrowthChart";
import { Icon, type IconName } from "@/components/Icons";
import { ModelsChart } from "@/components/ModelsChart";
import { OpenSourceChart } from "@/components/OpenSourceChart";
import { ReferencesChart } from "@/components/ReferencesChart";
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

  // Most charts describe SOLVES, so they only see fully resolved entries - a
  // candidate under review, a partial advance or a retracted claim is tracked
  // but has not resolved anything. The tiles and the hero curve describe the
  // whole record.
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
    <main className="mx-auto w-full max-w-6xl px-4 pb-4 pt-5 sm:px-8 sm:pt-6">
      <h1 className="sr-only">Stats</h1>

      <dl className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {tiles.map((t) => (
          <div
            key={t.label}
            className="flex flex-col justify-center rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3"
          >
            <dt className="flex items-center gap-1.5 text-xs text-[var(--ink-muted)]">
              <Icon name={t.icon} />
              {t.label}
              {t.help && <InfoTip content={t.help} label={t.label} />}
            </dt>
            {/* Same centered tile as the home StatBand. */}
            <dd className="mt-1 text-2xl font-semibold text-[var(--ink)]">{t.value}</dd>
          </div>
        ))}
      </dl>

      {/* Two-column grid, single column on mobile, ordered by interest: the
          significance scatter and the vendor race on top, the two growth
          lines second, the ratio pies last. */}
      <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Whole record: the scatter itself splits resolved (filled) from
            candidate (hollow) and excludes partial/variant/retracted. */}
        <div className="min-w-0 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] p-4 sm:p-5">
          <ReferencesChart problems={problems} />
        </div>
        <div className="min-w-0 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] p-4 sm:p-5">
          <ModelsChart problems={resolved} />
        </div>
        <div className="min-w-0 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] p-4 sm:p-5">
          <ContributionGrowthChart problems={resolved} />
        </div>
        {/* The "is AI doing theory yet?" chart. */}
        <div className="min-w-0 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] p-4 sm:p-5">
          <MethodGrowthChart problems={resolved} />
        </div>
        {/* The hero curve carries a full-width row on its own, and unlike the
            solve charts it counts EVERY tracked entry. */}
        <div className="min-w-0 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] p-4 sm:p-5 lg:col-span-2">
          <CumulativeChart problems={problems} />
        </div>
        <div className="min-w-0 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] p-4 sm:p-5">
          <SolveRatioChart problems={resolved} />
        </div>
        <div className="min-w-0 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] p-4 sm:p-5">
          <OpenSourceChart problems={resolved} />
        </div>
      </section>
    </main>
  );
}
