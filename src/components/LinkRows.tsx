"use client";

// Repeatable label + URL rows for an entry's extra sources.
//
// The surrounding forms carry every field as a string, so rows are encoded as
// JSON in the form value and decoded here - the component owns the editing
// experience, the server still validates with `parseLinks`.

import { useState } from "react";
import { decodeLinks, encodeLinks, MAX_LINKS } from "@/lib/editable";
import { LINK_KINDS, inferLinkKind } from "@/lib/link-kinds";
import type { LinkRef } from "@/lib/problems";

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

export function LinkRows({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (next: string) => void;
}) {
  const rows = decodeLinks(value);
  // Rows whose kind the person actually chose, as opposed to one this
  // component guessed. Needed because the URL is TYPED, not pasted whole: a
  // guard of "only guess while the kind is still `other`" locked in `code` the
  // moment "github.com" appeared and never reconsidered when ".lean" followed.
  const [chosen, setChosen] = useState<Set<number>>(new Set());

  const commit = (next: LinkRef[]) => onChange(encodeLinks(next));

  const update = (i: number, patch: Partial<LinkRef>) =>
    commit(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  return (
    <div className="mt-1 space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          {/* What the link IS. First control in the row because it is the
              question with an answer: the label is free text, this is not,
              and it is what the icon and (later) the filters read. */}
          <select
            value={row.kind ?? "other"}
            onChange={(e) => {
              setChosen((prev) => new Set(prev).add(i));
              update(i, { kind: e.target.value });
            }}
            aria-label={`Link ${i + 1} kind`}
            className={`${inputClass} w-full sm:w-36`}
          >
            {LINK_KINDS.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
          <input
            id={i === 0 ? id : undefined}
            value={row.label}
            onChange={(e) => update(i, { label: e.target.value })}
            placeholder="Label"
            aria-label={`Link ${i + 1} label`}
            className={`${inputClass} flex-1 sm:w-1/4 sm:flex-none`}
          />
          <input
            value={row.url}
            onChange={(e) => {
              const url = e.target.value;
              // Re-guess on every keystroke until the picker is touched, so
              // a URL finished with ".lean" is not still classified from its
              // host. An explicit choice is never overruled.
              const kind = chosen.has(i) ? row.kind : inferLinkKind(url, row.label);
              update(i, { url, kind });
            }}
            placeholder="https://…"
            inputMode="url"
            aria-label={`Link ${i + 1} URL`}
            className={`${inputClass} flex-1`}
          />
          <button
            type="button"
            onClick={() => commit(rows.filter((_, idx) => idx !== i))}
            aria-label={`Remove link ${i + 1}`}
            className="shrink-0 rounded border border-[var(--hairline)] bg-[var(--paper-raised)] p-1.5 text-[var(--ink-muted)] transition-colors hover:border-[var(--status-critical)] hover:text-[var(--status-critical)]"
          >
            <Cross />
          </button>
        </div>
      ))}

      {rows.length < MAX_LINKS && (
        <button
          type="button"
          onClick={() => commit([...rows, { label: "", url: "", kind: "other" }])}
          className="inline-flex items-center gap-1.5 rounded border border-[var(--hairline)] bg-[var(--paper-raised)] px-2.5 py-1.5 text-xs text-[var(--ink-secondary)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
        >
          <Plus />
          {rows.length === 0 ? "Add a link" : "Add another"}
        </button>
      )}
    </div>
  );
}
