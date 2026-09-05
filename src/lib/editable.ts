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
//   status        Publication state - a moderation concern, not a content one.
//
// CURATOR-ONLY, in CURATOR_FIELDS below: editable, but not by the people whose
// entries they score.
//
//   renownLangs   A Wikipedia-langlinks count, and part of how notable an
//                 entry looks. Self-reporting it would let a submitter inflate
//                 their own entry, which is why it was locked outright at
//                 first. But locked outright it could not be corrected either,
//                 and a reader who finds a dedicated article we missed has no
//                 way to get it recorded. A curator can now fix it; nobody
//                 else can touch it.
//   renownNote    Says what the count does and does not include, so it is only
//                 meaningful in the same hands as the count.
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

import { inferLinkKind, isLinkKind } from "@/lib/link-kinds";
import { encodeRelations } from "@/lib/relation-kinds";
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
  | "links"
  | "relations"
  | "renownLangs"
  | "renownNote"
  | "significanceNote";

export type FieldKind =
  | "text"
  | "textarea"
  | "number"
  | "list"
  | "url"
  | "choice"
  /// One link per line, "Label | https://url". Parsed by `parseLinks`.
  | "links"
  /// Typed edges to other entries, JSON rows of { to, kind, note }. Parsed by
  /// `parseRelations` in src/lib/relation-kinds.ts.
  | "relations";

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
  /// No "$" allowed: this field renders in plain-text surfaces (browser
  /// tabs, RSS, search, pickers, hover cards) where $...$ shows as raw
  /// LaTeX source. Enforced by both the edit and submission parsers, and
  /// EntryFields warns live while typing. Math in these fields is written
  /// in ASCII notation instead: L^p, n=5, H_125.
  plainText?: boolean;
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
  { value: "lean-checked", label: "Lean-checked, statement unaudited" },
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
  {
    key: "name",
    label: "Name",
    kind: "text",
    required: true,
    maxLength: 200,
    help: "Math renders: $inline$ works here and shows properly on the site. In browser tabs, feeds and search the math degrades to plain text automatically.",
  },
  {
    // Math is allowed here too. The one surface that cannot render it - SVG
    // chart axes - flattens through deTeX instead, which its label code
    // already did; keeping the field ASCII for that one consumer just made
    // the highlights and related-entries rows read like source code.
    key: "shortName",
    label: "Short name",
    kind: "text",
    required: true,
    maxLength: 60,
    help: "Compact label for highlights, related-entry rows and chart axes. Math works: $inline$ renders everywhere except chart axes, where it degrades to plain text.",
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
    // Spelled out after two abstracts were pasted here in one night. The
    // field is the question, not the answer: what was proved belongs under
    // "What was actually shown", and the abstract belongs in the source.
    help: "The problem as it was posed, in plain language. Not the paper's abstract, and not what was proved - that goes under \"What was actually shown\". Math works: $inline$ or $$display$$.",
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
    help: "What the figure covers and where it came from, e.g. an aggregate across several results. Hover-bubble text, so plain text only - no math.",
  },
  {
    // Renamed from "Result qualifier", and the cap went 200 -> 1000, because
    // the field had outgrown both. It began as a one-line caveat for results
    // that are not cleanly proved or disproved, but the entry page gives it
    // its own section headed "What was actually shown", and curators write it
    // that way: 31 of 204 stored values were over the old 200, several past
    // 600. The limit was describing a field that no longer existed.
    key: "resultNote",
    label: "What was actually shown",
    kind: "textarea",
    maxLength: 1000,
    help: "What the result does and does not settle: the caveat, the scope, what stays open. Math works: $inline$ or $$display$$.",
  },
  {
    key: "ageNote",
    label: "Age footnote",
    kind: "text",
    maxLength: 400,
    help: "Shown in a hover bubble, so plain text only - write π/2, not $\\pi/2$. Math renders in the statement and the prose notes, not here.",
  },
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
  {
    key: "relations",
    label: "Related entries",
    kind: "relations",
    help: "Typed connections to other catalog entries - a series, the same work resolving both, a special case. Each needs a short note saying why; it shows when a reader hovers the link. Plain text, no math.",
  },
];

/// Fields only a curator may write. Same shape as the rest, kept apart so the
/// server can whitelist against exactly one of the two lists depending on who
/// is asking, rather than checking a flag per field.
export const CURATOR_FIELDS: FieldSpec[] = [
  {
    key: "renownLangs",
    label: "Wikipedia languages",
    kind: "number",
    help: "Language editions with an article dedicated to THIS problem. 0 means no dedicated article, not unknown.",
  },
  {
    key: "renownNote",
    label: "Wikipedia note",
    kind: "textarea",
    maxLength: 300,
    help: "What the count leaves out, when it needs saying.",
  },
  {
    // Was on no spec list at all, so nothing capped it and the longest stored
    // value had reached 1072 characters. Curator-only for the same reason
    // `renownLangs` is: it scores the entry, and the people whose entries it
    // scores must not write it.
    key: "significanceNote",
    label: "Significance note",
    kind: "textarea",
    maxLength: 600,
    help: "Why the score is what it is, against the anchor ladder. Hover-bubble text, so plain text only - no math.",
  },
];

export const EDITABLE_KEYS = EDITABLE_FIELDS.map((f) => f.key);
export const CURATOR_KEYS = CURATOR_FIELDS.map((f) => f.key);

/// What one editor is allowed to write.
export function fieldsFor(isCurator: boolean): FieldSpec[] {
  return isCurator ? [...EDITABLE_FIELDS, ...CURATOR_FIELDS] : EDITABLE_FIELDS;
}

/// Form values are all strings; the server parses per `kind`.
export type EditableValues = Record<EditableKey, string>;

export const PROTECTED_FIELDS_NOTE =
  "Result, significance, the Erdős number and the URL slug are curator-only. Everything else, including the verification tier, is yours to correct.";

/// Seeds the edit form from an entry. Pure, so the entry page can build this
/// from data it already has instead of querying again.
///
/// The `Pick` also makes TypeScript prove every EditableKey really exists on
/// MathProblem - a typo in the field list fails to compile rather than silently
/// producing a blank input.
export function toEditableValues(source: Pick<MathProblem, EditableKey>): EditableValues {
  const out = {} as EditableValues;
  for (const spec of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) {
    if (spec.kind === "links") {
      // Carried through the string-keyed form values as JSON; the row editor
      // parses and re-serializes it, and `parseLinks` validates on the server.
      out[spec.key] = encodeLinks(source.links ?? []);
      continue;
    }
    if (spec.kind === "relations") {
      // Same JSON transport as links; `parseRelations` validates on the
      // server. Only the OUTGOING edges - incoming ones belong to the other
      // entry's edit dialog.
      out[spec.key] = encodeRelations(source.relations ?? []);
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

/// Extra links per entry, beyond the primary source. Was 8; raised on
/// 5 September 2026 when the K8-e release arrived carrying six links (proof,
/// checker, problem record, review archive, companion, PR) and the two
/// Astra disproofs each needed the compared statement, the development, the
/// Formal Conjectures source and the evaluation repository on top of the
/// announcement. Eight was low for exactly the well-documented entries the
/// site wants more of. Sixteen keeps a cap, since a link list is curated
/// evidence rather than a bibliography, and the editor still adds rows one at
/// a time.
export const MAX_LINKS = 16;

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
      // The kind rides along. Without it the editor's own round trip through
      // the form value dropped what the picker had just set, so a link could
      // only ever be saved as whatever the URL happened to imply.
      .map((l) => ({
        label: String(l.label ?? ""),
        url: String(l.url ?? ""),
        kind: isLinkKind(l.kind) ? l.kind : "other",
      }));
  } catch {
    return [];
  }
}

/// Validates the submitted link rows. Rows left completely blank are dropped
/// (the editor always keeps one empty row available), but a half-filled row
/// is an error rather than silent data loss.
///
/// `primaryUrl` is the entry's own source. A link may not repeat it: the
/// source is the citation and the links are everything else, and without the
/// rule there are two homes for "the paper" and no way to choose between
/// them. Two entries had drifted into listing the same PDF twice, which
/// rendered as a paper line above a Paper bucket containing the same paper.
/// Rejected rather than silently dropped, because the submitter chose to type
/// it and deserves to be told which rule it broke.
export function parseLinks(
  raw: string,
  primaryUrl?: string,
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
    if (primaryUrl && sameDocument(url, primaryUrl)) {
      return {
        ok: false,
        error:
          "That link is already the entry's primary source. The source is the citation; " +
          "list only the other material here.",
      };
    }
    if (value.some((v) => sameDocument(v.url, url))) {
      return { ok: false, error: `That link is listed twice ("${label}").` };
    }
    // An unrecognised or missing kind is not an error: the picker offers a
    // fixed list, so anything else came from an older draft or a hand-built
    // payload, and "other" is the honest reading of it.
    value.push({ label, url, kind: isLinkKind(row.kind) ? row.kind : inferLinkKind(url, label) });
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

/// A URL reduced to the document it points at, for deciding whether two links
/// are the same source.
///
/// Exact string comparison is not enough. The same paper reaches the catalog
/// as `arxiv.org/abs/2608.06538` and `arxiv.org/pdf/2608.06538v2`, with and
/// without a trailing slash, and with a tracking query on the end.
function documentKey(url: string): string {
  let s = url.trim().toLowerCase().replace(/[#?].*$/, "").replace(/\/+$/, "");
  s = s.replace(/^https?:\/\//, "").replace(/^www\./, "");
  const arxiv = s.match(/arxiv\.org\/(?:abs|pdf)\/(\d{4}\.\d{4,5})/);
  if (arxiv) return `arxiv:${arxiv[1]}`;
  return s.replace(/\.pdf$/, "");
}

/// Whether two URLs point at the same document.
export function sameDocument(a: string, b: string): boolean {
  return documentKey(a) === documentKey(b);
}
