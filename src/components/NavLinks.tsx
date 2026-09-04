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
  // Records are a different shape from entries (a quantity with a history,
  // not a result), so they get their own section rather than a filter chip.
  { href: "/records", label: "Records" },
  { href: "/users", label: "Members" },
  { href: "/stats", label: "Stats" },
  { href: "/methodology", label: "Methodology" },
  { href: "/about", label: "About" },
] as const;

function isActive(href: string, path: string): boolean {
  if (href === "/") {
    // Entry pages belong to the Entries section.
    return path === "/" || path.startsWith("/problem");
  }
  if (href === "/users") {
    // Individual profiles belong to the Members section.
    return path === "/users" || path.startsWith("/user/");
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
    // The inline breakpoint used to be `sm`. Promoting Members to the bar and
    // seating Discord and X beside About made the row too wide for a tablet,
    // so tablets now get the two-row layout phones always had. That is a
    // deliberate trade: the member directory is a first-class destination as
    // the community grows, and it outranks one row of chrome at 640-1024px.
    // The footer's earlier note that Members should stay out of the bar was
    // written before that was true.
    <nav
      className="order-3 -ml-1.5 flex w-full flex-wrap items-center gap-x-0 gap-y-1 lg:order-2 lg:ml-0 lg:w-auto lg:flex-nowrap lg:gap-1"
      aria-label="Site"
    >
      {LINKS.map(({ href, label }) => {
        const active = isActive(href, path);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`rounded-md px-1.5 py-1.5 text-sm transition-colors sm:px-2.5 ${
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
