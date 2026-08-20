"use client";

import { useEffect, useRef, useState } from "react";
import { DISCORD_INVITE } from "@/lib/community";
import Link from "next/link";
import { submitProblem } from "@/app/actions/submit-problem";
import {
  SUBMISSION_DRAFT_KEY,
  SUBMISSION_FIELDS,
  SUBMISSION_GROUPS,
  SUBMISSIONS_PER_WINDOW,
  emptySubmission,
  type SubmissionValues,
} from "@/lib/submission";
import { DuplicateHint } from "@/components/DuplicateHint";
import { EntryFields } from "@/components/EntryFields";
import { useViewer } from "@/components/ViewerProvider";



export function SubmitForm() {
  const { signedIn, loaded, isAdmin } = useViewer();
  const [values, setValues] = useState<SubmissionValues>(emptySubmission);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [restored, setRestored] = useState(false);
  // Nothing is written until a draft has been restored, or the empty initial
  // state would overwrite a saved draft on first paint.
  const ready = useRef(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SUBMISSION_DRAFT_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Record<string, unknown>;
        const clean = emptySubmission();
        let any = false;
        // Only known keys, only strings: a stale draft from an older field
        // set must not inject anything the form cannot render.
        for (const spec of SUBMISSION_FIELDS) {
          const v = saved[spec.key];
          if (typeof v === "string" && v !== "") {
            clean[spec.key] = v;
            any = true;
          }
        }
        if (any) {
          setValues(clean);
          setRestored(true);
        }
      }
    } catch {
      // A corrupt draft is not worth failing the page over.
    }
    ready.current = true;
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!ready.current) return;
    const filled = Object.values(values).some((v) => v !== "");
    try {
      if (filled) localStorage.setItem(SUBMISSION_DRAFT_KEY, JSON.stringify(values));
      else localStorage.removeItem(SUBMISSION_DRAFT_KEY);
    } catch {
      // Private browsing and full quotas both land here; the form still works.
    }
  }, [values]);

  function discardDraft() {
    setValues(emptySubmission());
    setRestored(false);
    try {
      localStorage.removeItem(SUBMISSION_DRAFT_KEY);
    } catch {}
  }

  async function submit() {
    setSaving(true);
    setError(null);
    const result = await submitProblem(values);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setValues(emptySubmission());
    try {
      localStorage.removeItem(SUBMISSION_DRAFT_KEY);
    } catch {}
    setDone(true);
  }

  // Deliberately NOT gated on `loaded`. The form used to render a blank
  // placeholder until the viewer fetch resolved, so someone arriving on a slow
  // connection met an empty box on the one page where the whole point is to
  // start typing. Nothing above the submit button depends on who you are.

  if (done) {
    return (
      <div className="rounded-md border border-[var(--status-good)] bg-[color-mix(in_srgb,var(--status-good)_8%,transparent)] px-4 py-3.5">
        <p className="text-sm text-[var(--ink)]">Thanks - your entry is in the queue.</p>
        <p className="mt-1 text-xs text-[var(--ink-secondary)]">
          It stays private until a reviewer approves it. Once live it will credit you
          by pseudonym.
        </p>
        {/* The highest-intent moment on the site: someone has just
            contributed and is waiting on a human. Worth one line. */}
        <p className="mt-2 text-xs text-[var(--ink-secondary)]">
          Want to talk it through while it waits?{" "}
          <a
            href={DISCORD_INVITE}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent-blue)] hover:underline"
          >
            Join the Discord
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-3 text-xs text-[var(--accent-blue)] hover:underline"
        >
          Submit another
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3">
        <p className="text-xs leading-relaxed text-[var(--ink-secondary)]">
          What belongs here: a precisely stated open question whose answer is
          now a proved or disproved theorem, with AI in the loop - any field of
          mathematics, theoretical computer science included. Not in scope:
          formalizations of known human results, empirical attacks, or improved
          heuristics. Every entry needs a real, checkable source - an
          announcement, an arXiv preprint or an article, not a summary of a
          summary. If a result is contested, unreviewed or partial, say so in
          the status and verification fields rather than leaving it out.
          Submissions are reviewed before they appear.
          {/* Read from the constant, never spelled out: this line said
              "three" for a while after the limit became five, which is the
              kind of small lie that costs a submission. */}
          {!isAdmin &&
            ` You can submit up to ${SUBMISSIONS_PER_WINDOW} entries per day.`}{" "}
          Full
          criteria in the{" "}
          <Link
            href="/methodology"
            className="text-[var(--accent-blue)] hover:underline"
          >
            methodology
          </Link>
          .
        </p>
      </div>

      {restored && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--accent-orange)] bg-[color-mix(in_srgb,var(--accent-orange)_8%,transparent)] px-3.5 py-2.5">
          <span className="text-xs text-[var(--ink-secondary)]">
            Restored an unfinished draft from this browser.
          </span>
          <button
            type="button"
            onClick={discardDraft}
            className="text-xs text-[var(--accent-blue)] hover:underline"
          >
            Start over
          </button>
        </div>
      )}

      {/* Grouped rather than one run of 32 inputs, and the rarely-needed nine
          sit behind a disclosure. Native <details> so it opens without JS. */}
      {SUBMISSION_GROUPS.map((group) => {
        const fields = SUBMISSION_FIELDS.filter((f) => group.keys.includes(f.key));
        const body = (
          <EntryFields
            fields={fields}
            values={values}
            onChange={(key, value) =>
              setValues((v) => ({ ...v, [key]: value }) as SubmissionValues)
            }
            idPrefix="submit"
            // Under the title only. Duplicates are the commonest avoidable
            // rejection, and the title is the field that can predict one.
            renderAfter={(key) =>
              key === "name" ? (
                <DuplicateHint
                  value={values.name ?? ""}
                  // The source is the stronger signal of the two: titles
                  // diverge when two people file the same paper, arXiv ids do
                  // not. Passed from under the title so the warning still
                  // appears where the submitter is looking.
                  sourceUrl={values.sourceUrl ?? ""}
                />
              ) : null
            }
          />
        );

        if (group.collapsed) {
          return (
            <details
              key={group.title}
              className="group mt-5 rounded-md border border-[var(--hairline)] bg-[var(--paper)]"
            >
              <summary className="cursor-pointer list-none px-3.5 py-2.5 text-sm text-[var(--ink-secondary)] transition-colors hover:text-[var(--accent-blue)]">
                <span
                  aria-hidden
                  className="mr-1.5 inline-block transition-transform group-open:rotate-90"
                >
                  ▶
                </span>
                {group.title}
                <span className="ml-1.5 text-xs text-[var(--ink-muted)]">{group.help}</span>
              </summary>
              <div className="border-t border-[var(--hairline)] px-3.5 py-4">{body}</div>
            </details>
          );
        }

        return (
          <section key={group.title} className="mt-6">
            <h2 className="font-serif text-base text-[var(--ink)]">{group.title}</h2>
            <p className="mt-0.5 mb-3 text-xs text-[var(--ink-muted)]">{group.help}</p>
            {body}
          </section>
        );
      })}

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[var(--hairline)] pt-4">
        {!loaded ? (
          <button
            type="button"
            disabled
            className="rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-3.5 py-2 text-sm text-[var(--ink-muted)] opacity-60"
          >
            Submit for review
          </button>
        ) : signedIn ? (
          <button
            type="button"
            onClick={submit}
            disabled={saving}
            className="rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-3.5 py-2 text-sm text-[var(--ink)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] disabled:opacity-40"
          >
            {saving ? "Submitting…" : "Submit for review"}
          </button>
        ) : (
          // The wall moved from arrival to submission. Someone who has typed a
          // submission has a reason to sign in; someone who has just landed
          // does not, and the draft is in localStorage so the round trip
          // through sign-in costs them nothing.
          <Link
            href="/sign-in"
            className="rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-3.5 py-2 text-sm text-[var(--ink)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
          >
            Sign in to submit
          </Link>
        )}
        {loaded && !signedIn && (
          <span className="text-xs text-[var(--ink-muted)]">
            Your draft is kept in this browser. You submit under a pseudonym.
          </span>
        )}
        {error && <span className="text-xs text-[var(--status-critical)]">{error}</span>}
      </div>
    </div>
  );
}
