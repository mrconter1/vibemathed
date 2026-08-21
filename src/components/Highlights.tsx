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
// "Latest" uses `solveDate`, which is real curated data. It was called "Just
// solved" while it showed only resolved entries; now that a claim still under
// review can appear there, that title would have been asserting the one thing
// such a row does not yet establish. Community-driven
// columns (top voted, most discussed) are worth adding once there is enough
// traffic for them to be non-empty - for now that signal lives in the list's
// sort control.

import { type ProblemWithVotes } from "@/lib/problems";
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
  // One pool for both columns: everything the record holds except a withdrawn
  // claim.
  //
  // The columns used to be narrower - the first resolved-only, the second
  // resolved-or-partial - and the effect was that the record's biggest results
  // were missing from its own front page. That is not bad luck, it is
  // selection: the more significant a claim, the longer it waits in
  // `candidate` for someone qualified to check it, so filtering candidates out
  // filtered systematically for unimportance. The disproof of
  // Yau-Tian-Donaldson, the sub-optimality of Marton's inner bound and the
  // sofic-groups question are all in the catalog at significance 50 or above
  // and none of them appeared here.
  //
  // The same argument had already been made once for partial results, which is
  // why they were let in: on a famous problem, real progress is usually
  // partial rather than total. Candidates are the same mistake one rung along.
  //
  // `retracted` stays out, and no pill fixes it. A withdrawn claim is not a
  // recent result, and listing one among them would be false whatever label it
  // carried.
  //
  // Standing is carried on the row instead of at the filter: a candidate shows
  // an Under review pill (see HighlightPreview). Partials and variants stay
  // unmarked, as before - "partial" says how much of the problem fell, which
  // the hover card and entry page explain, whereas "candidate" says how much
  // to believe it, and that belongs in front of the reader.
  const pool = all.filter((p) => p.resolution !== "retracted");

  const recent = [...pool]
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
    [...pool].sort((a, b) => b.solveDate.localeCompare(a.solveDate))[0]?.solveDate ?? "";
  const weekAgo = newest
    ? new Date(`${newest.slice(0, 10)}T00:00:00Z`).getTime() - 7 * 86400000
    : 0;
  const cutoff = newest ? new Date(weekAgo).toISOString().slice(0, 10) : "";
  const thisWeek = pool
    .filter((p) => p.significance != null && p.solveDate >= cutoff)
    .sort(
      (a, b) =>
        (b.significance ?? 0) - (a.significance ?? 0) ||
        b.solveDate.localeCompare(a.solveDate),
    )
    .slice(0, rows)
    .map((p) => toRow(p, `${p.significance}/100`));

  return [
    { icon: "spark", title: "Latest", hint: "Most recent results", rows: justSolved },
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
