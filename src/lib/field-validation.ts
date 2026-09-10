// The one implementation of "is this value allowed in this field".
//
// It used to live inside the update action, which meant the only way to run
// it was to be a signed-in human clicking Save. Curator scripts write
// straight to the database and so ran none of it, and the catalog collected
// rows the form would refuse: on 10 September 2026, twelve published entries
// held link sets that the save path rejects, so any edit to one of them
// failed with an error about a link the editor had never touched. Eleven of
// those were a link repeating the entry's own primary source; one was created
// by a review script the day before.
//
// So it lives here, importable by the server actions AND by scripts. A script
// that writes entry data is expected to call `checkStoredEntry` in its dry run
// and refuse to write when it fails - the same answer the form would give.

import { canonical, charLength } from "@/lib/char-length";
import {
  MAX_LINKS,
  isHttpUrl,
  isValidSolveDate,
  parseLinks,
  sameDocument,
  type FieldSpec,
} from "@/lib/editable";
import { parseRelations, type RelationRef } from "@/lib/relation-kinds";
import type { LinkRef } from "@/lib/problems";

/// The database value a form string maps to.
export type Parsed =
  | string
  | number
  | string[]
  | LinkRef[]
  | RelationRef[]
  | null;

export function parseField(
  spec: FieldSpec,
  raw: string,
  ownSlug: string,
): { ok: true; value: Parsed } | { ok: false; error: string } {
  // NFC as well as trim, so the value that gets counted below is the value
  // that gets stored. Without it a decomposed paste is measured one way and
  // written another, and two spellings of one visible name sit in the
  // catalog as different strings.
  const v = canonical(raw.trim());

  if (v === "") {
    if (spec.required)
      return { ok: false, error: `${spec.label} cannot be empty.` };
    const emptyArray =
      spec.kind === "list" ||
      spec.kind === "links" ||
      spec.kind === "relations";
    return { ok: true, value: emptyArray ? [] : null };
  }

  // charLength, not v.length: see src/lib/char-length.ts. Counting UTF-16
  // units refused notes the author had correctly counted as under the cap,
  // because blackboard bold and friends cost two units each.
  if (spec.maxLength && charLength(v) > spec.maxLength) {
    return {
      ok: false,
      error: `${spec.label} is too long: ${charLength(v)} characters, max ${spec.maxLength}.`,
    };
  }

  if (spec.plainText && v.includes("$")) {
    return {
      ok: false,
      error: `${spec.label} is plain text: write math in ASCII (L^p, n=5) rather than $...$, which renders as raw LaTeX in tabs, feeds and search.`,
    };
  }

  switch (spec.kind) {
    case "choice": {
      const allowed = (spec.options ?? []).map((o) => o.value);
      if (!allowed.includes(v)) {
        return { ok: false, error: `${spec.label} is not a valid option.` };
      }
      return { ok: true, value: v };
    }
    case "number": {
      if (!/^\d+$/.test(v))
        return { ok: false, error: `${spec.label} must be a whole number.` };
      const n = Number(v);
      if (spec.key === "yearPosed" && (n < 1000 || n > 3000)) {
        return { ok: false, error: "Year posed must be a four-digit year." };
      }
      return { ok: true, value: n };
    }
    case "url":
      if (!isHttpUrl(v))
        return {
          ok: false,
          error: `${spec.label} must start with http:// or https://.`,
        };
      return { ok: true, value: v };
    case "list":
      return {
        ok: true,
        value: v
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
    case "links":
      return parseLinks(v);
    case "relations":
      return parseRelations(v, ownSlug);
    case "text":
    case "textarea":
      if (spec.key === "solveDate" && !isValidSolveDate(v)) {
        return {
          ok: false,
          error: "Solve date must be YYYY, YYYY-MM or YYYY-MM-DD.",
        };
      }
      return { ok: true, value: v };
  }
}

/// A violation of the rules the edit form enforces, found in data that is
/// already stored.
export interface StoredViolation {
  field: string;
  problem: string;
}

/**
 * Check an entry's stored values the way the form would.
 *
 * Scripts call this before writing so they cannot leave behind a row that
 * the UI will later refuse to save. It takes values as they are stored,
 * rather than as form strings, because that is what a script has.
 */
export function checkStoredEntry(input: {
  fields?: Record<string, unknown>;
  specs?: FieldSpec[];
  links?: { label: string; url: string }[];
  sourceUrl?: string | null;
}): StoredViolation[] {
  const out: StoredViolation[] = [];
  const { fields = {}, specs = [], links, sourceUrl } = input;

  for (const spec of specs) {
    const v = fields[spec.key];
    if (v === undefined) continue;
    if (v === null || v === "") {
      if (spec.required)
        out.push({ field: spec.key, problem: "required but empty" });
      continue;
    }
    if (typeof v === "string") {
      const n = charLength(canonical(v));
      if (spec.maxLength && n > spec.maxLength)
        out.push({
          field: spec.key,
          problem: `${n} characters, max ${spec.maxLength}`,
        });
      if (spec.plainText && v.includes("$"))
        out.push({ field: spec.key, problem: "plain-text field contains $" });
      if (spec.kind === "choice") {
        const allowed = (spec.options ?? []).map((o) => o.value);
        if (!allowed.includes(v))
          out.push({
            field: spec.key,
            problem: `"${v}" is not an allowed option`,
          });
      }
      if (spec.kind === "url" && !isHttpUrl(v))
        out.push({ field: spec.key, problem: "not an http(s) URL" });
      if (spec.key === "solveDate" && !isValidSolveDate(v))
        out.push({
          field: spec.key,
          problem: "not YYYY, YYYY-MM or YYYY-MM-DD",
        });
    }
    if (
      typeof v === "number" &&
      spec.key === "yearPosed" &&
      (v < 1000 || v > 3000)
    )
      out.push({ field: spec.key, problem: "not a four-digit year" });
  }

  // Links carry the rules that actually bit: a link may not repeat the
  // primary source, and no two links may point at the same document. Both
  // compare by `sameDocument`, which normalises away tracking parameters -
  // which is how a "?utm_source=..." copy of the primary source slipped in
  // looking different.
  if (links) {
    if (links.length > MAX_LINKS)
      out.push({
        field: "links",
        problem: `${links.length} links, max ${MAX_LINKS}`,
      });
    const seen: string[] = [];
    for (const l of links) {
      if (!l.label || l.label.length > 120)
        out.push({
          field: "links",
          problem: `label ${l.label.length}/120: "${l.label.slice(0, 40)}"`,
        });
      if (!isHttpUrl(l.url))
        out.push({
          field: "links",
          problem: `not an http(s) URL: "${l.url.slice(0, 40)}"`,
        });
      if (sourceUrl && sameDocument(l.url, sourceUrl))
        out.push({
          field: "links",
          problem: `repeats the primary source: "${l.label.slice(0, 40)}"`,
        });
      if (seen.some((s) => sameDocument(s, l.url)))
        out.push({
          field: "links",
          problem: `duplicate of another link: "${l.label.slice(0, 40)}"`,
        });
      seen.push(l.url);
    }
  }
  return out;
}

/// `parseLinks` re-exported so a script can validate a link set exactly as
/// the form parses it, rather than approximating.
export { parseLinks };
