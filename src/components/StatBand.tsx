// KPI row for the home page - the headline numbers of the dataset, as stat
// tiles (per the dataviz spec: sentence-case label, semibold sans value with
// proportional figures, optional muted context line). A handful of headline
// numbers is a stat-tile row, not a chart.

import { ageAtSolve, type ProblemWithVotes } from "@/lib/problems";

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

interface Tile {
  label: string;
  value: string;
  /// Optional context line under the value (an entry name, a qualifier).
  sub?: string;
}

function computeTiles(problems: ProblemWithVotes[]): Tile[] {
  const erdos = problems.filter((p) => p.problemNumber !== null).length;
  const lean = problems.filter((p) => p.verification === "lean-verified").length;

  const latest = problems.reduce((a, b) => (a.solveDate >= b.solveDate ? a : b));

  let oldest: ProblemWithVotes | null = null;
  let oldestAge = -1;
  for (const p of problems) {
    const age = ageAtSolve(p);
    if (age !== null && age > oldestAge) {
      oldestAge = age;
      oldest = p;
    }
  }

  const votes = problems.reduce((sum, p) => sum + p.upvotes + p.downvotes, 0);

  const tiles: Tile[] = [
    { label: "Tracked problems", value: String(problems.length) },
    { label: "Erdős problems", value: String(erdos) },
    { label: "Lean-verified", value: String(lean), sub: "machine-checked proofs" },
    {
      label: "Latest solve",
      value: formatSolveDate(latest.solveDate),
      sub: latest.shortName,
    },
  ];
  if (oldest) {
    tiles.push({
      label: "Longest open",
      value: `${oldestAge}y`,
      sub: oldest.shortName,
    });
  }
  tiles.push({ label: "Votes cast", value: String(votes), sub: "by the community" });
  return tiles;
}

export function StatBand({ problems }: { problems: ProblemWithVotes[] }) {
  if (problems.length === 0) return null;
  const tiles = computeTiles(problems);

  return (
    <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-6">
      {tiles.map((t) => (
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
