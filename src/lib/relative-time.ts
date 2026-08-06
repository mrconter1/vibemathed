// "3 minutes ago", shared by the server reads that produce activity rows and
// by the client component that keeps them honest afterwards.
//
// It lives here rather than beside the component because a `"use client"`
// module cannot be imported into a cached server read, and because the two
// must agree: if the server said "5 hours ago" and the client recomputed to
// something worded differently, hydration would swap the text for no reason.

/// Coarse relative time. Deliberately not precise: past a week the exact
/// wording stops mattering and the absolute date is more useful, so callers
/// fall back to their preformatted date.
export function relativeTime(iso: string, now: number): string | null {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const secs = Math.round((now - then) / 1000);
  if (secs < 0) return "just now";
  if (secs < 45) return "just now";
  const mins = Math.round(secs / 60);
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days <= 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return null;
}

/// The relative wording only while it still adds something to a date shown
/// beside it: under a day old. Past that the date says it better, and
/// "6 days ago" next to "31 Jul" is two ways of writing one fact.
///
/// A solve dated in the future gets nothing rather than "just now". Solve
/// dates come from announcement dates in whatever timezone the source used,
/// so a date one day ahead of the reader's clock is an ordinary occurrence
/// and not a thing that just happened.
export function freshRelative(iso: string, now: number): string | null {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return null;
  const age = now - then;
  if (age < 0 || age >= 86_400_000) return null;
  return relativeTime(iso, now);
}

/// What a server read should put in an activity row's display date.
///
/// Callers used to send the absolute date and let the client turn it into
/// "5 hours ago" after hydration, which meant the markup itself read
/// "06 Aug 2026" and visibly changed once JavaScript arrived. Emitting the
/// relative wording here moves that to where it belongs: these reads are
/// cached for minutes, so the wording can be a minute stale, and the client
/// corrects it before the first paint.
export function relativeFallback(date: Date, absolute: string): string {
  return relativeTime(date.toISOString(), Date.now()) ?? absolute;
}
