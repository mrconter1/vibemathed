"use client";

// Cursor-following preview for the two Highlights columns.
//
// The rows are deliberately terse: a short name and one number. That is right
// for scanning, but it means deciding whether an entry is worth a click costs
// a navigation. This fills the gap without one.
//
// Desktop only, and the gate is `(hover: hover) and (pointer: fine)` rather
// than a width breakpoint. A card that chases a finger is nonsense: touch has
// no hover state, so a tap would flash it open and immediately navigate. Width
// is the wrong question; whether the device has a pointer is the right one.
//
// Position is written straight to the node's transform instead of going
// through state. A mousemove handler that calls setState re-renders the whole
// list on every pixel of travel, which is exactly the work you cannot afford
// in the one interaction whose entire job is to feel smooth.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AI_CONTRIBUTION, RESOLUTION, VERIFICATION } from "@/lib/display";
import type { ResolutionStatus, VerificationStatus } from "@/lib/problems";
import { SolvedStamp } from "@/components/RelativeTime";
import { TeX } from "@/components/TeX";

export interface PreviewRow {
  slug: string;
  /// Short label, what the row itself shows.
  name: string;
  /// The column's ranking value, shown on the right of the row.
  detail: string;
  iso?: string;
  aiDiscovered?: boolean;
  /// Set when the entry is not fully resolved. Takes the row's single pill
  /// slot, displacing the AI marker: a reader scanning "This week" has to be
  /// able to see that the top line is partial progress, and one pill is all
  /// the room a row has on a phone.
  status?: { label: string; color: string } | null;

  /// Everything below is preview-only.
  fullName: string;
  field: string | null;
  statement: string | null;
  model: string;
  verification: VerificationStatus;
  resolution: ResolutionStatus;
  significance: number | null;
  solved: string;
}

/// Gap between cursor and card, and the margin kept from the viewport edge.
const PAD = 16;
const EDGE = 8;

function Pill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="rounded-full px-1.5 py-px text-[10px] font-medium"
      style={{ color, backgroundColor: `color-mix(in srgb, ${color} 14%, transparent)` }}
    >
      {label}
    </span>
  );
}

export function HighlightList({ rows }: { rows: PreviewRow[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  /// Sits above the cursor, always. Anchoring to one side means the card
  /// appears in the same place every time, so the eye knows where to look
  /// instead of tracking a box that alternates above and below depending on
  /// how far down the row sits.
  ///
  /// Horizontal still flips near the right edge, because the alternative is a
  /// card hanging off screen. Vertical falls back below the cursor only when
  /// there is genuinely no room above, which on these two columns means the
  /// viewport is shorter than the card.
  function place(clientX: number, clientY: number) {
    const el = cardRef.current;
    if (!el) return;
    const { offsetWidth: w, offsetHeight: h } = el;
    const x =
      clientX + PAD + w > window.innerWidth - EDGE
        ? Math.max(EDGE, clientX - PAD - w)
        : clientX + PAD;
    const above = clientY - PAD - h;
    const y = above >= EDGE ? above : Math.min(clientY + PAD, window.innerHeight - EDGE - h);
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  const active = isDesktop ? rows.find((r) => r.slug === hovered) ?? null : null;

  return (
    <>
      <ul
        className="mt-2.5"
        onMouseMove={(e) => place(e.clientX, e.clientY)}
        onMouseLeave={() => setHovered(null)}
      >
        {rows.map((row) => (
          <li
            key={row.slug}
            onMouseEnter={(e) => {
              setHovered(row.slug);
              // Place before the first paint of the card, so it never appears
              // at the last row's position and then jump to this one.
              requestAnimationFrame(() => place(e.clientX, e.clientY));
            }}
            className="border-t border-[var(--hairline)] py-2 first:border-t-0 first:pt-0 last:pb-0"
          >
            <Link
              href={`/problem/${row.slug}`}
              className="group flex items-baseline justify-between gap-3"
            >
              <span className="flex min-w-0 items-baseline gap-1.5">
                <span className="min-w-0 truncate text-sm text-[var(--ink-secondary)] transition-colors group-hover:text-[var(--accent-blue)]">
                  <TeX>{row.name}</TeX>
                </span>
                {row.status ? (
                  <span
                    title={RESOLUTION[row.resolution].label}
                    className="min-w-0 shrink-[0.2] self-center truncate rounded-full px-1.5 py-px text-[10px] font-medium"
                    style={{
                      color: row.status.color,
                      background: `color-mix(in srgb, ${row.status.color} 14%, transparent)`,
                    }}
                  >
                    {row.status.label}
                  </span>
                ) : row.aiDiscovered ? (
                  <span
                    title={`${AI_CONTRIBUTION["ai-discovered"].pill}: the model produced the central proof or object`}
                    className="min-w-0 shrink-[0.2] self-center truncate rounded-full bg-[color-mix(in_srgb,var(--status-good)_14%,transparent)] px-1.5 py-px text-[10px] font-medium text-[var(--status-good)]"
                  >
                    {AI_CONTRIBUTION["ai-discovered"].pill}
                  </span>
                ) : null}
              </span>
              <span className="shrink-0 font-mono text-[11px] text-[var(--ink-muted)]">
                {row.iso ? <SolvedStamp iso={row.iso} date={row.detail} /> : row.detail}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Rendered only while hovering, and `pointer-events-none` so the card
          can never sit between the cursor and the row that spawned it. */}
      {active && (
        <div
          ref={cardRef}
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-50 w-60 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] p-2.5 shadow-lg"
        >
          <p className="font-serif text-[13px] leading-snug text-[var(--ink)]">
            <TeX>{active.fullName}</TeX>
          </p>
          {active.field && (
            <p className="mt-0.5 text-[11px] text-[var(--ink-muted)]">{active.field}</p>
          )}

          {active.statement && (
            <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-[var(--ink-secondary)]">
              <TeX>{active.statement}</TeX>
            </p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-1">
            <Pill
              label={VERIFICATION[active.verification].label}
              color={VERIFICATION[active.verification].color}
            />
            {active.resolution !== "resolved" && (
              <Pill
                label={RESOLUTION[active.resolution].label}
                color={RESOLUTION[active.resolution].color}
              />
            )}
          </div>

          <dl className="mt-2 space-y-0.5 border-t border-[var(--hairline)] pt-1.5 text-[10px]">
            <div className="flex justify-between gap-3">
              <dt className="shrink-0 text-[var(--ink-muted)]">Model</dt>
              <dd className="truncate text-right text-[var(--ink-secondary)]">
                {active.model}
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="shrink-0 text-[var(--ink-muted)]">Solved</dt>
              <dd className="text-right text-[var(--ink-secondary)]">{active.solved}</dd>
            </div>
            {active.significance != null && (
              <div className="flex justify-between gap-3">
                <dt className="shrink-0 text-[var(--ink-muted)]">Significance</dt>
                <dd className="text-right font-mono text-[var(--ink-secondary)]">
                  {active.significance}/100
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </>
  );
}
