"use client";

// The stats page's chart frame: the same bordered card as before, plus an
// expand control (desktop only) that reopens the chart in an overlay at
// 80% of the viewport.
//
// The chart is passed as children and rendered TWICE when expanded - once in
// the card, once in the overlay. That is cheap and correct: a React element
// is a description, and every chart here is an SVG drawn in viewBox
// coordinates, so the overlay copy scales all of its geometry, ticks and
// labels together for free. No chart component needed to change.
//
// The overlay box is sized to fit both bounds at once:
// width = min(80vw, 132vh), where 132vh approximates 80vh times the charts'
// common ~1.65 width-to-height ratio once their headers and captions are
// counted. Because the html wrapper adds header text of unknown height, the
// box also carries max-h with an internal scroll as the honest fallback -
// scaling can be exact for the SVG but never for text that wraps.

import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/Icons";

export function ChartCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  // Escape closes; the page behind must not scroll while the overlay owns
  // the screen.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <div
      className={`group relative min-w-0 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] p-4 sm:p-5 ${className ?? ""}`}
    >
      {/* Hover-revealed so it does not crowd the chart legends that live in
          the same corner; desktop only, since the overlay is pointless on a
          phone where the card already spans the screen. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Expand chart"
        title="Expand"
        className="absolute right-2 top-2 z-10 hidden h-6 w-6 items-center justify-center rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] text-[var(--ink-muted)] opacity-0 transition-opacity hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] focus-visible:opacity-100 group-hover:opacity-100 lg:inline-flex"
      >
        <Icon name="expand" size={12} />
      </button>

      {children}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Expanded chart"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 hidden items-center justify-center bg-[color-mix(in_srgb,var(--ink)_35%,transparent)] p-6 backdrop-blur-sm lg:flex"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            // 108vh, not 80vh times the SVG aspect: the box also holds the
            // chart's title, legend and caption, whose height scales with
            // nothing. The tighter factor leaves room for that chrome, so the
            // box fits the viewport whole and never grows a scrollbar.
            style={{ width: "min(80vw, 108vh)" }}
            className="relative rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] p-6 pt-8 shadow-xl"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              title="Close"
              className="absolute right-3 top-3 z-10 inline-flex h-7 w-7 items-center justify-center rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] text-[var(--ink-secondary)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
            >
              <Icon name="close" size={13} />
            </button>
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
