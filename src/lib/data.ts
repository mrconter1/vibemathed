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
import {
  CHANGELOG_TYPES,
  type ActivityView,
  type SiteActivityView,
} from "@/lib/activity";
import { formatCommentDate, renderCommentHtml } from "@/lib/comment-render";
import type { CommentView } from "@/lib/comments";
import { resolveSnapshot } from "@/lib/identity";
import type {
  AiContribution,
  FieldGroup,
  ProblemWithTrends,
  ProblemWithVotes,
  ResolutionStatus,
  SolveType,
  VerificationStatus,
} from "@/lib/problems";

export type { ProblemWithTrends, ProblemWithVotes };

const PROBLEM_SELECT = {
  slug: true,
  name: true,
  shortName: true,
  problemNumber: true,
  field: true,
  fieldGroup: true,
  statement: true,
  posedBy: true,
  yearPosed: true,
  solveType: true,
  resolution: true,
  claimIssueNote: true,
  aiContribution: true,
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
  links: { select: { label: true, url: true }, orderBy: { position: "asc" } },
  upvotes: true,
  downvotes: true,
  submittedBy: { select: { pseudonym: true } },
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
    fieldGroup: r.fieldGroup as FieldGroup | null,
    statement: r.statement,
    posedBy: r.posedBy,
    yearPosed: r.yearPosed,
    solveType: r.solveType as SolveType,
    resolution: r.resolution as ResolutionStatus,
    claimIssueNote: r.claimIssueNote,
    aiContribution: r.aiContribution as AiContribution | null,
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
    links: r.links.map((l) => ({ label: l.label, url: l.url })),
    upvotes: r.upvotes,
    downvotes: r.downvotes,
    score: r.upvotes - r.downvotes,
    commentCount: r._count.comments,
    // Null for the curated baseline; a pseudonym for community submissions.
    submittedBy: r.submittedBy?.pseudonym ?? null,
  };
}

const DAY_MS = 24 * 60 * 60 * 1000;

/// Per-problem engagement inside a time window, keyed by problem id.
interface WindowCounts {
  score: Map<string, number>;
  comments: Map<string, number>;
}

/// Aggregates votes and comments newer than `since`.
///
/// Two grouped queries rather than one per problem - at 75 entries this is two
/// round trips regardless of list size, and the whole thing sits inside the
/// cached read so it runs at most once a minute.
async function countsSince(since: Date): Promise<WindowCounts> {
  const [votes, comments] = await Promise.all([
    prisma.problemVote.groupBy({
      by: ["problemId", "vote"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
    prisma.comment.groupBy({
      by: ["problemId"],
      where: { createdAt: { gte: since } },
      _count: { _all: true },
    }),
  ]);

  const score = new Map<string, number>();
  for (const row of votes) {
    // Net score: an up adds, a down subtracts.
    const delta = row.vote === "up" ? row._count._all : -row._count._all;
    score.set(row.problemId, (score.get(row.problemId) ?? 0) + delta);
  }

  const commentCounts = new Map<string, number>();
  for (const row of comments) {
    commentCounts.set(row.problemId, row._count._all);
  }

  return { score, comments: commentCounts };
}

/// Every publicly listed problem. Pending and rejected submissions are excluded.
export async function getPublishedProblems(): Promise<ProblemWithTrends[]> {
  "use cache";
  cacheTag("problems");
  cacheLife("minutes");

  // `cacheLife("minutes")` means these window edges are up to a minute stale,
  // which is immaterial for a 7- or 30-day window.
  const now = Date.now();
  const [rows, week, month] = await Promise.all([
    prisma.problem.findMany({
      where: { status: "published" },
      select: { ...PROBLEM_SELECT, id: true },
      orderBy: { solveDate: "desc" },
    }),
    countsSince(new Date(now - 7 * DAY_MS)),
    countsSince(new Date(now - 30 * DAY_MS)),
  ]);

  return rows.map((row) => ({
    ...toProblem(row),
    score7d: week.score.get(row.id) ?? 0,
    score30d: month.score.get(row.id) ?? 0,
    comments7d: week.comments.get(row.id) ?? 0,
    comments30d: month.comments.get(row.id) ?? 0,
  }));
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

/// The changelog for one entry, newest first.
export async function getActivity(slug: string): Promise<ActivityView[]> {
  "use cache";
  cacheTag(`activity-${slug}`);
  cacheLife("minutes");

  const rows = await prisma.problemActivity.findMany({
    where: { problem: { slug }, type: { in: [...CHANGELOG_TYPES] } },
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      userId: true,
      userName: true,
      type: true,
      field: true,
      oldValue: true,
      newValue: true,
      createdAt: true,
    },
  });

  return rows.map((a) => ({
    id: a.id,
    userName: resolveSnapshot(a.userName, a.userId !== null),
    type: a.type,
    field: a.field,
    oldValue: a.oldValue,
    newValue: a.newValue,
    createdAt: formatCommentDate(a.createdAt),
  }));
}

/// Site-wide recent activity, newest first, across published entries only.
///
/// Same type filter as the per-entry changelog: votes are recorded but not
/// shown, because an unbounded "X voted" stream would bury the edits and
/// discussion this is meant to surface.
export async function getRecentActivity(limit = 8): Promise<SiteActivityView[]> {
  "use cache";
  cacheTag("activity");
  cacheLife("minutes");

  const rows = await prisma.problemActivity.findMany({
    where: {
      type: { in: [...CHANGELOG_TYPES] },
      problem: { status: "published" },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      userId: true,
      userName: true,
      type: true,
      field: true,
      oldValue: true,
      newValue: true,
      createdAt: true,
      problem: { select: { name: true, slug: true } },
    },
  });

  return rows.map((a) => ({
    id: a.id,
    userName: resolveSnapshot(a.userName, a.userId !== null),
    type: a.type,
    field: a.field,
    oldValue: a.oldValue,
    newValue: a.newValue,
    createdAt: formatCommentDate(a.createdAt),
    problemName: a.problem.name,
    problemSlug: a.problem.slug,
  }));
}

/// Total registered accounts, for the community tile on the home page.
///
/// Nothing revalidates a tag on sign-up (accounts are created inside the
/// Auth.js adapter), so freshness rests on the one-minute cache life alone -
/// which is plenty for a headline count.
export async function getUserCount(): Promise<number> {
  "use cache";
  cacheTag("users");
  cacheLife("minutes");

  return prisma.user.count();
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
