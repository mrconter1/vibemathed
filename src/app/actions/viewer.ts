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

  const [votes, pendingReviews] = await Promise.all([
    prisma.problemVote.findMany({
      where: { userId: session.user.id },
      select: { vote: true, problem: { select: { slug: true } } },
    }),
    // Only counted for admins - nobody else can act on it, and the size of the
    // unpublished queue is not public information.
    admin ? prisma.problem.count({ where: { status: "pending" } }) : Promise.resolve(0),
  ]);

  return {
    signedIn: true,
    userId: session.user.id,
    pseudonym: session.user.pseudonym ?? null,
    isAdmin: admin,
    pendingReviews,
    votes: Object.fromEntries(votes.map((v) => [v.problem.slug, v.vote])),
  };
}
