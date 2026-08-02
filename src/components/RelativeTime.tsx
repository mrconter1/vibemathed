"use client";

// "3 minutes ago" for the activity feed.
//
// The home page is prerendered and cached for minutes, so a relative string
// baked in on the server goes stale the moment it is served from cache. This
// renders the server's value first (so the markup matches and there is no
// layout shift), then recomputes from the raw timestamp once mounted and
// every half minute after, which is what makes "just now" honest.

import { useEffect, useState } from "react";

/// Coarse relative time. Deliberately not precise: past a week the exact
/// wording stops mattering and the absolute date is more useful, so the
/// caller's preformatted date is shown instead.
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
  const [label, setLabel] = useState(fallback);

  useEffect(() => {
    const tick = () => setLabel(relativeTime(iso, Date.now()) ?? fallback);
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [iso, fallback]);

  return (
    <time dateTime={iso} title={fallback}>
      {label}
    </time>
  );
}
