"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { approveSubmission, rejectSubmission } from "@/app/actions/submit-problem";

export interface PendingEntry {
  slug: string;
  name: string;
  field: string | null;
  solveType: string;
  solveDate: string;
  model: string;
  verification: string;
  statement: string | null;
  sourceUrl: string;
  sourceName: string;
  submittedBy: string;
  submittedAt: string;
}

export function ReviewQueue({ pending }: { pending: PendingEntry[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(slug: string, approve: boolean) {
    setBusy(slug);
    setError(null);
    const result = approve
      ? await approveSubmission(slug)
      : await rejectSubmission(slug);
    setBusy(null);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

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
              by {p.submittedBy} · {p.submittedAt}
            </span>
          </div>

          {p.statement && (
            <p className="mt-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
              {p.statement}
            </p>
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
              className="text-[var(--accent-blue)] hover:underline"
            >
              {p.sourceName} ↗
            </a>
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[var(--hairline)] pt-3">
            <button
              type="button"
              disabled={busy === p.slug}
              onClick={() => act(p.slug, true)}
              className="rounded-md border border-[var(--hairline)] px-3 py-1.5 text-xs text-[var(--ink)] transition-colors hover:border-[var(--status-good)] hover:text-[var(--status-good)] disabled:opacity-40"
            >
              {busy === p.slug ? "…" : "Approve"}
            </button>
            <button
              type="button"
              disabled={busy === p.slug}
              onClick={() => act(p.slug, false)}
              className="rounded-md px-2.5 py-1.5 text-xs text-[var(--ink-muted)] transition-colors hover:text-[var(--status-critical)] disabled:opacity-40"
            >
              Reject
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
