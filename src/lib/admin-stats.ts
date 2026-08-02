// Everything the admin page knows from our own database.
//
// Deliberately no caching: this is a single admin looking at a private page,
// and stale numbers on a dashboard you opened to check something are worse
// than a few hundred milliseconds of query.

import { prisma } from "@/lib/prisma";

export interface DayPoint {
  day: string;
  count: number;
}

export interface AdminStats {
  users: { total: number; withEntries: number; withComments: number; banned: number };
  entries: { published: number; pending: number; rejected: number };
  engagement: { votes: number; comments: number; reportsOpen: number; reportsTotal: number };
  review: { decided: number; approved: number; medianHours: number | null };
  registrations: DayPoint[];
  submissions: DayPoint[];
  activity: DayPoint[];
  topSubmitters: { name: string; entries: number }[];
  /// Entries + edits + comments per member: who is actually building the
  /// record, which top-submitters alone does not show.
  topContributors: { name: string; total: number; detail: string }[];
}

/// Buckets timestamps into a continuous run of days ending today, so a chart
/// shows the zero days instead of silently closing the gap.
function byDay(dates: Date[], days: number): DayPoint[] {
  const counts = new Map<string, number>();
  for (const d of dates) {
    const key = d.toISOString().slice(0, 10);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const out: DayPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const key = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    out.push({ day: key, count: counts.get(key) ?? 0 });
  }
  return out;
}

/// How many days of history actually exist. Charting a fixed 30 days on a
/// site that launched two weeks ago is mostly empty bars, which reads as a
/// dead site rather than a young one.
export async function availableDays(cap = 30): Promise<number> {
  const [firstUser, firstProblem] = await Promise.all([
    prisma.user.findFirst({ orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
    prisma.problem.findFirst({ orderBy: { createdAt: "asc" }, select: { createdAt: true } }),
  ]);
  const stamps = [firstUser?.createdAt, firstProblem?.createdAt].filter(
    (d): d is Date => d instanceof Date,
  );
  if (stamps.length === 0) return 1;
  const earliest = Math.min(...stamps.map((d) => d.getTime()));
  const spanDays = Math.floor((Date.now() - earliest) / 86400000) + 1;
  return Math.max(1, Math.min(cap, spanDays));
}

export async function getAdminStats(days = 30): Promise<AdminStats> {
  const since = new Date(Date.now() - days * 86400000);

  const [
    userRows,
    banned,
    usersWithEntries,
    usersWithComments,
    published,
    pending,
    rejected,
    votes,
    comments,
    reportsOpen,
    reportsTotal,
    submissionRows,
    activityRows,
    reviewed,
    submitterGroups,
  ] = await Promise.all([
    prisma.user.findMany({ where: { createdAt: { gte: since } }, select: { createdAt: true } }),
    prisma.user.count({ where: { banned: true } }),
    prisma.user.count({ where: { submittedProblems: { some: {} } } }),
    prisma.user.count({ where: { comments: { some: {} } } }),
    prisma.problem.count({ where: { status: "published" } }),
    prisma.problem.count({ where: { status: "pending" } }),
    prisma.problem.count({ where: { status: "rejected" } }),
    prisma.problemVote.count(),
    prisma.comment.count(),
    prisma.problemReport.count({ where: { status: "open" } }),
    prisma.problemReport.count(),
    prisma.problem.findMany({
      where: { createdAt: { gte: since }, submittedById: { not: null } },
      select: { createdAt: true },
    }),
    prisma.problemActivity.findMany({
      where: { createdAt: { gte: since } },
      select: { createdAt: true },
    }),
    prisma.problem.findMany({
      where: { reviewedAt: { not: null }, submittedById: { not: null } },
      select: { createdAt: true, reviewedAt: true, status: true },
    }),
    prisma.problem.groupBy({
      by: ["submittedById"],
      where: { submittedById: { not: null }, status: "published" },
      _count: { _all: true },
      orderBy: { _count: { submittedById: "desc" } },
      take: 5,
    }),
  ]);

  // How long submitters wait for an answer. Median, not mean: one entry left
  // for a week would drag an average into fiction.
  const waits = reviewed
    .map((r) => ((r.reviewedAt as Date).getTime() - r.createdAt.getTime()) / 3600000)
    .filter((h) => h >= 0)
    .sort((a, b) => a - b);
  const medianHours = waits.length
    ? Math.round(waits[Math.floor(waits.length / 2)] * 10) / 10
    : null;

  // One pass over the three things a member can do. Small tables, so this
  // is cheaper than three grouped queries plus a join.
  const [entryRows, editRows, commentRows, allNames, totalUsers] = await Promise.all([
    prisma.problem.findMany({
      where: { status: "published", submittedById: { not: null } },
      select: { submittedById: true },
    }),
    prisma.problemActivity.findMany({
      where: { userId: { not: null }, type: "updated" },
      select: { userId: true },
    }),
    prisma.comment.findMany({
      where: { userId: { not: null } },
      select: { userId: true },
    }),
    prisma.user.findMany({ select: { id: true, pseudonym: true } }),
    prisma.user.count(),
  ]);

  const tally = new Map<string, { entries: number; edits: number; comments: number }>();
  const bump = (id: string | null, key: "entries" | "edits" | "comments") => {
    if (!id) return;
    const row = tally.get(id) ?? { entries: 0, edits: 0, comments: 0 };
    row[key] += 1;
    tally.set(id, row);
  };
  for (const r of entryRows) bump(r.submittedById, "entries");
  for (const r of editRows) bump(r.userId, "edits");
  for (const r of commentRows) bump(r.userId, "comments");

  // One name map serves both leaderboards; no second round trip for it.
  const displayName = new Map(allNames.map((u) => [u.id, u.pseudonym ?? "Anonymous"]));
  const nameOf = displayName;
  const topContributors = [...tally.entries()]
    .map(([id, c]) => ({
      name: displayName.get(id) ?? "Anonymous",
      total: c.entries + c.edits + c.comments,
      detail: `${c.entries}e · ${c.edits}ed · ${c.comments}c`,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

  return {
    topContributors,
    users: {
      total: totalUsers,
      withEntries: usersWithEntries,
      withComments: usersWithComments,
      banned,
    },
    entries: { published, pending, rejected },
    engagement: { votes, comments, reportsOpen, reportsTotal },
    review: {
      decided: reviewed.length,
      approved: reviewed.filter((r) => r.status === "published").length,
      medianHours,
    },
    registrations: byDay(userRows.map((u) => u.createdAt), days),
    submissions: byDay(submissionRows.map((p) => p.createdAt), days),
    activity: byDay(activityRows.map((a) => a.createdAt), days),
    topSubmitters: submitterGroups.map((g) => ({
      name: nameOf.get(g.submittedById as string) ?? "Anonymous",
      entries: g._count._all,
    })),
  };
}
