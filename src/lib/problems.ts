// VibeMathed data model.
//
// This is a hand-curated (not scraped) record of math problems resolved with
// an AI model in the loop. The DATABASE is the single source of truth - the
// site renders from Prisma reads, and `src/data/problems.json` is only the
// seed baseline and disaster-recovery snapshot (refreshed by `npm run
// db:export`, consumed by `npm run db:seed`; nothing reads it at runtime).
// Every entry must cite a real, checkable source; if a result is disputed or
// not yet peer-reviewed, say so in `verification` rather than omitting it.
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

/// How much of the mathematics the model actually contributed - orthogonal to
/// `resolution` (what happened to the problem) and `verification` (how
/// trustworthy the claim is). Classification takes the authors' own disclosure
/// at face value; when a disclosure is vague, the LOWER tier applies. Below
/// the bottom tier - writing, proofreading, figures, routine code checks - an
/// entry is out of scope entirely, so there is no tier for it.
export type AiContribution =
  | "ai-discovered" // the model produced the central proof or object
  | "ai-co-developed" // named, essential steps came from the model
  | "ai-assisted"; // instrumental but human-led (search/verification tooling)

export const AI_CONTRIBUTIONS: AiContribution[] = [
  "ai-discovered",
  "ai-co-developed",
  "ai-assisted",
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

// How CHECKED the mathematics is, strongest to weakest. Deliberately
// orthogonal to `publication` (where the claim lives): a Lean-verified result
// can live in an unrefereed preprint or a bare company announcement, and the
// old single ladder conflated the two.
export type VerificationStatus =
  | "lean-verified" // formal proof machine-checked in Lean (strongest)
  | "expert-verified" // independently checked and endorsed by named domain experts
  | "site-confirmed" // erdosproblems.com's official status marks it solved (not Lean)
  | "unreviewed" // nobody independent has checked the mathematics yet
  | "contested"; // actively disputed or partially walked back

/// Where the claim lives in the scholarly pipeline - orthogonal to
/// `verification`.
export type PublicationStatus =
  | "announcement" // blog post, repository, tracker page or social post only
  | "preprint" // a manuscript on arXiv or similar
  | "peer-reviewed"; // accepted by a journal or conference

export const PUBLICATION_STATUSES: PublicationStatus[] = [
  "announcement",
  "preprint",
  "peer-reviewed",
];

/// HOW the resolution was achieved - the nature of the decisive step, which
/// proved/disproved cannot express (a proof of X is a disproof of not-X; the
/// interesting distinction is object vs certificate vs theory).
export type ResolutionMethod =
  | "construction" // an explicit object settles it (counterexample, witness)
  | "computation" // a finite certificate or exhaustive case analysis
  | "argument"; // a conceptual proof

export const RESOLUTION_METHODS: ResolutionMethod[] = [
  "construction",
  "computation",
  "argument",
];

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
  /**
   * Degree of AI involvement (see AiContribution). Null on entries not yet
   * classified - the axis postdates most of the catalog, and an unclassified
   * entry must render as "unknown", never as a default tier.
   */
  aiContribution?: AiContribution | null;
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
  /** Where the claim lives in the publication pipeline; null = unmigrated. */
  publication?: PublicationStatus | null;
  /** How the resolution was achieved; null = not yet classified. */
  resolutionMethod?: ResolutionMethod | null;
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
   * AI-estimated significance of the problem BEFORE the solve, 0-100 in steps
   * of 5 against the anchored ladder documented in the methodology (Riemann
   * hypothesis = 100). A curator measurement like renownLangs - assigned at
   * review with the published prompt, never self-reported. Null = not yet
   * assessed; renders as a dash, never as a default score.
   */
  significance?: number | null;
  /** One-line justification for the significance score. */
  significanceNote?: string | null;
  /**
   * Disclosed cost of producing the result in whole US dollars, or null -
   * which is the overwhelming majority, because almost nobody publishes it.
   * Never estimated from model pricing; only recorded when a source says it.
   */
  solveCostUsd?: number | null;
  /** What the figure covers and where it came from. */
  solveCostNote?: string | null;
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
  /// ISO timestamp of when the entry was added to the record (row creation) -
  /// distinct from `solveDate`, which is when the mathematics happened.
  addedAt: string;
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

/// What the client-side entry cards receive: ONLY the fields the list
/// actually renders, filters or sorts on. The full MathProblem used to be
/// serialized per card, which shipped long unused strings (aiRole, citations,
/// source names, raw TeX) for every entry - at 232 entries that was most of a
/// 1.7 MB page.
///
/// `statementHtml` is populated only for the first page of the default sort;
/// deeper entries ship `hasStatement: true` with a null html and the client
/// fetches the full slug->html map once from /api/statements, off the
/// critical path.
export interface CardEntry {
  slug: string;
  name: string;
  problemNumber: number | null;
  field: string | null;
  fieldGroup: FieldGroup | null;
  hasStatement: boolean;
  statementHtml: string | null;
  posedBy: string | null;
  yearPosed: number | null;
  solveType: SolveType;
  resolution: ResolutionStatus;
  claimIssueNote: string | null;
  aiContribution: AiContribution | null;
  solveDate: string;
  model: string;
  modelMaker: string | null;
  humanCollaborators: string[];
  verification: VerificationStatus;
  verificationNote: string | null;
  /** Where the claim lives in the publication pipeline; null = unmigrated. */
  publication?: PublicationStatus | null;
  /** How the resolution was achieved; null = not yet classified. */
  resolutionMethod?: ResolutionMethod | null;
  significance: number | null;
  significanceNote: string | null;
  solveCostUsd: number | null;
  resultNote: string | null;
  ageNote: string | null;
  upvotes: number;
  downvotes: number;
  score: number;
  score7d: number;
  score30d: number;
  comments7d: number;
  comments30d: number;
  commentCount: number;
  submittedBy: string | null;
  addedAt: string;
}

const SOLVE_TYPES: SolveType[] = ["proved", "disproved"];
const VERIFICATION_STATUSES: VerificationStatus[] = [
  "lean-verified",
  "expert-verified",
  "site-confirmed",
  "unreviewed",
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
  for (const key of ["renownNote", "resultNote", "ageNote", "claimIssueNote", "significanceNote"]) {
    if (p[key] !== undefined && p[key] !== null && typeof p[key] !== "string") {
      throw new Error(`${where}: "${key}" must be a string or null when present`);
    }
  }
  if (p.significance !== undefined && p.significance !== null) {
    const s = p.significance;
    if (typeof s !== "number" || !Number.isInteger(s) || s < 0 || s > 100) {
      throw new Error(`${where}: "significance" must be an integer 0-100 when present`);
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
  // Optional: entries predating the axis carry no value at all.
  if (
    p.aiContribution !== undefined &&
    p.aiContribution !== null &&
    !AI_CONTRIBUTIONS.includes(p.aiContribution as AiContribution)
  ) {
    throw new Error(
      `${where}: "aiContribution" must be one of ${AI_CONTRIBUTIONS.join(", ")} when present`,
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
  if (
    p.publication !== undefined &&
    p.publication !== null &&
    !PUBLICATION_STATUSES.includes(p.publication as PublicationStatus)
  ) {
    throw new Error(
      `${where}: "publication" must be one of ${PUBLICATION_STATUSES.join(", ")} when present`,
    );
  }
  if (
    p.resolutionMethod !== undefined &&
    p.resolutionMethod !== null &&
    !RESOLUTION_METHODS.includes(p.resolutionMethod as ResolutionMethod)
  ) {
    throw new Error(
      `${where}: "resolutionMethod" must be one of ${RESOLUTION_METHODS.join(", ")} when present`,
    );
  }

  return p as unknown as MathProblem;
}

/** Years a problem was open before resolution, or null if the posed year is unknown. */
export function ageAtSolve(problem: Pick<MathProblem, "yearPosed" | "solveDate">): number | null {
  if (problem.yearPosed === null) return null;
  const solveYear = parseInt(problem.solveDate.slice(0, 4), 10);
  if (Number.isNaN(solveYear)) return null;
  return solveYear - problem.yearPosed;
}
