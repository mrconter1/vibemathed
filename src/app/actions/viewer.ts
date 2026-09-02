"use server";

import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { SIGNED_OUT, type ViewerState } from "@/lib/viewer";

/// Everything about the current viewer that the UI needs, in one round trip.
///
/// This is fetched from the client after hydration rather than read in the page,
/// on purpose: `auth()` reads cookies, and reading cookies during render would
/// make every page dynamic and throw away the prerendered static shell the
/// site's SEO relies on. The cost is a brief moment where the header does not
/// yet know who you are, which is a good trade for keeping 75 entry pages
/// prerendered.
export async function getViewerState(): Promise<ViewerState> {
  const session = await auth();
  if (!session?.user?.id) return SIGNED_OUT;

  const admin = isAdmin(session.user.email);

  const userId = session.user.id;

  const [votes, pendingReviews, openReports, unread, me, oldestPending] = await Promise.all([
    prisma.problemVote.findMany({
      where: { userId },
      select: { vote: true, problem: { select: { slug: true } } },
    }),
    // Only counted for admins - nobody else can act on it, and the size of the
    // unpublished queue is not public information.
    admin ? prisma.problem.count({ where: { status: "pending" } }) : Promise.resolve(0),
    admin
      ? prisma.problemReport.count({ where: { status: "open" } })
      : Promise.resolve(0),
    // Unread = comments by OTHERS, newer than the viewer's watermark, on
    // published entries the viewer submitted or has commented on. Raw SQL so
    // the watermark join happens inside ONE query - fetching the watermark
    // first and counting after doubled the action's latency, and this whole
    // fetch gates how fast the header controls appear.
    prisma.$queryRaw<{ count: bigint }[]>`
      SELECT count(*) AS count
      FROM "Comment" c
      JOIN "Problem" p ON p.id = c."problemId"
      JOIN "User" u ON u.id = ${userId}
      WHERE c."createdAt" > u."notificationsSeenAt"
        AND (c."userId" IS NULL OR c."userId" <> ${userId})
        AND p.status = 'published'::"ProblemStatus"
        AND (
          p."submittedById" = ${userId}
          OR EXISTS (
            SELECT 1 FROM "Comment" c2
            WHERE c2."problemId" = p.id AND c2."userId" = ${userId}
          )
        )
    `,
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        bio: true,
        role: true,
        verified: true,
        showGoogleName: true,
        showGoogleEmail: true,
        listed: true,
        showComments: true,
        notificationsSeenAt: true,
      },
    }),
    // The oldest wait, for the header's review pill. Admin-only for the same
    // reason as the count.
    admin
      ? prisma.problem.findFirst({
          where: { status: "pending" },
          orderBy: { createdAt: "asc" },
          select: { createdAt: true },
        })
      : Promise.resolve(null),
  ]);

  // Decisions on your own submissions count as unread too, on the same
  // watermark as comments. Curator mail is counted per message instead: the
  // inbox is a list of conversations, and opening one says nothing about
  // whether the others have been read.
  // Decisions are not counted here. Each one writes a DirectMessage, which
  // `unreadInbox` already counts, and adding both made a single rejection
  // light the bell twice.
  const unreadInbox = me
    ? await prisma.directMessage.count({ where: { userId, readAt: null } })
    : 0;

  const notifications = Number(unread[0]?.count ?? 0);

  return {
    signedIn: true,
    userId,
    pseudonym: session.user.pseudonym ?? null,
    bio: me?.bio ?? null,
    role: me?.role ?? null,
    verified: me?.verified ?? false,
    showGoogleName: me?.showGoogleName ?? false,
    showGoogleEmail: me?.showGoogleEmail ?? false,
    listed: me?.listed ?? true,
    showComments: me?.showComments ?? true,
    isAdmin: admin,
    pendingReviews,
    oldestPendingAt: oldestPending?.createdAt.toISOString() ?? null,
    openReports,
    notifications,
    unreadInbox,
    votes: Object.fromEntries(votes.map((v) => [v.problem.slug, v.vote])),
  };
}
