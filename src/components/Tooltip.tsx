"use client";

// Instant, styled tooltips. These use `fixed` positioning so they escape any
// ancestor with `overflow` clipping (the native `title` tooltip was both slow
// and clipped). Extracted from the old problems table so the card layout and
// anything else can share them.
//
// The bubble is PORTALED to <body>: its trigger sits inside a `relative z-10`
// wrapper (needed to stay above the entry cards' stretched-link overlay), and
// a z-index inside that stacking context cannot beat the card's LATER z-10
// siblings - they painted over the bubble, making it look transparent.

import { useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/Icons";

// White, not paper-raised: the bubble usually floats over a card of exactly
// that color, where it looked transparent. White plus a stronger shadow makes
// it read as a solid layer above the page.
const BUBBLE =
  "pointer-events-none fixed z-50 w-64 -translate-x-1/2 whitespace-normal break-words rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] p-2.5 text-left text-xs font-normal normal-case leading-snug tracking-normal text-[var(--ink-secondary)] shadow-lg";

/// Render a string with `**...**` segments bolded.
export function renderBold(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-[var(--ink)]">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

function useBubble() {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLButtonElement>(null);

  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) {
      const half = 132; // half of the w-64 bubble, clamped into the viewport
      const x = Math.min(Math.max(r.left + r.width / 2, half + 8), window.innerWidth - half - 8);
      setPos({ x, y: r.bottom + 8 });
    }
    setOpen(true);
  };

  return { open, pos, ref, show, hide: () => setOpen(false) };
}

/// An info affordance that reveals an explanation on hover or focus.
///
/// Draws an SVG rather than the "ⓘ" character: at the 11px this sits at, the
/// glyph was rasterised from the font and read as visibly pixelated, and its
/// weight and alignment varied by platform. The icon is vector at any size and
/// matches the stroke weight of every other icon on the site.
export function InfoTip({ content, label }: { content: ReactNode; label: string }) {
  const { open, pos, ref, show, hide } = useBubble();
  return (
    // `relative z-10` keeps the trigger above a stretched-link overlay (entry
    // cards), so it stays hoverable instead of being swallowed by the card link.
    <span className="relative z-10 inline-flex">
      <button
        ref={ref}
        type="button"
        aria-label={`What is ${label}?`}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="inline-flex cursor-help items-center leading-none text-[var(--ink-muted)] transition-colors hover:text-[var(--accent-blue)]"
      >
        <Icon name="info" size={13} />
      </button>
      {open &&
        createPortal(
          <span role="tooltip" className={BUBBLE} style={{ left: pos.x, top: pos.y }}>
            {content}
          </span>,
          document.body,
        )}
    </span>
  );
}

/// A "*" next to a value that reveals a caveat on hover or focus.
export function StarNote({ text }: { text: string }) {
  const { open, pos, ref, show, hide } = useBubble();
  return (
    // See InfoTip: stays above the entry card's stretched-link overlay.
    <span className="relative z-10 inline">
      <button
        ref={ref}
        type="button"
        aria-label="Footnote"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="cursor-help align-super text-[10px] font-bold text-[var(--accent-orange)]"
      >
        *
      </button>
      {open &&
        createPortal(
          <span role="tooltip" className={BUBBLE} style={{ left: pos.x, top: pos.y }}>
            {renderBold(text)}
          </span>,
          document.body,
        )}
    </span>
  );
}
