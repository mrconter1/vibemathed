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
import type { ProfileLinks } from "@/lib/profile-links";
import {
  CHANGELOG_TYPES,
  collapseBursts,
  type ActivityView,
  type SiteActivityView,
} from "@/lib/activity";
import { relationKind } from "@/lib/relation-kinds";
import { relativeFallback } from "@/lib/relative-time";
import {
  formatCommentDate,
  formatCommentDateTime,
  renderCommentHtml,
} from "@/lib/comment-render";
import { texToHtml } from "@/components/TeX";
import type { CommentView } from "@/lib/comments";
import { resolveSnapshot } from "@/lib/identity";
import type {
  AiContribution,
  FieldGroup,
  PublicationStatus,
  ResolutionMethod,
  ProblemWithTrends,
  ProblemWithVotes,
  ResolutionStatus,
  SolveType,
  VerificationStatus,
} from "@/lib/problems";

export type { ProblemWithTrends, ProblemWithVotes };

/// Exported so the reviewer preview route can read unpublished rows with
/// exactly the shape the public reader uses.
export const PROBLEM_SELECT = {
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
  publication: true,
  resolutionMethod: true,
  citations: true,
  citationsPaper: true,
  citationsSource: true,
  citationsUrl: true,
  renownLangs: true,
  renownNote: true,
  significance: true,
  significanceNote: true,
  solveCostUsd: true,
  solveCostNote: true,
  resultNote: true,
  ageNote: true,
  sourceUrl: true,
  sourceName: true,
  createdAt: true,
  links: {
    select: { label: true, url: true, kind: true },
    orderBy: { position: "asc" },
  },
  // Outgoing only, in the { to, kind, note } shape the edit form carries.
  // The dialog MUST seed from this: an editor seeded empty would read as
  // "remove every relation" on the next unrelated save. The entry page's
  // display needs both directions plus target metadata, which is a separate
  // per-entry query (`getRelations`) rather than a join on every list row.
  relationsFrom: {
    select: { kind: true, note: true, to: { select: { slug: true } } },
    orderBy: { position: "asc" },
  },
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
export function toProblem(r: ProblemRow): ProblemWithVotes {
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
    publication: r.publication as PublicationStatus | null,
    resolutionMethod: r.resolutionMethod as ResolutionMethod | null,
    citations: r.citations,
    citationsPaper: r.citationsPaper,
    citationsSource: r.citationsSource,
    citationsUrl: r.citationsUrl,
    renownLangs: r.renownLangs,
    renownNote: r.renownNote,
    significance: r.significance,
    significanceNote: r.significanceNote,
    solveCostUsd: r.solveCostUsd,
    solveCostNote: r.solveCostNote,
    resultNote: r.resultNote,
    ageNote: r.ageNote,
    sourceUrl: r.sourceUrl,
    sourceName: r.sourceName,
    links: r.links.map((l) => ({ label: l.label, url: l.url, kind: l.kind })),
    relations: r.relationsFrom.map((x) => ({ to: x.to.slug, kind: x.kind, note: x.note })),
    upvotes: r.upvotes,
    downvotes: r.downvotes,
    score: r.upvotes - r.downvotes,
    commentCount: r._count.comments,
    // Null for the curated baseline; a pseudonym for community submissions.
    submittedBy: r.submittedBy?.pseudonym ?? null,
    addedAt: r.createdAt.toISOString(),
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
/// How many entries were ADDED to the catalog in the last seven days, and in
/// the seven before them. By createdAt, not solve date: this measures the
/// record's own growth. Lives behind "use cache" because that is the one
/// place a prerendered page may read the clock - same pattern as the vote
/// trend windows above, and a minute of staleness is nothing against a
/// seven-day window.
/// Today's UTC date as YYYY-MM-DD, for charts that window their x axis to
/// "the last N months" and so need to know where now is.
///
/// Server-side and passed down as a prop rather than read in the browser: the
/// charts are client components but still render on the server, and a clock
/// read during a client render would put a different final bucket in the
/// hydrated HTML than the server produced. Behind "use cache" for the same
/// reason as getEntryFlow - it is where a prerendered page may read the clock.
/// Refreshed hourly, which can leave the date stale for at most an hour after
/// midnight UTC; the cost of that is one week-bucket at the right edge.
export async function getToday(): Promise<string> {
  "use cache";
  cacheLife("hours");
  return new Date().toISOString().slice(0, 10);
}

export async function getEntryFlow(): Promise<{ week: number; prevWeek: number }> {
  "use cache";
  cacheTag("problems");
  cacheLife("hours");
  const now = Date.now();
  const [week, prevWeek] = await Promise.all([
    prisma.problem.count({
      where: { status: "published", createdAt: { gte: new Date(now - 7 * DAY_MS) } },
    }),
    prisma.problem.count({
      where: {
        status: "published",
        createdAt: { gte: new Date(now - 14 * DAY_MS), lt: new Date(now - 7 * DAY_MS) },
      },
    }),
  ]);
  return { week, prevWeek };
}

export async function getPublishedProblems(): Promise<ProblemWithTrends[]> {
  "use cache";
  cacheTag("problems");
  cacheLife("hours");

  // `cacheLife("hours")` means these window edges are up to an hour stale.
  // Immaterial for a 7- or 30-day window, and still fine for the 24-hour one,
  // where an hour is 4% of the window and only shifts which entries sit just
  // inside the boundary. An edit or a new entry does not wait for the hour:
  // `updateTag("problems")` drops this the moment anything published changes.
  const now = Date.now();
  const [rows, day, threeDay, week, month] = await Promise.all([
    prisma.problem.findMany({
      where: { status: "published" },
      select: { ...PROBLEM_SELECT, id: true },
      orderBy: { solveDate: "desc" },
    }),
    countsSince(new Date(now - DAY_MS)),
    countsSince(new Date(now - 3 * DAY_MS)),
    countsSince(new Date(now - 7 * DAY_MS)),
    countsSince(new Date(now - 30 * DAY_MS)),
  ]);

  return rows.map((row) => ({
    ...toProblem(row),
    score24h: day.score.get(row.id) ?? 0,
    score3d: threeDay.score.get(row.id) ?? 0,
    score7d: week.score.get(row.id) ?? 0,
    score30d: month.score.get(row.id) ?? 0,
    comments24h: day.comments.get(row.id) ?? 0,
    comments3d: threeDay.comments.get(row.id) ?? 0,
    comments7d: week.comments.get(row.id) ?? 0,
    comments30d: month.comments.get(row.id) ?? 0,
  }));
}

/// One problem by its public slug, or null when it does not exist or is not
/// published. Tagged individually so a vote only busts that entry's page.
export async function getProblemBySlug(
  slug: string,
): Promise<ProblemWithVotes | null> {
  "use cache";
  cacheTag("problems", `problem-${slug}`);
  cacheLife("hours");

  const row = await prisma.problem.findFirst({
    where: { slug, status: "published" },
    select: PROBLEM_SELECT,
  });
  return row ? toProblem(row) : null;
}

/// One row of an entry's "Related entries" block, direction already resolved:
/// `label` is the kind's forward or inverse reading depending on which side
/// this entry is, so the component never thinks about direction at all.
export interface RelationView {
  label: string;
  kind: string;
  slug: string;
  /// Pre-rendered with texToHtml - both titles may carry $...$ and the row is
  /// a client component, which must not ship KaTeX.
  shortNameHtml: string;
  nameHtml: string;
  note: string;
  solveDate: string;
  significance: number | null;
  resolution: string;
}

/// Both directions of an entry's typed relations, display-ready.
///
/// Cached under the entry's own tag: an edit to a relation updates BOTH
/// sides' `problem-<slug>` tags (see update-problem.ts), so this drops
/// exactly when either end changes.
export async function getRelations(slug: string): Promise<RelationView[]> {
  "use cache";
  cacheTag("problems", `problem-${slug}`);
  cacheLife("hours");

  const TARGET = {
    slug: true,
    shortName: true,
    name: true,
    solveDate: true,
    significance: true,
    resolution: true,
    status: true,
  } as const;

  const rows = await prisma.problemRelation.findMany({
    where: { OR: [{ from: { slug } }, { to: { slug } }] },
    select: { kind: true, note: true, position: true, from: { select: TARGET }, to: { select: TARGET } },
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });

  const out: RelationView[] = [];
  for (const r of rows) {
    const outgoing = r.from.slug === slug;
    const other = outgoing ? r.to : r.from;
    // A relation to an entry that later unpublished must not render a dead
    // link. The row survives (the entry may come back); the display skips it.
    if (other.status !== "published") continue;
    const spec = relationKind(r.kind);
    out.push({
      label: (outgoing ? spec?.forward : spec?.inverse) ?? r.kind,
      kind: r.kind,
      slug: other.slug,
      shortNameHtml: texToHtml(other.shortName),
      nameHtml: texToHtml(other.name),
      note: r.note,
      solveDate: other.solveDate,
      significance: other.significance,
      resolution: other.resolution,
    });
  }
  return out;
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
  cacheLife("hours");

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
      user: { select: { pseudonym: true } },
    },
  });

  return rows.map((c) => ({
    id: c.id,
    authorId: c.userId,
    authorName: resolveSnapshot(c.userName, c.userId !== null),
    authorPseudonym: c.user?.pseudonym ?? null,
    html: renderCommentHtml(c.body),
    source: c.body,
    createdAt: formatCommentDateTime(c.createdAt),
    edited: c.editedAt !== null,
  }));
}

/// The changelog for one entry, newest first.
export async function getActivity(slug: string): Promise<ActivityView[]> {
  "use cache";
  cacheTag(`activity-${slug}`);
  cacheLife("hours");

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
      user: { select: { pseudonym: true } },
    },
  });

  return collapseBursts(
    rows.map((a) => ({
      id: a.id,
      userName: resolveSnapshot(a.userName, a.userId !== null),
      userPseudonym: a.user?.pseudonym ?? null,
      createdAtIso: a.createdAt.toISOString(),
      type: a.type,
      field: a.field,
      oldValue: a.oldValue,
      newValue: a.newValue,
      createdAt: relativeFallback(a.createdAt, formatCommentDate(a.createdAt)),
    })),
  );
}

/// Site-wide recent activity, newest first, across published entries only.
///
/// Same type filter as the per-entry changelog: votes are recorded but not
/// shown, because an unbounded "X voted" stream would bury the edits and
/// discussion this is meant to surface.
export async function getRecentActivity(
  limit = 8,
): Promise<SiteActivityView[]> {
  "use cache";
  cacheTag("activity");
  cacheLife("hours");

  const rows = await prisma.problemActivity.findMany({
    where: {
      type: { in: [...CHANGELOG_TYPES] },
      problem: { status: "published" },
    },
    orderBy: { createdAt: "desc" },
    // Over-fetch, because collapsing is what decides how many rows this
    // actually yields. One person changing twelve fields used to fill the
    // whole feed; now it is one line, and the slice has to be deep enough to
    // still find `limit` distinct things underneath it.
    take: limit * 12,
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
      user: { select: { pseudonym: true } },
    },
  });

  return collapseBursts(
    rows.map((a) => ({
      id: a.id,
      userName: resolveSnapshot(a.userName, a.userId !== null),
      userPseudonym: a.user?.pseudonym ?? null,
      type: a.type,
      field: a.field,
      oldValue: a.oldValue,
      newValue: a.newValue,
      createdAt: relativeFallback(a.createdAt, formatCommentDate(a.createdAt)),
      createdAtIso: a.createdAt.toISOString(),
      problemName: a.problem.name,
      problemSlug: a.problem.slug,
    })),
  ).slice(0, limit);
}

/// A member's public profile: their published contributions and nothing else.
/// Pending/rejected submissions, email, OAuth identity and the banned flag
/// never leave the server.
export interface UserProfile {
  pseudonym: string;
  /// Short self-description, or null. Plain text; rendered as text.
  bio: string | null;
  /// Self-declared role (see MEMBER_ROLES), or null.
  role: string | null;
  /// Curator-set identity check, and what was checked.
  verified: boolean;
  verifiedNote: string | null;
  /// Curator-set team role (see STAFF_ROLES), or null.
  staffRole: string | null;
  /// Curator-set citation snapshot and its provenance, or null.
  citations: number | null;
  citationsNote: string | null;
  /// Whether the member publishes their comment history here. When false,
  /// `comments` is empty and the page omits the section rather than showing an
  /// empty one - an absent section is unremarkable, an empty one looks broken
  /// and announces the choice. `commentCount` stays accurate either way,
  /// because it feeds `contributions`.
  showComments: boolean;
  /// The Google identity, present ONLY when the owner turned its toggle on.
  /// Null carries no information about whether the account has one - the
  /// projection below never selects what it will not show.
  googleName: string | null;
  googleEmail: string | null;
  /// Fixed set of profile links; absent keys are unset.
  links: ProfileLinks;
  /// Everything the member has actually done here, in one number: entries
  /// published, edits recorded and comments written. Entry score measures
  /// how others voted on their submissions, which is a different question
  /// and rewards one popular entry over years of quiet work.
  contributions: number;
  /// Formatted join date. Accounts created before 2026-07-29 carry that date
  /// (when the column was added), not their true sign-up date.
  joined: string;
  entries: {
    slug: string;
    name: string;
    solveDate: string;
    solveType: string;
    resolution: string;
    score: number;
  }[];
  /// Net votes across all their published entries.
  entryScore: number;
  comments: {
    id: string;
    html: string;
    createdAt: string;
    problemName: string;
    problemSlug: string;
  }[];
  commentCount: number;
  editCount: number;
  edits: {
    id: string;
    field: string | null;
    createdAt: string;
    problemName: string;
    problemSlug: string;
  }[];
}

export interface DirectoryMember {
  pseudonym: string;
  role: string | null;
  verified: boolean;
  /// Same blended number as the profile's: entries + comments + edits.
  contributions: number;
  entries: number;
  comments: number;
  /// Field-level edits to other people's entries. Shown because it is often
  /// the whole of someone's rank: several members here have no entries and no
  /// comments and sit high on curation alone, which reads as a sorting bug
  /// until the number that earned it is on the row.
  edits: number;
  joined: string;
}

/// The member directory: everyone who has opted to be listed, most active
/// first.
///
/// Counts come from filtered `_count`s rather than per-member queries, so this
/// is one round trip whatever the membership.
///
/// The filters are not decoration. An unfiltered activity count includes
/// VOTES, which are recorded as activity rows, and voting is one click: the
/// first version of this ranked a member with no entries and no comments above
/// the curator who had submitted twenty, purely on votes cast. The three
/// filters here reproduce the profile page's definition of `contributions`
/// exactly - published entries, comments on published entries, and `updated`
/// activity only - so a member's rank here and their profile agree.
///
/// `showComments` is deliberately NOT consulted. That toggle withholds the
/// comment HISTORY, not the fact that someone comments; a member who has
/// hidden their history still ranks by what they have done.
export async function getMemberDirectory(): Promise<DirectoryMember[]> {
  "use cache";
  cacheTag("users");
  // Stays at "minutes" on purpose while its neighbours moved to "hours".
  // Accounts are created inside the Auth.js adapter, which revalidates no tag,
  // so a new member reaching this list depends on the cache life alone - the
  // same reason `getUserCount` keeps its short life. The cost of the exception
  // is one query a minute for one cache entry, against the 586-entry pages
  // that made the short life expensive; there is nothing to win by raising it
  // and a visibly empty directory to lose.
  cacheLife("minutes");

  const users = await prisma.user.findMany({
    // `listed` is the opt-out. Banned accounts never appear regardless: the
    // directory is a front door, and theirs is closed.
    where: { listed: true, banned: false, pseudonym: { not: null } },
    select: {
      pseudonym: true,
      role: true,
      verified: true,
      createdAt: true,
      _count: {
        select: {
          submittedProblems: { where: { status: "published" } },
          comments: { where: { problem: { status: "published" } } },
          activities: {
            where: { type: "updated", problem: { status: "published" } },
          },
        },
      },
    },
  });

  return users
    .map((u) => ({
      pseudonym: u.pseudonym as string,
      role: u.role,
      verified: u.verified,
      contributions:
        u._count.submittedProblems + u._count.comments + u._count.activities,
      entries: u._count.submittedProblems,
      comments: u._count.comments,
      edits: u._count.activities,
      joined: formatCommentDate(u.createdAt),
    }))
    // Most active first, then alphabetical so the long tail of members with
    // identical counts has a stable, findable order rather than whatever the
    // database returned.
    .sort(
      (a, b) =>
        b.contributions - a.contributions ||
        a.pseudonym.localeCompare(b.pseudonym),
    );
}

/// Public profile by CURRENT pseudonym, or null when no such member exists.
export async function getUserProfile(
  pseudonym: string,
): Promise<UserProfile | null> {
  "use cache";
  cacheTag("users");
  cacheLife("hours");

  const user = await prisma.user.findUnique({
    where: { pseudonym },
    select: {
      id: true,
      pseudonym: true,
      createdAt: true,
      bio: true,
      role: true,
      verified: true,
      verifiedNote: true,
      staffRole: true,
      citations: true,
      citationsNote: true,
      name: true,
      email: true,
      showGoogleName: true,
      showGoogleEmail: true,
      showComments: true,
      linkWebsite: true,
      linkArxiv: true,
      linkOrcid: true,
      linkGithub: true,
      linkLinkedin: true,
    },
  });
  if (!user?.pseudonym) return null;

  const publishedOnly = { problem: { status: "published" as const } };
  const [entries, comments, commentCount, edits, editCount] = await Promise.all(
    [
      prisma.problem.findMany({
        where: { submittedById: user.id, status: "published" },
        orderBy: { createdAt: "desc" },
        select: {
          slug: true,
          name: true,
          solveDate: true,
          solveType: true,
          resolution: true,
          upvotes: true,
          downvotes: true,
        },
      }),
      // Skipped entirely when the member has withdrawn their comment history,
      // rather than fetched and then dropped at render: the cheapest way to
      // not publish something is not to read it.
      user.showComments
        ? prisma.comment.findMany({
        where: { userId: user.id, ...publishedOnly },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          body: true,
          createdAt: true,
          problem: { select: { name: true, slug: true } },
        },
          })
        : Promise.resolve([]),
      // Counted either way: it feeds `contributions`, which is one blended
      // number and stays honest. Only the LIST is withheld.
      prisma.comment.count({ where: { userId: user.id, ...publishedOnly } }),
      prisma.problemActivity.findMany({
        where: { userId: user.id, type: "updated", ...publishedOnly },
        orderBy: { createdAt: "desc" },
        take: 15,
        select: {
          id: true,
          field: true,
          createdAt: true,
          problem: { select: { name: true, slug: true } },
        },
      }),
      prisma.problemActivity.count({
        where: { userId: user.id, type: "updated", ...publishedOnly },
      }),
    ],
  );

  const contributions = entries.length + editCount + commentCount;

  return {
    pseudonym: user.pseudonym,
    bio: user.bio,
    role: user.role,
    verified: user.verified,
    verifiedNote: user.verifiedNote,
    staffRole: user.staffRole,
    citations: user.citations,
    citationsNote: user.citationsNote,
    showComments: user.showComments,
    googleName: user.showGoogleName ? user.name : null,
    googleEmail: user.showGoogleEmail ? user.email : null,
    contributions,
    links: {
      website: user.linkWebsite,
      arxiv: user.linkArxiv,
      orcid: user.linkOrcid,
      github: user.linkGithub,
      linkedin: user.linkLinkedin,
    },
    joined: formatCommentDate(user.createdAt),
    entries: entries.map((e) => ({
      slug: e.slug,
      name: e.name,
      solveDate: e.solveDate,
      solveType: e.solveType,
      resolution: e.resolution,
      score: e.upvotes - e.downvotes,
    })),
    entryScore: entries.reduce((sum, e) => sum + e.upvotes - e.downvotes, 0),
    comments: comments.map((c) => ({
      id: c.id,
      html: renderCommentHtml(c.body),
      createdAt: formatCommentDateTime(c.createdAt),
      problemName: c.problem.name,
      problemSlug: c.problem.slug,
    })),
    commentCount,
    editCount,
    edits: edits.map((a) => ({
      id: a.id,
      field: a.field,
      // Absolute here on purpose: the profile prints this string as-is, with
      // no RelativeTime around it to keep it current, so relative wording
      // would freeze at whatever the cache was built at.
      createdAt: formatCommentDate(a.createdAt),
      problemName: a.problem.name,
      problemSlug: a.problem.slug,
    })),
  };
}

/// Rendered statement HTML for every published entry that has one, keyed by
/// slug. Serves /api/statements: the home page inlines only the first page's
/// statements, and the client fetches this map once for the rest - so page
/// weight stops growing with the catalog. KaTeX runs inside the cached read,
/// not per request.
export async function getStatementHtmlMap(): Promise<Record<string, string>> {
  "use cache";
  cacheTag("problems");
  cacheLife("days");

  const rows = await prisma.problem.findMany({
    where: { status: "published", statement: { not: null } },
    select: { slug: true, statement: true },
  });
  return Object.fromEntries(rows.map((r) => [r.slug, texToHtml(r.statement!)]));
}

/// Total registered accounts, for the community tile on the home page.
///
/// Nothing revalidates a tag on sign-up (accounts are created inside the
/// Auth.js adapter), so freshness rests on the one-minute cache life alone -
/// which is plenty for a headline count.
export interface TeamMember {
  pseudonym: string;
  staffRole: string;
  verified: boolean;
  /// The self-written bio, so the About page can say who someone is in their
  /// own words rather than ours.
  bio: string | null;
}

/// Everyone with a staff role, for the About page. Admins first, then
/// moderators, then developers; alphabetical within a role. Tagged "users"
/// like the profiles, so a role change shows up as soon as it is saved.
export async function getTeam(): Promise<TeamMember[]> {
  "use cache";
  cacheTag("users");
  cacheLife("hours");

  const rows = await prisma.user.findMany({
    where: { staffRole: { not: null }, pseudonym: { not: null } },
    select: { pseudonym: true, staffRole: true, verified: true, bio: true },
  });
  const order: Record<string, number> = { admin: 0, moderator: 1, developer: 2 };
  return rows
    .filter((r): r is typeof r & { pseudonym: string; staffRole: string } => !!r.pseudonym && !!r.staffRole)
    .map((r) => ({ pseudonym: r.pseudonym, staffRole: r.staffRole, verified: r.verified, bio: r.bio }))
    .sort(
      (a, b) =>
        (order[a.staffRole] ?? 9) - (order[b.staffRole] ?? 9) ||
        a.pseudonym.localeCompare(b.pseudonym),
    );
}

export async function getUserCount(): Promise<number> {
  "use cache";
  cacheTag("users");
  cacheLife("minutes");

  return prisma.user.count();
}

/// How many submissions are waiting for a curator.
///
/// Public on purpose. The size of the queue used to be admin-only on the
/// theory that it was nobody else's business, and the effect was that a
/// visitor could not tell a curated record with three entries in review from
/// an abandoned one. In September 2026 a Discord thread concluded the site
/// had stopped tracking anything, while six submissions moved through the
/// queue in 36 hours. The number is the cheapest possible proof of life.
///
/// Tagged "submissions", which submitProblem, approveSubmission and
/// rejectSubmission all update, so it is exact along the normal path and at
/// most a minute stale after a script-side write.
export async function getPendingCount(): Promise<number> {
  "use cache";
  cacheTag("submissions");
  cacheLife("minutes");

  return prisma.problem.count({ where: { status: "pending" } });
}

export interface QueueEntry {
  name: string;
  field: string | null;
  fieldGroup: string | null;
  submittedBy: string;
  submittedAtIso: string;
  /// Relative wording where possible, else the absolute date; see
  /// relativeFallback.
  submittedAt: string;
}

/// The review queue as the public sees it: title, field, age and submitter,
/// oldest first.
///
/// Deliberately nothing else. A pending entry has no page, its claim has not
/// been checked, and the site's name must not sit next to a statement it has
/// not stood behind - that is what the review is FOR. So no statement, no
/// source, no model, no slug: enough to show that the record is alive and that
/// a particular submission is in it, and not one field more. The admin review
/// page reads the full rows, uncached and behind auth, for exactly that reason.
export async function getPendingQueue(): Promise<QueueEntry[]> {
  "use cache";
  cacheTag("submissions");
  cacheLife("minutes");

  const rows = await prisma.problem.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "asc" },
    select: {
      name: true,
      field: true,
      fieldGroup: true,
      createdAt: true,
      submittedBy: { select: { pseudonym: true } },
    },
  });
  return rows.map((r) => ({
    name: r.name,
    field: r.field,
    fieldGroup: r.fieldGroup,
    submittedBy: resolveSnapshot(r.submittedBy?.pseudonym ?? null, r.submittedBy !== null),
    submittedAtIso: r.createdAt.toISOString(),
    submittedAt: relativeFallback(r.createdAt, formatCommentDate(r.createdAt)),
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
