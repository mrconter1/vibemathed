"use client";

// The curator inbox: one card per open message. "Mark handled" clears it from
// the queue and the header badge without deleting the row, exactly like a
// report. Replying happens in a mail client - the sender's address is only
// ever revealed to a curator who chose to answer.

import { useState, useTransition } from "react";
import Link from "next/link";
import { handleSiteMessage } from "@/app/actions/contact";
import { topicLabel } from "@/lib/contact";
import { useViewer } from "@/components/ViewerProvider";

export interface InboxMessage {
  id: string;
  topic: string;
  body: string;
  /// Pseudonym when the sender was signed in and the account still exists.
  sender: string | null;
  senderPseudonym: string | null;
  replyTo: string | null;
  sentAt: string;
}

export function MessagesList({ messages }: { messages: InboxMessage[] }) {
  const { refresh } = useViewer();
  const [done, setDone] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const open = messages.filter((m) => !done.has(m.id));
  if (open.length === 0 && messages.length > 0) {
    return <p className="text-sm text-[var(--ink-secondary)]">All handled.</p>;
  }

  function markHandled(id: string) {
    setError(null);
    startTransition(async () => {
      const result = await handleSiteMessage(id);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone((prev) => new Set(prev).add(id));
      refresh();
    });
  }

  return (
    <div className="space-y-4">
      {error && <p className="text-xs text-[var(--status-critical)]">{error}</p>}

      {open.map((m) => (
        <article
          key={m.id}
          className="rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3.5"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span className="font-serif text-base text-[var(--ink)]">
              {topicLabel(m.topic)}
            </span>
            <span className="font-mono text-[11px] text-[var(--ink-muted)]">
              {m.sentAt}
            </span>
          </div>

          <p className="mt-1 text-[11px] text-[var(--ink-muted)]">
            From{" "}
            {m.senderPseudonym ? (
              <Link
                href={`/user/${encodeURIComponent(m.senderPseudonym)}`}
                className="font-medium text-[var(--ink-secondary)] hover:text-[var(--accent-blue)] hover:underline"
              >
                {m.sender}
              </Link>
            ) : (
              <span className="font-medium text-[var(--ink-secondary)]">
                {m.sender ?? "someone not signed in"}
              </span>
            )}
            {m.replyTo && (
              <>
                {" · "}
                <a
                  href={`mailto:${m.replyTo}?subject=${encodeURIComponent("Re: your message to VibeMathed")}`}
                  className="text-[var(--accent-blue)] hover:underline"
                >
                  {m.replyTo}
                </a>
              </>
            )}
          </p>

          <p className="mt-2.5 whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink-secondary)]">
            {m.body}
          </p>

          <div className="mt-3 border-t border-[var(--hairline)] pt-2.5">
            <button
              type="button"
              onClick={() => markHandled(m.id)}
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
