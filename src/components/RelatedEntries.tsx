"use client";

// The "Related entries" block on an entry page.
//
// Each row is a typed edge to another entry: the kind's label (direction
// already resolved by the server - "Continues" on one side reads "Continued
// by" on the other), the target's short name as a link, and a hover card
// carrying what a reader wants before deciding to click: the full name, the
// note saying WHY the two are connected, and the target's date and
// significance. On touch screens hover does not exist, so the card also opens
// on focus - tabbing or tapping the link shows it, exactly like the site's
// other bubbles.
//
// A client component only for the hover state; everything it shows arrives
// pre-rendered from the server (the name HTML in particular, so KaTeX never
// ships to the browser).

import Link from "next/link";
import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { RelationView } from "@/lib/data";

const CARD =
  "pointer-events-none fixed z-50 w-72 -translate-x-1/2 whitespace-normal break-words rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] p-3 text-left text-xs font-normal leading-snug text-[var(--ink-secondary)] shadow-lg";

function Row({ relation }: { relation: RelationView }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLAnchorElement>(null);

  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) {
      const half = 148; // half the w-72 card, clamped into the viewport
      const x = Math.min(Math.max(r.left + r.width / 2, half + 8), window.innerWidth - half - 8);
      setPos({ x, y: r.bottom + 8 });
    }
    setOpen(true);
  };
  const hide = () => setOpen(false);

  return (
    <li className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className="shrink-0 text-[11px] uppercase tracking-wide text-[var(--ink-muted)]">
        {relation.label}
      </span>
      <Link
        ref={ref}
        href={`/problem/${relation.slug}`}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="text-sm text-[var(--accent-blue)] hover:underline"
      >
        {relation.shortName}
      </Link>
      {open &&
        createPortal(
          <span role="tooltip" className={CARD} style={{ left: pos.x, top: pos.y }}>
            <span
              className="block font-medium text-[var(--ink)]"
              dangerouslySetInnerHTML={{ __html: relation.nameHtml }}
            />
            <span className="mt-1 block">{relation.note}</span>
            <span className="mt-1.5 block text-[11px] text-[var(--ink-muted)]">
              Solved {relation.solveDate}
              {relation.significance !== null && ` · significance ${relation.significance}`}
            </span>
          </span>,
          document.body,
        )}
    </li>
  );
}

export function RelatedEntries({ relations }: { relations: RelationView[] }) {
  if (relations.length === 0) return null;
  return (
    <section className="mt-6">
      <h2 className="font-serif text-lg text-[var(--ink)]">Related entries</h2>
      <ul className="mt-2.5 space-y-1.5">
        {relations.map((r) => (
          <Row key={`${r.kind}-${r.slug}`} relation={r} />
        ))}
      </ul>
    </section>
  );
}
