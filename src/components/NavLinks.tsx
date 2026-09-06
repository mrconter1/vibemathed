"use client";

// Header navigation with an active state. Client-side only because active
// detection needs the current pathname; the links themselves are plain <Link>s.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CommunityLinks } from "@/components/CommunityLinks";

// Submit deliberately absent: it is an action, not a section, and lives as
// the plus button in the header's action cluster.
// Methodology sits in the bar rather than only in the footer because a
// mathematical physicist read the site closely enough to ask what the
// inclusion test was, and still had to ask. The rules being findable is not a
// convenience here: they are the argument for trusting the labels.
const LINKS = [
  { href: "/", label: "Entries" },
  // Frontiers are a different shape from entries (a quantity with a history,
  // not a result), so they get their own section rather than a filter chip.
  { href: "/frontiers", label: "Frontiers" },
  // Members is deliberately not here. The directory exists for people already
  // on the site and is reached from the footer, from beside Latest activity
  // and from the stat band - the places where wanting to know who else is
  // here actually occurs to someone. A header slot would give a page most
  // readers never need the same weight as the record itself. It was in the
  // header for one day (PR #18) and came out again on 5 September 2026.
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
    // Layout classes cooperate with SiteHeader's wrapping bar: below `lg` the
    // nav takes a full-width second row (the negative margin re-aligns the
    // first link's text with the logo despite the links' own padding); from
    // `lg` it sits inline between the logo and the account button.
    //
    // The inline breakpoint used to be `sm`. Seating Discord and X beside
    // About made the row too wide for a tablet, so tablets get the two-row
    // layout phones always had.
    //
    // Below `lg` the row does not wrap: it scrolls sideways, scrollbar hidden,
    // bleeding to the right page edge. On a 360px phone the five sections plus
    // the two marks are ~30px too wide for the row, and wrapping put the two
    // marks alone on a third header row, which read as debris. A row that
    // scrolls keeps the header two rows tall at every width; on a 412px phone
    // nothing actually scrolls. The marks sit at the row's right end below
    // `lg` (sections left, outposts right) and beside About from `lg`, where
    // the row is inline and has no far end to speak of.
    <nav
      className="order-3 -ml-1.5 flex w-full items-center gap-x-0 gap-y-1 max-lg:-mr-4 max-lg:flex-nowrap max-lg:overflow-x-auto max-lg:whitespace-nowrap max-lg:pr-4 max-lg:[scrollbar-width:none] max-lg:[&::-webkit-scrollbar]:hidden sm:max-lg:-mr-8 sm:max-lg:pr-8 lg:order-2 lg:ml-0 lg:w-auto lg:gap-1"
      aria-label="Site"
    >
      {LINKS.map(({ href, label }) => {
        const active = isActive(href, path);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`rounded-md px-1 py-1.5 text-[13px] transition-colors sm:px-2.5 sm:text-sm ${
              active
                ? "bg-[var(--paper)] font-medium text-[var(--ink)] shadow-[inset_0_0_0_1px_var(--hairline)]"
                : "text-[var(--ink-secondary)] hover:text-[var(--ink)]"
            }`}
          >
            {label}
          </Link>
        );
      })}
      <CommunityLinks />
    </nav>
  );
}
