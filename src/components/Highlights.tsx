// Two entry points into the dataset, above the full list: what just happened
// and what mattered most this week. Neither duplicates the list's default
// ordering.
//
// "This week" replaced a "longest standing" column ranked by years open. That
// one was static: the oldest problems in the record rarely change, so the
// column said the same thing every day and stopped being a reason to look.
//
// A third "best known" column (by notability) fits here naturally if the row
// ever wants it back - notability is already a sort option in the list.
//
// Deliberately NOT "recently added": every entry was seeded within the same few
// seconds, so `createdAt` ordering is seed insertion order, not information.
// "Just solved" uses `solveDate`, which is real curated data. Community-driven
// columns (top voted, most discussed) are worth adding once there is enough
// traffic for them to be non-empty - for now that signal lives in the list's
// sort control.

import Link from "next/link";
import { type ProblemWithVotes } from "@/lib/problems";
import { AI_CONTRIBUTION } from "@/lib/display";
import { Icon, type IconName } from "@/components/Icons";
import { SolvedStamp } from "@/components/RelativeTime";
import { TeX } from "@/components/TeX";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/// Day and month for recent solves: "12 Jun". The catalog now fills up fast
/// enough that every row in this column shares a year, so printing it on all
/// five was noise. The year returns the moment a row disagrees with the
/// newest one - `refYear` is that newest year, so an older straggler still
/// reads unambiguously.
///
/// Handles the three shapes solveDate takes: "2026-06-12", "2026-06" (no day
/// to show) and bare "2026" (nothing but the year).
function formatSolveDate(d: string, refYear: string): string {
  const [year, month, day] = d.split("-");
  const m = month ? MONTHS[Number(month) - 1] : undefined;
  if (!m) return year;
  const stamp = day ? `${Number(day)} ${m}` : m;
  return year === refYear ? stamp : `${stamp} ${year}`;
}

interface Row {
  slug: string;
  name: string;
  /// The value this column ranks on, shown beside the name.
  detail: string;
  /// Set only where `detail` is a solve date precise enough to age: the
  /// timestamp the client recomputes "14 hours ago" from. Absent on
  /// month-only and year-only solve dates, and on columns whose detail is not
  /// a date at all.
  iso?: string;
  /// Marks the top AI-contribution tier: the model produced the central proof
  /// or object.
  aiDiscovered?: boolean;
}

/// The badge. Its own flex child rather than part of the name, because the
/// name truncates: inside that span the pill would be the first thing a narrow
/// screen threw away, which is exactly backwards.
///
/// It shows the whole label wherever it fits and clips to "AI-discove..." when
/// it does not, so the two shrink priorities matter. The title is the long,
/// compressible text and gives way first; `shrink-[0.2]` lets the pill absorb
/// roughly a fifth of the squeeze the title takes, so it stays whole down to
/// narrow phones and only starts clipping under real pressure. `min-w-0` is
/// what makes `truncate` work at all on a flex child, and `title` keeps the
/// full label reachable once it clips.
function DiscoveredPill({ label }: { label: string }) {
  return (
    <span
      title={`${label}: the model produced the central proof or object`}
      className="min-w-0 shrink-[0.2] self-center truncate rounded-full bg-[color-mix(in_srgb,var(--status-good)_14%,transparent)] px-1.5 py-px text-[10px] font-medium text-[var(--status-good)]"
    >
      {label}
    </span>
  );
}

interface Column {
  icon: IconName;
  title: string;
  hint: string;
  rows: Row[];
}

function buildColumns(all: ProblemWithVotes[], rows: number): Column[] {
  // Highlights celebrate outcomes, so only fully resolved entries qualify - a
  // candidate under review or a retracted claim must not headline "Just
  // solved" or count as having fallen.
  const problems = all.filter((p) => p.resolution === "resolved");

  const recent = [...problems]
    .sort((a, b) => b.solveDate.localeCompare(a.solveDate))
    .slice(0, rows);
  // The newest solve sets the reference year for the whole column.
  const refYear = recent[0]?.solveDate.slice(0, 4) ?? "";
  const justSolved = recent.map((p) => ({
    slug: p.slug,
    name: p.shortName,
    detail: formatSolveDate(p.solveDate, refYear),
    // Only a full "YYYY-MM-DD" can be aged. A solve recorded as "2026-06" is
    // a month, and treating it as the first of that month would invent a
    // precision the record does not have.
    iso: p.solveDate.length === 10 ? `${p.solveDate}T00:00:00Z` : undefined,
    aiDiscovered: p.aiContribution === "ai-discovered",
  }));

  // The week's best, by how much mathematics cared about the problem before
  // it fell. A rolling seven days rather than the calendar week: on a Monday
  // a calendar week is nearly empty, and the column would read as though
  // nothing had happened when in fact six days of results had just scrolled
  // out of it.
  //
  // Entries with no significance yet are skipped rather than sorted as zero.
  // A blank score means not assessed, and ranking it below a 5 would state
  // something the record does not know.
  // Seven days back from the newest solve, not from the wall clock. Two
  // reasons, and the second is the one that matters. The page is
  // prerendered, and reading the current time in a server component opts the
  // whole route out of that. And a window anchored to the data is the more
  // useful one regardless: after a quiet stretch a clock-based week empties
  // out and the column reads as though nothing has been solved, when what
  // actually happened is that nothing was solved THIS week specifically.
  const newest = recent[0]?.solveDate ?? "";
  const weekAgo = newest
    ? new Date(`${newest.slice(0, 10)}T00:00:00Z`).getTime() - 7 * 86400000
    : 0;
  const cutoff = newest ? new Date(weekAgo).toISOString().slice(0, 10) : "";
  const thisWeek = problems
    .filter((p) => p.significance != null && p.solveDate >= cutoff)
    .sort(
      (a, b) =>
        (b.significance ?? 0) - (a.significance ?? 0) ||
        b.solveDate.localeCompare(a.solveDate),
    )
    .slice(0, rows)
    .map((p) => ({
      slug: p.slug,
      name: p.shortName,
      detail: `${p.significance}/100`,
      aiDiscovered: p.aiContribution === "ai-discovered",
    }));

  return [
    { icon: "spark", title: "Just solved", hint: "Most recent results", rows: justSolved },
    {
      icon: "pulse",
      title: "This week",
      hint: "Most significant of the last seven days",
      rows: thisWeek,
    },
  ];
}

export function Highlights({
  problems,
  rows = 4,
}: {
  problems: ProblemWithVotes[];
  rows?: number;
}) {
  if (problems.length === 0) return null;
  const columns = buildColumns(problems, rows).filter((c) => c.rows.length > 0);
  if (columns.length === 0) return null;

  // `contents` so each card is a direct child of the home page's overview grid.
  return (
    <div className="contents">
      {columns.map((col) => (
        <section
          key={col.title}
          className="col-span-2 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3.5"
        >
          <h3 className="flex items-center gap-2 font-serif text-base text-[var(--ink)]">
            <Icon name={col.icon} size={14} className="text-[var(--ink-muted)]" />
            {col.title}
          </h3>
          <p className="mt-0.5 text-[11px] text-[var(--ink-muted)]">{col.hint}</p>

          <ul className="mt-2.5">
            {col.rows.map((row) => (
              <li
                key={row.slug}
                className="border-t border-[var(--hairline)] py-2 first:border-t-0 first:pt-0 last:pb-0"
              >
                <Link
                  href={`/problem/${row.slug}`}
                  className="group flex items-baseline justify-between gap-3"
                >
                  <span className="flex min-w-0 items-baseline gap-1.5">
                    <span className="min-w-0 truncate text-sm text-[var(--ink-secondary)] transition-colors group-hover:text-[var(--accent-blue)]">
                      <TeX>{row.name}</TeX>
                    </span>
                    {row.aiDiscovered && (
                      <DiscoveredPill label={AI_CONTRIBUTION["ai-discovered"].pill ?? "AI-discovered"} />
                    )}
                  </span>
                  <span className="shrink-0 font-mono text-[11px] text-[var(--ink-muted)]">
                    {row.iso ? (
                      <SolvedStamp iso={row.iso} date={row.detail} />
                    ) : (
                      row.detail
                    )}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
