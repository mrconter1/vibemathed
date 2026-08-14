"use client";

// Repeatable kind + target + note rows for an entry's typed relations.
//
// Same transport contract as LinkRows: the surrounding form carries every
// field as a string, so rows travel as JSON in the form value and are decoded
// here. The server still validates with `parseRelations` and resolves slugs
// to ids, so nothing this component does is trusted.
//
// The target is picked by SEARCHING NAMES, not by typing a slug: nobody knows
// slugs, and a picker that needs one is a picker for the person who wrote the
// database. The search calls the same published-entries index the submission
// form's duplicate check uses; choosing a result stores its slug.

import { useEffect, useRef, useState } from "react";
import { searchEntriesForRelation } from "@/app/actions/similar";
import type { SimilarEntry } from "@/app/actions/similar";
import {
  decodeRelations,
  encodeRelations,
  MAX_RELATIONS,
  RELATION_KINDS,
  RELATION_NOTE_MAX,
  type RelationRef,
} from "@/lib/relation-kinds";

const inputClass =
  "w-full rounded border border-[var(--hairline)] bg-[var(--field)] px-2.5 py-1.5 text-sm text-[var(--ink)] transition-colors hover:border-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]";

function Plus() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
      <path d="M8 3v10M3 8h10" />
    </svg>
  );
}

function Cross() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
      <path d="M4 4l8 8M12 4l-8 8" />
    </svg>
  );
}

/// One row's target control: a chosen entry rendered as a removable chip, or
/// a search box with a result dropdown while still choosing.
function TargetPicker({
  slug,
  ownSlug,
  rowIndex,
  onPick,
  onClear,
}: {
  slug: string;
  ownSlug: string;
  rowIndex: number;
  onPick: (slug: string) => void;
  onClear: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SimilarEntry[]>([]);
  const [open, setOpen] = useState(false);
  // Out-of-order responses: a slow query for "sen" must not overwrite the
  // results for "sendov" that already landed. Bumped on every keystroke, so a
  // response is applied only if nothing was typed since it was sent.
  const seq = useRef(0);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 3) return;
    const mine = seq.current;
    const t = setTimeout(async () => {
      const found = await searchEntriesForRelation(q, ownSlug);
      // setState from an async callback, never from the effect body - and
      // only when this is still the latest query.
      if (seq.current === mine) {
        setResults(found);
        setOpen(true);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [query, ownSlug]);

  if (slug) {
    return (
      <span className="flex min-w-0 flex-1 items-center gap-1.5 rounded border border-[var(--hairline)] bg-[var(--paper-raised)] px-2.5 py-1.5 text-sm">
        <span className="truncate text-[var(--ink)]" title={slug}>
          {slug}
        </span>
        <button
          type="button"
          onClick={onClear}
          aria-label={`Change relation ${rowIndex + 1} target`}
          className="shrink-0 text-[var(--ink-muted)] transition-colors hover:text-[var(--status-critical)]"
        >
          <Cross />
        </button>
      </span>
    );
  }

  return (
    <span className="relative min-w-0 flex-1">
      <input
        value={query}
        onChange={(e) => {
          seq.current += 1;
          setQuery(e.target.value);
          // Below the search threshold the old results are stale, not
          // "still loading" - clear them here rather than in the effect.
          if (e.target.value.trim().length < 3) {
            setResults([]);
            setOpen(false);
          }
        }}
        onFocus={() => results.length > 0 && setOpen(true)}
        // Delayed so a click on a result lands before the list unmounts.
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder="Search entries by name…"
        aria-label={`Relation ${rowIndex + 1} target entry`}
        className={inputClass}
      />
      {open && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-56 overflow-y-auto rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] py-1 shadow-lg">
          {results.map((r) => (
            <li key={r.slug}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onPick(r.slug);
                  setQuery("");
                  setOpen(false);
                }}
                className="block w-full px-2.5 py-1.5 text-left text-sm text-[var(--ink)] transition-colors hover:bg-[var(--field)]"
              >
                {/* Pre-rendered on the server: names may carry $...$ math. */}
                <span
                  className="block truncate"
                  dangerouslySetInnerHTML={{ __html: r.nameHtml }}
                />
                <span className="block text-[11px] text-[var(--ink-muted)]">{r.solveDate}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </span>
  );
}

export function RelationRows({
  id,
  value,
  ownSlug,
  onChange,
}: {
  id: string;
  value: string;
  /// The entry being edited, excluded from search results.
  ownSlug: string;
  onChange: (next: string) => void;
}) {
  const rows = decodeRelations(value);
  const commit = (next: RelationRef[]) => onChange(encodeRelations(next));
  const update = (i: number, patch: Partial<RelationRef>) =>
    commit(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  return (
    <div className="mt-1 space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
            <select
              id={i === 0 ? id : undefined}
              value={row.kind}
              onChange={(e) => update(i, { kind: e.target.value })}
              aria-label={`Relation ${i + 1} kind`}
              className={`${inputClass} w-full sm:w-44`}
            >
              {RELATION_KINDS.map((k) => (
                <option key={k.value} value={k.value} title={k.help}>
                  {k.forward}
                </option>
              ))}
            </select>
            <TargetPicker
              slug={row.to}
              ownSlug={ownSlug}
              rowIndex={i}
              onPick={(slug) => update(i, { to: slug })}
              onClear={() => update(i, { to: "" })}
            />
            <button
              type="button"
              onClick={() => commit(rows.filter((_, idx) => idx !== i))}
              aria-label={`Remove relation ${i + 1}`}
              className="shrink-0 rounded border border-[var(--hairline)] bg-[var(--paper-raised)] p-1.5 text-[var(--ink-muted)] transition-colors hover:border-[var(--status-critical)] hover:text-[var(--status-critical)]"
            >
              <Cross />
            </button>
          </div>
          <input
            value={row.note}
            onChange={(e) => update(i, { note: e.target.value })}
            maxLength={RELATION_NOTE_MAX}
            placeholder="Why are these connected? Shown on hover. Plain text, no math."
            aria-label={`Relation ${i + 1} note`}
            className={inputClass}
          />
        </div>
      ))}

      {rows.length < MAX_RELATIONS && (
        <button
          type="button"
          onClick={() => commit([...rows, { to: "", kind: "related", note: "" }])}
          className="inline-flex items-center gap-1.5 rounded border border-[var(--hairline)] bg-[var(--paper-raised)] px-2.5 py-1.5 text-xs text-[var(--ink-secondary)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
        >
          <Plus />
          {rows.length === 0 ? "Add a related entry" : "Add another"}
        </button>
      )}
    </div>
  );
}
