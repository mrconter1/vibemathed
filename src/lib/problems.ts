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
// The data file is untyped JSON, hand-edited AND machine-generated - so it is
// validated rather than cast. `assertProblem` lives here; the actual loading of
// `problems.json` lives in `src/lib/curated.ts`, deliberately kept apart so
// that importing a type or `ageAtSolve` from this module cannot drag 79 KB of
// JSON into the browser bundle.

export type SolveType = "proved" | "disproved";

/// What happened to the PROBLEM - orthogonal to `verification`, which says how
/// trustworthy the claim is. "resolved" is the default and the only status the
/// original dataset used; the others exist so partial results, candidate
/// solutions awaiting community review, variant-only readings and retracted
/// claims can be recorded honestly instead of being forced into "resolved".
export type ResolutionStatus =
  | "resolved" // the stated problem is fully proved or disproved
  | "partial" // a real advance (new bound, special case), problem still open
  | "variant" // only a variant or literal-wording reading was resolved
  | "candidate" // full solution claimed, authoritative review still pending
  | "retracted"; // claim withdrawn or refuted after publication

export const RESOLUTION_STATUSES: ResolutionStatus[] = [
  "resolved",
  "partial",
  "variant",
  "candidate",
  "retracted",
];

/// Normalized field taxonomy for filtering. The free-text `field` stays on
/// entries as the detail line; this is what the filter chips group by.
export const FIELD_GROUPS = [
  "Number theory",
  "Combinatorics",
  "Geometry & topology",
  "Algebra",
  "Analysis",
  "Probability & statistics",
  "Algorithms & optimization",
  "Theoretical computer science",
  "Differential equations",
  "Mathematical physics",
  "Quantum information & computing",
] as const;

export type FieldGroup = (typeof FIELD_GROUPS)[number];

/// An additional link beyond the primary source: a Lean repository, an
/// independent proof of the same theorem, a community record.
export interface LinkRef {
  label: string;
  url: string;
}

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
  /** Normalized field bucket (see FIELD_GROUPS); what the filter chips group by. */
  fieldGroup: FieldGroup | null;
  /** Plain-language statement. Null for lean entries. */
  statement: string | null;
  /** Who posed it. Null for lean entries. */
  posedBy: string | null;
  /** Year posed. Null when not reliably known (most lean entries). */
  yearPosed: number | null;
  solveType: SolveType;
  /** What happened to the problem; see ResolutionStatus. */
  resolution: ResolutionStatus;
  /**
   * Optional note documenting a known issue with the claim (a refuted lemma,
   * a misformalized statement). Rendered as a visible flag. Present only on
   * entries that need it.
   */
  claimIssueNote?: string | null;
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
   * snapshot 2026-07-22 for the original set and 2026-07-30 for the imported
   * catalog (every import verified 0 under the strict rule - the near-misses
   * were all concept articles). Frozen at this snapshot on purpose - we do NOT track it
   * live, so a burst of coverage triggered by the solution itself can never
   * inflate the score after the fact (the same reasoning behind the strict rule).
   */
  renownLangs: number;
  /**
   * Optional caveat shown as a "*" next to the notability count, e.g. when a
   * Wikipedia article exists but was created in response to the solution and so
   * does not count. Present only on entries that need it.
   */
  renownNote?: string | null;
  /**
   * Optional short qualifier appended to the visible result, for results that
   * aren't cleanly "proved"/"disproved" - e.g. disproved in some dimensions but
   * still open in others. Present only on entries that need it.
   */
  resultNote?: string | null;
  /**
   * Optional footnote shown as a "*" next to the age, e.g. to flag that the
   * "years open" span oversells how fully the problem is closed, and to record
   * who found the result. Present only on entries that need it.
   */
  ageNote?: string | null;
  sourceUrl: string;
  sourceName: string;
  /**
   * Additional links beyond the primary source. Optional in the JSON
   * baseline; the database always stores an array (empty by default).
   */
  links?: LinkRef[];
}

/// The windows offered for time-sensitive sorting.
export type Period = "week" | "month" | "all";

/// A curated problem plus its lifetime engagement counts.
///
/// Lives here rather than in `src/lib/data.ts` so client components can import
/// the type without dragging the Prisma client into the browser bundle.
export type ProblemWithVotes = MathProblem & {
  upvotes: number;
  downvotes: number;
  /// Lifetime net score, precomputed so the client can sort on it directly.
  score: number;
  commentCount: number;
  /// Pseudonym of whoever submitted this entry, or null for curated ones.
  submittedBy: string | null;
};

/// A problem plus engagement inside recent time windows.
///
/// These are shipped with the list so that "top voted this week" stays a
/// client-side sort. The denormalized totals on the row cannot answer a time
/// question - that needs the underlying vote and comment rows - so aggregation
/// happens once, server-side, inside the cached read rather than on every sort
/// change. Only the list needs these; a single entry page does not.
export type ProblemWithTrends = ProblemWithVotes & {
  /// Net score from votes cast in the last 7 / 30 days.
  score7d: number;
  score30d: number;
  /// Comments posted in the last 7 / 30 days.
  comments7d: number;
  comments30d: number;
};

/// What the client-side entry cards receive: an entry, its counts, and its
/// statement with math already rendered to HTML on the server.
export type ProblemCardData = ProblemWithTrends & {
  statementHtml: string | null;
};

const SOLVE_TYPES: SolveType[] = ["proved", "disproved"];
const VERIFICATION_STATUSES: VerificationStatus[] = [
  "lean-verified",
  "expert-verified",
  "site-confirmed",
  "preprint-unrefereed",
  "announced-unreviewed",
  "contested",
];

export function assertProblem(value: unknown, index: number): MathProblem {
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
  for (const key of ["renownNote", "resultNote", "ageNote", "claimIssueNote"]) {
    if (p[key] !== undefined && p[key] !== null && typeof p[key] !== "string") {
      throw new Error(`${where}: "${key}" must be a string or null when present`);
    }
  }
  requireStringArray("humanCollaborators");

  if (!SOLVE_TYPES.includes(p.solveType as SolveType)) {
    throw new Error(`${where}: "solveType" must be one of ${SOLVE_TYPES.join(", ")}`);
  }
  if (!RESOLUTION_STATUSES.includes(p.resolution as ResolutionStatus)) {
    throw new Error(
      `${where}: "resolution" must be one of ${RESOLUTION_STATUSES.join(", ")}`,
    );
  }
  // The curated baseline always classifies; only community rows may lack it.
  if (!FIELD_GROUPS.includes(p.fieldGroup as FieldGroup)) {
    throw new Error(`${where}: "fieldGroup" must be one of ${FIELD_GROUPS.join(", ")}`);
  }
  if (p.links !== undefined) {
    const ok =
      Array.isArray(p.links) &&
      p.links.every(
        (l) =>
          typeof l === "object" &&
          l !== null &&
          typeof (l as LinkRef).label === "string" &&
          typeof (l as LinkRef).url === "string",
      );
    if (!ok) {
      throw new Error(`${where}: "links" must be an array of { label, url } when present`);
    }
  }
  if (!VERIFICATION_STATUSES.includes(p.verification as VerificationStatus)) {
    throw new Error(
      `${where}: "verification" must be one of ${VERIFICATION_STATUSES.join(", ")}`,
    );
  }

  return p as unknown as MathProblem;
}

/** Years a problem was open before resolution, or null if the posed year is unknown. */
export function ageAtSolve(problem: MathProblem): number | null {
  if (problem.yearPosed === null) return null;
  const solveYear = parseInt(problem.solveDate.slice(0, 4), 10);
  if (Number.isNaN(solveYear)) return null;
  return solveYear - problem.yearPosed;
}
