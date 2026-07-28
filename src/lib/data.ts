// Database-backed reads for problems.
//
// Split by cacheability, which is what makes Partial Prerendering work here:
//
//   - Curated content and vote TALLIES are public and identical for everyone,
//     so they live behind `use cache` + `cacheTag` and end up in the static
//     shell. `revalidateTag` in the vote action refreshes them.
//   - The viewer's OWN vote is per-request and must never be cached publicly.
//     It is read dynamically (see `src/app/actions/vote.ts`) and applied on the
//     client, so one person's vote can never leak into another's page.
//
// `'use cache: private'` would also fit the second case, but it is still marked
// experimental in Next 16 (it depends on runtime prefetching, which is not
// stable), so this deliberately uses a plain dynamic read instead.

import type { Prisma } from "@prisma/client";
import { cacheLife, cacheTag } from "next/cache";
import { prisma } from "@/lib/prisma";
import { formatCommentDate, renderCommentHtml } from "@/lib/comment-render";
import type { CommentView } from "@/lib/comments";
import { resolveSnapshot } from "@/lib/identity";
import type { ProblemWithVotes, SolveType, VerificationStatus } from "@/lib/problems";

export type { ProblemWithVotes };

const PROBLEM_SELECT = {
  slug: true,
  name: true,
  shortName: true,
  problemNumber: true,
  field: true,
  statement: true,
  posedBy: true,
  yearPosed: true,
  solveType: true,
  solveDate: true,
  model: true,
  modelMaker: true,
  humanCollaborators: true,
  aiRole: true,
  verification: true,
  verificationNote: true,
  citations: true,
  citationsPaper: true,
  citationsSource: true,
  citationsUrl: true,
  renownLangs: true,
  renownNote: true,
  resultNote: true,
  ageNote: true,
  sourceUrl: true,
  sourceName: true,
  upvotes: true,
  downvotes: true,
  _count: { select: { comments: true } },
} as const;

type ProblemRow = Prisma.ProblemGetPayload<{ select: typeof PROBLEM_SELECT }>;

// `solveType` and `verification` are stored as strings (see the note in
// prisma/schema.prisma). Every writer validates them first - the seed runs them
// through `assertProblem` - so the casts here restore the union types the rest
// of the app is written against rather than re-validating on every read.
function toProblem(r: ProblemRow): ProblemWithVotes {
  return {
    slug: r.slug,
    name: r.name,
    shortName: r.shortName,
    problemNumber: r.problemNumber,
    field: r.field,
    statement: r.statement,
    posedBy: r.posedBy,
    yearPosed: r.yearPosed,
    solveType: r.solveType as SolveType,
    solveDate: r.solveDate,
    model: r.model,
    modelMaker: r.modelMaker,
    humanCollaborators: r.humanCollaborators,
    aiRole: r.aiRole,
    verification: r.verification as VerificationStatus,
    verificationNote: r.verificationNote,
    citations: r.citations,
    citationsPaper: r.citationsPaper,
    citationsSource: r.citationsSource,
    citationsUrl: r.citationsUrl,
    renownLangs: r.renownLangs,
    renownNote: r.renownNote,
    resultNote: r.resultNote,
    ageNote: r.ageNote,
    sourceUrl: r.sourceUrl,
    sourceName: r.sourceName,
    upvotes: r.upvotes,
    downvotes: r.downvotes,
    score: r.upvotes - r.downvotes,
    commentCount: r._count.comments,
  };
}

/// Every publicly listed problem. Pending and rejected submissions are excluded.
export async function getPublishedProblems(): Promise<ProblemWithVotes[]> {
  "use cache";
  cacheTag("problems");
  cacheLife("minutes");

  const rows = await prisma.problem.findMany({
    where: { status: "published" },
    select: PROBLEM_SELECT,
    orderBy: { solveDate: "desc" },
  });
  return rows.map(toProblem);
}

/// One problem by its public slug, or null when it does not exist or is not
/// published. Tagged individually so a vote only busts that entry's page.
export async function getProblemBySlug(slug: string): Promise<ProblemWithVotes | null> {
  "use cache";
  cacheTag("problems", `problem-${slug}`);
  cacheLife("minutes");

  const row = await prisma.problem.findFirst({
    where: { slug, status: "published" },
    select: PROBLEM_SELECT,
  });
  return row ? toProblem(row) : null;
}

/// The discussion on one entry, oldest first.
///
/// Public and identical for everyone, so it is cached and lands in the entry
/// page's static shell (which also means comments get indexed). Whether the
/// viewer may edit a given comment is decided on the client by comparing
/// `authorId` against their own id.
export async function getComments(slug: string): Promise<CommentView[]> {
  "use cache";
  cacheTag(`comments-${slug}`);
  cacheLife("minutes");

  const rows = await prisma.comment.findMany({
    where: { problem: { slug } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      userId: true,
      userName: true,
      body: true,
      createdAt: true,
      editedAt: true,
    },
  });

  return rows.map((c) => ({
    id: c.id,
    authorId: c.userId,
    authorName: resolveSnapshot(c.userName, c.userId !== null),
    html: renderCommentHtml(c.body),
    source: c.body,
    createdAt: formatCommentDate(c.createdAt),
    edited: c.editedAt !== null,
  }));
}

/// Slugs of every published problem, for `generateStaticParams` and the sitemap.
export async function getPublishedSlugs(): Promise<string[]> {
  "use cache";
  cacheTag("problems");
  cacheLife("hours");

  const rows = await prisma.problem.findMany({
    where: { status: "published" },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}
