"use client";

// The reader's inbox, in two views on one page: a list of conversations, and
// one conversation open.
//
// Fetched from the client rather than rendered on the server for the same
// reason as everything else behind `auth()` - reading cookies during render
// would make the route dynamic.
//
// Opening a conversation is a state change, not a navigation. The list is
// already in memory, going back should not refetch it, and a conversation is
// not a page anyone should be able to link to or land on cold. Which does
// mean the browser's back button leaves the page rather than closing the
// conversation, so the way back is a control that is always visible.
//
// Replying is the only way a reader can send anything, and the recipient
// comes from the thread rather than from a field, so this cannot become a way
// to message a stranger.

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import {
  getConversation,
  getInbox,
  replyToMessage,
  type Conversation,
  type InboxMessage,
  type InboxSummary,
} from "@/app/actions/inbox";
import { MESSAGE_MAX } from "@/lib/messages";
import { useViewer } from "@/components/ViewerProvider";
import { TeX } from "@/components/TeX";

/// What the list shows of a message. Mirrors the server's `preview`, for the
/// one case the server does not produce: a reply the reader just sent, which
/// has to appear on its list row without refetching the list.
function firstLine(body: string, limit = 110): string {
  const line = body.trim().split(/\r?\n/)[0] ?? "";
  return line.length > limit ? `${line.slice(0, limit - 1).trimEnd()}…` : line;
}

/// The entry a conversation is about, linked when it still has a public page.
function EntryLine({
  slug,
  name,
  className,
}: {
  slug: string | null;
  name: string | null;
  className?: string;
}) {
  if (!name) return null;
  return (
    <p className={className}>
      {slug ? (
        <Link
          href={`/problem/${slug}`}
          className="text-[var(--ink-secondary)] hover:text-[var(--accent-blue)] hover:underline"
        >
          <TeX>{name}</TeX>
        </Link>
      ) : (
        // A rejected entry has no public page, so it is named but not linked.
        // Naming it still matters: without it the conversation reads as being
        // about nothing in particular.
        <span className="text-[var(--ink-secondary)]">
          <TeX>{name}</TeX>
        </span>
      )}
    </p>
  );
}

/// One row in the conversation list.
function SummaryRow({
  item,
  onOpen,
}: {
  item: InboxSummary;
  onOpen: () => void;
}) {
  const unread = item.unreadCount > 0;
  return (
    <button
      type="button"
      onClick={onOpen}
      className={`block w-full rounded-lg border border-l-2 bg-[var(--paper-raised)] px-4 py-3 text-left transition-colors hover:border-[var(--ink-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)] ${
        unread
          ? "border-[var(--hairline)] border-l-[var(--accent-orange)]"
          : "border-[var(--hairline)] border-l-[var(--hairline)]"
      }`}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <span className="flex items-baseline gap-2">
          <span
            className={`text-sm ${unread ? "font-medium text-[var(--ink)]" : "text-[var(--ink)]"}`}
          >
            {item.other}
          </span>
          {unread && (
            <span className="rounded-full bg-[var(--accent-orange)] px-1.5 py-px text-[10px] font-medium text-white">
              {item.unreadCount} new
            </span>
          )}
        </span>
        <span className="font-mono text-[11px] text-[var(--ink-muted)]">
          {item.lastAt}
        </span>
      </div>

      <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
        {item.kindLabel}
        {item.messageCount > 1 && ` · ${item.messageCount} messages`}
      </p>
      <EntryLine
        slug={item.entrySlug}
        name={item.entryName}
        className="mt-0.5 text-xs"
      />

      {/* The last thing said, one line of it. Prefixed when it was the
          reader's own, which is the difference between "they are waiting on
          you" and "you are waiting on them". */}
      <p
        className={`mt-1.5 truncate text-sm ${
          unread ? "text-[var(--ink)]" : "text-[var(--ink-secondary)]"
        }`}
      >
        {item.lastMine && (
          <span className="text-[var(--ink-muted)]">You: </span>
        )}
        {item.preview}
      </p>
    </button>
  );
}

/// One message in an open conversation.
function Bubble({ m }: { m: InboxMessage }) {
  return (
    <div className={`flex flex-col ${m.mine ? "items-end" : "items-start"}`}>
      <div className="flex items-baseline gap-2 px-1">
        <span className="text-xs font-medium text-[var(--ink)]">
          {m.mine ? "You" : m.from}
        </span>
        <span className="font-mono text-[10px] text-[var(--ink-muted)]">
          {m.when}
        </span>
        {m.isNew && (
          <span className="rounded-full bg-[var(--accent-orange)] px-1.5 py-px text-[10px] font-medium text-white">
            New
          </span>
        )}
      </div>

      {/* Sided rather than full width, which is what makes a run of messages
          read as an exchange at a glance. Capped short of the column so the
          side is always visible even on one short line. */}
      <div
        className={`mt-1 max-w-[85%] rounded-lg border px-3 py-2 ${
          m.mine
            ? "border-[var(--accent-blue)] bg-[color-mix(in_srgb,var(--accent-blue)_8%,transparent)]"
            : "border-[var(--hairline)] bg-[var(--paper-raised)]"
        }`}
      >
        {m.reason && (
          <p className="mb-1.5 inline-block rounded border border-[var(--hairline)] bg-[var(--paper)] px-2 py-0.5 font-mono text-[11px] text-[var(--ink-secondary)]">
            {m.reason}
          </p>
        )}
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--ink-secondary)]">
          {m.body}
        </p>
      </div>
    </div>
  );
}

function ConversationView({
  conversation,
  onBack,
  onReplied,
}: {
  conversation: Conversation;
  onBack: () => void;
  onReplied: (reply: InboxMessage) => void;
}) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const count = conversation.messages.length;

  // Newest message in view on open, and after every reply. Before paint, so
  // the conversation never appears at the top and jump afterwards.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [count]);

  const send = useCallback(async () => {
    if (busy || !text.trim()) return;
    setBusy(true);
    setError(null);
    const result = await replyToMessage(conversation.id, text);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onReplied(result.message);
    setText("");
  }, [busy, text, conversation.id, onReplied]);

  return (
    <section className="rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)]">
      <header className="flex items-start gap-3 border-b border-[var(--hairline)] bg-[var(--paper)] px-3 py-2.5">
        <button
          type="button"
          onClick={onBack}
          className="mt-0.5 shrink-0 rounded-md border border-[var(--hairline)] px-2 py-1 text-xs text-[var(--ink-secondary)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)]"
        >
          ← All
        </button>
        <div className="min-w-0">
          <p className="font-serif text-base leading-tight text-[var(--ink)]">
            {conversation.other}
          </p>
          <p className="text-xs text-[var(--ink-muted)]">
            {conversation.kindLabel}
          </p>
          <EntryLine
            slug={conversation.entrySlug}
            name={conversation.entryName}
            className="text-xs"
          />
        </div>
      </header>

      {/* A bounded, scrolling transcript rather than a growing page: the
          composer stays put at the bottom where it was left, which is what
          makes this feel like a conversation and not a form under an
          article. Capped by viewport height so it works on a phone and does
          not become a letterbox on a large screen. */}
      <div
        ref={scroller}
        className="dialog-scroll flex max-h-[min(60vh,32rem)] flex-col gap-4 overflow-y-auto px-3 py-4"
      >
        {conversation.messages.map((m) => (
          <Bubble key={m.id} m={m} />
        ))}
      </div>

      {!conversation.canReply ? (
        // A contact-form message from somebody with no account. There is no
        // inbox to deliver an answer to, so the composer is absent rather than
        // present and then refused. The address they left is in the message.
        <p className="border-t border-[var(--hairline)] bg-[var(--paper)] px-3 py-3 text-xs text-[var(--ink-muted)]">
          Sent from the contact form without an account, so there is nowhere to
          reply to in place. Any address they left is in the message above.
        </p>
      ) : (
        <div className="border-t border-[var(--hairline)] bg-[var(--paper)] px-3 py-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void send();
            }}
            rows={2}
            maxLength={MESSAGE_MAX}
            placeholder={`Reply to ${conversation.other}`}
            className="w-full resize-y rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-3 py-2 text-sm leading-relaxed text-[var(--ink)] focus:border-[var(--accent-blue)] focus:outline-none"
          />
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => void send()}
              disabled={busy || !text.trim()}
              className="rounded-md bg-[var(--accent-blue)] px-3 py-1.5 text-xs text-white transition-opacity hover:opacity-90 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)]"
            >
              {busy ? "Sending" : "Send"}
            </button>
            <span className="font-mono text-[11px] text-[var(--ink-muted)]">
              {text.length}/{MESSAGE_MAX}
            </span>
          </div>
          {error && (
            <p className="mt-2 text-xs text-[var(--status-critical)]">
              {error}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

export function InboxList() {
  const { loaded, signedIn, refresh } = useViewer();
  const [items, setItems] = useState<InboxSummary[] | null>(null);
  const [open, setOpen] = useState<Conversation | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);

  useEffect(() => {
    if (!loaded || !signedIn || fetched.current) return;
    fetched.current = true;
    getInbox().then((result) => {
      if (result.ok) setItems(result.items);
      else setError(result.error);
    });
  }, [loaded, signedIn]);

  const openThread = useCallback(
    async (id: string) => {
      setOpening(id);
      const result = await getConversation(id);
      setOpening(null);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setOpen(result.conversation);
      // Reading is what clears the unread state, so the list row and the
      // header badge both follow from having opened it.
      setItems((prev) =>
        prev
          ? prev.map((t) => (t.id === id ? { ...t, unreadCount: 0 } : t))
          : prev,
      );
      void refresh();
    },
    [refresh],
  );

  const onReplied = useCallback(
    (conversationId: string, reply: InboxMessage) => {
      setOpen((prev) =>
        prev ? { ...prev, messages: [...prev.messages, reply] } : prev,
      );
      // The row behind the open conversation has to follow it, or going back
      // shows the message before last as the most recent thing said.
      setItems((prev) =>
        prev
          ? prev.map((t) =>
              t.id === conversationId
                ? {
                    ...t,
                    lastAt: reply.when,
                    preview: firstLine(reply.body),
                    lastMine: true,
                    messageCount: t.messageCount + 1,
                    unreadCount: 0,
                  }
                : t,
            )
          : prev,
      );
    },
    [],
  );

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

  if (open) {
    return (
      <ConversationView
        conversation={open}
        onBack={() => setOpen(null)}
        onReplied={(reply) => onReplied(open.id, reply)}
      />
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
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className={opening === item.id ? "opacity-50" : ""}>
          <SummaryRow item={item} onOpen={() => void openThread(item.id)} />
        </div>
      ))}
    </div>
  );
}
