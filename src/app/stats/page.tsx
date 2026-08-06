import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedProblems } from "@/lib/data";
import { ChartCard } from "@/components/ChartCard";
import type { ChartProblem } from "@/lib/problems";
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

  // The charts are client components, so whatever they receive as props is
  // serialized into the page payload. Handing them the raw catalog shipped
  // every statement, note and trend counter to the browser to draw a few
  // hundred dots - most of this page's weight, and most of its load time.
  // The projection IS the payload: fourteen fields, nothing prose-sized.
  const slim: ChartProblem[] = problems.map((p) => ({
    slug: p.slug,
    name: p.name,
    shortName: p.shortName,
    field: p.field,
    solveDate: p.solveDate,
    solveType: p.solveType,
    resolution: p.resolution,
    resolutionMethod: p.resolutionMethod,
    aiContribution: p.aiContribution,
    model: p.model,
    modelMaker: p.modelMaker,
    verification: p.verification,
    yearPosed: p.yearPosed,
    significance: p.significance,
  }));

  // Most charts describe SOLVES, so they only see fully resolved entries - a
  // candidate under review, a partial advance or a retracted claim is tracked
  // but has not resolved anything. The tiles and the hero curve describe the
  // whole record.
  const resolved = slim.filter((p) => p.resolution === "resolved");

  // Week-over-week, anchored to the DATA rather than the wall clock: reading
  // `new Date()` in a prerendered server component is a Cache Components
  // build error, and a data-anchored window is more useful regardless - after
  // a quiet stretch a clock week empties out and reads as though nothing was
  // ever solved. Same anchoring as the home page's "This week" column. Only
  // day-precision solve dates can sit in a 7-day window; month-precision
  // entries ("2026-07") are left out rather than invented onto a day.
  const dayDates = problems
    .map((p) => p.solveDate)
    .filter((d) => d.length === 10)
    .sort();
  const newestDay = dayDates.at(-1);
  const backFrom = (iso: string, days: number) =>
    new Date(new Date(`${iso}T00:00:00Z`).getTime() - days * 86400000)
      .toISOString()
      .slice(0, 10);
  const weekStart = newestDay ? backFrom(newestDay, 6) : "";
  const prevWeekStart = newestDay ? backFrom(newestDay, 13) : "";
  const weekCount = newestDay ? dayDates.filter((d) => d >= weekStart).length : 0;
  const prevWeekCount = newestDay
    ? dayDates.filter((d) => d >= prevWeekStart && d < weekStart).length
    : 0;
  const weekChange =
    prevWeekCount > 0
      ? Math.round(((weekCount - prevWeekCount) / prevWeekCount) * 100)
      : null;

  // A share, not a count: how much of the record is machine-checked.
  const leanShare = problems.length
    ? Math.round(
        (problems.filter((p) => p.verification === "lean-verified").length /
          problems.length) *
          100,
      )
    : 0;

  // The stakes, in one number. Only entries with a known posed year count;
  // most of the catalog has one. Kept as the ENTRY rather than the year so the
  // tile can link to it - a reader who sees 1932 immediately wants to know
  // which problem that was. Ties break on the earliest solve, then the slug,
  // so the link is deterministic rather than dependent on query order.
  const oldest =
    problems
      .filter((p) => typeof p.yearPosed === "number")
      .sort(
        (a, b) =>
          (a.yearPosed ?? 0) - (b.yearPosed ?? 0) ||
          a.solveDate.localeCompare(b.solveDate) ||
          a.slug.localeCompare(b.slug),
      )[0] ?? null;

  const tiles: {
    icon: IconName;
    label: string;
    value: string;
    change?: string;
    /// Whether the change line reports a decline, for its colour.
    changeDown?: boolean;
    sub?: string;
    help?: string;
    /// When the number names one entry, the number links to it.
    href?: string;
  }[] = [
    {
      icon: "layers",
      label: "Tracked problems",
      value: String(problems.length),
      // No delta: the change in a running total is the flow, which the next
      // tile already reports.
      sub: `${resolved.length} fully resolved`,
    },
    {
      icon: "spark",
      label: "Solved this week",
      value: String(weekCount),
      change:
        weekChange === null
          ? undefined
          : `${weekChange >= 0 ? "▲" : "▼"} ${Math.abs(weekChange)}% on last week`,
      changeDown: weekChange !== null && weekChange < 0,
      sub: weekChange === null ? `${prevWeekCount} the week before` : undefined,
      help: "The seven days ending at the newest recorded solve, against the seven before them. Counted by the date the problem was solved, not the date we added it, so the window follows the data rather than the calendar.",
    },
    {
      icon: "shield",
      label: "Lean-verified",
      value: `${leanShare}%`,
      sub: "machine-checked proof",
      help: "Share of the whole record carrying a formal proof checked by Lean, the strongest rung of our verification ladder.",
    },
    {
      icon: "votes",
      label: "Oldest problem cracked",
      value: oldest?.yearPosed ? String(oldest.yearPosed) : "—",
      sub: oldest ? oldest.shortName : "year it was posed",
      href: oldest ? `/problem/${oldest.slug}` : undefined,
    },
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
            {/* Same centered tile as the home StatBand, plus the comparison
                line a bare total lacks. */}
            <dd className="mt-1 text-2xl font-semibold text-[var(--ink)]">
              {t.href ? (
                <Link
                  href={t.href}
                  className="transition-colors hover:text-[var(--accent-blue)] hover:underline"
                >
                  {t.value}
                </Link>
              ) : (
                t.value
              )}
            </dd>
            {t.change && (
              <p
                className={`mt-0.5 text-[11px] font-medium ${
                  t.changeDown
                    ? "text-[var(--ink-muted)]"
                    : "text-[var(--status-good)]"
                }`}
              >
                {t.change}
              </p>
            )}
            {t.sub && !t.change && (
              <p className="mt-0.5 text-[11px] text-[var(--ink-muted)]">{t.sub}</p>
            )}
          </div>
        ))}
      </dl>

      {/* Two-column grid, single column on mobile, ordered by interest: the
          significance scatter and the vendor race on top, the two growth
          lines second, the ratio pies last. */}
      <section className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Whole record: the scatter itself splits resolved (filled) from
            candidate (hollow) and excludes partial/variant/retracted. */}
        <ChartCard>
          <ReferencesChart problems={slim} />
        </ChartCard>
        <ChartCard>
          <ModelsChart problems={resolved} />
        </ChartCard>
        <ChartCard>
          <ContributionGrowthChart problems={resolved} />
        </ChartCard>
        {/* The "is AI doing theory yet?" chart. */}
        <ChartCard>
          <MethodGrowthChart problems={resolved} />
        </ChartCard>
        {/* The hero curve carries a full-width row on its own, and unlike the
            solve charts it counts EVERY tracked entry. */}
        <ChartCard className="lg:col-span-2">
          <CumulativeChart problems={slim} />
        </ChartCard>
        <ChartCard>
          <SolveRatioChart problems={resolved} />
        </ChartCard>
        <ChartCard>
          <OpenSourceChart problems={resolved} />
        </ChartCard>
      </section>
    </main>
  );
}
