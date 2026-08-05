"use server";

import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { formatCommentDateTime } from "@/lib/comment-render";
import { MESSAGE_MAX, messageKindLabel, reasonLabel } from "@/lib/messages";
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

  // Two passes rather than one. A conversation is only partly addressed to
  // the reader: their own replies were addressed to the other end, so a query
  // on `userId` alone returns half of it. The first pass finds which threads
  // they are in, the second reads those threads whole.
  const involved = await prisma.directMessage.findMany({
    where: { OR: [{ userId }, { senderId: userId }] },
    orderBy: { createdAt: "desc" },
    take: PAGE * 4,
    select: { id: true, parentId: true },
  });
  const rootIds = [...new Set(involved.map((m) => m.parentId ?? m.id))].slice(0, PAGE);
  if (rootIds.length === 0) return { ok: true, items: [] };

  const rows = await prisma.directMessage.findMany({
    where: { OR: [{ id: { in: rootIds } }, { parentId: { in: rootIds } }] },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      parentId: true,
      kind: true,
      body: true,
      createdAt: true,
      readAt: true,
      userId: true,
      senderId: true,
      senderName: true,
      sender: { select: { pseudonym: true } },
      user: { select: { pseudonym: true } },
      problem: { select: { slug: true, name: true, status: true } },
    },
  });

  const items: InboxSummary[] = [];
  for (const root of rows.filter((m) => m.parentId === null)) {
    const thread = [root, ...rows.filter((m) => m.parentId === root.id)];
    const last = thread[thread.length - 1];
    // Whoever is not the reader. Read off the root, since both ends appear on
    // it whichever direction it went: a curator sees the submitter's name, a
    // submitter sees the curator's.
    const otherName =
      root.senderId === userId
        ? (root.user?.pseudonym ?? "them")
        : (root.sender?.pseudonym ?? root.senderName ?? "the curators");

    items.push({
      id: root.id,
      kindLabel: messageKindLabel(root.kind),
      other: otherName,
      entrySlug: root.problem?.status === "published" ? root.problem.slug : null,
      entryName: root.problem?.name ?? null,
      started: formatCommentDateTime(root.createdAt),
      lastAt: formatCommentDateTime(last.createdAt),
      preview: preview(last.body),
      lastMine: last.senderId === userId,
      messageCount: thread.length,
      unreadCount: thread.filter((m) => m.userId === userId && m.readAt === null).length,
    });
  }

  // Most recently spoken in first: a conversation answered an hour ago
  // belongs above one that has been quiet for a week.
  const order = new Map(rows.map((m, i) => [m.id, i]));
  const lastIndex = (id: string) =>
    Math.max(
      order.get(id) ?? 0,
      ...rows.filter((m) => m.parentId === id).map((m) => order.get(m.id) ?? 0),
    );
  items.sort((a, b) => lastIndex(b.id) - lastIndex(a.id));
  return { ok: true, items };
}

/// One conversation, in full, and reading it marks it read.
///
/// The read stamp lands here rather than on the list for a reason: this is
/// the only call that actually returns the words, so it is the only moment
/// when "read" is true.
export async function getConversation(rootId: string): Promise<ConversationResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Sign in to read your inbox." };
  const userId = session.user.id;

  const root = await prisma.directMessage.findUnique({
    where: { id: rootId },
    select: {
      id: true,
      parentId: true,
      kind: true,
      userId: true,
      senderId: true,
      senderName: true,
      sender: { select: { pseudonym: true } },
      user: { select: { pseudonym: true } },
      problem: { select: { slug: true, name: true, status: true } },
    },
  });
  // A reply id is not a conversation id, and neither is somebody else's.
  if (!root || root.parentId !== null) {
    return { ok: false, error: "That conversation no longer exists." };
  }
  if (root.userId !== userId && root.senderId !== userId) {
    return { ok: false, error: "That conversation is not yours." };
  }

  const rows = await prisma.directMessage.findMany({
    where: { OR: [{ id: rootId }, { parentId: rootId }] },
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
  });

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
  const unread = rows.filter((m) => m.userId === userId && m.readAt === null);
  if (unread.length > 0) {
    await prisma.directMessage.updateMany({
      where: { id: { in: unread.map((m) => m.id) } },
      data: { readAt: new Date() },
    });
  }

  return {
    ok: true,
    conversation: {
      id: root.id,
      kindLabel: messageKindLabel(root.kind),
      other:
        root.senderId === userId
          ? (root.user?.pseudonym ?? "them")
          : (root.sender?.pseudonym ?? root.senderName ?? "the curators"),
      entrySlug: root.problem?.status === "published" ? root.problem.slug : null,
      entryName: root.problem?.name ?? null,
      messages,
      canReply: (root.userId === userId ? root.senderId : root.userId) !== null,
    },
  };
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
/// know who they are answering. Nothing on the site lets a curator type an
/// arbitrary recipient, which keeps this from becoming a way to cold-message
/// readers.
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
