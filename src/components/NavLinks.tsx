"use client";

// Header navigation with an active state. Client-side only because active
// detection needs the current pathname; the links themselves are plain <Link>s.

import Link from "next/link";
import { usePathname } from "next/navigation";

// Submit deliberately absent: it is an action, not a section, and lives as
// the plus button in the header's action cluster.
const LINKS = [
  { href: "/", label: "Entries" },
  { href: "/stats", label: "Stats" },
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
    </nav>
  );
}
