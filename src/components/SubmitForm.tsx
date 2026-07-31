"use client";

import { useState } from "react";
import Link from "next/link";
import { submitProblem } from "@/app/actions/submit-problem";
import {
  SUBMISSION_FIELDS,
  emptySubmission,
  type SubmissionValues,
} from "@/lib/submission";
import { EntryFields } from "@/components/EntryFields";
import { useViewer } from "@/components/ViewerProvider";

export function SubmitForm() {
  const { signedIn, loaded, isAdmin } = useViewer();
  const [values, setValues] = useState<SubmissionValues>(emptySubmission);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

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
    setDone(true);
  }

  if (!loaded) {
    return (
      <div className="h-40 rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)]" />
    );
  }

  if (!signedIn) {
    return (
      <p className="rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3 text-sm text-[var(--ink-secondary)]">
        <Link href="/sign-in" className="text-[var(--accent-blue)] hover:underline">
          Sign in
        </Link>{" "}
        to submit an entry. You submit under a pseudonym.
      </p>
    );
  }

  if (done) {
    return (
      <div className="rounded-md border border-[var(--status-good)] bg-[color-mix(in_srgb,var(--status-good)_8%,transparent)] px-4 py-3.5">
        <p className="text-sm text-[var(--ink)]">Thanks - your entry is in the queue.</p>
        <p className="mt-1 text-xs text-[var(--ink-secondary)]">
          It stays private until a reviewer approves it. Once live it will credit you
          by pseudonym.
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
          {!isAdmin && " You can submit up to three entries per day."} Full
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

      <div className="mt-5">
        <EntryFields
          fields={SUBMISSION_FIELDS}
          values={values}
          onChange={(key, value) =>
            setValues((v) => ({ ...v, [key]: value }) as SubmissionValues)
          }
          idPrefix="submit"
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[var(--hairline)] pt-4">
        <button
          type="button"
          onClick={submit}
          disabled={saving}
          className="rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-3.5 py-2 text-sm text-[var(--ink)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] disabled:opacity-40"
        >
          {saving ? "Submitting…" : "Submit for review"}
        </button>
        {error && <span className="text-xs text-[var(--status-critical)]">{error}</span>}
      </div>
    </div>
  );
}
