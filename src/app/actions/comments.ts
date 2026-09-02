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

/// A delete either removes the row (no replies) or blanks it (replies exist),
/// and the client needs to know which so the thread keeps its shape.
export type DeleteResult =
  | { ok: true; removed: true }
  | { ok: true; removed: false; comment: CommentView }
  | { ok: false; error: string };

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

/// The row as the client sees it. One place, so the three actions and the
/// cached reader cannot disagree about a field.
function toView(row: {
  id: string;
  userId: string | null;
  userName: string | null;
  body: string;
  createdAt: Date;
  editedAt: Date | null;
  parentId: string | null;
  upvotes: number;
  downvotes: number;
  deletedAt: Date | null;
  pseudonym: string | null;
}): CommentView {
  const deleted = row.deletedAt !== null;
  return {
    id: row.id,
    authorId: row.userId,
    authorName: resolveSnapshot(row.userName, row.userId !== null),
    authorPseudonym: row.pseudonym,
    html: deleted ? "" : renderCommentHtml(row.body),
    source: deleted ? "" : row.body,
    createdAt: formatCommentDateTime(row.createdAt),
    createdAtIso: row.createdAt.toISOString(),
    edited: row.editedAt !== null,
    parentId: row.parentId,
    upvotes: row.upvotes,
    downvotes: row.downvotes,
    deleted,
  };
}

/// Posts a comment, or a reply when `parentId` is given. A reply may answer
/// any comment on the same entry, at any depth - the tree is unbounded on the
/// server and the client decides how deep to indent.
export async function addComment(
  slug: string,
  raw: string,
  parentId: string | null = null,
): Promise<CommentResult> {
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

  // A reply must answer a comment on THIS entry. Checked here rather than
  // trusted from the client, since a comment id is guessable in principle.
  if (parentId !== null) {
    const parent = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { problemId: true, deletedAt: true },
    });
    if (!parent || parent.problemId !== problem.id) {
      return { ok: false, error: "The comment you are replying to no longer exists." };
    }
    if (parent.deletedAt !== null) {
      return { ok: false, error: "That comment was deleted; reply to another one." };
    }
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
      data: { problemId: problem.id, userId, userName, body: checked.text, parentId },
      select: { id: true, createdAt: true },
    });
    await prisma.problemActivity.create({
      data: { problemId: problem.id, userId, userName, type: "commented" },
    });

    invalidate(slug);

    return {
      ok: true,
      comment: toView({
        id: created.id,
        userId,
        userName,
        body: checked.text,
        createdAt: created.createdAt,
        editedAt: null,
        parentId,
        upvotes: 0,
        downvotes: 0,
        deletedAt: null,
        pseudonym: userName,
      }),
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
    select: {
      userId: true,
      userName: true,
      createdAt: true,
      parentId: true,
      upvotes: true,
      downvotes: true,
      deletedAt: true,
    },
  });
  if (!existing) {
    return { ok: false, error: "That comment no longer exists." };
  }
  // Ownership is checked on the server, not just hidden in the UI.
  if (existing.userId !== session.user.id) {
    return { ok: false, error: "You can only edit your own comments." };
  }
  if (existing.deletedAt !== null) {
    return { ok: false, error: "That comment was deleted." };
  }

  try {
    const editedAt = new Date();
    await prisma.comment.update({
      where: { id: commentId },
      data: { body: checked.text, editedAt },
    });

    invalidate(slug);

    return {
      ok: true,
      comment: toView({
        id: commentId,
        userId: existing.userId,
        userName: existing.userName,
        body: checked.text,
        createdAt: existing.createdAt,
        editedAt,
        parentId: existing.parentId,
        upvotes: existing.upvotes,
        downvotes: existing.downvotes,
        deletedAt: null,
        pseudonym: session.user.pseudonym ?? null,
      }),
    };
  } catch (error) {
    console.error("editComment failed", error);
    return { ok: false, error: "Could not save your edit. Please try again." };
  }
}

/// Deletes the viewer's own comment. With replies under it, the row is kept
/// and blanked instead, so the people who answered are not left replying to
/// nothing; the client swaps in the blanked view.
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
    select: {
      userId: true,
      userName: true,
      createdAt: true,
      editedAt: true,
      parentId: true,
      upvotes: true,
      downvotes: true,
      _count: { select: { replies: true } },
    },
  });
  if (!existing) {
    return { ok: false, error: "That comment no longer exists." };
  }
  if (existing.userId !== session.user.id) {
    return { ok: false, error: "You can only delete your own comments." };
  }

  try {
    if (existing._count.replies === 0) {
      await prisma.comment.delete({ where: { id: commentId } });
      invalidate(slug);
      return { ok: true, removed: true };
    }
    const deletedAt = new Date();
    await prisma.comment.update({
      where: { id: commentId },
      data: { body: "", deletedAt },
    });
    invalidate(slug);
    return {
      ok: true,
      removed: false,
      comment: toView({
        id: commentId,
        userId: existing.userId,
        userName: existing.userName,
        body: "",
        createdAt: existing.createdAt,
        editedAt: existing.editedAt,
        parentId: existing.parentId,
        upvotes: existing.upvotes,
        downvotes: existing.downvotes,
        deletedAt,
        pseudonym: session.user.pseudonym ?? null,
      }),
    };
  } catch (error) {
    console.error("deleteComment failed", error);
    return { ok: false, error: "Could not delete that comment. Please try again." };
  }
}
