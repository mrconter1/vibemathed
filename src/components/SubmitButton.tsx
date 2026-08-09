"use client";

// The submit action, as the first of the header's action buttons.
//
// It used to be a "Submit" word in the nav, sitting between Stats and About as
// though it were another page to browse. It is not: it is the one thing a
// reader DOES here, and the action cluster on the right is where doing things
// lives. A plus is also the shorter word for it in every app a reader has
// already used.
//
// Renders for everyone. A signed-out visitor sees it beside Sign in, which is
// the right order of discovery: find out you can contribute, then find out you
// need an account. Hiding it until sign-in would keep the invitation from the
// people who most need it.

import Link from "next/link";
import { usePathname } from "next/navigation";

export function SubmitButton() {
  const active = usePathname() === "/submit";

  return (
    <Link
      href="/submit"
      title="Submit an entry"
      aria-label="Submit an entry"
      aria-current={active ? "page" : undefined}
      // Same 8x8 geometry as the mail, bell and theme buttons beside it.
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border transition-colors ${
        active
          ? "border-[var(--accent-blue)] bg-[var(--paper)] text-[var(--accent-blue)]"
          : "border-[var(--hairline)] bg-[var(--paper-raised)] text-[var(--ink-secondary)] hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
      }`}
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        aria-hidden
      >
        <path d="M12 5v14M5 12h14" />
      </svg>
    </Link>
  );
}
