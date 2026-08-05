"use client";

// The reader's inbox: curator mail, read in full, and answerable.
//
// Fetched from the client rather than rendered on the server for the same
// reason as everything else behind `auth()` - reading cookies during render
// would make the route dynamic. Opening the page moves the inbox watermark,
// so the badge clears, while rows that were unread at open keep their marker
// until the next visit. Same contract as the bell.
//
// A message is a thread: the curator's decision, then whatever the two of you
// said about it. Replying is the only way a reader can send anything, and the
// recipient comes from the thread rather than from a field, so this cannot
// become a way to message a stranger.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  getInbox,
  markInboxSeen,
  replyToMessage,
  type InboxItem,
  type InboxMessage,
} from "@/app/actions/inbox";
import { MESSAGE_MAX } from "@/lib/messages";
import { useViewer } from "@/components/ViewerProvider";
import { TeX } from "@/components/TeX";

/// One message in a thread.
///
/// Attribution leads rather than trails. A single message reads fine either
/// way, but in a conversation the first thing to know about a paragraph is
/// who is talking, and a signature underneath means reading the words before
/// knowing whose they are.
function Message({ m, first }: { m: InboxMessage; first?: boolean }) {
  return (
    <div
      className={`px-4 py-3 ${first ? "" : "border-t border-[var(--hairline)]"} ${
        // Your own messages sit on the page colour rather than the raised
        // surface, so the two voices are told apart by the sheet they are
        // written on and the thread still scans as one column.
        m.mine ? "bg-[var(--paper)]" : ""
      }`}
    >
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
        <span className="text-xs font-medium text-[var(--ink)]">
          {m.mine ? "You" : m.from}
        </span>
        <span className="font-mono text-[11px] text-[var(--ink-muted)]">{m.when}</span>
        {m.isNew && (
          <span className="rounded-full bg-[var(--accent-orange)] px-1.5 py-px text-[10px] font-medium text-white">
            New
          </span>
        )}
      </div>

      {m.reason && (
        <p className="mt-1.5 inline-block rounded border border-[var(--hairline)] bg-[var(--paper)] px-2 py-0.5 font-mono text-[11px] text-[var(--ink-secondary)]">
          {m.reason}
        </p>
      )}
      {m.body && (
        <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink-secondary)]">
          {m.body}
        </p>
      )}
    </div>
  );
}

function Thread({
  item,
  onReplied,
}: {
  item: InboxItem;
  onReplied: (threadId: string, reply: InboxMessage) => void;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) box.current?.focus();
  }, [open]);

  async function send() {
    if (busy || !text.trim()) return;
    setBusy(true);
    setError(null);
    const result = await replyToMessage(item.id, text);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onReplied(item.id, result.message);
    setText("");
    setOpen(false);
  }

  const count = item.replies.length + 1;
  const unread = item.isNew || item.replies.some((r) => r.isNew);

  return (
    <article
      // The unread marker is a left rule rather than a background tint: it
      // survives both themes without a second colour, and it is the same
      // signal the bell menu uses for a new row.
      //
      // `overflow-hidden` so the messages inside, which paint edge to edge to
      // read as one column, stay inside the rounded corners.
      className={`overflow-hidden rounded-lg border border-l-2 border-[var(--hairline)] bg-[var(--paper-raised)] ${
        unread ? "border-l-[var(--accent-orange)]" : "border-l-[var(--hairline)]"
      }`}
    >
      {/* What the conversation is about, stated once at the top. Below it,
          every message is just somebody talking. */}
      <div className="border-b border-[var(--hairline)] bg-[var(--paper)] px-4 py-2.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className="font-serif text-base text-[var(--ink)]">{item.kindLabel}</span>
          <span className="font-mono text-[11px] text-[var(--ink-muted)]">
            {count === 1 ? "1 message" : `${count} messages`}
          </span>
        </div>

        {item.entryName && (
          <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
            {item.entrySlug ? (
              <Link
                href={`/problem/${item.entrySlug}`}
                className="text-[var(--ink-secondary)] hover:text-[var(--accent-blue)] hover:underline"
              >
                <TeX>{item.entryName}</TeX>
              </Link>
            ) : (
              // A rejected entry has no public page, so it is named but not
              // linked. Naming it still matters: without it the message reads
              // as being about nothing in particular.
              <span className="text-[var(--ink-secondary)]">
                <TeX>{item.entryName}</TeX>
              </span>
            )}
          </p>
        )}
      </div>

      {/* The conversation, oldest first, each message ruled off from the
          last. Reading order matches the order it was said in, which a stack
          of separately-bordered cards does not make obvious. */}
      <Message m={item} first />
      {item.replies.map((r) => (
        <Message key={r.id} m={r} />
      ))}

      <div className="border-t border-[var(--hairline)] px-4 py-3">
        {open ? (
          <>
            <textarea
              ref={box}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void send();
                if (e.key === "Escape") setOpen(false);
              }}
              rows={3}
              maxLength={MESSAGE_MAX}
              placeholder={`Reply to ${item.mine ? "this thread" : item.from}`}
              className="w-full resize-y rounded-md border border-[var(--hairline)] bg-[var(--paper)] px-3 py-2 text-sm leading-relaxed text-[var(--ink)] focus:border-[var(--accent-blue)] focus:outline-none"
            />
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => void send()}
                disabled={busy || !text.trim()}
                className="rounded-md bg-[var(--accent-blue)] px-3 py-1.5 text-xs text-white transition-opacity hover:opacity-90 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)]"
              >
                {busy ? "Sending" : "Send reply"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)]"
              >
                Cancel
              </button>
              <span className="ml-auto font-mono text-[11px] text-[var(--ink-muted)]">
                {text.length}/{MESSAGE_MAX}
              </span>
            </div>
            {error && <p className="mt-2 text-xs text-[var(--status-critical)]">{error}</p>}
          </>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            // Full width and always present, so the thread visibly expects an
            // answer. A small button tucked under the last message reads as a
            // secondary action on that message rather than as the way to
            // continue the conversation.
            className="w-full rounded-md border border-dashed border-[var(--hairline)] px-3 py-2 text-left text-xs text-[var(--ink-muted)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)]"
          >
            {item.mine ? "Write a reply" : `Reply to ${item.from}`}
          </button>
        )}
      </div>
    </article>
  );
}

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

  function onReplied(threadId: string, reply: InboxMessage) {
    setItems((prev) =>
      prev
        ? prev.map((t) => (t.id === threadId ? { ...t, replies: [...t.replies, reply] } : t))
        : prev,
    );
  }

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
        something you submitted, their reply lands here, and you can answer it
        from the same place.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <Thread key={item.id} item={item} onReplied={onReplied} />
      ))}
    </div>
  );
}
