"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { submitProblem } from "@/app/actions/submit-problem";
import {
  SUBMISSION_DRAFT_KEY,
  SUBMISSION_FIELDS,
  SUBMISSION_GROUPS,
  emptySubmission,
  type SubmissionValues,
} from "@/lib/submission";
import { DuplicateHint } from "@/components/DuplicateHint";
import { EntryFields } from "@/components/EntryFields";
import { signInWithGitHub, signInWithGoogle } from "@/app/actions/auth";
import { useViewer } from "@/components/ViewerProvider";

/// Shown instead of the form when nobody is signed in.
///
/// The wall used to sit at the submit button, on the reasoning that a person
/// who has typed a submission has a reason to sign in and a person who has
/// just landed does not. The draft survives in localStorage, so nothing was
/// ever lost. But losing nothing is not the same as feeling safe: reaching
/// the end of a long form and meeting a login there reads as a bait and
/// switch, and no reassurance printed at that moment undoes it. Better to be
/// asked at the door.
function SignInWall() {
  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-5 py-6 sm:px-6">
      <h2 className="font-serif text-lg text-[var(--ink)]">Sign in to submit</h2>
      <p className="mt-2 max-w-prose text-sm leading-relaxed text-[var(--ink-secondary)]">
        One click, no forms. Submissions are reviewed before they go live, and
        the published entry credits you by pseudonym. The name and email on the
        account you use are never shown on the site.
      </p>

      <div className="mt-5 flex flex-col gap-2 sm:max-w-xs">
        <form action={signInWithGoogle}>
          {/* Back to the form after signing in, rather than the home page:
              the reader came here to submit something. */}
          <input type="hidden" name="redirectTo" value="/submit" />
          <button type="submit" className={providerBtn}>
            <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden>
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18z" />
              <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.01-2.34z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z" />
            </svg>
            Continue with Google
          </button>
        </form>
        <form action={signInWithGitHub}>
          {/* Back to the form after signing in, rather than the home page:
              the reader came here to submit something. */}
          <input type="hidden" name="redirectTo" value="/submit" />
          <button type="submit" className={providerBtn}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
            Continue with GitHub
          </button>
        </form>
      </div>

      <p className="mt-3 text-xs text-[var(--ink-muted)]">
        Either works. A shared verified email reaches the same account.
      </p>
    </div>
  );
}

const providerBtn =
  "inline-flex w-full items-center justify-center gap-2 rounded-md border border-[var(--hairline)] bg-[var(--paper)] px-4 py-2.5 text-sm text-[var(--ink)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]";


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

  const form = (
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
              key === "name" ? <DuplicateHint value={values.name ?? ""} /> : null
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

  // Once the viewer is known, React decides outright.
  if (loaded) return signedIn ? form : <SignInWall />;

  // Before that it is not known, and `loaded` only flips after a fetch, so
  // picking either one here flashes the wrong page at half the visitors. Ship
  // both and let the boot script's data-viewer attribute choose in CSS, the
  // same mechanism the header uses. No attribute means signed out, which is
  // right for a first visit and the cheaper mistake: a stranger sees the
  // invitation to sign in, rather than a member briefly seeing a wall.
  return (
    <>
      <div className="viewer-out">
        <SignInWall />
      </div>
      <div className="viewer-in-block">{form}</div>
    </>
  );
}
