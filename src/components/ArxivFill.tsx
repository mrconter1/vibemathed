"use client";

// "Paste an arXiv link" above the submission form (issue #5). Fills the
// fields transcription actually gets wrong - source URL, source name, date,
// authors - and offers the paper's title as a starting title. Everything
// stays editable and nothing submits. The abstract is shown for reference,
// never written into Statement: that field is the problem as posed.
//
// Fields the submitter has already typed are left alone unless they ask to
// overwrite, so a paste after ten minutes of work cannot wipe it.

import { useState } from "react";
import { fetchArxiv, type ArxivPaper } from "@/app/actions/arxiv";
import type { SubmissionValues } from "@/lib/submission";

export function ArxivFill({
  values,
  onFill,
}: {
  values: SubmissionValues;
  /// Applies a partial set of field values.
  onFill: (patch: Partial<SubmissionValues>) => void;
}) {
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paper, setPaper] = useState<ArxivPaper | null>(null);
  const [showAbstract, setShowAbstract] = useState(false);

  async function lookup(overwrite: boolean) {
    setBusy(true);
    setError(null);
    const res = await fetchArxiv(input);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    const p = res.paper;
    setPaper(p);
    const patch: Partial<SubmissionValues> = {};
    const set = (key: keyof SubmissionValues, v: string) => {
      if (overwrite || !values[key]) patch[key] = v;
    };
    set("sourceUrl", p.url);
    set("sourceName", "arXiv");
    set("solveDate", p.published);
    set("humanCollaborators", p.authors.join(", "));
    set("publication", "preprint");
    // The paper's title is a starting point for the entry name, which should
    // name the problem. Offered, not imposed: only when the name is empty.
    if (!values.name) patch.name = p.title;
    onFill(patch);
  }

  const filledCount = paper ? 4 + (values.name === paper.title ? 1 : 0) : 0;

  return (
    <div className="mb-5 rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3">
      <label htmlFor="arxiv-fill" className="text-xs font-medium text-[var(--ink)]">
        Start from an arXiv paper
      </label>
      <p className="mt-0.5 text-[11px] text-[var(--ink-muted)]">
        Fills the source, date and authors, and offers the title. You review every field
        before sending; nothing is submitted for you.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <input
          id="arxiv-fill"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void lookup(false);
            }
          }}
          placeholder="arxiv.org/abs/2608.30238 or 2608.30238"
          className="min-w-0 flex-1 rounded-md border border-[var(--hairline)] bg-[var(--paper)] px-3 py-1.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
        />
        <button
          type="button"
          disabled={busy || !input.trim()}
          onClick={() => void lookup(false)}
          className="rounded-md border border-[var(--hairline)] px-3 py-1.5 text-xs text-[var(--ink)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] disabled:opacity-40"
        >
          {busy ? "Looking up…" : "Fill"}
        </button>
        {paper && (
          <button
            type="button"
            disabled={busy}
            onClick={() => void lookup(true)}
            className="rounded-md px-2 py-1.5 text-xs text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] disabled:opacity-40"
            title="Replace what you already typed in those fields"
          >
            Overwrite
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-[var(--status-critical)]">{error}</p>}
      {paper && (
        <div className="mt-2 text-xs text-[var(--ink-secondary)]">
          <p>
            <span className="font-medium text-[var(--ink)]">{paper.title}</span>
            {" · "}
            {paper.authors.join(", ")}
            {" · "}
            {paper.published}
            {paper.primaryCategory ? ` · ${paper.primaryCategory}` : ""}
            {" · filled "}
            {filledCount} {filledCount === 1 ? "field" : "fields"}
          </p>
          {paper.mentionsModel ? (
            <p className="mt-1 text-[var(--ink-muted)]">
              The abstract mentions a model. Say what it did under &ldquo;What the AI
              did&rdquo;, from the paper&apos;s own disclosure.
            </p>
          ) : (
            <p className="mt-1 text-[var(--ink-muted)]">
              The abstract does not mention a model. The disclosure that counts is in the
              paper itself; if there is none, the entry will be declined.
            </p>
          )}
          <button
            type="button"
            onClick={() => setShowAbstract((s) => !s)}
            className="mt-1 text-[var(--accent-blue)] hover:underline"
          >
            {showAbstract ? "Hide abstract" : "Show abstract"}
          </button>
          {showAbstract && (
            <p className="mt-1 leading-relaxed text-[var(--ink-muted)]">
              {paper.abstract}
              <br />
              <span className="italic">
                For reference only. Statement is the problem as posed, not the abstract.
              </span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
