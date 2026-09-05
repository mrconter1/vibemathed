"use client";

import { TeX } from "@/components/TeX";
// The curator's report queue: one card per open report, with the entry it
// concerns, who sent it, when, and the free-text explanation. Handling one
// clears it from the queue (and the header badge) without deleting the row,
// and can answer the reporter in the same step - a report used to be a
// one-way channel, which is a poor way to treat someone who took the trouble
// to flag a wrong entry.

import { useState, useTransition } from "react";
import Link from "next/link";
import { handleReport } from "@/app/actions/report";
import { MessageDialog } from "@/components/MessageDialog";
import { useViewer } from "@/components/ViewerProvider";

export interface OpenReport {
  id: string;
  body: string;
  reporter: string;
  /// Null when the account is gone; the name then renders unlinked.
  reporterPseudonym: string | null;
  /// False when the reporting account no longer exists, so there is nobody
  /// left to answer.
  canReply: boolean;
  /// Where the reported thing lives - an entry or a frontier. Reports on both
  /// land in this one queue, so the row cannot assume /problem/.
  subjectHref: string;
  subjectName: string;
  /// "entry" or "frontier", shown as a chip so a curator can see at a glance
  /// which kind of thing is being flagged.
  subjectKind: string;
  reportedAt: string;
}

export function ReportsList({ reports }: { reports: OpenReport[] }) {
  const { refresh } = useViewer();
  const [done, setDone] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  /// Which report is being answered. Null means no dialog is open. Declared
  /// with the other hooks, above the early return, or it would be called
  /// conditionally.
  const [replying, setReplying] = useState<OpenReport | null>(null);

  const open = reports.filter((r) => !done.has(r.id));
  if (open.length === 0 && reports.length > 0) {
    return <p className="text-sm text-[var(--ink-secondary)]">All handled.</p>;
  }

  function markHandled(id: string, message: string) {
    setError(null);
    startTransition(async () => {
      const result = await handleReport(id, message);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone((prev) => new Set(prev).add(id));
      setReplying(null);
      // The header badge counts open reports; pull the new number.
      refresh();
    });
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-xs text-[var(--status-critical)]">{error}</p>}

      {open.map((r) => (
        <article
          key={r.id}
          className="rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3.5"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span className="flex flex-wrap items-baseline gap-2">
              {/* Which kind of thing is flagged. A frontier report is usually
                  about a historical row's value or attribution, which is a
                  different job from checking an entry's claim, so the queue
                  says so rather than making the curator open it to find out. */}
              {r.subjectKind === "frontier" && (
                <span className="rounded border border-[var(--accent-orange)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--accent-orange)]">
                  Frontier
                </span>
              )}
              <Link
                href={r.subjectHref}
                className="font-serif text-base text-[var(--ink)] hover:text-[var(--accent-blue)]"
              >
                <TeX>{r.subjectName}</TeX>
              </Link>
            </span>
            <span className="font-mono text-[11px] text-[var(--ink-muted)]">
              {r.reportedAt}
            </span>
          </div>

          <p className="mt-1 text-[11px] text-[var(--ink-muted)]">
            Reported by{" "}
            {r.reporterPseudonym ? (
              <Link
                href={`/user/${encodeURIComponent(r.reporterPseudonym)}`}
                className="font-medium text-[var(--ink-secondary)] hover:text-[var(--accent-blue)] hover:underline"
              >
                {r.reporter}
              </Link>
            ) : (
              <span className="font-medium text-[var(--ink-secondary)]">{r.reporter}</span>
            )}
          </p>

          <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink-secondary)]">
            {r.body}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--hairline)] pt-2.5">
            <button
              type="button"
              onClick={() => setReplying(r)}
              disabled={pending}
              className="rounded-md border border-[var(--hairline)] bg-[var(--paper)] px-3 py-1.5 text-xs text-[var(--ink-secondary)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] disabled:opacity-40"
            >
              Handle and reply
            </button>
            {/* Kept as a one-click path: most reports are acted on silently,
                and forcing a dialog on all of them would slow the queue down
                to make a minority case tidier. */}
            <button
              type="button"
              onClick={() => markHandled(r.id, "")}
              disabled={pending}
              className="rounded-md px-2.5 py-1.5 text-xs text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] disabled:opacity-40"
            >
              Handle without replying
            </button>
          </div>
        </article>
      ))}

      {replying && (
        <MessageDialog
          // Fresh dialog per report; see the same note in ReviewQueue.
          key={replying.id}
          title="Reply and mark handled"
          intro="Goes to the reporter's inbox. It is not public and is not posted to the entry."
          placeholder="What you found, and what you changed or why you left it."
          confirmLabel="Send and mark handled"
          canDeliver={replying.canReply}
          busy={pending}
          onCancel={() => setReplying(null)}
          onConfirm={(_reason, message) => markHandled(replying.id, message)}
        />
      )}
    </div>
  );
}
