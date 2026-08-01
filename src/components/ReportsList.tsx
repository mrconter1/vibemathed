"use client";

// The curator's report queue: one card per open report, with the entry it
// concerns, who sent it, when, and the free-text explanation. "Mark handled"
// clears it from the queue (and the header badge) without deleting the row.

import { useState, useTransition } from "react";
import Link from "next/link";
import { handleReport } from "@/app/actions/report";
import { useViewer } from "@/components/ViewerProvider";

export interface OpenReport {
  id: string;
  body: string;
  reporter: string;
  /// Null when the account is gone; the name then renders unlinked.
  reporterPseudonym: string | null;
  problemSlug: string;
  problemName: string;
  reportedAt: string;
}

export function ReportsList({ reports }: { reports: OpenReport[] }) {
  const { refresh } = useViewer();
  const [done, setDone] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const open = reports.filter((r) => !done.has(r.id));
  if (open.length === 0 && reports.length > 0) {
    return <p className="text-sm text-[var(--ink-secondary)]">All handled.</p>;
  }

  function markHandled(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await handleReport(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone((prev) => new Set(prev).add(id));
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
            <Link
              href={`/problem/${r.problemSlug}`}
              className="font-serif text-base text-[var(--ink)] hover:text-[var(--accent-blue)]"
            >
              {r.problemName}
            </Link>
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

          <div className="mt-3 border-t border-[var(--hairline)] pt-2.5">
            <button
              type="button"
              onClick={() => markHandled(r.id)}
              disabled={pending}
              className="rounded-md border border-[var(--hairline)] bg-[var(--paper)] px-3 py-1.5 text-xs text-[var(--ink-secondary)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] disabled:opacity-40"
            >
              Mark handled
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
