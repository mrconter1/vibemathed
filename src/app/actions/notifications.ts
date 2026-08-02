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

  // A curator's decision on YOUR submission, with whatever message they
  // left. Rejected entries have no public page, so those rows link nowhere -
  // the message is the whole notification.
  const decisions = await prisma.problem.findMany({
    where: { submittedById: userId, reviewedAt: { not: null } },
    orderBy: { reviewedAt: "desc" },
    take: FEED_SIZE,
    select: {
      id: true,
      slug: true,
      name: true,
      status: true,
      reviewedAt: true,
      reviewMessage: true,
    },
  });

  const decisionItems: NotificationItem[] = decisions.map((d) => ({
    id: `decision-${d.id}`,
    kind: "decision" as const,
    entrySlug: d.status === "published" ? d.slug : "",
    entryName: d.name,
    author: d.status === "published" ? "Approved" : "Not accepted",
    snippet:
      d.reviewMessage && d.reviewMessage.length > SNIPPET_MAX
        ? `${d.reviewMessage.slice(0, SNIPPET_MAX)}…`
        : (d.reviewMessage ??
          (d.status === "published"
            ? "Your submission is now published."
            : "Your submission was not accepted.")),
    when: formatCommentDate(d.reviewedAt as Date),
    isNew: (d.reviewedAt as Date) > me.notificationsSeenAt,
  }));

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

  // Newest first across both kinds, then capped: a decision is not more
  // important than a reply, it is just another thing that happened.
  const merged = [...items, ...decisionItems]
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
