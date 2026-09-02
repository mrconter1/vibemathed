"use server";

// Curators' working notes on a submission under review. Internal: read and
// written on the review page only, never shown on the entry or to the
// submitter (that channel is the inbox, via sendDirectMessage).
//
// Plain text, short, append-only. A note is a message to the next reviewer -
// "source checked, waiting on the author about the tier" - not a document.

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { canReview } from "@/lib/curators";
import { formatCommentDateTime } from "@/lib/comment-render";
import { REVIEW_NOTE_MAX } from "@/lib/review-notes";

export interface ReviewNoteView {
  id: string;
  userName: string;
  body: string;
  createdAt: string;
}

export type ReviewNoteResult = { ok: true; note: ReviewNoteView } | { ok: false; error: string };

export async function addReviewNote(slug: string, raw: string): Promise<ReviewNoteResult> {
  const session = await auth();
  if (!session?.user?.id || !canReview(session.user)) {
    return { ok: false, error: "Not authorised." };
  }

  const body = raw.trim();
  if (!body) return { ok: false, error: "Write something first." };
  if (body.length > REVIEW_NOTE_MAX) {
    return { ok: false, error: `Notes are capped at ${REVIEW_NOTE_MAX} characters.` };
  }

  const problem = await prisma.problem.findUnique({ where: { slug }, select: { id: true } });
  if (!problem) return { ok: false, error: "That submission no longer exists." };

  try {
    const note = await prisma.reviewNote.create({
      data: {
        problemId: problem.id,
        userId: session.user.id,
        userName: session.user.pseudonym ?? null,
        body,
      },
      select: { id: true, userName: true, body: true, createdAt: true },
    });
    return {
      ok: true,
      note: {
        id: note.id,
        userName: note.userName ?? "Curator",
        body: note.body,
        createdAt: formatCommentDateTime(note.createdAt),
      },
    };
  } catch (error) {
    console.error("addReviewNote failed", error);
    return { ok: false, error: "Could not save the note." };
  }
}
