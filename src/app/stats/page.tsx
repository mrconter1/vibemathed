import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedProblems } from "@/lib/data";
import { NOTABILITY_HELP } from "@/lib/display";
import { ModelsChart } from "@/components/ModelsChart";
import { ReferencesChart } from "@/components/ReferencesChart";
import { SolveRatioChart } from "@/components/SolveRatioChart";
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
  const notable = problems.filter((p) => p.renownLangs > 0).length;

  const tiles: { label: string; value: string; help?: string }[] = [
    { label: "Tracked problems", value: String(problems.length) },
    { label: "Contested results", value: String(contested) },
    { label: "With Wikipedia article", value: String(notable), help: NOTABILITY_HELP },
    { label: "Votes cast", value: String(totalVotes) },
  ];

  return (
    <main className="mx-auto w-full max-w-6xl px-4 pb-4 pt-8 sm:px-8 sm:pt-10">
      <header>
        <h1 className="font-serif text-3xl tracking-tight text-[var(--ink)]">Stats</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--ink-secondary)]">
          Everything here is derived from the {problems.length} tracked entries.
          The cumulative timeline lives on the{" "}
          <Link href="/" className="text-[var(--accent-blue)] hover:underline">
            home page
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
            <dt className="flex items-center gap-1 text-xs text-[var(--ink-muted)]">
              {t.label}
              {t.help && <InfoTip content={t.help} label={t.label} />}
            </dt>
            <dd className="mt-1 text-2xl font-semibold text-[var(--ink)]">{t.value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="min-w-0 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] p-4 sm:p-5">
          <ReferencesChart problems={problems} />
        </div>
        <div className="min-w-0 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] p-4 sm:p-5">
          <SolveRatioChart problems={problems} />
        </div>
        <div className="min-w-0 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] p-4 sm:p-5 lg:col-span-2">
          <ModelsChart problems={problems} />
        </div>
      </section>
    </main>
  );
}
