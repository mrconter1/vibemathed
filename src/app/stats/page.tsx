import type { Metadata } from "next";
import Link from "next/link";
import { getEntryFlow, getPublishedProblems } from "@/lib/data";
import { ChartCard } from "@/components/ChartCard";
import type { ChartProblem } from "@/lib/problems";
import { ContributionGrowthChart } from "@/components/ContributionGrowthChart";
import { CumulativeChart } from "@/components/CumulativeChart";
import { FieldsChart } from "@/components/FieldsChart";
import { MethodGrowthChart } from "@/components/MethodGrowthChart";
import { Icon, type IconName } from "@/components/Icons";
import { ModelsChart } from "@/components/ModelsChart";
import { OpenSourceChart } from "@/components/OpenSourceChart";
import { ReferencesChart } from "@/components/ReferencesChart";
import { SolveRatioChart } from "@/components/SolveRatioChart";
import { VendorShareChart } from "@/components/VendorShareChart";
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
    fieldGroup: p.fieldGroup,
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

  // The record's own growth: entries added in the last seven days against
  // the seven before. The clock read lives inside getEntryFlow's cache scope,
  // where a prerendered page is allowed to have one.
  const flow = await getEntryFlow();
  const weekChange =
    flow.prevWeek > 0
      ? Math.round(((flow.week - flow.prevWeek) / flow.prevWeek) * 100)
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
      label: "New entries this week",
      value: String(flow.week),
      change:
        weekChange === null
          ? undefined
          : `${weekChange >= 0 ? "▲" : "▼"} ${Math.abs(weekChange)}% on last week`,
      changeDown: weekChange !== null && weekChange < 0,
      sub: weekChange === null ? `${flow.prevWeek} the week before` : undefined,
      help: "Entries added to the catalog in the last seven days, against the seven days before them. Counted by the date we published the entry, not the date the problem was solved.",
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
        <ChartCard id="significance-vs-age" label="significance vs. age">
          <ReferencesChart problems={slim} />
        </ChartCard>
        <ChartCard id="by-ai-system" label="solves by AI system">
          <ModelsChart problems={resolved} />
        </ChartCard>
        {/* Directly after the volume race, because it answers the question the
            volume race raises and cannot settle: cumulative counts only rise,
            so every vendor's line climbs and gaining ground looks the same as
            being carried by the record's growth. */}
        <ChartCard id="vendor-share" label="share of solves per vendor">
          <VendorShareChart problems={resolved} />
        </ChartCard>
        <ChartCard id="by-contribution-tier" label="growth per AI-contribution tier">
          <ContributionGrowthChart problems={resolved} />
        </ChartCard>
        {/* The "is AI doing theory yet?" chart. */}
        <ChartCard id="by-resolution-method" label="growth per resolution method">
          <MethodGrowthChart problems={resolved} />
        </ChartCard>
        {/* Area growth beside the record's total - both count EVERY tracked
            entry, unlike the solve charts, so the pair reads as "which parts
            of the record grew" next to "how the whole record grew". */}
        <ChartCard id="by-area" label="growth per area">
          <FieldsChart problems={slim} />
        </ChartCard>
        <ChartCard id="over-time" label="problems over time">
          <CumulativeChart problems={slim} />
        </ChartCard>
        <ChartCard id="proved-vs-disproved" label="proved vs. disproved">
          <SolveRatioChart problems={resolved} />
        </ChartCard>
        <ChartCard id="closed-vs-open-source" label="closed vs. open source">
          <OpenSourceChart problems={resolved} />
        </ChartCard>
      </section>
    </main>
  );
}
