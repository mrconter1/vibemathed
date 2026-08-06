"use client";

// The header's mailbox: an envelope beside the bell, badged with unread
// curator mail, linking straight to /inbox.
//
// Mail used to be a line item inside the bell's panel and a link buried in
// the profile menu, which meant the one message addressed to you personally
// was two clicks behind a badge shared with comment noise. Now the bell
// counts what happened near you; the envelope counts what was written TO
// you, and the two read separately at a glance.
//
// The badge clears through the same path it always did: opening a
// conversation marks it read, and InboxList's refresh() re-reads the viewer
// state that this renders from.

import Link from "next/link";
import { Icon } from "@/components/Icons";
import { useViewer } from "@/components/ViewerProvider";

export function InboxButton() {
  const { loaded, signedIn, unreadInbox } = useViewer();

  // Same idiom as the bell: while the viewer is unknown, ship the control
  // and let `data-viewer` decide visibility, so it does not pop into a
  // settled header a beat late and shove its neighbours sideways. No badge
  // yet - a count is a claim about unread mail, and we do not have one.
  if (!loaded) {
    return (
      <span
        className="viewer-in h-8 w-8 items-center justify-center rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] text-[var(--ink-secondary)]"
        aria-hidden
      >
        <Icon name="mail" size={15} />
      </span>
    );
  }

  if (!signedIn) return null;

  return (
    <Link
      href="/inbox"
      aria-label={unreadInbox > 0 ? `Inbox (${unreadInbox} unread)` : "Inbox"}
      title="Inbox"
      className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] text-[var(--ink-secondary)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
    >
      <Icon name="mail" size={15} />
      {unreadInbox > 0 && (
        <span
          className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums text-[var(--paper-raised)]"
          style={{ backgroundColor: "var(--accent-orange)" }}
        >
          {unreadInbox > 99 ? "99+" : unreadInbox}
        </span>
      )}
    </Link>
  );
}
