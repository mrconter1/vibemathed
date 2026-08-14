"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { approveSubmission, rejectSubmission } from "@/app/actions/submit-problem";
import { APPROVE_REASONS, REJECT_REASONS } from "@/lib/messages";
import { MessageDialog } from "@/components/MessageDialog";
import { useViewer } from "@/components/ViewerProvider";
import { TeX } from "@/components/TeX";

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
  /// For the reviewer, never published - but submitters write real math in
  /// it ($R_{dih}$ and friends), so it renders through TeX like the name
  /// does. "Never appears on the entry" was a reason not to cache it, not a
  /// reason to show the reviewer raw source.
  submitterNote: string | null;
  submittedBy: string;
  /// Current pseudonym for the profile link, or null when unlinkable.
  submittedByPseudonym: string | null;
  /// Whether the submitting account still exists. Distinct from having a
  /// pseudonym: a member with no display name yet is still reachable.
  canDeliver: boolean;
  submittedAt: string;
}

export function ReviewQueue({ pending }: { pending: PendingEntry[] }) {
  const router = useRouter();
  const { refresh: refreshViewer } = useViewer();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(
    slug: string,
    approve: boolean,
    reason: string | null,
    message: string,
  ) {
    setBusy(slug);
    setError(null);
    const result = approve
      ? await approveSubmission(slug, message, reason)
      : await rejectSubmission(slug, message, reason);
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

  // The decision being composed: which entry, whether it is an approval, and
  // whether the submitter still has an account to receive the reply.
  const [decision, setDecision] = useState<{
    slug: string;
    approve: boolean;
    canDeliver: boolean;
  } | null>(null);

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
            <h2 className="font-serif text-base text-[var(--ink)]"><TeX>{p.name}</TeX></h2>
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

          {p.submitterNote && (
            <p className="mt-2 rounded-md border border-[color-mix(in_srgb,var(--accent-blue)_40%,transparent)] bg-[color-mix(in_srgb,var(--accent-blue)_6%,transparent)] px-2.5 py-1.5 text-xs leading-relaxed text-[var(--ink-secondary)]">
              <span className="font-medium text-[var(--ink)]">Note from submitter: </span>
              <TeX>{p.submitterNote}</TeX>
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--hairline)] pt-3">
            <button
              type="button"
              disabled={busy === p.slug}
              onClick={() =>
                setDecision({
                  slug: p.slug,
                  approve: true,
                  canDeliver: p.canDeliver,
                })
              }
              className="rounded-md border border-[var(--hairline)] px-3 py-1.5 text-xs text-[var(--ink)] transition-colors hover:border-[var(--status-good)] hover:text-[var(--status-good)] disabled:opacity-40"
            >
              {busy === p.slug ? "…" : "Approve"}
            </button>
            <button
              type="button"
              disabled={busy === p.slug}
              onClick={() =>
                setDecision({
                  slug: p.slug,
                  approve: false,
                  canDeliver: p.canDeliver,
                })
              }
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
        <MessageDialog
          // Keyed so switching entries or flipping approve/reject starts a
          // fresh dialog. Without it React reuses the instance and the
          // previous decision's reason and message survive into the next one.
          key={`${decision.slug}-${decision.approve}`}
          title={decision.approve ? "Approve this entry" : "Reject this entry"}
          intro={
            decision.approve
              ? "Goes to the submitter's inbox and is not public. Optional on an approval."
              : "Goes to the submitter's inbox and is not public, so a rejection reason stays between you and them. Worth writing: a turned-down submission with no reason reads as arbitrary."
          }
          reasons={decision.approve ? APPROVE_REASONS : REJECT_REASONS}
          reasonLabel={decision.approve ? "How it went in" : "Why it was turned down"}
          placeholder={
            decision.approve
              ? "Anything you changed, or why it went in as a candidate."
              : "What was missing, and what would make it publishable."
          }
          confirmLabel={decision.approve ? "Approve and send" : "Reject and send"}
          canDeliver={decision.canDeliver}
          busy={busy !== null}
          onCancel={() => setDecision(null)}
          onConfirm={(reason, message) =>
            act(decision.slug, decision.approve, reason, message)
          }
        />
      )}

    </div>
  );
}
