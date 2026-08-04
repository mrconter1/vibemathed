"use server";

import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { formatCommentDate } from "@/lib/comment-render";
import { MESSAGE_MAX, messageKindLabel, reasonLabel } from "@/lib/messages";
import { prisma } from "@/lib/prisma";

// The reader's inbox: mail a curator wrote to them, read in full.
//
// The bell menu shows that something arrived; this is where the whole thing
// can actually be read. That split is the point of having a page at all - a
// 90-character snippet is fine for "someone replied to you" and useless for
// "here is why your submission was turned down".

export interface InboxItem {
  id: string;
  /// Human label for what prompted it, from MESSAGE_KINDS.
  kindLabel: string;
  /// The canned reason, already resolved to its label. Null when the curator
  /// wrote freehand.
  reason: string | null;
  body: string;
  from: string;
  /// The entry it concerns, when it still exists and is public.
  entrySlug: string | null;
  entryName: string | null;
  when: string;
  isNew: boolean;
}

export type InboxResult =
  | { ok: true; items: InboxItem[] }
  | { ok: false; error: string };

const PAGE = 50;

export async function getInbox(): Promise<InboxResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Sign in to read your inbox." };
  const userId = session.user.id;

  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { inboxSeenAt: true },
  });
  if (!me) return { ok: false, error: "Account not found." };

  const rows = await prisma.directMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: PAGE,
    select: {
      id: true,
      kind: true,
      reason: true,
      body: true,
      createdAt: true,
      senderName: true,
      sender: { select: { pseudonym: true } },
      problem: { select: { slug: true, name: true, status: true } },
    },
  });

  return {
    ok: true,
    items: rows.map((m) => ({
      id: m.id,
      kindLabel: messageKindLabel(m.kind),
      reason: reasonLabel(m.reason),
      body: m.body,
      from: m.sender?.pseudonym ?? m.senderName ?? "the curators",
      // A rejected entry has no public page, so it is named but not linked.
      entrySlug: m.problem?.status === "published" ? m.problem.slug : null,
      entryName: m.problem?.name ?? null,
      when: formatCommentDate(m.createdAt),
      isNew: m.createdAt > me.inboxSeenAt,
    })),
  };
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
