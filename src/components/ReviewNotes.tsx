"use client";

// Curators' notes under a submission on the review page. Internal: the
// submitter never sees these, the entry never shows them. See the ReviewNote
// model for why they exist now that review is a shared job.

import { useState } from "react";
import { REVIEW_NOTE_MAX, addReviewNote, type ReviewNoteView } from "@/app/actions/review-notes";

export function ReviewNotes({ slug, initial }: { slug: string; initial: ReviewNoteView[] }) {
  const [notes, setNotes] = useState(initial);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setBusy(true);
    setError(null);
    const res = await addReviewNote(slug, draft);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setNotes((n) => [...n, res.note]);
    setDraft("");
  }

  return (
    <div className="mt-3 border-t border-dashed border-[var(--hairline)] pt-2.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--ink-muted)]">
        Curator notes{notes.length > 0 ? ` (${notes.length})` : ""}
        <span className="ml-1.5 font-normal normal-case tracking-normal">
          - internal, the submitter does not see these
        </span>
      </p>
      {notes.length > 0 && (
        <ul className="mt-1.5 space-y-1.5">
          {notes.map((n) => (
            <li key={n.id} className="text-xs leading-relaxed text-[var(--ink-secondary)]">
              <span className="font-medium text-[var(--ink)]">{n.userName}</span>
              <span className="text-[var(--ink-muted)]"> · {n.createdAt}</span>
              <br />
              <span className="whitespace-pre-wrap">{n.body}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2 flex items-start gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={REVIEW_NOTE_MAX}
          rows={2}
          placeholder="Checked the source, waiting on the author about the tier…"
          className="min-h-9 flex-1 rounded-md border border-[var(--hairline)] bg-[var(--paper)] px-2.5 py-1.5 text-xs text-[var(--ink)] focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent-blue)]"
        />
        <button
          type="button"
          disabled={busy || !draft.trim()}
          onClick={submit}
          className="rounded-md border border-[var(--hairline)] px-2.5 py-1.5 text-xs text-[var(--ink)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] disabled:opacity-40"
        >
          {busy ? "…" : "Add note"}
        </button>
      </div>
      {error && <p className="mt-1 text-xs text-[var(--status-critical)]">{error}</p>}
    </div>
  );
}
