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

/// `id` is the chart's permalink target, e.g. `#by-ai-system`. It is chosen at
/// the call site rather than derived from the chart's heading, for the reason
/// review reasons and slugs are: once a link to it exists somewhere, it is
/// stored data, and a reworded heading must not silently break it.
///
/// `label` names the chart for the link's tooltip and screen-reader text.
/// It repeats the heading, which lives inside `children` where this component
/// cannot reach it. A label that drifts from the heading is a cosmetic tooltip
/// problem; the id is the contract.
export function ChartCard({
  children,
  className,
  id,
  label,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  label?: string;
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
      // scroll-mt clears the sticky header, the same way the methodology
      // sections do it: without it, arriving on #by-ai-system parks the card's
      // heading underneath the bar.
      id={id}
      className={`relative min-w-0 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] p-4 sm:p-5 ${id ? "scroll-mt-20 " : ""}${className ?? ""}`}
    >
      {/* Both controls sit in one flex cluster rather than being positioned
          individually, so the permalink does not need to know whether the
          expand button beside it is currently displayed - on a phone it is
          not, and the link simply takes the corner. */}
      <div className="absolute right-2 top-2 z-10 flex items-center gap-1">
        {/* A plain anchor, so it does what a link does: updates the address bar
            and scrolls. Right-click-copy then yields a shareable URL, which is
            the whole point, and none of it needs JavaScript.

            This lives on the card and not on the chart's own heading because
            `children` is rendered twice while the overlay is open - anchoring
            the heading would put two elements with the same id in the
            document, and a duplicate id makes the link ambiguous. */}
        {id && (
          <a
            href={`#${id}`}
            aria-label={label ? `Link to the ${label} chart` : "Link to this chart"}
            title={label ? `Link to the ${label} chart` : "Link to this chart"}
            className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] text-[var(--ink-muted)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
          >
            <Icon name="link" size={12} />
          </a>
        )}
        {/* Always visible while the chart is collapsed: hover-revealing it hid
            the only affordance that says the chart can be opened at all, which
            is worse than the crowding it was avoiding next to the legends. It
            stays muted so it reads as chrome rather than data, and stays
            desktop-only, since the overlay is pointless on a phone where the
            card already spans the screen. */}
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Expand chart"
          title="Expand"
          className="hidden h-6 w-6 items-center justify-center rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] text-[var(--ink-muted)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] lg:inline-flex"
        >
          <Icon name="expand" size={12} />
        </button>
      </div>

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
