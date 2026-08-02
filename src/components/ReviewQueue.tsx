"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { approveSubmission, rejectSubmission } from "@/app/actions/submit-problem";
import { REVIEW_MESSAGE_MAX } from "@/lib/submission";
import { useViewer } from "@/components/ViewerProvider";

export interface PendingEntry {
  slug: string;
  name: string;
  field: string | null;
  solveType: string;
  solveDate: string;
  model: string;
  verification: string;
  /// Pre-rendered on the server with texToHtml, so KaTeX never ships to the
  /// browser. Null when the submission has no statement.
  statementHtml: string | null;
  sourceUrl: string;
  sourceName: string;
  submittedBy: string;
  /// Current pseudonym for the profile link, or null when unlinkable.
  submittedByPseudonym: string | null;
  submittedAt: string;
}

export function ReviewQueue({ pending }: { pending: PendingEntry[] }) {
  const router = useRouter();
  const { refresh: refreshViewer } = useViewer();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(slug: string, approve: boolean, message: string) {
    setBusy(slug);
    setError(null);
    const result = approve
      ? await approveSubmission(slug, message)
      : await rejectSubmission(slug, message);
    setBusy(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    // `router.refresh()` re-renders the queue, but the header badge lives in
    // client state, so it needs telling separately.
    router.refresh();
    refreshViewer();
    setDecision(null);
  }

  // The decision being composed: which entry, and whether it is an approval.
  const [decision, setDecision] = useState<{ slug: string; approve: boolean } | null>(null);
  const [message, setMessage] = useState("");

  if (pending.length === 0) {
    return (
      <p className="rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-6 text-center text-sm text-[var(--ink-muted)]">
        Nothing waiting for review.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-xs text-[var(--status-critical)]">{error}</p>}

      {pending.map((p) => (
        <article
          key={p.slug}
          className="rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3.5"
        >
          <div className="flex flex-wrap items-baseline gap-x-2.5">
            <h2 className="font-serif text-base text-[var(--ink)]">{p.name}</h2>
            <span className="text-xs text-[var(--ink-muted)]">
              by{" "}
              {p.submittedByPseudonym ? (
                <a
                  href={`/user/${encodeURIComponent(p.submittedByPseudonym)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--ink-secondary)] hover:text-[var(--accent-blue)] hover:underline"
                >
                  {p.submittedBy}
                </a>
              ) : (
                p.submittedBy
              )}{" "}
              · {p.submittedAt}
            </span>
          </div>

          {p.statementHtml && (
            <p
              className="math-prose mt-2 text-sm leading-relaxed text-[var(--ink-secondary)]"
              dangerouslySetInnerHTML={{ __html: p.statementHtml }}
            />
          )}

          <dl className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] text-[var(--ink-secondary)]">
            <span>{p.field ?? "—"}</span>
            <span>{p.solveType}</span>
            <span>{p.model}</span>
            <span>{p.solveDate}</span>
            <span>{p.verification}</span>
          </dl>

          <p className="mt-2 text-xs">
            <a
              href={p.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="break-words text-[var(--accent-blue)] hover:underline"
            >
              {p.sourceName} ↗
            </a>
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--hairline)] pt-3">
            <button
              type="button"
              disabled={busy === p.slug}
              onClick={() => {
                setMessage("");
                setDecision({ slug: p.slug, approve: true });
              }}
              className="rounded-md border border-[var(--hairline)] px-3 py-1.5 text-xs text-[var(--ink)] transition-colors hover:border-[var(--status-good)] hover:text-[var(--status-good)] disabled:opacity-40"
            >
              {busy === p.slug ? "…" : "Approve"}
            </button>
            <button
              type="button"
              disabled={busy === p.slug}
              onClick={() => {
                setMessage("");
                setDecision({ slug: p.slug, approve: false });
              }}
              className="rounded-md px-2.5 py-1.5 text-xs text-[var(--ink-muted)] transition-colors hover:text-[var(--status-critical)] disabled:opacity-40"
            >
              Reject
            </button>
            {/* Reviewers need the entry as it will publish, which the public
                route cannot show while it is still pending. */}
            <Link
              href={`/admin/preview?slug=${encodeURIComponent(p.slug)}`}
              className="ml-auto text-xs text-[var(--accent-blue)] hover:underline"
            >
              Open full entry
            </Link>
          </div>
        </article>
      ))}

      {decision && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-[rgba(20,18,12,0.45)]"
            onClick={() => setDecision(null)}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={decision.approve ? "Approve submission" : "Reject submission"}
            className="relative w-full rounded-t-lg border border-[var(--hairline)] bg-[var(--paper)] sm:max-w-md sm:rounded-lg"
          >
            <header className="border-b border-[var(--hairline)] px-5 py-3.5">
              <h2 className="font-serif text-lg text-[var(--ink)]">
                {decision.approve ? "Approve this entry" : "Reject this entry"}
              </h2>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--ink-muted)]">
                The message reaches the submitter through their notifications.
                It is not public, so a rejection reason stays between you and
                them.
                {decision.approve
                  ? " Optional on an approval."
                  : " Worth writing: a turned-down submission with no reason reads as arbitrary."}
              </p>
            </header>
            <div className="px-5 py-4">
              <textarea
                value={message}
                maxLength={REVIEW_MESSAGE_MAX}
                rows={4}
                autoFocus
                placeholder={
                  decision.approve
                    ? "Anything you changed, or why it went in as a candidate."
                    : "What was missing, and what would make it publishable."
                }
                onChange={(e) => setMessage(e.target.value)}
                className="w-full resize-y rounded border border-[var(--hairline)] bg-[var(--paper-raised)] px-2.5 py-2 text-sm text-[var(--ink)] transition-colors hover:border-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
              />
              <p className="mt-1 text-right text-[11px] text-[var(--ink-muted)]">
                {message.length}/{REVIEW_MESSAGE_MAX}
              </p>
            </div>
            <footer className="flex flex-wrap items-center gap-2 border-t border-[var(--hairline)] px-5 py-3">
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => act(decision.slug, decision.approve, message)}
                className="rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-3 py-1.5 text-xs text-[var(--ink)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] disabled:opacity-40"
              >
                {busy !== null
                  ? "Saving…"
                  : decision.approve
                    ? "Approve and send"
                    : "Reject and send"}
              </button>
              <button
                type="button"
                disabled={busy !== null}
                onClick={() => setDecision(null)}
                className="rounded-md px-2 py-1 text-xs text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] disabled:opacity-40"
              >
                Cancel
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
