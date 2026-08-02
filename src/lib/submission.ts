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

export type SubmissionKey = EditableKey | "solveType" | "problemNumber";

export type SubmissionFieldSpec = Omit<FieldSpec, "key"> & { key: SubmissionKey };

const SOLVE_TYPE_FIELD: SubmissionFieldSpec = {
  key: "solveType",
  label: "Result",
  kind: "choice",
  required: true,
  options: [
    { value: "proved", label: "Proved" },
    { value: "disproved", label: "Disproved" },
  ],
};

const PROBLEM_NUMBER_FIELD: SubmissionFieldSpec = {
  key: "problemNumber",
  label: "Erdős number",
  kind: "number",
  help: "If this is a numbered Erdős problem. Blank otherwise.",
};

/// The submission form: name and short name first, then the two fields fixed at
/// creation, then everything an editor could later change.
export const SUBMISSION_FIELDS: SubmissionFieldSpec[] = [
  ...EDITABLE_FIELDS.slice(0, 2), // name, shortName
  PROBLEM_NUMBER_FIELD,
  SOLVE_TYPE_FIELD,
  ...EDITABLE_FIELDS.slice(2),
];

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
/// Cap on the note a curator leaves with a decision. Long enough for a
/// real reason, short enough that it stays a message and not a review.
export const REVIEW_MESSAGE_MAX = 600;

export const SUBMISSION_WINDOW_MS = 24 * 60 * 60 * 1000;
export const SUBMISSIONS_PER_WINDOW = 3;

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
