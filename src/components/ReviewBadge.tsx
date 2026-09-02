"use client";

// The curator's queue as its own control in the header, rather than a line
// inside the bell.
//
// The count was already there. The bell badge summed unread comments with
// pending submissions and open reports, and its panel listed the queue. It did
// not work: between 31 Aug and 1 Sep 2026 three submissions sat unreviewed for
// up to 23 hours while the bell said "3", because a bell means "something
// happened near you", and the same digit covers a comment under an entry you
// once voted on. A submitter concluded the site was broken and said so in the
// Discord, and a curator believed the queue was clear.
//
// So the queue gets a pill of its own: admins only, only when non-empty,
// orange because it is work and not news, linking straight to the review page.
// The tooltip carries the oldest wait, which is the number that decides
// whether this is urgent. Nothing here is disclosed to anyone who could not
// act on it - the viewer state carries zero and null for non-admins.
//
// It appears late on a first visit, after the viewer fetch resolves, and
// before paint on every visit after that thanks to the provider's cached seed.
// The other header controls avoid even the first-visit shift by shipping an
// inert shell, but a shell for a pill that most viewers never get would be a
// blank space in every visitor's header.

import Link from "next/link";
import { useEffect, useState } from "react";
import { useViewer } from "@/components/ViewerProvider";
import { useBeforePaint } from "@/lib/before-paint";
import { relativeTime } from "@/lib/relative-time";

export function ReviewBadge() {
  const { loaded, isAdmin, pendingReviews, oldestPendingAt } = useViewer();

  // Browser clock only, read the same way RelativeTime reads it. Under Cache
  // Components a client component may not call Date.now() during prerender,
  // and this one renders inside the static shell of every page; a clock read
  // before paint is the sanctioned exception, and the interval keeps the
  // wording honest while the tab stays open.
  const [now, setNow] = useState<number | null>(null);
  useBeforePaint(() => {
    setNow(Date.now());
  }, []);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  if (!loaded || !isAdmin || pendingReviews <= 0) return null;

  const waited = oldestPendingAt && now !== null ? relativeTime(oldestPendingAt, now) : null;
  const label = `${pendingReviews} to review`;
  const detail = waited ? `Oldest submitted ${waited}` : "Submissions awaiting review";

  return (
    <Link
      href="/admin/submissions"
      title={detail}
      aria-label={`${label}. ${detail}`}
      className={
        "inline-flex h-7 shrink-0 items-center rounded-md border px-2 text-xs font-medium " +
        "border-[var(--accent-orange)] text-[var(--accent-orange)] " +
        "bg-[color-mix(in_srgb,var(--accent-orange)_10%,transparent)] " +
        "transition-colors hover:bg-[color-mix(in_srgb,var(--accent-orange)_18%,transparent)] " +
        "sm:h-8 " +
        "focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 " +
        "focus-visible:outline-[var(--accent-blue)]"
      }
    >
      {label}
    </Link>
  );
}
