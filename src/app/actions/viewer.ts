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

  const [votes, pendingReviews, openReports, me] = await Promise.all([
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
    prisma.user.findUnique({
      where: { id: userId },
      select: { notificationsSeenAt: true },
    }),
  ]);

  // Unread = comments by OTHERS, newer than the viewer's watermark, on
  // published entries the viewer submitted or has commented on.
  const notifications = me
    ? await prisma.comment.count({
        where: {
          createdAt: { gt: me.notificationsSeenAt },
          NOT: { userId },
          problem: {
            status: "published",
            OR: [
              { submittedById: userId },
              { comments: { some: { userId } } },
            ],
          },
        },
      })
    : 0;

  return {
    signedIn: true,
    userId,
    pseudonym: session.user.pseudonym ?? null,
    isAdmin: admin,
    pendingReviews,
    openReports,
    notifications,
    votes: Object.fromEntries(votes.map((v) => [v.problem.slug, v.vote])),
  };
}
