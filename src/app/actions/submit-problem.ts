"use server";

import type { Prisma } from "@prisma/client";
import { updateTag } from "next/cache";
import { auth } from "@/auth";
import { isAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import { isHttpUrl, isValidSolveDate } from "@/lib/editable";
import {
  SUBMISSION_FIELDS,
  SUBMISSION_WINDOW_MS,
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

  // One submission per person per day, so a burst cannot flood the queue.
  // Admins bypass it.
  if (!admin) {
    const since = new Date(Date.now() - SUBMISSION_WINDOW_MS);
    const recent = await prisma.problem.count({
      where: { submittedById: userId, createdAt: { gte: since } },
    });
    if (recent >= 1) {
      return {
        ok: false,
        error: "You can submit one entry per day. Try again tomorrow.",
      };
    }
  }

  // Validate and coerce every field against its spec.
  const data: Record<string, string | number | string[] | null> = {};
  for (const spec of SUBMISSION_FIELDS) {
    const raw = (values[spec.key] ?? "").trim();

    if (raw === "") {
      if (spec.required) return { ok: false, error: `${spec.label} is required.` };
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
      default:
        if (spec.key === "solveDate" && !isValidSolveDate(raw)) {
          return { ok: false, error: "Solve date must be YYYY, YYYY-MM or YYYY-MM-DD." };
        }
        data[spec.key] = raw;
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
export async function approveSubmission(slug: string): Promise<ReviewResult> {
  const session = await requireAdmin();
  if (!session) return { ok: false, error: "Not authorised." };

  const problem = await prisma.problem.findUnique({
    where: { slug },
    select: { id: true, status: true },
  });
  if (!problem) return { ok: false, error: "That submission no longer exists." };
  if (problem.status !== "pending") {
    return { ok: false, error: "That submission has already been reviewed." };
  }

  try {
    await prisma.$transaction([
      prisma.problem.update({ where: { id: problem.id }, data: { status: "published" } }),
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
export async function rejectSubmission(slug: string): Promise<ReviewResult> {
  const session = await requireAdmin();
  if (!session) return { ok: false, error: "Not authorised." };

  const problem = await prisma.problem.findUnique({
    where: { slug },
    select: { id: true, status: true },
  });
  if (!problem) return { ok: false, error: "That submission no longer exists." };
  if (problem.status !== "pending") {
    return { ok: false, error: "That submission has already been reviewed." };
  }

  try {
    await prisma.$transaction([
      prisma.problem.update({ where: { id: problem.id }, data: { status: "rejected" } }),
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

  updateTag("submissions");
  return { ok: true };
}
