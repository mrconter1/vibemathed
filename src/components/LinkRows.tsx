"use client";

// Repeatable label + URL rows for an entry's extra sources.
//
// The surrounding forms carry every field as a string, so rows are encoded as
// JSON in the form value and decoded here - the component owns the editing
// experience, the server still validates with `parseLinks`.

import { decodeLinks, encodeLinks, MAX_LINKS } from "@/lib/editable";
import type { LinkRef } from "@/lib/problems";

const inputClass =
  "w-full rounded border border-[var(--hairline)] bg-white px-2.5 py-1.5 text-sm text-[var(--ink)] transition-colors hover:border-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]";

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

  const commit = (next: LinkRef[]) => onChange(encodeLinks(next));

  const update = (i: number, patch: Partial<LinkRef>) =>
    commit(rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  return (
    <div className="mt-1 space-y-2">
      {rows.map((row, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            id={i === 0 ? id : undefined}
            value={row.label}
            onChange={(e) => update(i, { label: e.target.value })}
            placeholder="Label"
            aria-label={`Link ${i + 1} label`}
            className={`${inputClass} sm:w-2/5`}
          />
          <input
            value={row.url}
            onChange={(e) => update(i, { url: e.target.value })}
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
          onClick={() => commit([...rows, { label: "", url: "" }])}
          className="inline-flex items-center gap-1.5 rounded border border-[var(--hairline)] bg-[var(--paper-raised)] px-2.5 py-1.5 text-xs text-[var(--ink-secondary)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
        >
          <Plus />
          {rows.length === 0 ? "Add a link" : "Add another"}
        </button>
      )}
    </div>
  );
}
