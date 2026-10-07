// The entry list's search language, and the matcher that runs it.
//
// Pure and dependency-free so the same code runs in the browser (the list
// filters as you type) and on the server (/api/search, for agents and
// scripts). The catalog is small enough - about a thousand entries - that a
// linear pass over prebuilt, normalised documents takes a few milliseconds,
// which is faster than any index lookup over the network would be.
//
// Syntax, all of it optional and combinable:
//
//   kakeya restriction          every word must match somewhere (AND)
//   "free group factor"         an exact phrase
//   -conditional                a word that must NOT match
//   hadwiger OR sidorenko       either side (OR binds tighter than AND)
//   name:hodge                  restrict a word to one field
//   field:"number theory"       ...quoted values work with fields too
//   sig:>50  year:<1950         numeric comparisons: > >= < <= = and ranges
//   sig:40..60  open:>=30       (sig = significance, year = year posed,
//   solved:2026-09              open = years open, solved = date prefix)
//
// Fields: name, field, posed (posedby), model, people (by), status,
// verification (tier), result (proved/disproved), source, collection, text
// (all prose: statement, result, notes), number (Erdős-style problem number).
// A bare word searches every text field. Matching ignores case and accents,
// and math markup is flattened first, so "erdos" finds Erdős and "L_p" finds
// "$L_p$".

export type TextField =
  | "name"
  | "field"
  | "posed"
  | "model"
  | "people"
  | "status"
  | "verification"
  | "result"
  | "source"
  | "collection"
  | "text"
  | "number";

export type NumberField = "sig" | "year" | "open";

export interface SearchDoc {
  slug: string;
  /// Normalised (see `fold`) text per field. `all` is every field joined.
  name: string;
  field: string;
  posed: string;
  model: string;
  people: string;
  status: string;
  verification: string;
  result: string;
  source: string;
  collection: string;
  text: string;
  number: string;
  all: string;
  sig: number | null;
  year: number | null;
  open: number | null;
  solved: string;
}

type Term =
  | { kind: "text"; field: TextField | null; value: string; neg: boolean }
  | { kind: "num"; field: NumberField; min: number; max: number; neg: boolean }
  | { kind: "date"; prefix: string; neg: boolean };

/// A parsed query: AND over groups, OR within a group.
export interface ParsedQuery {
  groups: Term[][];
  /// Positive free-text values, for relevance scoring and highlighting.
  words: string[];
}

const FIELD_ALIASES: Record<string, TextField | NumberField | "solved"> = {
  name: "name",
  title: "name",
  field: "field",
  area: "field",
  posed: "posed",
  posedby: "posed",
  poser: "posed",
  model: "model",
  ai: "model",
  people: "people",
  by: "people",
  author: "people",
  status: "status",
  resolution: "status",
  verification: "verification",
  tier: "verification",
  verified: "verification",
  result: "result",
  source: "source",
  collection: "collection",
  release: "collection",
  text: "text",
  number: "number",
  no: "number",
  sig: "sig",
  significance: "sig",
  year: "year",
  posedyear: "year",
  open: "open",
  age: "open",
  solved: "solved",
  date: "solved",
};

/// Lowercase, strip accents and math delimiters, collapse whitespace. Applied
/// to documents once and to every query term, so both sides agree.
export function fold(s: string | null | undefined): string {
  if (!s) return "";
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\\(?:mathbb|mathrm|mathcal|operatorname|text|mathbf)\b/g, "")
    .replace(/[$\\{}]/g, "")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/// Split a raw query into tokens, keeping quoted phrases (with or without a
/// field prefix) together.
function tokenize(raw: string): string[] {
  const out: string[] = [];
  const re = /(-?[a-z]+:"[^"]*"?|-?"[^"]*"?|\S+)/gi;
  for (const m of raw.matchAll(re)) out.push(m[0]);
  return out;
}

function parseNumber(field: NumberField, spec: string, neg: boolean): Term | null {
  const s = spec.trim();
  let m = s.match(/^(\d+(?:\.\d+)?)\.\.(\d+(?:\.\d+)?)$/);
  if (m) return { kind: "num", field, min: Number(m[1]), max: Number(m[2]), neg };
  m = s.match(/^(>=|<=|>|<|=)?(\d+(?:\.\d+)?)$/);
  if (!m) return null;
  const v = Number(m[2]);
  switch (m[1]) {
    case ">":
      return { kind: "num", field, min: v + 1e-9, max: Infinity, neg };
    case ">=":
      return { kind: "num", field, min: v, max: Infinity, neg };
    case "<":
      return { kind: "num", field, min: -Infinity, max: v - 1e-9, neg };
    case "<=":
      return { kind: "num", field, min: -Infinity, max: v, neg };
    default:
      return { kind: "num", field, min: v, max: v, neg };
  }
}

export function parseQuery(raw: string): ParsedQuery {
  const groups: Term[][] = [];
  const words: string[] = [];
  let pendingOr = false;
  for (const tok of tokenize(raw)) {
    if (tok === "OR" || tok === "|") {
      pendingOr = groups.length > 0;
      continue;
    }
    let t = tok;
    let neg = false;
    if (t.startsWith("-") && t.length > 1) {
      neg = true;
      t = t.slice(1);
    }
    let term: Term | null = null;
    const fm = t.match(/^([a-z]+):(.*)$/i);
    if (fm && FIELD_ALIASES[fm[1].toLowerCase()]) {
      const target = FIELD_ALIASES[fm[1].toLowerCase()];
      const value = fm[2].replace(/^"|"$/g, "");
      if (!value) continue;
      if (target === "sig" || target === "year" || target === "open") {
        term = parseNumber(target, value, neg);
      } else if (target === "solved") {
        term = { kind: "date", prefix: value.trim(), neg };
      } else {
        term = { kind: "text", field: target, value: fold(value), neg };
      }
    } else {
      const value = fold(t.replace(/^"|"$/g, ""));
      if (!value) continue;
      term = { kind: "text", field: null, value, neg };
    }
    if (!term) continue;
    if (term.kind === "text" && !term.neg) words.push(term.value);
    if (pendingOr && groups.length > 0) groups[groups.length - 1].push(term);
    else groups.push([term]);
    pendingOr = false;
  }
  return { groups, words };
}

function termMatches(doc: SearchDoc, t: Term): boolean {
  let hit: boolean;
  if (t.kind === "num") {
    const v = doc[t.field];
    hit = v !== null && v >= t.min && v <= t.max;
  } else if (t.kind === "date") {
    hit = doc.solved.startsWith(t.prefix);
  } else if (t.field === "number") {
    // A problem number is an identity, not a substring: number:3 must not
    // find #13.
    hit = doc.number === t.value.replace(/^#/, "");
  } else {
    hit = (t.field ? doc[t.field] : doc.all).includes(t.value);
  }
  return t.neg ? !hit : hit;
}

export function matches(doc: SearchDoc, q: ParsedQuery): boolean {
  for (const group of q.groups) {
    if (!group.some((t) => termMatches(doc, t))) return false;
  }
  return true;
}

/// Higher is better. A word in the name outweighs one in the field or the
/// people, which outweighs one buried in the prose; a whole-word match beats
/// a substring. Used to order results when a search is active.
export function relevance(doc: SearchDoc, q: ParsedQuery): number {
  let score = 0;
  for (const w of q.words) {
    const whole = new RegExp(`(^|[^a-z0-9])${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^a-z0-9]|$)`);
    if (doc.name.includes(w)) score += whole.test(doc.name) ? 12 : 8;
    if (doc.number === w) score += 12;
    if (doc.field.includes(w)) score += 4;
    if (doc.posed.includes(w) || doc.people.includes(w)) score += 4;
    if (doc.model.includes(w)) score += 3;
    if (doc.text.includes(w)) score += whole.test(doc.text) ? 2 : 1;
  }
  return score;
}

/// What a document is built from. Every field optional so callers can pass
/// what they have: the list has the card fields at once and the prose only
/// after the search index arrives.
export interface SearchSource {
  slug: string;
  name: string;
  shortName?: string | null;
  problemNumber?: number | null;
  field?: string | null;
  fieldGroup?: string | null;
  posedBy?: string | null;
  yearPosed?: number | null;
  model?: string | null;
  modelMaker?: string | null;
  humanCollaborators?: string[];
  submittedBy?: string | null;
  resolution?: string | null;
  resolutionLabel?: string | null;
  verification?: string | null;
  verificationLabel?: string | null;
  solveType?: string | null;
  solveDate?: string | null;
  significance?: number | null;
  yearsOpen?: number | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  linkLabels?: string[];
  collectionLabel?: string | null;
  prose?: (string | null | undefined)[];
}

export function buildDoc(s: SearchSource): SearchDoc {
  const name = fold([s.name, s.shortName].filter(Boolean).join(" "));
  const field = fold([s.field, s.fieldGroup].filter(Boolean).join(" "));
  const posed = fold(s.posedBy);
  const model = fold([s.model, s.modelMaker].filter(Boolean).join(" "));
  const people = fold([...(s.humanCollaborators ?? []), s.submittedBy].filter(Boolean).join(" "));
  const status = fold([s.resolution, s.resolutionLabel].filter(Boolean).join(" "));
  const verification = fold([s.verification, s.verificationLabel].filter(Boolean).join(" "));
  const result = fold(s.solveType);
  const source = fold([s.sourceName, s.sourceUrl, ...(s.linkLabels ?? [])].filter(Boolean).join(" "));
  const collection = fold(s.collectionLabel);
  const text = fold((s.prose ?? []).filter(Boolean).join(" "));
  const number = s.problemNumber != null ? String(s.problemNumber) : "";
  return {
    slug: s.slug,
    name,
    field,
    posed,
    model,
    people,
    status,
    verification,
    result,
    source,
    collection,
    text,
    number,
    all: [name, field, posed, model, people, status, verification, result, source, collection, text, number ? `#${number} ${number}` : ""].join(" \u0001 "),
    sig: s.significance ?? null,
    year: s.yearPosed ?? null,
    open: s.yearsOpen ?? null,
    solved: s.solveDate ?? "",
  };
}

/// Run a query over documents: filter, and rank by relevance when the query
/// has free text. Stable for ties, so the caller's order survives.
export function search(docs: SearchDoc[], raw: string): { slug: string; score: number }[] {
  const q = parseQuery(raw);
  const out: { slug: string; score: number; i: number }[] = [];
  docs.forEach((d, i) => {
    if (matches(d, q)) out.push({ slug: d.slug, score: relevance(d, q), i });
  });
  out.sort((a, b) => b.score - a.score || a.i - b.i);
  return out.map(({ slug, score }) => ({ slug, score }));
}
