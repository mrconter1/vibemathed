"use client";

// Near-matches for the title being typed on the submission form.
//
// Deliberately a panel under the field rather than an autocomplete overlay.
// An overlay has to be dismissed, steals the Enter key, and on a phone fights
// the on-screen keyboard for the same strip of screen; this just takes space
// when it has something to say and none when it does not. It never blocks
// submission - it is a warning, and the submitter is sometimes right.

import { useEffect, useState } from "react";
import { findSimilarEntries, type SimilarEntry } from "@/app/actions/similar";
import { TeX } from "@/components/TeX";

/// Long enough that a fast typist does not fire a query per keystroke, short
/// enough that the panel feels attached to the typing.
const DEBOUNCE_MS = 350;

const MIN_QUERY = 4;

export function DuplicateHint({ value }: { value: string }) {
  // Results carry the query they answer. Everything else falls out of that:
  // a stale response cannot overwrite a fresh one, and a title edited back
  // below the minimum length shows nothing without a state update to clear it.
  const [result, setResult] = useState<{ query: string; rows: SimilarEntry[] }>({
    query: "",
    rows: [],
  });
  /// The exact text whose matches were dismissed. Keyed rather than boolean so
  /// typing on brings the check back: the dismissal was about those titles,
  /// not about the feature.
  const [dismissedFor, setDismissedFor] = useState<string | null>(null);

  const text = value.trim();

  useEffect(() => {
    if (text.length < MIN_QUERY) return;
    let live = true;
    const timer = setTimeout(() => {
      findSimilarEntries(text).then((rows) => {
        if (live) setResult({ query: text, rows });
      });
    }, DEBOUNCE_MS);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [text]);

  const matches = result.query === text ? result.rows : [];
  if (dismissedFor === text || matches.length === 0) return null;

  return (
    <div className="mt-1.5 rounded border border-[var(--accent-orange)] bg-[color-mix(in_srgb,var(--accent-orange)_7%,transparent)] px-2.5 py-2">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-[11px] leading-snug text-[var(--ink-secondary)]">
          {matches.length === 1
            ? "One entry already looks close:"
            : `${matches.length} entries already look close:`}
        </p>
        <button
          type="button"
          onClick={() => setDismissedFor(text)}
          className="shrink-0 text-[11px] text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
        >
          Dismiss
        </button>
      </div>
      <ul className="mt-1 space-y-0.5">
        {matches.map((m) => (
          <li key={m.slug} className="leading-snug">
            <a
              href={`/problem/${m.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              // New tab, always: checking a possible duplicate must not
              // navigate away from a half-typed submission.
              className="text-xs text-[var(--accent-blue)] hover:underline"
            >
              <TeX>{m.name}</TeX>
            </a>{" "}
            <span className="font-mono text-[10px] text-[var(--ink-muted)]">
              {m.solveDate}
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-1.5 text-[11px] leading-snug text-[var(--ink-muted)]">
        Different problem? Carry on. The same one solved again by another model
        belongs on the existing entry as a comment, not as a new one.
      </p>
    </div>
  );
}
