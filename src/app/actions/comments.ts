"use server";

import { updateTag } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatCommentDateTime, renderCommentHtml } from "@/lib/comment-render";
import {
  COMMENT_MAX_LENGTH,
  COMMENT_RATE_LIMIT_MS,
  type CommentView,
} from "@/lib/comments";
import { resolveSnapshot } from "@/lib/identity";

export type CommentResult =
  | { ok: true; comment: CommentView }
  | { ok: false; error: string };

export type DeleteResult = { ok: true } | { ok: false; error: string };

/// Shared validation for posting and editing.
function validate(raw: string): { ok: true; text: string } | { ok: false; error: string } {
  const text = raw.trim();
  if (text.length === 0) {
    return { ok: false, error: "Comment cannot be empty." };
  }
  if (text.length > COMMENT_MAX_LENGTH) {
    return {
      ok: false,
      error: `Comment is too long (max ${COMMENT_MAX_LENGTH} characters).`,
    };
  }
  return { ok: true, text };
}

/// Busts the cached comment list for this entry, plus the entry lists whose
/// cards show a comment count.
function invalidate(slug: string) {
  updateTag(`comments-${slug}`);
  updateTag("problems");
  updateTag(`problem-${slug}`);
  // Both the entry's own changelog and the site-wide activity feed.
  updateTag(`activity-${slug}`);
  updateTag("activity");
}

export async function addComment(slug: string, raw: string): Promise<CommentResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Sign in to comment." };
  }
  const userId = session.user.id;

  const checked = validate(raw);
  if (!checked.ok) return checked;

  const problem = await prisma.problem.findFirst({
    where: { slug, status: "published" },
    select: { id: true },
  });
  if (!problem) {
    return { ok: false, error: "That entry no longer exists." };
  }

  // Rate limit: reject if this person commented very recently, anywhere.
  const last = await prisma.comment.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { createdAt: true },
  });
  if (last && Date.now() - last.createdAt.getTime() < COMMENT_RATE_LIMIT_MS) {
    return { ok: false, error: "You're commenting too fast. Wait a few seconds." };
  }

  try {
    const userName = session.user.pseudonym ?? null;
    const created = await prisma.comment.create({
      data: { problemId: problem.id, userId, userName, body: checked.text },
      select: { id: true, createdAt: true },
    });
    await prisma.problemActivity.create({
      data: { problemId: problem.id, userId, userName, type: "commented" },
    });

    invalidate(slug);

    return {
      ok: true,
      comment: {
        id: created.id,
        authorId: userId,
        authorName: resolveSnapshot(userName, true),
        authorPseudonym: userName,
        html: renderCommentHtml(checked.text),
        source: checked.text,
        createdAt: formatCommentDateTime(created.createdAt),
        edited: false,
      },
    };
  } catch (error) {
    console.error("addComment failed", error);
    return { ok: false, error: "Could not post your comment. Please try again." };
  }
}

export async function editComment(
  commentId: string,
  raw: string,
  slug: string,
): Promise<CommentResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Sign in to edit." };
  }

  const checked = validate(raw);
  if (!checked.ok) return checked;

  const existing = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true, userName: true, createdAt: true },
  });
  if (!existing) {
    return { ok: false, error: "That comment no longer exists." };
  }
  // Ownership is checked on the server, not just hidden in the UI.
  if (existing.userId !== session.user.id) {
    return { ok: false, error: "You can only edit your own comments." };
  }

  try {
    await prisma.comment.update({
      where: { id: commentId },
      data: { body: checked.text, editedAt: new Date() },
    });

    invalidate(slug);

    return {
      ok: true,
      comment: {
        id: commentId,
        authorId: existing.userId,
        authorName: resolveSnapshot(existing.userName, true),
        authorPseudonym: session.user.pseudonym ?? null,
        html: renderCommentHtml(checked.text),
        source: checked.text,
        createdAt: formatCommentDateTime(existing.createdAt),
        edited: true,
      },
    };
  } catch (error) {
    console.error("editComment failed", error);
    return { ok: false, error: "Could not save your edit. Please try again." };
  }
}

export async function deleteComment(
  commentId: string,
  slug: string,
): Promise<DeleteResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Sign in to delete." };
  }

  const existing = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  });
  if (!existing) {
    return { ok: false, error: "That comment no longer exists." };
  }
  if (existing.userId !== session.user.id) {
    return { ok: false, error: "You can only delete your own comments." };
  }

  try {
    await prisma.comment.delete({ where: { id: commentId } });
    invalidate(slug);
    return { ok: true };
  } catch (error) {
    console.error("deleteComment failed", error);
    return { ok: false, error: "Could not delete that comment. Please try again." };
  }
}
