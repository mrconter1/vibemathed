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

import { type ProblemWithVotes } from "@/lib/problems";
import { RESOLUTION } from "@/lib/display";
import { Icon, type IconName } from "@/components/Icons";
import { HighlightList, type PreviewRow } from "@/components/HighlightPreview";

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

/// One row, plus the fields the desktop hover card shows. Ten rows total, so
/// the extra payload is negligible - unlike the stats page, where projecting
/// full problems into a client component cost most of a megabyte.
type Row = PreviewRow;

/// Builds a row from a problem, given the column's ranking detail.
function toRow(p: ProblemWithVotes, detail: string, iso?: string): Row {
  return {
    slug: p.slug,
    name: p.shortName,
    detail,
    iso,
    aiDiscovered: p.aiContribution === "ai-discovered",
    // Shown INSTEAD of the AI pill when set, never beside it: one marker per
    // row keeps the line readable on a phone, and if an entry is only a
    // partial result then that is the thing a reader needs to know first.
    status:
      p.resolution === "resolved"
        ? null
        : { label: RESOLUTION[p.resolution].pill ?? RESOLUTION[p.resolution].label,
            color: RESOLUTION[p.resolution].color },
    fullName: p.name,
    field: p.field ?? p.fieldGroup,
    // Clamped here rather than in the card: the whole statement would ride the
    // RSC payload for a card that line-clamps to three lines anyway.
    statement: p.statement ? p.statement.slice(0, 220) : null,
    model: p.model,
    verification: p.verification,
    resolution: p.resolution,
    significance: p.significance ?? null,
    solved: p.solveDate,
  };
}


interface Column {
  icon: IconName;
  title: string;
  hint: string;
  rows: Row[];
}

function buildColumns(all: ProblemWithVotes[], rows: number): Column[] {
  // "Just solved" is about outcomes, so only fully resolved entries qualify: a
  // candidate under review or a retracted claim must not headline it or count
  // as having fallen.
  const problems = all.filter((p) => p.resolution === "resolved");

  // "This week" ranks by how much the problem mattered, and excluding partial
  // results there hid the biggest thing that has happened to this record. The
  // zeta critical-line bound is the most significant entry in the catalog and
  // was invisible on the front page, because improving a bound on the Riemann
  // hypothesis is a partial result by definition. So are the Tuza degree-seven
  // proof and most record ladders: the more famous the problem, the likelier
  // that real progress on it is partial rather than total.
  //
  // Candidates and variants stay out. Those are claims whose standing is in
  // question, where partial describes how much of the problem fell, not how
  // much to believe it.
  const notable = all.filter(
    (p) => p.resolution === "resolved" || p.resolution === "partial",
  );

  const recent = [...problems]
    .sort((a, b) => b.solveDate.localeCompare(a.solveDate))
    .slice(0, rows);
  // The newest solve sets the reference year for the whole column.
  const refYear = recent[0]?.solveDate.slice(0, 4) ?? "";
  const justSolved = recent.map((p) =>
    toRow(
      p,
      formatSolveDate(p.solveDate, refYear),
      // Only a full "YYYY-MM-DD" can be aged. A solve recorded as "2026-06" is
      // a month, and treating it as the first of that month would invent a
      // precision the record does not have.
      p.solveDate.length === 10 ? `${p.solveDate}T00:00:00Z` : undefined,
    ),
  );

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
  const newest =
    [...notable].sort((a, b) => b.solveDate.localeCompare(a.solveDate))[0]?.solveDate ?? "";
  const weekAgo = newest
    ? new Date(`${newest.slice(0, 10)}T00:00:00Z`).getTime() - 7 * 86400000
    : 0;
  const cutoff = newest ? new Date(weekAgo).toISOString().slice(0, 10) : "";
  const thisWeek = notable
    .filter((p) => p.significance != null && p.solveDate >= cutoff)
    .sort(
      (a, b) =>
        (b.significance ?? 0) - (a.significance ?? 0) ||
        b.solveDate.localeCompare(a.solveDate),
    )
    .slice(0, rows)
    .map((p) => toRow(p, `${p.significance}/100`));

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

          <HighlightList rows={col.rows} />
        </section>
      ))}
    </div>
  );
}
