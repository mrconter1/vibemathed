"use server";

import { auth } from "@/auth";
import { formatCommentDate } from "@/lib/comment-render";
import { prisma } from "@/lib/prisma";

// The viewer's notification feed: comments by others on entries they
// submitted or have commented on. Computed against the per-user seen
// watermark (User.notificationsSeenAt) - there are no notification rows.

export interface NotificationItem {
  id: string;
  /// "comment" is someone replying on an entry you are involved with;
  /// "decision" is a curator approving or rejecting your submission.
  kind: "comment" | "decision";
  entrySlug: string;
  entryName: string;
  /// Who commented - live pseudonym, falling back to the stored snapshot.
  author: string;
  /// Plain-text opening of the comment.
  snippet: string;
  when: string;
  /// Newer than the viewer's watermark at fetch time.
  isNew: boolean;
}

export type NotificationsResult =
  | { ok: true; items: NotificationItem[] }
  | { ok: false; error: string };

const FEED_SIZE = 12;
const SNIPPET_MAX = 90;

export async function getNotifications(): Promise<NotificationsResult> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Sign in first." };
  const userId = session.user.id;

  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { notificationsSeenAt: true },
  });
  if (!me) return { ok: false, error: "Account not found." };

  // The recent feed regardless of read state - the panel shows context, the
  // watermark only decides which rows light up as new.
  const rows = await prisma.comment.findMany({
    where: {
      NOT: { userId },
      problem: {
        status: "published",
        OR: [{ submittedById: userId }, { comments: { some: { userId } } }],
      },
    },
    orderBy: { createdAt: "desc" },
    take: FEED_SIZE,
    select: {
      id: true,
      body: true,
      createdAt: true,
      userName: true,
      user: { select: { pseudonym: true } },
      problem: { select: { slug: true, name: true } },
    },
  });

  // Decisions used to be their own rows here. They no longer are: a decision
  // always writes a DirectMessage carrying the full reasoning, so showing
  // both meant one action produced two notifications, the bell's being a
  // truncated copy of the inbox's. The inbox owns this now.

  const items: NotificationItem[] = rows.map((r) => ({
    id: r.id,
    kind: "comment" as const,
    entrySlug: r.problem.slug,
    entryName: r.problem.name,
    author: r.user?.pseudonym ?? r.userName ?? "deleted account",
    snippet:
      r.body.length > SNIPPET_MAX ? `${r.body.slice(0, SNIPPET_MAX)}…` : r.body,
    when: formatCommentDate(r.createdAt),
    isNew: r.createdAt > me.notificationsSeenAt,
  }));

  const merged = items
    .sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1))
    .slice(0, FEED_SIZE);

  return { ok: true, items: merged };
}

/// Moves the watermark to now, so everything currently unread stops counting.
/// Called when the viewer opens the notifications panel.
export async function markNotificationsSeen(): Promise<{ ok: boolean }> {
  const session = await auth();
  if (!session?.user?.id) return { ok: false };
  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { notificationsSeenAt: new Date() },
    });
    return { ok: true };
  } catch (error) {
    console.error("markNotificationsSeen failed", error);
    return { ok: false };
  }
}
