// Typed entry-to-entry relations.
//
// A relation is ONE directed row rendered from both sides: `from` shows the
// forward label, `to` shows the inverse. That is the property that scales -
// no mirror row to keep in sync, deleting is one row, and the two entry pages
// cannot disagree about whether they are related. Symmetric kinds simply use
// the same label in both directions.
//
// The vocabulary is small and curated on purpose. A relation graph is useful
// exactly in proportion to how sparse and typed it is; "related" alone tells
// a reader nothing, and a free-form vocabulary decays into that. Same
// string-not-enum convention as link-kinds.ts: adding a kind is an edit here,
// not a schema migration.
//
// Every relation carries a required NOTE saying why it exists - it renders in
// the hover card next to the target's name. Plain text, never math: it shows
// in a client-side bubble, which cannot run KaTeX (see StarNote).

export interface RelationKindSpec {
  value: string;
  /// Label on the entry the relation points FROM.
  forward: string;
  /// Label on the entry it points TO. Same as `forward` for symmetric kinds.
  inverse: string;
  /// Symmetric kinds read identically from both sides, and a reverse
  /// duplicate (B->A when A->B exists) is refused.
  symmetric: boolean;
  help: string;
}

export const RELATION_KINDS: RelationKindSpec[] = [
  {
    value: "continues",
    forward: "Continues",
    inverse: "Continued by",
    symmetric: false,
    help: "A later instalment of the same line of work. Points from the later entry to the earlier one.",
  },
  {
    value: "builds-on",
    forward: "Builds on",
    inverse: "Built on by",
    symmetric: false,
    help: "Uses the other entry's result or technique, or answers a question it left open.",
  },
  {
    value: "generalizes",
    forward: "Generalizes",
    inverse: "Special case of",
    symmetric: false,
    help: "The other entry is a special case of this one. Points from the general statement to the special one.",
  },
  {
    value: "same-work",
    forward: "Same work resolves both",
    inverse: "Same work resolves both",
    symmetric: true,
    help: "Both entries fall to the same paper or argument.",
  },
  {
    value: "same-result",
    forward: "Independent proof of the same result",
    inverse: "Independent proof of the same result",
    symmetric: true,
    help: "Two entries proving the same theorem by demonstrably different, independent routes.",
  },
  {
    value: "related",
    forward: "Related",
    inverse: "Related",
    symmetric: true,
    help: "A real connection none of the sharper kinds captures. The note must say what it is.",
  },
];

export const RELATION_KIND_VALUES = RELATION_KINDS.map((k) => k.value);

export function relationKind(value: string): RelationKindSpec | undefined {
  return RELATION_KINDS.find((k) => k.value === value);
}

/// Outgoing relations per entry. Same order of magnitude as MAX_LINKS: the
/// graph's value is that it is sparse and curated.
export const MAX_RELATIONS = 8;
/// The required why-this-link text. Mirrored by @db.String(200) on the column.
export const RELATION_NOTE_MAX = 200;
/// Mirrored by @db.String(30) on the column.
export const RELATION_KIND_MAX = 30;

/// One row as it travels through the string-keyed form values (and the JSON
/// dataset): the target is its public slug, resolved to an id on the server.
export interface RelationRef {
  to: string;
  kind: string;
  note: string;
}

/// Serializes rows for transport through a form value, like encodeLinks.
export function encodeRelations(relations: RelationRef[]): string {
  return relations.length ? JSON.stringify(relations) : "";
}

/// Reads the form value back into rows. Never throws - a malformed value
/// renders as no rows rather than breaking the form.
export function decodeRelations(raw: string): RelationRef[] {
  if (!raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((r) => r && typeof r === "object")
      .map((r) => ({
        to: String(r.to ?? ""),
        kind: RELATION_KIND_VALUES.includes(String(r.kind)) ? String(r.kind) : "related",
        note: String(r.note ?? ""),
      }));
  } catch {
    return [];
  }
}

/// Validates submitted rows. Blank rows are dropped (the editor keeps one
/// empty row available); a half-filled row is an error rather than silent
/// data loss. Target existence and reverse-duplicates need the database, so
/// the server action checks those - this validates everything else.
export function parseRelations(
  raw: string,
  ownSlug: string,
): { ok: true; value: RelationRef[] } | { ok: false; error: string } {
  const rows = decodeRelations(raw).filter((r) => r.to.trim() || r.note.trim());
  if (rows.length > MAX_RELATIONS) {
    return { ok: false, error: `At most ${MAX_RELATIONS} related entries.` };
  }
  const value: RelationRef[] = [];
  for (const row of rows) {
    const to = row.to.trim();
    const note = row.note.trim();
    if (!to) return { ok: false, error: "Every relation needs a target entry." };
    if (to === ownSlug) {
      return { ok: false, error: "An entry cannot relate to itself." };
    }
    if (!note) {
      return {
        ok: false,
        error: "Every relation needs a note saying why the two entries are connected.",
      };
    }
    if (note.length > RELATION_NOTE_MAX) {
      return { ok: false, error: `Relation notes are at most ${RELATION_NOTE_MAX} characters.` };
    }
    if (!RELATION_KIND_VALUES.includes(row.kind)) {
      return { ok: false, error: `"${row.kind}" is not a relation kind.` };
    }
    if (value.some((v) => v.to === to && v.kind === row.kind)) {
      return { ok: false, error: `That relation is listed twice ("${to}").` };
    }
    value.push({ to, kind: row.kind, note });
  }
  return { ok: true, value };
}
