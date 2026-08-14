"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import type { VoteKind } from "@prisma/client";
import { voteOnProblem } from "@/app/actions/vote";
import { useViewer } from "@/components/ViewerProvider";

/// Moves one vote from `from` to `to`, for the optimistic tally shown before the
/// server answers. Clamped at zero so a stale count can never render negative.
function applyVote(
  up: number,
  down: number,
  from: VoteKind | null,
  to: VoteKind | null,
): { up: number; down: number } {
  let u = up;
  let d = down;
  if (from === "up") u -= 1;
  if (from === "down") d -= 1;
  if (to === "up") u += 1;
  if (to === "down") d += 1;
  return { up: Math.max(0, u), down: Math.max(0, d) };
}

function Arrow({ dir, size }: { dir: "up" | "down"; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d={dir === "up" ? "M8 3l5.5 8H2.5L8 3z" : "M8 13L2.5 5h11L8 13z"} />
    </svg>
  );
}

export function VoteButtons({
  slug,
  upvotes,
  downvotes,
  size = "sm",
}: {
  slug: string;
  upvotes: number;
  downvotes: number;
  size?: "sm" | "lg";
}) {
  const { signedIn, loaded, votes, setVote } = useViewer();
  const mine = votes[slug] ?? null;

  // Server-rendered counts are the baseline; `override` holds the local truth
  // from the moment the viewer clicks until the server confirms.
  const [override, setOverride] = useState<{ up: number; down: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const up = override?.up ?? upvotes;
  const down = override?.down ?? downvotes;

  function cast(vote: VoteKind) {
    if (!signedIn) {
      setError("signin");
      return;
    }
    const previous = mine;
    const next = previous === vote ? null : vote;

    setVote(slug, next);
    setOverride(applyVote(up, down, previous, next));
    setError(null);

    startTransition(async () => {
      const result = await voteOnProblem(slug, vote);
      if (!result.ok) {
        // Roll the optimistic change back and surface why.
        setVote(slug, previous);
        setOverride(null);
        setError(result.error);
        return;
      }
      setVote(slug, result.userVote);
      setOverride({ up: result.upvotes, down: result.downvotes });
    });
  }

  // Icon over count rather than side by side, so the button is a square
  // (min-height = min-width) at any count width normally reaches, instead of
  // a pill that only happens to be as tall as its icon. `min-w` rather than a
  // fixed `w`: a count that grows past two digits widens the button instead
  // of clipping, and that trade only bites entries popular enough for it to
  // be a good problem to have. Sized to match the 34x34 Report/Edit icon
  // buttons this sits beside on the entry page, so the whole control corner
  // reads as one family of squares rather than a square pair next to a pill.
  const dims = size === "lg" ? "min-h-[34px] min-w-[34px] px-1.5 py-1" : "min-h-[27px] min-w-[27px] px-1 py-0.5";
  // The gap between the two arrows has to match the gap the entry page puts
  // between this pair and the Report/Edit icons beside it, or the four squares
  // read as a tight pair next to a loose pair instead of one evenly spaced
  // row. `lg` is the entry-page size and so tracks that page's `gap-1.5`;
  // cards keep the tighter `gap-1`, where these buttons stand alone.
  const rowGap = size === "lg" ? "gap-1.5" : "gap-1";
  const iconSize = size === "lg" ? 12 : 10;
  const countText = size === "lg" ? "text-[11px]" : "text-[10px]";
  // Styling lives in classes, not inline styles - inline styles always beat
  // hover classes, which is why these buttons used to have no hover feedback.
  // The hover wash is a translucent ink mix so it reads on both surfaces
  // (paper on the entry page, raised paper on cards).
  // `rounded`, not `rounded-md`: these sit in the entry page's control corner
  // beside the report and edit buttons, which use the 4px radius - a 6px
  // radius on just the votes read as a different component family.
  const base = `inline-flex flex-col items-center justify-center gap-0.5 rounded border font-medium leading-none transition-colors tabular-nums ${dims} disabled:opacity-50`;
  const inactive =
    "border-[var(--hairline)] text-[var(--ink-secondary)] hover:border-[var(--ink-muted)] hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)]";

  const upActive = mine === "up";
  const downActive = mine === "down";

  return (
    <div className="inline-flex flex-col items-start gap-1">
      {/* Always a row. A square pair is narrow enough - about 60px at `sm` -
          that cards no longer need the vertical stack the old wide pill pair
          once did to avoid squeezing the title next to it. */}
      <div className={`inline-flex items-center ${rowGap}`}>
        <button
          type="button"
          onClick={() => cast("up")}
          disabled={pending || !loaded}
          aria-pressed={upActive}
          aria-label={`Upvote (${up})`}
          title={signedIn ? "Upvote" : "Sign in to vote"}
          className={`${base} ${
            upActive
              ? "border-[var(--status-good)] bg-[color-mix(in_srgb,var(--status-good)_10%,transparent)] text-[var(--status-good)] hover:bg-[color-mix(in_srgb,var(--status-good)_18%,transparent)]"
              : inactive
          }`}
        >
          <Arrow dir="up" size={iconSize} />
          <span className={countText}>{up}</span>
        </button>
        <button
          type="button"
          onClick={() => cast("down")}
          disabled={pending || !loaded}
          aria-pressed={downActive}
          aria-label={`Downvote (${down})`}
          title={signedIn ? "Downvote" : "Sign in to vote"}
          className={`${base} ${
            downActive
              ? "border-[var(--accent-orange)] bg-[color-mix(in_srgb,var(--accent-orange)_10%,transparent)] text-[var(--accent-orange)] hover:bg-[color-mix(in_srgb,var(--accent-orange)_18%,transparent)]"
              : inactive
          }`}
        >
          <Arrow dir="down" size={iconSize} />
          <span className={countText}>{down}</span>
        </button>
      </div>

      {error === "signin" ? (
        <Link
          href="/sign-in"
          className="text-[11px] text-[var(--accent-blue)] hover:underline"
        >
          Sign in to vote
        </Link>
      ) : (
        error && <span className="text-[11px] text-[var(--status-critical)]">{error}</span>
      )}
    </div>
  );
}
