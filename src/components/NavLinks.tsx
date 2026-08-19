"use client";

// Header navigation with an active state. Client-side only because active
// detection needs the current pathname; the links themselves are plain <Link>s.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X_PROFILE } from "@/lib/community";

// Submit deliberately absent: it is an action, not a section, and lives as
// the plus button in the header's action cluster.
// Methodology sits in the bar rather than only in the footer because a
// mathematical physicist read the site closely enough to ask what the
// inclusion test was, and still had to ask. The rules being findable is not a
// convenience here: they are the argument for trusting the labels.
const LINKS = [
  { href: "/", label: "Entries" },
  { href: "/stats", label: "Stats" },
  { href: "/methodology", label: "Methodology" },
  { href: "/about", label: "About" },
] as const;

function isActive(href: string, path: string): boolean {
  if (href === "/") {
    // Entry pages belong to the Entries section.
    return path === "/" || path.startsWith("/problem");
  }
  return path === href || path.startsWith(`${href}/`);
}

export function NavLinks() {
  const path = usePathname();

  return (
    // Layout classes cooperate with SiteHeader's wrapping bar: on mobile the
    // nav takes a full-width second row (the negative margin re-aligns the
    // first link's text with the logo despite the links' own padding); from
    // `sm` it sits inline between the logo and the account button.
    <nav
      className="order-3 -ml-2.5 flex w-full items-center gap-1 sm:order-2 sm:ml-0 sm:w-auto"
      aria-label="Site"
    >
      {LINKS.map(({ href, label }) => {
        const active = isActive(href, path);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`rounded-md px-2.5 py-1.5 text-sm transition-colors ${
              active
                ? "bg-[var(--paper)] font-medium text-[var(--ink)] shadow-[inset_0_0_0_1px_var(--hairline)]"
                : "text-[var(--ink-secondary)] hover:text-[var(--ink)]"
            }`}
          >
            {label}
          </Link>
        );
      })}

      {/* Sits inside the nav rather than in the action cluster on the right,
          because it belongs to the same "where else this site lives" group as
          the sections, and because the cluster is for things you DO here. On a
          phone the nav is its own full-width row, so keeping it here means it
          stays beside About in both layouts instead of drifting to the other
          end of the header.

          Icon-only among four word links: the mark is more recognisable than
          the word at this size, and a fifth label would crowd the row at the
          360px width the header is already tight at. */}
      <a
        href={X_PROFILE}
        target="_blank"
        rel="noopener noreferrer"
        title="Follow on X"
        aria-label="Follow on X (opens in a new tab)"
        className="ml-1 inline-flex items-center rounded-md px-1.5 py-1.5 text-[var(--brand-x)] transition-opacity hover:opacity-70"
      >
        {/* The app-icon treatment: a filled tile with the X knocked OUT of it,
            rather than the bare glyph. Closer to how the mark is presented
            everywhere else, and at this size a solid shape with a hole in it
            holds up far better than four thin strokes.

            The knockout is a real hole, via a mask, not an X painted in the
            surface colour. The header is translucent and sits over whatever
            the page has scrolled under it, so a "transparent" X painted as
            paper would be a visibly wrong shade the moment anything passed
            beneath it.

            Tile is --brand-x: true black, not the page's warm --ink, because
            this is somebody else's mark and it is the colour they use. It
            inverts to white in the dark theme rather than staying black, which
            is X's own guidance and the only way the tile stays visible on a
            near-black page.

            Full strength at rest and dimming on hover, which is the inverse of
            the word links beside it. They start recessed and darken because
            they are ink; a brand mark starts solid, and dimming is the
            interaction every other logo-link on the web uses. */}
        <svg width="23" height="23" viewBox="0 0 24 24" aria-hidden>
          <mask id="x-mark-knockout">
            <rect width="24" height="24" rx="5" fill="white" />
            {/* Scaled about the centre so the mark sits inside the tile with
                app-icon-like padding instead of touching the corners. */}
            <path
              transform="translate(12 12) scale(0.68) translate(-12 -12)"
              d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
              fill="black"
            />
          </mask>
          <rect width="24" height="24" rx="5" fill="currentColor" mask="url(#x-mark-knockout)" />
        </svg>
      </a>
    </nav>
  );
}
