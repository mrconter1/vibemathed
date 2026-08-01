"use client";

// The header bell: unread count badge + a dropdown feed of comments by
// others on entries the viewer submitted or has commented on. Opening the
// panel fetches the feed and moves the server watermark, so the badge
// clears; rows that were unread at open keep their "new" highlight until
// the panel closes.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  getNotifications,
  markNotificationsSeen,
  type NotificationItem,
} from "@/app/actions/notifications";
import { Icon } from "@/components/Icons";
import { useViewer } from "@/components/ViewerProvider";

export function NotificationsMenu() {
  const { loaded, signedIn, notifications, clearNotifications } = useViewer();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape, same idiom as the account menu.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!loaded || !signedIn) return null;

  async function openPanel() {
    setOpen(true);
    setError(null);
    setItems(null);
    const result = await getNotifications();
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setItems(result.items);
    // Everything shown is now seen: move the server watermark, zero the badge.
    void markNotificationsSeen();
    clearNotifications();
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={
          notifications > 0
            ? `Notifications (${notifications} unread)`
            : "Notifications"
        }
        title="Notifications"
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] text-[var(--ink-secondary)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
      >
        <Icon name="bell" size={15} />
        {notifications > 0 && (
          <span
            className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums text-[var(--paper-raised)]"
            style={{ backgroundColor: "var(--accent-orange)" }}
          >
            {notifications > 99 ? "99+" : notifications}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          // The bell is NOT at the screen edge (the account button sits to
          // its right), so a right-anchored 320px panel would clip off the
          // left of a phone. Below sm it becomes a fixed sheet clamped to
          // the viewport, under the header row; from sm up it anchors to
          // the bell as a normal dropdown.
          className="fixed inset-x-3 top-12 z-50 rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] shadow-lg sm:absolute sm:inset-x-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-80"
        >
          <p className="border-b border-[var(--hairline)] px-3.5 py-2.5 font-serif text-sm text-[var(--ink)]">
            Notifications
          </p>

          {error && (
            <p className="px-3.5 py-3 text-xs text-[var(--status-critical)]">{error}</p>
          )}

          {!error && items === null && (
            <div className="space-y-2 px-3.5 py-3" aria-hidden>
              <div className="h-3.5 w-4/5 rounded bg-[var(--hairline)]/40" />
              <div className="h-3.5 w-3/5 rounded bg-[var(--hairline)]/40" />
            </div>
          )}

          {items !== null && items.length === 0 && (
            <p className="px-3.5 py-3 text-xs leading-relaxed text-[var(--ink-muted)]">
              Nothing yet. Comments on entries you submitted or joined the
              discussion on will show up here.
            </p>
          )}

          {items !== null && items.length > 0 && (
            <ul className="max-h-96 overflow-y-auto py-1 dialog-scroll">
              {items.map((n) => (
                <li key={n.id}>
                  <Link
                    href={`/problem/${n.entrySlug}#discussion`}
                    onClick={() => setOpen(false)}
                    className={`block border-l-2 px-3.5 py-2 transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] ${
                      n.isNew ? "border-[var(--accent-orange)]" : "border-transparent"
                    }`}
                  >
                    <span className="block text-xs leading-snug text-[var(--ink-secondary)]">
                      <span className="font-medium text-[var(--ink)]">{n.author}</span>{" "}
                      commented on{" "}
                      <span className="font-medium text-[var(--ink)]">{n.entryName}</span>
                    </span>
                    <span className="mt-0.5 block truncate text-[11px] text-[var(--ink-muted)]">
                      {n.snippet}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] text-[var(--ink-muted)]">
                      {n.when}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
