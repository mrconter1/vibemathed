// User-submitted entries.
//
// A submission proposes a whole entry and nothing goes live until an admin
// approves it, so the form asks for two things the edit form does not: the
// result (proved/disproved) and the Erdős number. Both are entry identity
// rather than facts that drift, so they are fixed at creation and curator-only
// afterwards. The verification tier is NOT in that group - it is editable
// everywhere, because it genuinely changes over an entry's life.
//
// `renownLangs` is never asked for. It is a frozen Wikipedia-langlinks snapshot
// with strict attribution rules, so it stays a curator measurement - new
// entries start at 0 until it is looked up.

import { EDITABLE_FIELDS, type EditableKey, type FieldSpec } from "@/lib/editable";

export type SubmissionKey = EditableKey | "solveType" | "problemNumber" | "submitterNote";

export type SubmissionFieldSpec = Omit<FieldSpec, "key"> & { key: SubmissionKey };

const SOLVE_TYPE_FIELD: SubmissionFieldSpec = {
  key: "solveType",
  label: "Result",
  kind: "choice",
  required: true,
  options: [
    { value: "proved", label: "Proved" },
    { value: "disproved", label: "Disproved" },
    // Rare, and offered anyway: a submitter with an independence result has
    // nowhere honest to put it otherwise, and the two-option list was quietly
    // pushing them toward "proved".
    { value: "independent", label: "Independent of the axioms" },
  ],
};

const PROBLEM_NUMBER_FIELD: SubmissionFieldSpec = {
  key: "problemNumber",
  label: "Erdős number",
  kind: "number",
  help: "If this is a numbered Erdős problem. Blank otherwise.",
};

/// For the reviewer, not the entry. A submitter who already knows about a
/// related or overlapping entry - a duplicate, a weaker prior result, an
/// attribution question - had nowhere to say so: `aiRole` is about the model,
/// `resultNote` publishes, and everything else on the form is a fact about
/// the mathematics. Never shown on the published entry and not editable
/// afterwards; if it matters to a reader, the reviewer moves it into a field
/// that publishes (typically `resultNote`) rather than leaving it here.
const SUBMITTER_NOTE_FIELD: SubmissionFieldSpec = {
  key: "submitterNote",
  label: "Anything else worth knowing",
  kind: "textarea",
  maxLength: 1000,
  help: "For the reviewer, not the entry - a duplicate you noticed, a related result, anything that doesn't fit above. Not published.",
};

/// The submission form: name and short name first, then the three fields
/// fixed at creation, then everything an editor could later change.
///
/// Relations are NOT offered here: the picker excludes the entry being
/// edited, and a submission has no slug yet to exclude. Anyone who wants
/// to relate their new entry can do it from the entry page the moment it
/// publishes, like any other edit.
export const SUBMISSION_FIELDS: SubmissionFieldSpec[] = [
  ...EDITABLE_FIELDS.slice(0, 2), // name, shortName
  PROBLEM_NUMBER_FIELD,
  SOLVE_TYPE_FIELD,
  ...EDITABLE_FIELDS.slice(2).filter((f) => f.kind !== "relations"),
  SUBMITTER_NOTE_FIELD,
];

/// The form in four parts, not one list of 32 fields.
///
/// The order is by who can answer, and the split is measured rather than
/// guessed. Across the first 23 real submissions, everything in the first
/// three groups was filled 78-100% of the time; every field in the fourth was
/// filled by 17% or fewer, and four of them by nobody at all. Putting those
/// nine behind a disclosure takes the form from 32 visible fields to 23
/// without removing a single capability.
///
/// The Erdős number is in that last group deliberately. Only 9% of submitters
/// have one, but it cannot simply be dropped: 131 entries carry it and the
/// finder dedupes Erdős problems on this field rather than by parsing slugs.
/// Its problem was position, not existence - it used to be the third question
/// on the form, so nine submitters in ten were asked something irrelevant
/// before being asked what they had found.
export interface SubmissionGroup {
  title: string;
  help: string;
  keys: SubmissionKey[];
  /// Collapsed by default, for the group almost nobody needs.
  collapsed?: boolean;
}

export const SUBMISSION_GROUPS: SubmissionGroup[] = [
  {
    title: "The result",
    help: "What was solved, and where it is written down. Only you can supply this.",
    keys: ["name", "shortName", "statement", "solveType", "sourceUrl", "sourceName", "solveDate"],
  },
  {
    title: "The AI's part",
    help: "Which model, what it actually contributed, and how checked the mathematics is.",
    keys: ["model", "modelMaker", "aiRole", "aiContribution", "verification", "verificationNote", "publication"],
  },
  {
    title: "Context",
    help: "Helpful but not essential - a reviewer can fill or correct any of it.",
    keys: [
      "fieldGroup",
      "field",
      "resolution",
      "resolutionMethod",
      "posedBy",
      "yearPosed",
      "humanCollaborators",
      "links",
      "resultNote",
      "submitterNote",
    ],
  },
  {
    title: "Rarely needed",
    help: "Skip unless one genuinely applies. Most entries leave every one of these blank.",
    collapsed: true,
    keys: ["problemNumber", "ageNote", "claimIssueNote", "solveCostUsd", "solveCostNote", "citations", "citationsPaper", "citationsSource", "citationsUrl"],
  },
];

// A field dropped from every group would vanish from the form silently, so
// the partition is checked rather than trusted.
const GROUPED = SUBMISSION_GROUPS.flatMap((g) => g.keys);
const ALL_KEYS = SUBMISSION_FIELDS.map((f) => f.key);
const missing = ALL_KEYS.filter((k) => !GROUPED.includes(k));
const dupes = GROUPED.filter((k, i) => GROUPED.indexOf(k) !== i);
if (missing.length || dupes.length) {
  throw new Error(
    `SUBMISSION_GROUPS must partition the fields exactly. Missing: ${missing.join(", ") || "none"}. Duplicated: ${dupes.join(", ") || "none"}.`,
  );
}

/// Draft persistence key. A submission is long enough that losing it to an
/// accidental reload, or to the round trip through sign-in, is the difference
/// between an entry and an abandoned tab.
export const SUBMISSION_DRAFT_KEY = "vibemathed:submit-draft";

export type SubmissionValues = Record<SubmissionKey, string>;

export function emptySubmission(): SubmissionValues {
  const out = {} as SubmissionValues;
  for (const spec of SUBMISSION_FIELDS) out[spec.key] = "";
  return out;
}

/// Submission throttle: up to SUBMISSIONS_PER_WINDOW entries per person per
/// rolling 24 hours. Admins are exempt. Generous enough for a productive
/// contributor with several results (it happens), still a cap on spam - and
/// note that curator-entered rows credited to an account count against its
/// quota too, since the check is by submitter id.
/// Cap on the note a curator leaves with a decision. Now one number with
/// every other kind of curator mail - see MESSAGE_MAX in src/lib/messages.ts.
export { MESSAGE_MAX as REVIEW_MESSAGE_MAX } from "@/lib/messages";

export const SUBMISSION_WINDOW_MS = 24 * 60 * 60 * 1000;
/// Raised from 3 to 10. Three was set when the queue was the bottleneck; the
/// people actually hitting it turned out to be the regulars sending several
/// good entries in a sitting, which is the traffic this site wants, not the
/// flooding the throttle exists to stop.
export const SUBMISSIONS_PER_WINDOW = 10;

/// URL-safe id derived from the entry name. Uniqueness is enforced by the
/// caller against the database.
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
