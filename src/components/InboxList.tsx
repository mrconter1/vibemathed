"use client";

// The reader's inbox, in three views on one page: a list of conversations,
// one conversation open, and the composer for starting a new one.
//
// Fetched from the client rather than rendered on the server for the same
// reason as everything else behind `auth()` - reading cookies during render
// would make the route dynamic.
//
// Opening a conversation (or the composer) is a state change, not a
// navigation. The list is already in memory, going back should not refetch
// it, and a conversation is not a page anyone should be able to link to or
// land on cold. Which does mean the browser's back button leaves the page
// rather than closing the conversation, so the way back is a control that is
// always visible.
//
// Speed comes from three choices rather than one: the list is fetched the
// moment the component mounts (the action checks auth itself, so there is
// nothing to wait for), hovering a row prefetches its conversation into a
// cache so opening it is usually instant, and the server reads behind both
// are single indexed queries.

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
  markConversationRead,
  replyToMessage,
  searchUsers,
  startConversation,
  type Conversation,
  type InboxMessage,
  type InboxSummary,
} from "@/app/actions/inbox";
import { MESSAGE_MAX, SUBJECT_MAX } from "@/lib/messages";
import { useViewer } from "@/components/ViewerProvider";
import { TeX } from "@/components/TeX";

/// Conversations per list page. Small enough that the list never scrolls the
/// pager out of sight, large enough that most inboxes fit on page one.
const PER_PAGE = 10;

/// What the list shows of a message. Mirrors the server's `preview`, for the
/// one case the server does not produce: a reply the reader just sent, which
/// has to appear on its list row without refetching the list.
function firstLine(body: string, limit = 110): string {
  const line = body.trim().split(/\r?\n/)[0] ?? "";
  return line.length > limit ? `${line.slice(0, limit - 1).trimEnd()}…` : line;
}

/// The name on the other end, linked to their profile when they have one.
/// Inside a clickable row, so the link stops propagation rather than also
/// opening the conversation underneath itself.
function OtherName({
  name,
  user,
  className,
}: {
  name: string;
  user: string | null;
  className: string;
}) {
  if (!user) return <span className={className}>{name}</span>;
  return (
    <Link
      href={`/user/${encodeURIComponent(user)}`}
      onClick={(e) => e.stopPropagation()}
      className={`${className} hover:text-[var(--accent-blue)] hover:underline`}
    >
      {name}
    </Link>
  );
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
          onClick={(e) => e.stopPropagation()}
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
///
/// A div acting as a button rather than a <button>, because the name and the
/// entry inside it are real links and interactive content may not nest inside
/// a button.
function SummaryRow({
  item,
  onOpen,
  onWarm,
}: {
  item: InboxSummary;
  onOpen: () => void;
  /// Called on hover and focus: the moments that precede a click, which is
  /// when prefetching the conversation pays for itself.
  onWarm: () => void;
}) {
  const unread = item.unreadCount > 0;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onMouseEnter={onWarm}
      onFocus={onWarm}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="block w-full cursor-pointer rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3 text-left transition-colors hover:border-[var(--ink-muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)]"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <span className="flex items-baseline gap-2">
          <OtherName
            name={item.other}
            user={item.otherUser}
            className={`text-sm ${unread ? "font-medium text-[var(--ink)]" : "text-[var(--ink)]"}`}
          />
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

      {/* What the conversation is about: its subject when it has one, its
          kind otherwise. Both never - the kind of a composed message is
          visible in the thread itself, and two headlines is one too many. */}
      <p className="mt-0.5 text-xs text-[var(--ink-muted)]">
        {item.subject ? (
          <span className="text-[var(--ink-secondary)]">{item.subject}</span>
        ) : (
          item.kindLabel
        )}
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
    </div>
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
            <OtherName
              name={conversation.other}
              user={conversation.otherUser}
              className=""
            />
          </p>
          <p className="text-xs text-[var(--ink-muted)]">
            {conversation.subject ?? conversation.kindLabel}
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
          {/* Grows with what is typed. Two fixed rows is fine for "thanks"
              and cramped for anything worth saying; on a phone it meant
              writing a paragraph through a two-line window. Capped so a long
              reply cannot push the send button off screen, and it scrolls
              past that. Height comes from scrollHeight after a reset to auto,
              because scrollHeight never shrinks on its own. */}
          <textarea
            value={text}
            ref={(el) => {
              if (!el) return;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 220)}px`;
            }}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void send();
            }}
            rows={3}
            maxLength={MESSAGE_MAX}
            placeholder={`Reply to ${conversation.other}`}
            className="w-full resize-none overflow-y-auto rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-3 py-2 text-sm leading-relaxed text-[var(--ink)] focus:border-[var(--accent-blue)] focus:outline-none"
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

/// The composer: recipient, subject, body. Recipient autocompletes against
/// real pseudonyms and the server re-validates on send, so what gets typed is
/// a suggestion and what gets delivered is a user.
function ComposeView({
  onBack,
  onSent,
}: {
  onBack: () => void;
  onSent: (conversation: Conversation) => void;
}) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [matches, setMatches] = useState<string[]>([]);
  const [showMatches, setShowMatches] = useState(false);
  // The query the current suggestions answer, so a stale response cannot
  // overwrite a newer one (round trips do not finish in the order they left).
  const asked = useRef("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Runs from the change handler, not an effect: the search follows typing,
  // and debounced a beat, since firing on every keystroke would race eight
  // requests to answer one word.
  const onToChange = useCallback((value: string) => {
    setTo(value);
    setShowMatches(true);
    const q = value.trim();
    asked.current = q;
    if (timer.current) clearTimeout(timer.current);
    if (q.length < 2) {
      setMatches([]);
      return;
    }
    timer.current = setTimeout(() => {
      searchUsers(q).then((names) => {
        if (asked.current === q) setMatches(names);
      });
    }, 250);
  }, []);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  // Typed name matches a known account exactly (bar case). Advisory only:
  // the server is the one that actually decides.
  const known = matches.some((m) => m.toLowerCase() === to.trim().toLowerCase());

  const send = useCallback(async () => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await startConversation({ to, subject, body });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSent(result.conversation);
  }, [busy, to, subject, body, onSent]);

  const field =
    "w-full rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-3 py-2 text-sm text-[var(--ink)] focus:border-[var(--accent-blue)] focus:outline-none";

  return (
    <section className="rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)]">
      <header className="flex items-center gap-3 border-b border-[var(--hairline)] bg-[var(--paper)] px-3 py-2.5">
        <button
          type="button"
          onClick={onBack}
          className="shrink-0 rounded-md border border-[var(--hairline)] px-2 py-1 text-xs text-[var(--ink-secondary)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)]"
        >
          ← All
        </button>
        <p className="font-serif text-base text-[var(--ink)]">Send new message</p>
      </header>

      <div className="flex flex-col gap-3 px-3 py-4">
        <div className="relative">
          <label className="mb-1 block text-xs text-[var(--ink-muted)]" htmlFor="compose-to">
            To
          </label>
          <input
            id="compose-to"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            onBlur={() => {
              // Delayed so a click on a suggestion lands before the list
              // hides out from under it.
              setTimeout(() => setShowMatches(false), 150);
            }}
            autoComplete="off"
            spellCheck={false}
            placeholder="Their name on the site"
            className={field}
          />
          {showMatches && matches.length > 0 && !known && (
            <ul className="absolute z-10 mt-1 w-full overflow-hidden rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] shadow-sm">
              {matches.map((name) => (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => {
                      setTo(name);
                      setShowMatches(false);
                    }}
                    className="block w-full px-3 py-1.5 text-left text-sm text-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--accent-blue)_8%,transparent)]"
                  >
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          )}
          {to.trim().length >= 2 && !known && matches.length === 0 && (
            <p className="mt-1 text-xs text-[var(--ink-muted)]">
              No user by that name yet. Names complete as you type.
            </p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-xs text-[var(--ink-muted)]" htmlFor="compose-subject">
            Subject
          </label>
          <input
            id="compose-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={SUBJECT_MAX}
            placeholder="What it is about"
            className={field}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-[var(--ink-muted)]" htmlFor="compose-body">
            Message
          </label>
          <textarea
            id="compose-body"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            maxLength={MESSAGE_MAX}
            placeholder="Plain text only"
            className={`${field} resize-none leading-relaxed`}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => void send()}
            disabled={busy || !to.trim() || !subject.trim() || !body.trim()}
            className="rounded-md bg-[var(--accent-blue)] px-3 py-1.5 text-xs text-white transition-opacity hover:opacity-90 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)]"
          >
            {busy ? "Sending" : "Send"}
          </button>
          <span className="font-mono text-[11px] text-[var(--ink-muted)]">
            {body.length}/{MESSAGE_MAX}
          </span>
        </div>
        {error && (
          <p className="text-xs text-[var(--status-critical)]">{error}</p>
        )}
      </div>
    </section>
  );
}

export function InboxList() {
  const { loaded, signedIn, refresh } = useViewer();
  const [items, setItems] = useState<InboxSummary[] | null>(null);
  const [open, setOpen] = useState<Conversation | null>(null);
  const [composing, setComposing] = useState(false);
  const [opening, setOpening] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fetched = useRef(false);
  // Conversations fetched ahead of a click. Warmed on row hover/focus and
  // kept in step by replies; dropped nowhere, since a session's inbox is
  // small and a stale cache is corrected by the read-marking on open.
  const cache = useRef(new Map<string, Conversation>());
  const warming = useRef(new Set<string>());

  // Fired on mount, not on viewer readiness: the action checks auth itself,
  // so waiting for the viewer round trip before starting this one just
  // chained two latencies that could run side by side.
  useEffect(() => {
    if (fetched.current) return;
    fetched.current = true;
    getInbox().then((result) => {
      if (result.ok) setItems(result.items);
      else setError(result.error);
    });
  }, []);

  /// Prefetch, without marking read: "read" is a claim about the reader, not
  /// about the mouse passing by.
  const warm = useCallback((id: string) => {
    if (cache.current.has(id) || warming.current.has(id)) return;
    warming.current.add(id);
    getConversation(id, true).then((result) => {
      warming.current.delete(id);
      if (result.ok) cache.current.set(id, result.conversation);
    });
  }, []);

  const openThread = useCallback(
    async (id: string) => {
      const hit = cache.current.get(id);
      if (hit) {
        setOpen(hit);
        // The words are already here; only the read stamp is outstanding.
        void markConversationRead(id).then(() => refresh());
      } else {
        setOpening(id);
        const result = await getConversation(id);
        setOpening(null);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        cache.current.set(id, result.conversation);
        setOpen(result.conversation);
        void refresh();
      }
      // Reading is what clears the unread state, so the list row and the
      // header badge both follow from having opened it.
      setItems((prev) =>
        prev
          ? prev.map((t) => (t.id === id ? { ...t, unreadCount: 0 } : t))
          : prev,
      );
    },
    [refresh],
  );

  const onReplied = useCallback(
    (conversationId: string, reply: InboxMessage) => {
      setOpen((prev) => {
        const next = prev
          ? { ...prev, messages: [...prev.messages, reply] }
          : prev;
        if (next) cache.current.set(conversationId, next);
        return next;
      });
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

  /// A conversation the composer just started: a row for it goes on top, and
  /// the thread opens.
  const onSent = useCallback((conversation: Conversation) => {
    cache.current.set(conversation.id, conversation);
    const first = conversation.messages[0];
    setItems((prev) => [
      {
        id: conversation.id,
        kindLabel: conversation.kindLabel,
        other: conversation.other,
        otherUser: conversation.otherUser,
        subject: conversation.subject,
        entrySlug: null,
        entryName: null,
        started: first?.when ?? "",
        lastAt: first?.when ?? "",
        preview: firstLine(first?.body ?? ""),
        lastMine: true,
        messageCount: 1,
        unreadCount: 0,
      },
      ...(prev ?? []),
    ]);
    setComposing(false);
    setPage(0);
    setOpen(conversation);
  }, []);

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

  if (composing) {
    return <ComposeView onBack={() => setComposing(false)} onSent={onSent} />;
  }

  const pages = Math.max(1, Math.ceil(items.length / PER_PAGE));
  const current = Math.min(page, pages - 1);
  const visible = items.slice(current * PER_PAGE, (current + 1) * PER_PAGE);

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button
          type="button"
          onClick={() => setComposing(true)}
          className="rounded-md bg-[var(--accent-blue)] px-3 py-1.5 text-xs text-white transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)]"
        >
          Send new message
        </button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-6 text-center text-sm text-[var(--ink-muted)]">
          No messages. When a curator answers a report you sent or decides on
          something you submitted, their reply lands here - or start a
          conversation yourself with Send new message.
        </p>
      ) : (
        <div className="space-y-2">
          {visible.map((item) => (
            <div key={item.id} className={opening === item.id ? "opacity-50" : ""}>
              <SummaryRow
                item={item}
                onOpen={() => void openThread(item.id)}
                onWarm={() => warm(item.id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* The pager, only once there is something to page. Numbers rather than
          infinite scroll: an inbox is a finite place, and "page 2 of 3" says
          how much is left in a way a spinner never does. */}
      {pages > 1 && (
        <nav className="mt-4 flex items-center justify-center gap-4 text-xs">
          <button
            type="button"
            onClick={() => setPage(current - 1)}
            disabled={current === 0}
            className="rounded-md border border-[var(--hairline)] px-2.5 py-1 text-[var(--ink-secondary)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] disabled:opacity-40 disabled:hover:border-[var(--hairline)] disabled:hover:text-[var(--ink-secondary)]"
          >
            ← Newer
          </button>
          <span className="font-mono text-[11px] text-[var(--ink-muted)]">
            {current + 1} / {pages}
          </span>
          <button
            type="button"
            onClick={() => setPage(current + 1)}
            disabled={current >= pages - 1}
            className="rounded-md border border-[var(--hairline)] px-2.5 py-1 text-[var(--ink-secondary)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] disabled:opacity-40 disabled:hover:border-[var(--hairline)] disabled:hover:text-[var(--ink-secondary)]"
          >
            Older →
          </button>
        </nav>
      )}
    </div>
  );
}
