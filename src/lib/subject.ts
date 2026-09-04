// What a comment, changelog row or report is ABOUT.
//
// The site has two commentable things: a catalog entry and a record. They
// share every piece of machinery downstream - threading, voting, editing,
// deletion, notifications, moderation - so `Comment`, `ProblemActivity` and
// `ProblemReport` each carry a nullable `problemId` and a nullable `recordId`
// rather than being duplicated per kind. This module is the discriminator
// those two columns imply, in one place, so no call site invents its own.
//
// A subject is a plain serialisable object: it crosses the server-action
// boundary from client components, so it must survive JSON.

export type SubjectKind = "problem" | "record";

export interface Subject {
  kind: SubjectKind;
  slug: string;
}

export function problemSubject(slug: string): Subject {
  return { kind: "problem", slug };
}

export function recordSubject(slug: string): Subject {
  return { kind: "record", slug };
}

/// Server actions receive this from the browser, so it is untrusted input and
/// is validated rather than cast.
export function isSubject(v: unknown): v is Subject {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return (o.kind === "problem" || o.kind === "record") && typeof o.slug === "string" && o.slug.length > 0;
}

/// The URL of the thing being discussed. Entry pages are `/problem/:slug` for
/// historical reasons (the catalog predates records); records are
/// `/record/:slug`.
export function subjectHref(s: Subject): string {
  return s.kind === "problem" ? `/problem/${s.slug}` : `/record/${s.slug}`;
}

/// Cache tags. Deliberately DIFFERENT prefixes per kind: an entry and a record
/// could share a slug, and one invalidating the other's comment list would be
/// a bug nobody would find twice.
export function commentsTag(s: Subject): string {
  return s.kind === "problem" ? `comments-${s.slug}` : `record-comments-${s.slug}`;
}

export function activityTag(s: Subject): string {
  return s.kind === "problem" ? `activity-${s.slug}` : `record-activity-${s.slug}`;
}

export function subjectTag(s: Subject): string {
  return s.kind === "problem" ? `problem-${s.slug}` : `record-${s.slug}`;
}

/// The collection tag, for lists that span every subject of that kind.
export function collectionTag(s: Subject): string {
  return s.kind === "problem" ? "problems" : "records";
}

/// A Prisma `where` fragment selecting rows attached to this subject. Written
/// as a nested relation filter rather than an id so callers do not have to
/// resolve the subject first.
export function subjectWhere(s: Subject): { problem: { slug: string } } | { record: { slug: string } } {
  return s.kind === "problem" ? { problem: { slug: s.slug } } : { record: { slug: s.slug } };
}

/// The foreign key to write when creating a row for this subject.
export function subjectKey(s: Subject, id: string): { problemId: string } | { recordId: string } {
  return s.kind === "problem" ? { problemId: id } : { recordId: id };
}

/// Recover the subject from a stored row, for the paths that only have the row
/// (editing and deleting a comment, handling a report). Returns null when a
/// row has neither side set, which the schema permits and the application
/// never writes.
export function subjectOf(row: {
  problem?: { slug: string } | null;
  record?: { slug: string } | null;
}): Subject | null {
  if (row.problem) return problemSubject(row.problem.slug);
  if (row.record) return recordSubject(row.record.slug);
  return null;
}
