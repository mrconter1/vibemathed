// VibeMathed data model.
//
// This is a hand-curated (not scraped) record of math problems resolved with
// an AI model in the loop. The actual data lives in `src/data/problems.json`
// - see the README for how to add an entry. Every entry must cite a real,
// checkable source; if a result is disputed or not yet peer-reviewed, say so
// in `verification` rather than omitting it.
//
// Two flavours of entry live in the same list:
//   - "marquee" entries: fully hand-written, with statement, aiRole prose,
//     verification notes, and (where looked up) a real citation count.
//   - "lean" entries: bulk-imported from Terence Tao's AI-contributions wiki
//     for Erdős problems (github.com/teorth/erdosproblems). These carry only
//     the fields the wiki table actually states - problem number, AI systems,
//     date, human collaborators, whether it was Lean-verified - and leave the
//     rest null rather than inventing a statement or a posed-year.
//
// The data file is untyped JSON, hand-edited AND machine-generated - so this
// module validates its shape at load time instead of trusting a cast.

import rawProblems from "@/data/problems.json";

export type SolveType = "proved" | "disproved";

// An ordinal "trust ladder", strongest to weakest.
export type VerificationStatus =
  | "lean-verified" // formal proof machine-checked in Lean (strongest)
  | "expert-verified" // independently checked and endorsed by named domain experts
  | "site-confirmed" // erdosproblems.com's official status marks it solved (not Lean)
  | "preprint-unrefereed" // written up in an arXiv preprint, not yet peer-reviewed
  | "announced-unreviewed" // publicly claimed with a construction, no independent check yet
  | "contested"; // actively disputed or partially walked back

export interface MathProblem {
  /** URL-safe unique id */
  slug: string;
  name: string;
  /** Compact label for chart axes / narrow layouts */
  shortName: string;
  /** Erdős problem number, if this is one; null otherwise */
  problemNumber: number | null;
  /** Math field. Null for lean entries where we didn't fetch the problem page. */
  field: string | null;
  /** Plain-language statement. Null for lean entries. */
  statement: string | null;
  /** Who posed it. Null for lean entries. */
  posedBy: string | null;
  /** Year posed. Null when not reliably known (most lean entries). */
  yearPosed: number | null;
  solveType: SolveType;
  /** ISO date, or "YYYY-MM" / "YYYY". For date ranges, the completion date. */
  solveDate: string;
  model: string;
  /** Vendor. Null for lean/multi-vendor entries. */
  modelMaker: string | null;
  /** Human mathematicians/researchers involved. Empty array if none named. */
  humanCollaborators: string[];
  /** What the model did. Null for lean entries. */
  aiRole: string | null;
  verification: VerificationStatus;
  verificationNote: string | null;
  /** Reference count for the paper in `citationsPaper`. Null until looked up. */
  citations: number | null;
  citationsPaper: string | null;
  citationsSource: string | null;
  citationsUrl: string | null;
  /**
   * Renown proxy: number of Wikipedia language editions that carry an article
   * dedicated to THIS problem. Strict attribution - a generic concept article
   * (e.g. "Factorial" for a factorial-divisibility problem) does not count, so
   * 0 means "no dedicated article", not "unknown". Source: Wikipedia langlinks,
   * snapshot 2026-07-22.
   */
  renownLangs: number;
  /**
   * Optional caveat shown as a "*" next to the notability count, e.g. when a
   * Wikipedia article exists but was created in response to the solution and so
   * does not count. Present only on entries that need it.
   */
  renownNote?: string | null;
  sourceUrl: string;
  sourceName: string;
}

const SOLVE_TYPES: SolveType[] = ["proved", "disproved"];
const VERIFICATION_STATUSES: VerificationStatus[] = [
  "lean-verified",
  "expert-verified",
  "site-confirmed",
  "preprint-unrefereed",
  "announced-unreviewed",
  "contested",
];

function assertProblem(value: unknown, index: number): MathProblem {
  const p = value as Record<string, unknown>;
  const where = `src/data/problems.json[${index}]${p?.slug ? ` (${p.slug})` : ""}`;

  const requireString = (key: string) => {
    if (typeof p[key] !== "string" || p[key] === "") {
      throw new Error(`${where}: "${key}" must be a non-empty string`);
    }
  };
  const requireStringArray = (key: string) => {
    if (!Array.isArray(p[key]) || !p[key].every((v) => typeof v === "string")) {
      throw new Error(`${where}: "${key}" must be a string array`);
    }
  };
  const requireNullableString = (key: string) => {
    if (p[key] !== null && typeof p[key] !== "string") {
      throw new Error(`${where}: "${key}" must be a string or null`);
    }
  };
  const requireNullableNumber = (key: string) => {
    if (p[key] !== null && typeof p[key] !== "number") {
      throw new Error(`${where}: "${key}" must be a number or null`);
    }
  };
  const requireNumber = (key: string) => {
    if (typeof p[key] !== "number") {
      throw new Error(`${where}: "${key}" must be a number`);
    }
  };

  ["slug", "name", "shortName", "solveDate", "model", "sourceUrl", "sourceName"].forEach(
    requireString,
  );
  ["field", "statement", "posedBy", "modelMaker", "aiRole", "verificationNote", "citationsPaper", "citationsSource", "citationsUrl"].forEach(
    requireNullableString,
  );
  ["problemNumber", "yearPosed", "citations"].forEach(requireNullableNumber);
  requireNumber("renownLangs");
  if (p.renownNote !== undefined && p.renownNote !== null && typeof p.renownNote !== "string") {
    throw new Error(`${where}: "renownNote" must be a string or null when present`);
  }
  requireStringArray("humanCollaborators");

  if (!SOLVE_TYPES.includes(p.solveType as SolveType)) {
    throw new Error(`${where}: "solveType" must be one of ${SOLVE_TYPES.join(", ")}`);
  }
  if (!VERIFICATION_STATUSES.includes(p.verification as VerificationStatus)) {
    throw new Error(
      `${where}: "verification" must be one of ${VERIFICATION_STATUSES.join(", ")}`,
    );
  }

  return p as unknown as MathProblem;
}

export const problems: MathProblem[] = (rawProblems as unknown[]).map(assertProblem);

/** Years a problem was open before resolution, or null if the posed year is unknown. */
export function ageAtSolve(problem: MathProblem): number | null {
  if (problem.yearPosed === null) return null;
  const solveYear = parseInt(problem.solveDate.slice(0, 4), 10);
  if (Number.isNaN(solveYear)) return null;
  return solveYear - problem.yearPosed;
}
