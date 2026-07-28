"use server";

import { updateTag } from "next/cache";
import type { VoteKind } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export type VoteResult =
  | { ok: true; userVote: VoteKind | null; upvotes: number; downvotes: number }
  | { ok: false; error: string };

/// Casts, switches, or undoes the signed-in viewer's vote on one entry.
///
/// Keyed by public slug rather than row id so internal UUIDs never reach the
/// client. Vote row, activity record and denormalized tally all move inside one
/// transaction, so the counters cannot drift from the underlying votes.
export async function voteOnProblem(slug: string, vote: VoteKind): Promise<VoteResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Sign in to vote." };
  }
  const userId = session.user.id;
  const userName = session.user.pseudonym ?? null;

  const problem = await prisma.problem.findFirst({
    where: { slug, status: "published" },
    select: { id: true },
  });
  if (!problem) {
    return { ok: false, error: "That entry no longer exists." };
  }
  const problemId = problem.id;

  try {
    const outcome = await prisma.$transaction(async (tx) => {
      const existing = await tx.problemVote.findUnique({
        where: { problemId_userId: { problemId, userId } },
        select: { id: true, vote: true },
      });

      // First vote on this entry.
      if (!existing) {
        await tx.problemVote.create({ data: { problemId, userId, vote } });
        await tx.problemActivity.create({
          data: { problemId, userId, userName, type: "voted", vote },
        });
        const counts = await tx.problem.update({
          where: { id: problemId },
          data:
            vote === "up" ? { upvotes: { increment: 1 } } : { downvotes: { increment: 1 } },
          select: { upvotes: true, downvotes: true },
        });
        return { userVote: vote as VoteKind | null, ...counts };
      }

      // Clicking the same direction again undoes the vote.
      if (existing.vote === vote) {
        await tx.problemVote.delete({ where: { id: existing.id } });
        await tx.problemActivity.create({
          data: { problemId, userId, userName, type: "unvoted", vote },
        });
        const counts = await tx.problem.update({
          where: { id: problemId },
          data:
            vote === "up" ? { upvotes: { decrement: 1 } } : { downvotes: { decrement: 1 } },
          select: { upvotes: true, downvotes: true },
        });
        return { userVote: null as VoteKind | null, ...counts };
      }

      // Switching direction moves one across both tallies.
      await tx.problemVote.update({ where: { id: existing.id }, data: { vote } });
      await tx.problemActivity.create({
        data: { problemId, userId, userName, type: "voted", vote },
      });
      const counts = await tx.problem.update({
        where: { id: problemId },
        data:
          vote === "up"
            ? { upvotes: { increment: 1 }, downvotes: { decrement: 1 } }
            : { upvotes: { decrement: 1 }, downvotes: { increment: 1 } },
        select: { upvotes: true, downvotes: true },
      });
      return { userVote: vote as VoteKind | null, ...counts };
    });

    // `updateTag` rather than `revalidateTag`: the voter must see their own
    // vote reflected immediately, not stale-while-revalidate content.
    updateTag("problems");
    updateTag(`problem-${slug}`);

    return { ok: true, ...outcome };
  } catch (error) {
    console.error("voteOnProblem failed", error);
    return { ok: false, error: "Could not save your vote. Please try again." };
  }
}
