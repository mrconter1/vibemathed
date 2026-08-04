"use server";

import type { Prisma } from "@prisma/client";
import { updateTag } from "next/cache";
import { auth } from "@/auth";
import { sendDirectMessage } from "@/app/actions/inbox";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { isHttpUrl, isValidSolveDate, parseLinks } from "@/lib/editable";
import {
  SUBMISSION_FIELDS,
  SUBMISSION_WINDOW_MS,
  SUBMISSIONS_PER_WINDOW,
  slugify,
  type SubmissionValues,
} from "@/lib/submission";

export type SubmitResult =
  | { ok: true; slug: string }
  | { ok: false; error: string };

export type ReviewResult = { ok: true } | { ok: false; error: string };


/// Submits a new entry for review. It is stored with status `pending` and is
/// invisible everywhere public until an admin approves it.
export async function submitProblem(values: SubmissionValues): Promise<SubmitResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Sign in to submit an entry." };
  }
  const userId = session.user.id;
  const userName = session.user.pseudonym ?? null;
  const admin = isAdmin(session.user.email);

  // A few submissions per person per day, so a burst cannot flood the queue.
  // Admins bypass it.
  if (!admin) {
    const since = new Date(Date.now() - SUBMISSION_WINDOW_MS);
    const recent = await prisma.problem.count({
      where: { submittedById: userId, createdAt: { gte: since } },
    });
    if (recent >= SUBMISSIONS_PER_WINDOW) {
      return {
        ok: false,
        error: `You can submit up to ${SUBMISSIONS_PER_WINDOW} entries per rolling 24 hours. Try again later.`,
      };
    }
  }

  // Validate and coerce every field against its spec.
  const data: Record<string, unknown> = {};
  for (const spec of SUBMISSION_FIELDS) {
    const raw = (values[spec.key] ?? "").trim();

    if (raw === "") {
      if (spec.required) return { ok: false, error: `${spec.label} is required.` };
      // No rows submitted: omit the nested relation entirely.
      if (spec.kind === "links") continue;
      data[spec.key] = spec.kind === "list" ? [] : null;
      continue;
    }
    if (spec.maxLength && raw.length > spec.maxLength) {
      return { ok: false, error: `${spec.label} is too long (max ${spec.maxLength}).` };
    }

    switch (spec.kind) {
      case "choice": {
        const allowed = (spec.options ?? []).map((o) => o.value);
        if (!allowed.includes(raw)) {
          return { ok: false, error: `${spec.label} is not a valid option.` };
        }
        data[spec.key] = raw;
        break;
      }
      case "number": {
        if (!/^\d+$/.test(raw)) {
          return { ok: false, error: `${spec.label} must be a whole number.` };
        }
        const n = Number(raw);
        if (spec.key === "yearPosed" && (n < 1000 || n > 3000)) {
          return { ok: false, error: "Year posed must be a four-digit year." };
        }
        data[spec.key] = n;
        break;
      }
      case "url":
        if (!isHttpUrl(raw)) {
          return { ok: false, error: `${spec.label} must start with http:// or https://.` };
        }
        data[spec.key] = raw;
        break;
      case "list":
        data[spec.key] = raw.split(",").map((s) => s.trim()).filter(Boolean);
        break;
      case "links": {
        const parsed = parseLinks(raw);
        if (!parsed.ok) return { ok: false, error: parsed.error };
        // Nested create - links are their own table, not a column.
        data[spec.key] = {
          create: parsed.value.map((l, position) => ({ ...l, position })),
        };
        break;
      }
      default:
        if (spec.key === "solveDate" && !isValidSolveDate(raw)) {
          return { ok: false, error: "Solve date must be YYYY, YYYY-MM or YYYY-MM-DD." };
        }
        data[spec.key] = raw;
    }
  }

  // Claiming a top verification tier requires evidence in the submission
  // itself. The edit path already refuses to MOVE an entry up the ladder
  // without a note; before this, creation had no such rule, so a submission
  // could assert "Lean-verified" with no artifact and no explanation and land
  // in the review queue looking authoritative. Reviewers need something to
  // check, so ask for the note or a link (the primary source alone does not
  // count - a paper claiming a Lean proof is not the Lean proof).
  const claimedTier = String(data.verification ?? "");
  if (claimedTier === "lean-verified" || claimedTier === "expert-verified") {
    const note = String(data.verificationNote ?? "").trim();
    const linkRows = Array.isArray((data.links as { create?: unknown[] })?.create)
      ? ((data.links as { create: unknown[] }).create.length as number)
      : 0;
    if (!note && linkRows === 0) {
      return {
        ok: false,
        error:
          "A Lean-verified or independently expert-verified claim needs evidence: add a verification note saying who or what checked it, or link the formalization or review.",
      };
    }
  }

  // Derive a unique slug from the name.
  const base = slugify(String(data.name ?? ""));
  if (!base) {
    return { ok: false, error: "Name must contain some letters or numbers." };
  }
  let slug = base;
  for (let n = 2; n < 50; n++) {
    const taken = await prisma.problem.findUnique({ where: { slug }, select: { id: true } });
    if (!taken) break;
    slug = `${base}-${n}`;
  }

  // The loop above returns an error for any missing required field, so by here
  // every column Prisma demands is populated. TypeScript cannot see that
  // through the dynamic field walk, hence the assertion.
  const createInput = {
    ...data,
    slug,
    // Notability is a curator measurement (frozen snapshot), never
    // self-reported. Starts at 0 until looked up.
    renownLangs: 0,
    status: "pending",
    submittedById: userId,
  } as unknown as Prisma.ProblemUncheckedCreateInput;

  try {
    const created = await prisma.problem.create({
      data: createInput,
      select: { id: true },
    });
    await prisma.problemActivity.create({
      data: { problemId: created.id, userId, userName, type: "submitted" },
    });
  } catch (error) {
    console.error("submitProblem failed", error);
    return { ok: false, error: "Could not save your submission. Please try again." };
  }

  updateTag("submissions");
  return { ok: true, slug };
}

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return null;
  if (!isAdmin(session.user.email)) return null;
  return session;
}

/// Publishes a pending submission.
export async function approveSubmission(
  slug: string,
  message = "",
  reason: string | null = null,
): Promise<ReviewResult> {
  const session = await requireAdmin();
  if (!session) return { ok: false, error: "Not authorised." };

  const problem = await prisma.problem.findUnique({
    where: { slug },
    select: { id: true, status: true, submittedById: true },
  });
  if (!problem) return { ok: false, error: "That submission no longer exists." };
  if (problem.status !== "pending") {
    return { ok: false, error: "That submission has already been reviewed." };
  }

  try {
    await prisma.$transaction([
      prisma.problem.update({
        where: { id: problem.id },
        data: {
          status: "published",
          reviewedAt: new Date(),
          reviewMessage: message.trim() || null,
          reviewReason: reason,
        },
      }),
      prisma.problemActivity.create({
        data: {
          problemId: problem.id,
          userId: session.user.id,
          userName: session.user.pseudonym ?? null,
          type: "approved",
        },
      }),
    ]);
  } catch (error) {
    console.error("approveSubmission failed", error);
    return { ok: false, error: "Could not approve that entry." };
  }

  // The decision already shows in the submitter's notifications; this puts the
  // full text somewhere they can actually read it.
  await sendDirectMessage({
    userId: problem.submittedById,
    kind: "decision",
    reason,
    body: message,
    problemId: problem.id,
  });

  updateTag("problems");
  updateTag(`problem-${slug}`);
  updateTag("submissions");
  // An approved entry brings its whole history into the public feed.
  updateTag(`activity-${slug}`);
  updateTag("activity");
  return { ok: true };
}

/// Turns down a pending submission. Kept in the database so the submitter can
/// see the outcome rather than having their work vanish.
export async function rejectSubmission(
  slug: string,
  message = "",
  reason: string | null = null,
): Promise<ReviewResult> {
  const session = await requireAdmin();
  if (!session) return { ok: false, error: "Not authorised." };

  const problem = await prisma.problem.findUnique({
    where: { slug },
    select: { id: true, status: true, submittedById: true },
  });
  if (!problem) return { ok: false, error: "That submission no longer exists." };
  if (problem.status !== "pending") {
    return { ok: false, error: "That submission has already been reviewed." };
  }

  try {
    await prisma.$transaction([
      prisma.problem.update({
        where: { id: problem.id },
        data: {
          status: "rejected",
          reviewedAt: new Date(),
          reviewMessage: message.trim() || null,
          reviewReason: reason,
        },
      }),
      prisma.problemActivity.create({
        data: {
          problemId: problem.id,
          userId: session.user.id,
          userName: session.user.pseudonym ?? null,
          type: "rejected",
        },
      }),
    ]);
  } catch (error) {
    console.error("rejectSubmission failed", error);
    return { ok: false, error: "Could not reject that entry." };
  }

  // The one place this matters most: a rejected entry has no public page, so
  // without the inbox the reason existed only as a truncated line in a menu.
  await sendDirectMessage({
    userId: problem.submittedById,
    kind: "decision",
    reason,
    body: message,
    problemId: problem.id,
  });

  updateTag("submissions");
  return { ok: true };
}
