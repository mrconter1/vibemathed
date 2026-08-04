"use client";

// The reader's inbox: curator mail, read in full.
//
// Fetched from the client rather than rendered on the server for the same
// reason as everything else behind `auth()` - reading cookies during render
// would make the route dynamic. Opening the page moves the inbox watermark,
// so the badge clears, while rows that were unread at open keep their marker
// until the next visit. Same contract as the bell.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getInbox, markInboxSeen, type InboxItem } from "@/app/actions/inbox";
import { useViewer } from "@/components/ViewerProvider";
import { TeX } from "@/components/TeX";

export function InboxList() {
  const { loaded, signedIn, refresh } = useViewer();
  const [items, setItems] = useState<InboxItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const opened = useRef(false);

  useEffect(() => {
    if (!loaded || !signedIn || opened.current) return;
    opened.current = true;
    getInbox().then((result) => {
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setItems(result.items);
      // Everything here is now read. Move the watermark, then re-read viewer
      // state so the header badge drops.
      void markInboxSeen().then(() => refresh());
    });
  }, [loaded, signedIn, refresh]);

  if (loaded && !signedIn) {
    return (
      <p className="text-sm leading-relaxed text-[var(--ink-secondary)]">
        Sign in to read your inbox.
      </p>
    );
  }

  if (error) {
    return <p className="text-sm text-[var(--status-critical)]">{error}</p>;
  }

  if (items === null) {
    return (
      <div className="space-y-3" aria-hidden>
        <div className="h-20 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)]" />
        <div className="h-20 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)]" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p className="rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-6 text-center text-sm text-[var(--ink-muted)]">
        No messages. When a curator answers a report you sent or decides on
        something you submitted, their reply lands here.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((m) => (
        <article
          key={m.id}
          // The unread marker is a left rule rather than a background tint:
          // it survives both themes without a second colour, and it is the
          // same signal the bell menu uses for a new row.
          className={`rounded-lg border border-l-2 border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3.5 ${
            m.isNew ? "border-l-[var(--accent-orange)]" : "border-l-[var(--hairline)]"
          }`}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span className="font-serif text-base text-[var(--ink)]">
              {m.kindLabel}
            </span>
            <span className="font-mono text-[11px] text-[var(--ink-muted)]">
              {m.when}
            </span>
          </div>

          {m.entryName && (
            <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
              {m.entrySlug ? (
                <Link
                  href={`/problem/${m.entrySlug}`}
                  className="text-[var(--ink-secondary)] hover:text-[var(--accent-blue)] hover:underline"
                >
                  <TeX>{m.entryName}</TeX>
                </Link>
              ) : (
                // A rejected entry has no public page, so it is named but not
                // linked. Naming it still matters: without it the message
                // reads as being about nothing in particular.
                <span className="text-[var(--ink-secondary)]">
                  <TeX>{m.entryName}</TeX>
                </span>
              )}
            </p>
          )}

          {m.reason && (
            <p className="mt-2 inline-block rounded border border-[var(--hairline)] bg-[var(--paper)] px-2 py-0.5 font-mono text-[11px] text-[var(--ink-secondary)]">
              {m.reason}
            </p>
          )}

          {m.body && (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink-secondary)]">
              {m.body}
            </p>
          )}

          <p className="mt-2.5 text-[11px] text-[var(--ink-muted)]">from {m.from}</p>
        </article>
      ))}
    </div>
  );
}
