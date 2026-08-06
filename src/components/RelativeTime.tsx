"use client";

// "3 minutes ago" for the activity feed.
//
// The home page is prerendered and cached for minutes, so a relative string
// baked in on the server goes stale the moment it is served from cache. This
// renders the server's value first (so the markup matches and there is no
// layout shift), then recomputes from the raw timestamp once mounted and
// every half minute after, which is what makes "just now" honest.
//
// The first recomputation runs before paint. In a plain effect the feed
// visibly read "06 Aug 2026" and then flipped to "5 hours ago" a frame later,
// which looked like a bug rather than a refinement.

import { useEffect, useState } from "react";
import { useBeforePaint } from "@/lib/before-paint";
import { freshRelative, relativeTime } from "@/lib/relative-time";

export { relativeTime };

export function RelativeTime({
  iso,
  fallback,
}: {
  /// Raw ISO timestamp; the only thing accurate enough to recompute from.
  iso: string;
  /// The absolute date, used before hydration and for anything older than a
  /// week.
  fallback: string;
}) {
  // `fallback` is already relative wording when the caller could produce it -
  // see `relativeFallback` in src/lib/relative-time.ts, which the cached
  // server reads use. Computing it here instead is not an option: under Cache
  // Components a client component may not call `Date.now()` during prerender,
  // and rightly so, since that would bake a timestamp into static HTML.
  const [label, setLabel] = useState(fallback);

  // Before paint: the correction must not be a visible second state.
  useBeforePaint(() => {
    setLabel(relativeTime(iso, Date.now()) ?? fallback);
  }, [iso, fallback]);

  // Keeping it honest afterwards is not urgent, so the ticker stays an
  // ordinary effect.
  useEffect(() => {
    const id = setInterval(
      () => setLabel(relativeTime(iso, Date.now()) ?? fallback),
      30_000,
    );
    return () => clearInterval(id);
  }, [iso, fallback]);

  return (
    // The server's clock and the reader's can land either side of a minute
    // boundary, making the two renders disagree by one word. The layout
    // effect above overwrites the text either way, so the mismatch is not
    // worth a console warning.
    <time dateTime={iso} title={fallback} suppressHydrationWarning>
      {label}
    </time>
  );
}

/// The "Just solved" column's stamp: the solve date, and the age beside it
/// while the solve is less than a day old.
///
/// A bare "6 Aug" cannot separate something that landed an hour ago from
/// something that landed last night, and the top of that column is the one
/// place on the site where that difference is the entire point. Older rows
/// keep the date alone, so the column does not turn into a wall of "4 days
/// ago" that has to be decoded back into dates.
///
/// Unlike `RelativeTime` this needs no `suppressHydrationWarning`: the server
/// renders the date, the client's first render renders the same date, and the
/// age is appended in the before-paint pass afterwards. Nothing disagrees.
export function SolvedStamp({ iso, date }: { iso: string; date: string }) {
  // The date alone, which is all a prerendered shell may know - reading the
  // clock on the server would opt the home page out of being prerendered at
  // all, and bake a timestamp into static HTML besides.
  const [label, setLabel] = useState(date);

  const stamp = () => {
    const rel = freshRelative(iso, Date.now());
    setLabel(rel ? `${date} · ${rel}` : date);
  };

  useBeforePaint(stamp, [iso, date]);

  // A solve date is midnight, so just after one the wording really does move
  // minute by minute. A minute ticker is enough to keep that honest.
  useEffect(() => {
    const id = setInterval(stamp, 60_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iso, date]);

  return <time dateTime={iso}>{label}</time>;
}
