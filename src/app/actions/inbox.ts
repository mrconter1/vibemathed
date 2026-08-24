"use server";

import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { formatCommentDateTime } from "@/lib/comment-render";
import { MESSAGE_MAX, SUBJECT_MAX, messageKindLabel, reasonLabel } from "@/lib/messages";
import { prisma } from "@/lib/prisma";

// The reader's inbox: mail a curator wrote to them, read in full.
//
// The bell menu shows that something arrived; this is where the whole thing
// can actually be read. That split is the point of having a page at all - a
// 90-character snippet is fine for "someone replied to you" and useless for
// "here is why your submission was turned down".

/// One message inside a conversation.
export interface InboxMessage {
  id: string;
  /// The canned reason, already resolved to its label. Null when the curator
  /// wrote freehand, and always null on a reply.
  reason: string | null;
  body: string;
  from: string;
  when: string;
  /// Arrived, and not yet opened. Only ever true on messages addressed to the
  /// reader: your own words are never unread.
  isNew: boolean;
  /// Written by the person reading it. Drives the side it sits on and the
  /// wording, since "from you" reads badly against your own words.
  mine: boolean;
}

/// A row in the conversation list. Enough to decide whether to open it, and
/// nothing more: the messages themselves are fetched when it is opened.
export interface InboxSummary {
  /// The root message's id, which is also the conversation's id.
  id: string;
  /// Human label for what prompted it, from MESSAGE_KINDS.
  kindLabel: string;
  /// Who is on the other end.
  other: string;
  /// The other end's pseudonym when they are a real account, so the name can
  /// link to their profile. Null for "the curators" and deleted accounts.
  otherUser: string | null;
  /// The composer's subject line. Null on curator mail, which is headed by
  /// its kind and entry instead.
  subject: string | null;
  /// The entry it concerns, when it still exists and is public.
  entrySlug: string | null;
  entryName: string | null;
  /// When the conversation opened, and when it was last spoken in.
  started: string;
  lastAt: string;
  /// First line of the most recent message, for the list.
  preview: string;
  /// Whether the last word was the reader's own, so the list can say so.
  lastMine: boolean;
  messageCount: number;
  unreadCount: number;
}

export type InboxResult =
  | { ok: true; items: InboxSummary[] }
  | { ok: false; error: string };

export interface Conversation {
  id: string;
  kindLabel: string;
  other: string;
  otherUser: string | null;
  subject: string | null;
  entrySlug: string | null;
  entryName: string | null;
  messages: InboxMessage[];
  /// Whether there is somebody at the other end to answer. False for a
  /// contact-form message sent by a visitor with no account: there is no
  /// inbox to deliver a reply to, so the composer is not offered rather than
  /// offered and then refused.
  canReply: boolean;
}

export type ConversationResult =
  | { ok: true; conversation: Conversation }
  | { ok: false; error: string };

export type ReplyResult =
  | { ok: true; message: InboxMessage }
  | { ok: false; error: string };

const PAGE = 50;

/// Wait between replies, matched to the comment limiter. Curator mail is a
/// slower surface than a discussion thread, so this only needs to stop a
/// runaway loop, not pace a conversation.
const REPLY_RATE_LIMIT_MS = 5000;

/// The first line of a message, short enough for a list row.
function preview(body: string, limit = 110): string {
  const line = body.trim().split("\n")[0] ?? "";
  return line.length > limit ? `${line.slice(0, limit - 1).trimEnd()}…` : line;
}

/// The conversations the reader is in, most recently spoken in first.
///
/// Deliberately does NOT mark anything read. A list is a list of things you
/// have not necessarily read yet, and the old behaviour - open the page,
/// everything is read - meant a decision could be marked as read by a glance
/// at a page that never showed its text.
export async function getInbox(): Promise<InboxResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Sign in to read your inbox." };
  const userId = session.user.id;

  // One query, and NOT capped at the SQL level: the order a reader cares
  // about is by last ACTIVITY, which is not known until the replies are in
  // hand, so a `take` here would cut on the wrong axis. This used to
  // `take: PAGE` ordered by the root's own `createdAt`, which is a
  // conversation's AGE, not its activity - a root from three weeks ago that
  // got a reply five minutes ago sorted by that reply for display, but had
  // already been cut from the batch fetched, by root age, before that reply
  // was ever looked at. The result: a genuinely unread, genuinely recent
  // conversation invisible on every page, with no error and no sign anything
  // was missing - exactly what this project's own curator hit at 90
  // conversations, the 75th oldest, its most recent reply nine days after
  // the row itself would have been fetched. Fetching every one of this
  // reader's threads and slicing after the real sort (below) fixes it, at
  // the cost of the take: for a personal-scale inbox - curator and
  // submitter conversations, not a message platform - even the busiest
  // account today is two digits, so this is still the one query it always
  // was.
  //
  // Membership in a thread is decided entirely by its root: the two ends of
  // a conversation are the root's recipient and sender, and `replyToMessage`
  // only ever lets those two write in it. So the reader's threads are
  // exactly the roots naming them, and `include: replies` brings each thread
  // along in the same round trip - this used to be two sequential queries,
  // the first of which filtered on unindexed `senderId` and scanned the
  // table.
  const roots = await prisma.directMessage.findMany({
    where: { parentId: null, OR: [{ userId }, { senderId: userId }] },
    select: {
      id: true,
      kind: true,
      subject: true,
      body: true,
      createdAt: true,
      readAt: true,
      userId: true,
      senderId: true,
      senderName: true,
      sender: { select: { pseudonym: true } },
      user: { select: { pseudonym: true } },
      problem: { select: { slug: true, name: true, status: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        select: {
          body: true,
          createdAt: true,
          readAt: true,
          userId: true,
          senderId: true,
        },
      },
    },
  });

  const items = roots.map((root) => {
    const last = root.replies[root.replies.length - 1] ?? root;
    // Whoever is not the reader. Read off the root, since both ends appear on
    // it whichever direction it went: a curator sees the submitter's name, a
    // submitter sees the curator's.
    const otherUser =
      root.senderId === userId
        ? (root.user?.pseudonym ?? null)
        : (root.sender?.pseudonym ?? null);
    const other =
      otherUser ??
      (root.senderId === userId ? "them" : (root.senderName ?? "the curators"));
    const unread = (m: { userId: string; readAt: Date | null }) =>
      m.userId === userId && m.readAt === null;

    return {
      stamp: last.createdAt.getTime(),
      item: {
        id: root.id,
        kindLabel: messageKindLabel(root.kind),
        other,
        otherUser,
        subject: root.subject,
        entrySlug: root.problem?.status === "published" ? root.problem.slug : null,
        entryName: root.problem?.name ?? null,
        started: formatCommentDateTime(root.createdAt),
        lastAt: formatCommentDateTime(last.createdAt),
        preview: preview(last.body),
        lastMine: last.senderId === userId,
        messageCount: 1 + root.replies.length,
        unreadCount: (unread(root) ? 1 : 0) + root.replies.filter(unread).length,
      } satisfies InboxSummary,
    };
  });

  // Most recently spoken in first: a conversation answered an hour ago
  // belongs above one that has been quiet for a week. The PAGE cap applies
  // HERE, after the true order is known, not at the query above - see the
  // comment there for what went wrong when it was the other way round.
  items.sort((a, b) => b.stamp - a.stamp);
  return { ok: true, items: items.slice(0, PAGE).map((x) => x.item) };
}

/// One conversation, in full.
///
/// Reading it marks it read, unless `peek` is set. Peek exists for the list's
/// hover prefetch: fetching words ahead of time is a speed win, but "read"
/// has to mean the reader actually opened it, so a prefetch takes the words
/// and leaves the stamp to `markConversationRead`.
export async function getConversation(
  rootId: string,
  peek = false,
): Promise<ConversationResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Sign in to read your inbox." };
  const userId = session.user.id;

  // Root and thread in one round trip; membership is checked after the read.
  const root = await prisma.directMessage.findUnique({
    where: { id: rootId },
    select: {
      id: true,
      parentId: true,
      kind: true,
      subject: true,
      reason: true,
      body: true,
      createdAt: true,
      readAt: true,
      userId: true,
      senderId: true,
      senderName: true,
      sender: { select: { pseudonym: true } },
      user: { select: { pseudonym: true } },
      problem: { select: { slug: true, name: true, status: true } },
      replies: {
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          reason: true,
          body: true,
          createdAt: true,
          readAt: true,
          userId: true,
          senderId: true,
          senderName: true,
          sender: { select: { pseudonym: true } },
        },
      },
    },
  });
  // A reply id is not a conversation id, and neither is somebody else's.
  if (!root || root.parentId !== null) {
    return { ok: false, error: "That conversation no longer exists." };
  }
  if (root.userId !== userId && root.senderId !== userId) {
    return { ok: false, error: "That conversation is not yours." };
  }

  const rows = [root, ...root.replies];
  const messages: InboxMessage[] = rows.map((m) => ({
    id: m.id,
    reason: reasonLabel(m.reason),
    body: m.body,
    from: m.sender?.pseudonym ?? m.senderName ?? "the curators",
    when: formatCommentDateTime(m.createdAt),
    isNew: m.userId === userId && m.readAt === null,
    mine: m.senderId === userId,
  }));

  // Stamped after the view is built, so the messages that were unread on
  // arrival still render with their marker this once.
  if (!peek) {
    const unread = rows.filter((m) => m.userId === userId && m.readAt === null);
    if (unread.length > 0) {
      await prisma.directMessage.updateMany({
        where: { id: { in: unread.map((m) => m.id) } },
        data: { readAt: new Date() },
      });
    }
  }

  const otherUser =
    root.senderId === userId
      ? (root.user?.pseudonym ?? null)
      : (root.sender?.pseudonym ?? null);
  return {
    ok: true,
    conversation: {
      id: root.id,
      kindLabel: messageKindLabel(root.kind),
      other:
        otherUser ??
        (root.senderId === userId ? "them" : (root.senderName ?? "the curators")),
      otherUser,
      subject: root.subject,
      entrySlug: root.problem?.status === "published" ? root.problem.slug : null,
      entryName: root.problem?.name ?? null,
      messages,
      canReply: (root.userId === userId ? root.senderId : root.userId) !== null,
    },
  };
}

/// Settles the read stamp for a conversation fetched with `peek`. Called when
/// a prefetched thread is actually opened; scoped to the reader's own unread
/// messages, so it cannot mark anything on the other end.
export async function markConversationRead(rootId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.id) return;
  await prisma.directMessage.updateMany({
    where: {
      userId: session.user.id,
      readAt: null,
      OR: [{ id: rootId }, { parentId: rootId }],
    },
    data: { readAt: new Date() },
  });
}

/// Answers a message, inside its thread.
///
/// This is the only way a non-curator can create a message, and it is
/// deliberately the only one: the recipient is derived from the thread rather
/// than supplied, so nobody can open a conversation with a stranger. Both
/// sides can use it, so a curator answering a reply goes through here too.
export async function replyToMessage(messageId: string, raw: string): Promise<ReplyResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Sign in to reply." };
  const userId = session.user.id;

  const body = raw.trim();
  if (!body) return { ok: false, error: "Reply cannot be empty." };
  if (body.length > MESSAGE_MAX) {
    return { ok: false, error: `Reply is too long (max ${MESSAGE_MAX} characters).` };
  }

  const target = await prisma.directMessage.findUnique({
    where: { id: messageId },
    select: { id: true, parentId: true },
  });
  if (!target) return { ok: false, error: "That message no longer exists." };

  // Replies attach to the root, never to each other, so the thread stays flat
  // however deep the exchange goes.
  const rootId = target.parentId ?? target.id;
  const root = await prisma.directMessage.findUnique({
    where: { id: rootId },
    select: { id: true, userId: true, senderId: true, problemId: true },
  });
  if (!root) return { ok: false, error: "That message no longer exists." };

  // The two ends of the thread, and the only two accounts allowed to write in
  // it. A message whose sender has since deleted their account has one end
  // missing, and cannot be answered.
  const other = userId === root.userId ? root.senderId : userId === root.senderId ? root.userId : null;
  if (!other) return { ok: false, error: "This conversation cannot be replied to." };

  const last = await prisma.directMessage.findFirst({
    where: { senderId: userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (last && Date.now() - last.createdAt.getTime() < REPLY_RATE_LIMIT_MS) {
    return { ok: false, error: "You're replying too fast. Wait a few seconds." };
  }

  try {
    const created = await prisma.directMessage.create({
      data: {
        userId: other,
        senderId: userId,
        senderName: session.user.pseudonym ?? null,
        kind: "reply",
        body,
        problemId: root.problemId,
        parentId: root.id,
      },
      select: { id: true, createdAt: true },
    });
    return {
      ok: true,
      message: {
        id: created.id,
        reason: null,
        body,
        from: session.user.pseudonym ?? "you",
        when: formatCommentDateTime(created.createdAt),
        isNew: false,
        mine: true,
      },
    };
  } catch (error) {
    console.error("replyToMessage failed", error);
    return { ok: false, error: "Could not send your reply. Please try again." };
  }
}

/// Pseudonyms matching a composer's To field, for the autocomplete.
///
/// Pseudonyms are the site's only public identity, already shown on every
/// comment and vote, so listing matches leaks nothing. Signed-in only, two
/// characters minimum, eight results: enough to find someone, not enough to
/// walk the user table.
export async function searchUsers(raw: string): Promise<string[]> {
  const session = await auth();
  if (!session?.user?.id) return [];
  const q = raw.trim();
  if (q.length < 2) return [];
  const rows = await prisma.user.findMany({
    where: {
      pseudonym: { contains: q, mode: "insensitive" },
      NOT: { id: session.user.id },
    },
    orderBy: { pseudonym: "asc" },
    take: 8,
    select: { pseudonym: true },
  });
  return rows.map((r) => r.pseudonym).filter((p): p is string => p !== null);
}

/// How many conversations one account may start per day. A gentle cap: real
/// use is a handful, and a spammer's value scales with volume, so this is
/// where the two part ways.
const NEW_THREADS_PER_DAY = 10;

/// Starts a conversation from the composer.
///
/// This opens the door `replyToMessage`'s design kept shut: a recipient is
/// typed rather than derived from a thread. The trade is deliberate - readers
/// asked to be able to write to the curators (and each other) without waiting
/// to be written to first - and the daily cap plus the reply rate limit are
/// what keep the open door from becoming a cold-mail cannon.
export async function startConversation(input: {
  to: string;
  subject: string;
  body: string;
}): Promise<ConversationResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Sign in to send a message." };
  const userId = session.user.id;

  const subject = input.subject.trim();
  const body = input.body.trim();
  if (!subject) return { ok: false, error: "Give the message a subject." };
  if (subject.length > SUBJECT_MAX) {
    return { ok: false, error: `Subject is too long (max ${SUBJECT_MAX} characters).` };
  }
  if (!body) return { ok: false, error: "Message cannot be empty." };
  if (body.length > MESSAGE_MAX) {
    return { ok: false, error: `Message is too long (max ${MESSAGE_MAX} characters).` };
  }

  // The recipient must exist, exactly. Insensitive on case because the To
  // field is typed by hand, but never fuzzy: "did you mean" belongs in the
  // autocomplete, not in where mail gets delivered.
  const to = input.to.trim();
  const recipient = to
    ? await prisma.user.findFirst({
        where: { pseudonym: { equals: to, mode: "insensitive" } },
        select: { id: true, pseudonym: true },
      })
    : null;
  if (!recipient) {
    return { ok: false, error: `No user named "${to}". Pick a name from the suggestions.` };
  }
  if (recipient.id === userId) {
    return { ok: false, error: "That would be a note to yourself." };
  }

  const dayAgo = new Date(Date.now() - 86_400_000);
  const started = await prisma.directMessage.count({
    where: { senderId: userId, parentId: null, createdAt: { gte: dayAgo } },
  });
  if (started >= NEW_THREADS_PER_DAY) {
    return { ok: false, error: "You have started a lot of conversations today. Try again tomorrow." };
  }

  try {
    const created = await prisma.directMessage.create({
      data: {
        userId: recipient.id,
        senderId: userId,
        senderName: session.user.pseudonym ?? null,
        kind: "message",
        subject,
        body,
      },
      select: { id: true, createdAt: true },
    });
    // The full conversation, so the composer can land in the thread it just
    // started without another round trip.
    return {
      ok: true,
      conversation: {
        id: created.id,
        kindLabel: messageKindLabel("message"),
        other: recipient.pseudonym ?? "them",
        otherUser: recipient.pseudonym,
        subject,
        entrySlug: null,
        entryName: null,
        messages: [
          {
            id: created.id,
            reason: null,
            body,
            from: session.user.pseudonym ?? "you",
            when: formatCommentDateTime(created.createdAt),
            isNew: false,
            mine: true,
          },
        ],
        canReply: true,
      },
    };
  } catch (error) {
    console.error("startConversation failed", error);
    return { ok: false, error: "Could not send your message. Please try again." };
  }
}

/// How many messages are addressed to the reader and not yet opened. Read by
/// the header badge, so it stays a count query rather than a fetch.
export async function countUnreadMessages(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) return 0;
  return prisma.directMessage.count({
    where: { userId: session.user.id, readAt: null },
  });
}

/// Writes one message into a reader's inbox.
///
/// Server-only helper rather than an exported action taking a recipient: the
/// callers are the review queue and the reports queue, both of which already
/// know who they are answering. Typed recipients go through
/// `startConversation` and its caps instead.
export async function sendDirectMessage(input: {
  userId: string | null | undefined;
  kind: string;
  body: string;
  reason?: string | null;
  problemId?: string | null;
}): Promise<void> {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) return;

  // Nothing to deliver, or nobody to deliver it to. An anonymous report has
  // no account behind it, which is a normal outcome, not an error.
  const body = input.body.trim();
  if (!input.userId || (!body && !input.reason)) return;

  try {
    await prisma.directMessage.create({
      data: {
        userId: input.userId,
        senderId: session?.user?.id ?? null,
        senderName: session?.user?.pseudonym ?? null,
        kind: input.kind,
        reason: input.reason ?? null,
        body: body.slice(0, MESSAGE_MAX),
        problemId: input.problemId ?? null,
      },
    });
  } catch (error) {
    // A message that fails to save must not roll back the decision that
    // prompted it: the review or the report handling already happened.
    console.error("sendDirectMessage failed", error);
  }
}
