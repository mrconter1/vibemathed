"use client";

// Flagging an entry for curator attention. The trigger is a small flag icon
// button that sits with the vote and edit controls in the entry header; the
// dialog collects a free-text explanation. Reports are private (they go to
// the curators, not the page) and capped at three per day per person.

import { useEffect, useState } from "react";
import Link from "next/link";
import { reportProblem } from "@/app/actions/report";
import { Icon } from "@/components/Icons";
import { useViewer } from "@/components/ViewerProvider";

/// Matches the vote buttons beside it: same border, radius and hover wash.
export const CORNER_ICON_BUTTON =
  "inline-flex h-8 w-8 items-center justify-center rounded border border-[var(--hairline)] text-[var(--ink-secondary)] transition-colors hover:border-[var(--ink-muted)] hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] hover:text-[var(--ink)]";

const BODY_MAX = 1000;

export function ReportEntryDialog({ slug }: { slug: string }) {
  const { signedIn, loaded } = useViewer();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lock background scroll while the dialog is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function openDialog() {
    setBody("");
    setError(null);
    setSent(false);
    setOpen(true);
  }

  async function send() {
    setSending(true);
    setError(null);
    const result = await reportProblem(slug, body);
    setSending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSent(true);
  }

  if (!loaded) {
    return <span className="inline-block h-8 w-8 rounded bg-[var(--hairline)]/40" aria-hidden />;
  }

  if (!signedIn) {
    return (
      <Link
        href="/sign-in"
        className={CORNER_ICON_BUTTON}
        title="Sign in to report an issue"
        aria-label="Sign in to report an issue"
      >
        <Icon name="flag" size={14} />
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className={CORNER_ICON_BUTTON}
        title="Report an issue"
        aria-label="Report an issue with this entry"
      >
        <Icon name="flag" size={14} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-[rgba(20,18,12,0.45)]"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Report this entry"
            className="relative flex max-h-[88dvh] w-full flex-col rounded-t-lg border border-[var(--hairline)] bg-[var(--paper)] sm:max-w-md sm:rounded-lg"
          >
            <header className="border-b border-[var(--hairline)] px-5 py-3.5">
              <h2 className="font-serif text-lg text-[var(--ink)]">Report this entry</h2>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--ink-muted)]">
                Tell the curators what is wrong - a broken source, a misstated
                result, a claim that does not hold. Reports go straight to
                review and are never shown publicly. Up to three per day.
              </p>
            </header>

            {sent ? (
              <div className="px-5 py-5">
                <p className="text-sm text-[var(--ink-secondary)]">
                  Thanks - the report is in. A curator will take a look.
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="mt-4 rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-3 py-1.5 text-xs text-[var(--ink)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <div className="px-5 py-4">
                  <label
                    htmlFor="report-body"
                    className="block text-[11px] font-medium text-[var(--ink-secondary)]"
                  >
                    What is the issue?
                  </label>
                  <textarea
                    id="report-body"
                    value={body}
                    maxLength={BODY_MAX}
                    onChange={(e) => setBody(e.target.value)}
                    rows={5}
                    autoFocus
                    className="mt-1 w-full resize-y rounded border border-[var(--hairline)] bg-[var(--paper-raised)] px-2.5 py-2 text-sm text-[var(--ink)] transition-colors hover:border-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
                  />
                </div>

                <footer className="flex flex-wrap items-center gap-2 border-t border-[var(--hairline)] px-5 py-3">
                  <button
                    type="button"
                    onClick={send}
                    disabled={sending || body.trim() === ""}
                    className="rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-3 py-1.5 text-xs text-[var(--ink)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] disabled:opacity-40"
                  >
                    {sending ? "Sending…" : "Send report"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={sending}
                    className="rounded-md px-2 py-1 text-xs text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] disabled:opacity-40"
                  >
                    Cancel
                  </button>
                  {error && (
                    <span className="text-[11px] text-[var(--status-critical)]">{error}</span>
                  )}
                </footer>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
