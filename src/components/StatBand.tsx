// Headline figures for the home page, as stat tiles (per the dataviz spec:
// sentence-case label, semibold sans value, proportional figures). A handful of
// headline numbers is a stat-tile row, not a chart.
//
// Renders with `display: contents` so the tiles are direct children of the home
// page's overview grid - the <dl> keeps the semantics without becoming a grid
// item itself.
//
// Deliberately four, not six: "latest solve" and "longest open" used to live
// here, but the highlight cards directly below now say the same thing with the
// entry names attached, so the tiles would just be repeating them.

import type { ProblemWithVotes } from "@/lib/problems";

interface Tile {
  label: string;
  value: string;
  sub?: string;
}

function computeTiles(problems: ProblemWithVotes[]): Tile[] {
  const erdos = problems.filter((p) => p.problemNumber !== null).length;
  const lean = problems.filter((p) => p.verification === "lean-verified").length;
  const votes = problems.reduce((sum, p) => sum + p.upvotes + p.downvotes, 0);
  const comments = problems.reduce((sum, p) => sum + p.commentCount, 0);

  return [
    { label: "Tracked problems", value: String(problems.length) },
    { label: "Erdős problems", value: String(erdos) },
    { label: "Lean-verified", value: String(lean), sub: "machine-checked" },
    {
      label: "Community",
      value: String(votes + comments),
      sub: `${votes} votes · ${comments} comments`,
    },
  ];
}

export function StatBand({ problems }: { problems: ProblemWithVotes[] }) {
  if (problems.length === 0) return null;

  return (
    <dl className="contents">
      {computeTiles(problems).map((t) => (
        <div
          key={t.label}
          className="rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3"
        >
          <dt className="text-xs text-[var(--ink-muted)]">{t.label}</dt>
          {/* Proportional figures on purpose - tabular-nums looks loose at
              display sizes; reserve it for columns that must align. */}
          <dd className="mt-1 text-2xl font-semibold text-[var(--ink)]">{t.value}</dd>
          {t.sub && (
            <dd className="mt-0.5 truncate text-[11px] text-[var(--ink-muted)]" title={t.sub}>
              {t.sub}
            </dd>
          )}
        </div>
      ))}
    </dl>
  );
}
