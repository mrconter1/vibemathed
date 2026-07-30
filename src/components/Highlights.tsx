// Two entry points into the dataset, above the full list: what just happened
// and what took the longest. Neither duplicates the list's default ordering.
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
import { ageAtSolve, type ProblemWithVotes } from "@/lib/problems";
import { Icon, type IconName } from "@/components/Icons";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/// "2026-06-12" / "2026-06" → "Jun 2026"; bare "2026" stays as is.
function formatSolveDate(d: string): string {
  const [year, month] = d.split("-");
  if (!month) return year;
  const m = MONTHS[Number(month) - 1];
  return m ? `${m} ${year}` : year;
}

interface Row {
  slug: string;
  name: string;
  /// The value this column ranks on, shown beside the name.
  detail: string;
}

interface Column {
  icon: IconName;
  title: string;
  hint: string;
  rows: Row[];
}

function buildColumns(problems: ProblemWithVotes[], rows: number): Column[] {
  const justSolved = [...problems]
    .sort((a, b) => b.solveDate.localeCompare(a.solveDate))
    .slice(0, rows)
    .map((p) => ({
      slug: p.slug,
      name: p.shortName,
      detail: formatSolveDate(p.solveDate),
    }));

  const longestStanding = problems
    .map((p) => ({ p, age: ageAtSolve(p) }))
    .filter((x): x is { p: ProblemWithVotes; age: number } => x.age !== null)
    .sort((a, b) => b.age - a.age)
    .slice(0, rows)
    .map(({ p, age }) => ({
      slug: p.slug,
      name: p.shortName,
      detail: `open ${age}y`,
    }));

  return [
    { icon: "spark", title: "Just solved", hint: "Most recent results", rows: justSolved },
    {
      icon: "hourglass",
      title: "Longest standing",
      hint: "Open the longest before falling",
      rows: longestStanding,
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
                  <span className="min-w-0 truncate text-sm text-[var(--ink-secondary)] transition-colors group-hover:text-[var(--accent-blue)]">
                    {row.name}
                  </span>
                  <span className="shrink-0 font-mono text-[11px] text-[var(--ink-muted)]">
                    {row.detail}
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
