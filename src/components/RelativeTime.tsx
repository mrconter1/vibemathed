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
import { relativeTime } from "@/lib/relative-time";

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
