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
//
// No active state, deliberately. The nav marks where you ARE; this cluster is
// things you can DO, and none of its other buttons light up to say you are
// looking at their result. A plus that stays lit on /submit reads as a stuck
// toggle rather than a location.
//
// A server component, because with no active state there is nothing to know
// about the current route.

import Link from "next/link";

export function SubmitButton() {
  return (
    <Link
      href="/submit"
      title="Submit an entry"
      aria-label="Submit an entry"
      // Same 8x8 geometry as the mail, bell and theme buttons beside it.
      className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] text-[var(--ink-secondary)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
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
