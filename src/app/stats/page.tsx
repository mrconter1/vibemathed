import type { Metadata } from "next";
import Link from "next/link";
import { getPublishedProblems } from "@/lib/data";
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

  // Month-over-month on the last COMPLETE month, deliberately not a rolling
  // window. Two reasons. A month-to-date comparison shows a fake collapse for
  // the first three weeks of every month - on 3 August, August-so-far against
  // July reads -89%. And on a series this bursty a rolling ratio is an
  // artefact of the window: the same data gives +44% over 7 days, +386% over
  // 30 and +478% over 120. A completed month is the one comparison a reader
  // cannot recompute into a different headline.
  const monthly = new Map<string, number>();
  for (const p of problems) {
    // Month-precision entries ("2026-07") already carry the month; day
    // precision is truncated to it.
    const month = p.solveDate.slice(0, 7);
    if (month.length === 7) monthly.set(month, (monthly.get(month) ?? 0) + 1);
  }
  const months = [...monthly.keys()].sort();
  // "Complete" is derived from the data, not the clock. Reading `new Date()`
  // in a prerendered server component is a Cache Components build error, and
  // the newest month present is in practice the one still filling, so the
  // month before it is the newest complete one. If a month has not yet
  // produced an entry the report simply lags a month, which is the safe
  // direction to be wrong in.
  const lastMonth = months.at(-2);
  const prevMonth = months.at(-3);
  const lastCount = lastMonth ? (monthly.get(lastMonth) ?? 0) : 0;
  const prevCount = prevMonth ? (monthly.get(prevMonth) ?? 0) : 0;
  const monthChange =
    prevCount > 0 ? Math.round(((lastCount - prevCount) / prevCount) * 100) : null;
  const monthName = lastMonth
    ? new Date(`${lastMonth}-02`).toLocaleString("en-GB", { month: "long" })
    : "";
  const prevName = prevMonth
    ? new Date(`${prevMonth}-02`).toLocaleString("en-GB", { month: "long" })
    : "";

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
      label: `Solved in ${monthName}`,
      value: String(lastCount),
      change:
        monthChange === null
          ? undefined
          : `${monthChange >= 0 ? "▲" : "▼"} ${Math.abs(monthChange)}% on ${prevName}`,
      help: "Counted by the date the problem was solved, not the date we added it, and always the last complete month - a month still in progress would show a decline that is only the calendar.",
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
              <p className="mt-0.5 text-[11px] font-medium text-[var(--status-good)]">
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
