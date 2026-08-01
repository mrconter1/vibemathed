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

import { ageAtSolve, type ProblemWithVotes } from "@/lib/problems";
import { Icon, type IconName } from "@/components/Icons";

interface Tile {
  icon: IconName;
  label: string;
  value: string;
  sub?: string;
}

function computeTiles(problems: ProblemWithVotes[], users: number): Tile[] {
  const resolved = problems.filter((p) => p.resolution === "resolved").length;
  const lean = problems.filter((p) => p.verification === "lean-verified").length;
  const votes = problems.reduce((sum, p) => sum + p.upvotes + p.downvotes, 0);
  const comments = problems.reduce((sum, p) => sum + p.commentCount, 0);
  // The single most impressive true number the dataset has: how long these
  // problems had collectively stood open before falling. Replaces the old
  // Erdős count, which was insider trivia (and lives on as a field filter).
  // Only RESOLVED entries count - a candidate under review or a partial
  // advance has not closed anything yet.
  const yearsOpen = problems.reduce(
    (sum, p) => sum + (p.resolution === "resolved" ? (ageAtSolve(p) ?? 0) : 0),
    0,
  );

  return [
    {
      icon: "layers",
      label: "Tracked problems",
      value: String(problems.length),
      // A sub line like its three siblings, so the row reads as one family.
      sub: `${resolved} fully resolved`,
    },
    {
      icon: "hourglass",
      label: "Combined years open",
      value: yearsOpen.toLocaleString("en-US"),
      sub: "before AI closed them",
    },
    { icon: "shield", label: "Lean-verified", value: String(lean), sub: "machine-checked" },
    {
      // The headline figure is PEOPLE: the tile exists to show the site has a
      // community, and a member count says that; the engagement sits below it.
      icon: "users",
      label: "Community members",
      value: String(users),
      sub: `${votes} votes · ${comments} comments`,
    },
  ];
}

export function StatBand({
  problems,
  users,
}: {
  problems: ProblemWithVotes[];
  users: number;
}) {
  if (problems.length === 0) return null;

  return (
    <dl className="contents">
      {computeTiles(problems, users).map((t) => (
        <div
          key={t.label}
          className="flex flex-col justify-center rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3"
        >
          <dt className="flex items-center gap-1.5 text-xs text-[var(--ink-muted)]">
            <Icon name={t.icon} />
            {t.label}
          </dt>
          {/* Proportional figures on purpose - tabular-nums looks loose at
              display sizes; reserve it for columns that must align. The tile
              centers its content (justify-center): on desktop the activity
              feed spans both overview rows and stretches the tiles a little,
              and a centered label+figure block keeps them adjacent while
              splitting the slack evenly instead of pooling it. */}
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
