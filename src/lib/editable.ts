// Which entry fields signed-in users may edit, and how each is validated.
//
// Shared by the edit form and the server action, so the form cannot offer a
// field the server would reject - and, more importantly, the server never
// trusts the form: it whitelists against this same list.
//
// WHAT IS DELIBERATELY NOT EDITABLE, and why:
//
//   slug          URL identity. Changing it breaks every existing link, the
//                 sitemap and any inbound citation. Renaming an entry changes
//                 `name`, not the slug.
//   problemNumber Identity link to erdosproblems.com/<n>.
//   solveType     "Proved" vs "disproved" is the entry's headline claim.
//   renownLangs   Documented as a frozen snapshot on purpose, so coverage
//                 triggered BY a solution can never inflate the score after
//                 the fact. It is a measurement with a methodology, not a fact
//                 to be corrected - self-reporting would defeat the design.
//   status        Publication state - a moderation concern, not a content one.
//
// `verification` IS editable, deliberately. It looks like the field most worth
// protecting, but the trust ladder is factual and time-varying - a preprint
// gets refereed, an announcement gets expert-checked, a result gets disputed -
// and those transitions are exactly what a reader notices first. Freezing it
// makes entries go stale, which costs more credibility than the vandalism it
// would prevent. Locking the tier while leaving `verificationNote` open was
// also incoherent: it let the prose say "now peer-reviewed" while the badge
// still said "preprint". Changing the tier requires updating the note in the
// same edit (see `update-problem.ts`), and every change is in the changelog.

import { FIELD_GROUPS, type LinkRef, type MathProblem } from "@/lib/problems";

export type EditableKey =
  | "name"
  | "shortName"
  | "field"
  | "fieldGroup"
  | "resolution"
  | "aiContribution"
  | "claimIssueNote"
  | "statement"
  | "formalStatement"
  | "formalStatementSourceUrl"
  | "posedBy"
  | "yearPosed"
  | "solveDate"
  | "model"
  | "modelMaker"
  | "humanCollaborators"
  | "aiRole"
  | "verification"
  | "publication"
  | "resolutionMethod"
  | "verificationNote"
  | "solveCostUsd"
  | "solveCostNote"
  | "resultNote"
  | "ageNote"
  | "citations"
  | "citationsPaper"
  | "citationsSource"
  | "citationsUrl"
  | "sourceUrl"
  | "sourceName"
  | "links";

export type FieldKind =
  | "text"
  | "textarea"
  | "number"
  | "list"
  | "url"
  | "choice"
  /// One link per line, "Label | https://url". Parsed by `parseLinks`.
  | "links";

export interface FieldSpec {
  key: EditableKey;
  label: string;
  kind: FieldKind;
  /// Empty is not allowed for these.
  required?: boolean;
  help?: string;
  maxLength?: number;
  /// For `choice` fields. The server validates against exactly these values.
  options?: { value: string; label: string }[];
}

/// Resolution statuses - what happened to the problem itself. Editable for the
/// same reason `verification` is: an entry moves through these over its life
/// (candidate gets accepted, a resolved claim gets retracted), and freezing the
/// status is exactly how a record goes stale. Like the verification tier, a
/// change must be explained in the verification note in the same edit.
export const RESOLUTION_OPTIONS = [
  { value: "resolved", label: "Resolved" },
  { value: "partial", label: "Partial result" },
  { value: "variant", label: "Variant only" },
  { value: "candidate", label: "Candidate (review pending)" },
  { value: "retracted", label: "Retracted" },
];

export const FIELD_GROUP_OPTIONS = FIELD_GROUPS.map((g) => ({ value: g, label: g }));

/// Degree of AI involvement, strongest first. Deliberately NOT required:
/// entries predating the axis are unclassified (null), and forcing a value on
/// every unrelated edit would just farm inaccurate answers. Below the bottom
/// tier an entry is out of scope, so "none of these" cannot be selected.
export const AI_CONTRIBUTION_OPTIONS = [
  { value: "ai-discovered", label: "AI-discovered" },
  { value: "ai-co-developed", label: "AI co-developed" },
  { value: "ai-assisted", label: "AI-assisted" },
];

/// The verification trust ladder, strongest first: how checked the
/// mathematics is.
export const VERIFICATION_OPTIONS = [
  { value: "lean-verified", label: "Lean-verified" },
  { value: "expert-verified", label: "Independently expert-verified" },
  { value: "site-confirmed", label: "Site-confirmed" },
  { value: "unreviewed", label: "Unreviewed" },
  { value: "contested", label: "Contested" },
];

/// Where the claim lives in the scholarly pipeline.
export const PUBLICATION_OPTIONS = [
  { value: "announcement", label: "Announcement" },
  { value: "preprint", label: "Preprint" },
  { value: "peer-reviewed", label: "Peer-reviewed" },
];

/// How the resolution was achieved: an explicit object, a finite certificate
/// or exhaustive case analysis, or a conceptual proof.
export const RESOLUTION_METHOD_OPTIONS = [
  { value: "construction", label: "Construction (explicit object)" },
  { value: "computation", label: "Computation (finite certificate)" },
  { value: "argument", label: "Argument (conceptual proof)" },
];

export const EDITABLE_FIELDS: FieldSpec[] = [
  { key: "name", label: "Name", kind: "text", required: true, maxLength: 200 },
  {
    key: "shortName",
    label: "Short name",
    kind: "text",
    required: true,
    maxLength: 60,
    help: "Compact label used on chart axes and narrow layouts.",
  },
  {
    key: "fieldGroup",
    label: "Field",
    kind: "choice",
    required: true,
    options: FIELD_GROUP_OPTIONS,
    help: "The bucket the field filter groups by.",
  },
  {
    key: "field",
    label: "Field detail",
    kind: "text",
    maxLength: 80,
    help: "Free-text subfield shown on the card, e.g. Additive combinatorics.",
  },
  {
    key: "resolution",
    label: "Status",
    kind: "choice",
    required: true,
    options: RESOLUTION_OPTIONS,
    help: "What happened to the problem. Changing this requires updating the verification note in the same edit.",
  },
  {
    key: "aiContribution",
    label: "AI contribution",
    kind: "choice",
    options: AI_CONTRIBUTION_OPTIONS,
    help: "How much of the mathematics the model contributed, going by the authors' own disclosure - pick the lower tier when it is vague. Writing or proofreading alone is out of scope entirely.",
  },
  {
    key: "claimIssueNote",
    label: "Claim issue",
    kind: "textarea",
    maxLength: 1000,
    help: "Only when a documented issue exists with the claim (refuted lemma, misformalized statement). Renders as a visible flag.",
  },
  {
    key: "statement",
    label: "Statement",
    kind: "textarea",
    maxLength: 1200,
    help: "Plain-language statement. Math works: $inline$ or $$display$$.",
  },
  {
    key: "formalStatement",
    label: "Formal statement",
    kind: "textarea",
    maxLength: 6000,
    help: "The problem as formalized, verbatim - usually the Lean statement, not the proof. Paste only the definitions and the theorem, so a reader can check it says what the problem says.",
  },
  {
    key: "formalStatementSourceUrl",
    label: "Formal statement source",
    kind: "url",
    help: "Where it was copied from. Required if a formal statement is given.",
  },
  { key: "posedBy", label: "Posed by", kind: "text", maxLength: 200 },
  { key: "yearPosed", label: "Year posed", kind: "number", help: "Four-digit year, or blank if unknown." },
  {
    key: "solveDate",
    label: "Solve date",
    kind: "text",
    required: true,
    help: "YYYY, YYYY-MM or YYYY-MM-DD. For a range, the completion date.",
  },
  { key: "model", label: "Model", kind: "text", required: true, maxLength: 120 },
  { key: "modelMaker", label: "Vendor", kind: "text", maxLength: 120 },
  {
    key: "humanCollaborators",
    label: "Collaborators",
    kind: "list",
    help: "Comma-separated names.",
  },
  {
    key: "aiRole",
    label: "What the AI did",
    kind: "textarea",
    maxLength: 1500,
    help: "Math works here too.",
  },
  {
    key: "verification",
    label: "Verification",
    kind: "choice",
    required: true,
    options: VERIFICATION_OPTIONS,
    help: "How checked the mathematics is. Changing this requires updating the note below in the same edit, so the reason is on record.",
  },
  {
    key: "publication",
    label: "Publication",
    kind: "choice",
    options: PUBLICATION_OPTIONS,
    help: "Where the claim lives: a bare announcement, a preprint, or a peer-reviewed venue. Changing this also requires updating the verification note.",
  },
  {
    key: "resolutionMethod",
    label: "Method",
    kind: "choice",
    options: RESOLUTION_METHOD_OPTIONS,
    help: "The decisive step: an explicit object, a finite certificate or case analysis, or a conceptual proof. Classify by what the result hinged on.",
  },
  {
    key: "verificationNote",
    label: "Verification note",
    kind: "textarea",
    maxLength: 1500,
    help: "The prose explaining how strongly this result is checked.",
  },
  {
    key: "solveCostUsd",
    label: "Disclosed cost (USD)",
    kind: "number",
    help: "Whole dollars, only when a source actually states what the result cost. Never estimate it from model pricing - leave blank if undisclosed.",
  },
  {
    key: "solveCostNote",
    label: "Cost note",
    kind: "text",
    maxLength: 300,
    help: "What the figure covers and where it came from, e.g. an aggregate across several results.",
  },
  {
    key: "resultNote",
    label: "Result qualifier",
    kind: "text",
    maxLength: 200,
    help: "Short caveat for results that aren't cleanly proved/disproved.",
  },
  { key: "ageNote", label: "Age footnote", kind: "text", maxLength: 400 },
  { key: "citations", label: "Citations", kind: "number", help: "Looked-up count, or blank." },
  { key: "citationsPaper", label: "Cited paper", kind: "text", maxLength: 300 },
  { key: "citationsSource", label: "Citation source", kind: "text", maxLength: 120 },
  { key: "citationsUrl", label: "Citation URL", kind: "url" },
  { key: "sourceUrl", label: "Source URL", kind: "url", required: true },
  { key: "sourceName", label: "Source name", kind: "text", required: true, maxLength: 200 },
  {
    key: "links",
    label: "More links",
    kind: "links",
    help: "Beyond the primary source: Lean repositories, independent proofs of the same theorem, verifiers, community records.",
  },
];

export const EDITABLE_KEYS = EDITABLE_FIELDS.map((f) => f.key);

/// Form values are all strings; the server parses per `kind`.
export type EditableValues = Record<EditableKey, string>;

export const PROTECTED_FIELDS_NOTE =
  "Result, notability, the Erdős number and the URL slug are curator-only. Everything else, including the verification tier, is yours to correct.";

/// Seeds the edit form from an entry. Pure, so the entry page can build this
/// from data it already has instead of querying again.
///
/// The `Pick` also makes TypeScript prove every EditableKey really exists on
/// MathProblem - a typo in the field list fails to compile rather than silently
/// producing a blank input.
export function toEditableValues(source: Pick<MathProblem, EditableKey>): EditableValues {
  const out = {} as EditableValues;
  for (const spec of EDITABLE_FIELDS) {
    if (spec.kind === "links") {
      // Carried through the string-keyed form values as JSON; the row editor
      // parses and re-serializes it, and `parseLinks` validates on the server.
      out[spec.key] = encodeLinks(source.links ?? []);
      continue;
    }
    const value = source[spec.key];
    out[spec.key] = Array.isArray(value)
      ? value.join(", ")
      : value === null || value === undefined
        ? ""
        : String(value);
  }
  return out;
}

export const MAX_LINKS = 8;

/// Serializes link rows for transport through the string-keyed form values.
export function encodeLinks(links: LinkRef[]): string {
  return links.length ? JSON.stringify(links) : "";
}

/// Reads the form value back into rows for the editor. Never throws - a
/// malformed value renders as no rows rather than breaking the form.
export function decodeLinks(raw: string): LinkRef[] {
  if (!raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((l) => l && typeof l === "object")
      .map((l) => ({ label: String(l.label ?? ""), url: String(l.url ?? "") }));
  } catch {
    return [];
  }
}

/// Validates the submitted link rows. Rows left completely blank are dropped
/// (the editor always keeps one empty row available), but a half-filled row
/// is an error rather than silent data loss.
export function parseLinks(
  raw: string,
): { ok: true; value: LinkRef[] } | { ok: false; error: string } {
  const rows = decodeLinks(raw).filter((l) => l.label.trim() || l.url.trim());
  if (rows.length > MAX_LINKS) {
    return { ok: false, error: `At most ${MAX_LINKS} extra links.` };
  }
  const value: LinkRef[] = [];
  for (const row of rows) {
    const label = row.label.trim();
    const url = row.url.trim();
    if (!label || label.length > 120) {
      return { ok: false, error: "Every link needs a label of at most 120 characters." };
    }
    if (!isHttpUrl(url)) {
      return {
        ok: false,
        error: `Link URL must start with http:// or https:// ("${url.slice(0, 40)}").`,
      };
    }
    value.push({ label, url });
  }
  return { ok: true, value };
}

/// Accepts "2026", "2026-07" or "2026-07-12".
export function isValidSolveDate(v: string): boolean {
  if (!/^\d{4}(-\d{2}(-\d{2})?)?$/.test(v)) return false;
  const [y, m, d] = v.split("-").map(Number);
  if (y < 1000 || y > 3000) return false;
  if (m !== undefined && (m < 1 || m > 12)) return false;
  if (d !== undefined && (d < 1 || d > 31)) return false;
  return true;
}

export function isHttpUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}
