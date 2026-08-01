"use server";

import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

// Entry reports: a reader flags an entry for curator attention, with a
// free-text explanation. Reports are private - no activity row, no public
// rendering - and rate-limited like submissions.

const MAX_PER_DAY = 3;
const BODY_MAX = 1000;

export type ReportResult = { ok: true } | { ok: false; error: string };

export async function reportProblem(slug: string, body: string): Promise<ReportResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Sign in to report." };
  }
  const userId = session.user.id;

  const text = body.trim();
  if (!text) {
    return { ok: false, error: "Describe the issue first." };
  }
  if (text.length > BODY_MAX) {
    return { ok: false, error: `Keep it under ${BODY_MAX} characters.` };
  }

  const problem = await prisma.problem.findFirst({
    where: { slug, status: "published" },
    select: { id: true },
  });
  if (!problem) {
    return { ok: false, error: "That entry no longer exists." };
  }

  // Rolling 24h window, same shape as the submission limit. Admins are
  // exempt for the same reason they are there: they are the moderation.
  if (!isAdmin(session.user.email)) {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recent = await prisma.problemReport.count({
      where: { userId, createdAt: { gte: since } },
    });
    if (recent >= MAX_PER_DAY) {
      return {
        ok: false,
        error: `You have used your ${MAX_PER_DAY} reports for today. Try again tomorrow.`,
      };
    }
  }

  try {
    await prisma.problemReport.create({
      data: {
        problemId: problem.id,
        userId,
        userName: session.user.pseudonym ?? null,
        body: text,
      },
    });
    return { ok: true };
  } catch (error) {
    console.error("reportProblem failed", error);
    return { ok: false, error: "Could not send the report. Please try again." };
  }
}

/// Marks a report as handled. Curator-only; the report stays in the table as
/// a record, it just leaves the queue and the badge count.
export async function handleReport(reportId: string): Promise<ReportResult> {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return { ok: false, error: "Not allowed." };
  }

  try {
    await prisma.problemReport.update({
      where: { id: reportId },
      data: { status: "handled", handledAt: new Date() },
    });
    return { ok: true };
  } catch (error) {
    console.error("handleReport failed", error);
    return { ok: false, error: "Could not update the report." };
  }
}
