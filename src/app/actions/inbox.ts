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

/// One message. A thread is a root plus the replies under it, and both are
/// this shape: a reply carries no reason and no entry of its own, but is
/// otherwise read the same way.
export interface InboxMessage {
  id: string;
  /// The canned reason, already resolved to its label. Null when the curator
  /// wrote freehand, and always null on a reply.
  reason: string | null;
  body: string;
  from: string;
  when: string;
  isNew: boolean;
  /// Written by the person reading it. Drives the alignment and the wording,
  /// since "from you" reads badly against your own words.
  mine: boolean;
}

export interface InboxItem extends InboxMessage {
  /// Human label for what prompted the thread, from MESSAGE_KINDS.
  kindLabel: string;
  /// The entry it concerns, when it still exists and is public.
  entrySlug: string | null;
  entryName: string | null;
  replies: InboxMessage[];
}

export type InboxResult =
  | { ok: true; items: InboxItem[] }
  | { ok: false; error: string };

export type ReplyResult =
  | { ok: true; message: InboxMessage }
  | { ok: false; error: string };

const PAGE = 50;

/// Wait between replies, matched to the comment limiter. Curator mail is a
/// slower surface than a discussion thread, so this only needs to stop a
/// runaway loop, not pace a conversation.
const REPLY_RATE_LIMIT_MS = 5000;

export async function getInbox(): Promise<InboxResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Sign in to read your inbox." };
  const userId = session.user.id;

  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { inboxSeenAt: true },
  });
  if (!me) return { ok: false, error: "Account not found." };

  // Two passes rather than one. A thread is only partly addressed to the
  // reader: their own replies were addressed to the curator, so a query on
  // `userId` alone returns half a conversation. The first pass finds which
  // threads they are in, the second reads those threads whole.
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
      reason: true,
      body: true,
      createdAt: true,
      senderId: true,
      senderName: true,
      sender: { select: { pseudonym: true } },
      problem: { select: { slug: true, name: true, status: true } },
    },
  });

  const view = (m: (typeof rows)[number]): InboxMessage => ({
    id: m.id,
    reason: reasonLabel(m.reason),
    body: m.body,
    from: m.sender?.pseudonym ?? m.senderName ?? "the curators",
    when: formatCommentDateTime(m.createdAt),
    // Your own words are never unread, whenever you wrote them.
    isNew: m.senderId !== userId && m.createdAt > me.inboxSeenAt,
    mine: m.senderId === userId,
  });

  const roots = rows.filter((m) => m.parentId === null);
  const items: InboxItem[] = roots.map((root) => {
    const replies = rows.filter((m) => m.parentId === root.id).map(view);
    return {
      ...view(root),
      kindLabel: messageKindLabel(root.kind),
      // A rejected entry has no public page, so it is named but not linked.
      entrySlug: root.problem?.status === "published" ? root.problem.slug : null,
      entryName: root.problem?.name ?? null,
      replies,
    };
  });

  // Newest conversation first, counting replies: a thread someone answered an
  // hour ago belongs above one that has been quiet for a week.
  const lastAt = (t: InboxItem) => t.replies.at(-1)?.id ?? t.id;
  const order = new Map(rows.map((m, i) => [m.id, i]));
  items.sort((a, b) => (order.get(lastAt(b)) ?? 0) - (order.get(lastAt(a)) ?? 0));
  return { ok: true, items };
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

/// How many messages arrived since the reader last opened the inbox. Read by
/// the header badge, so it stays a count query rather than a fetch.
export async function countUnreadMessages(): Promise<number> {
  const session = await auth();
  if (!session?.user?.id) return 0;
  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { inboxSeenAt: true },
  });
  if (!me) return 0;
  return prisma.directMessage.count({
    where: { userId: session.user.id, createdAt: { gt: me.inboxSeenAt } },
  });
}

/// Moves the inbox watermark. Deliberately separate from the notifications
/// watermark: opening the bell should not mark unread curator mail as read.
export async function markInboxSeen(): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { inboxSeenAt: new Date() },
    });
    return { ok: true };
  } catch (error) {
    console.error("markInboxSeen failed", error);
    return { ok: false };
  }
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
