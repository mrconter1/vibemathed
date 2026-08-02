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

/// Last feed this tab saw. The panel renders from it instantly on open while
/// the live fetch refreshes underneath, so navigating between pages never
/// shows the loading skeleton twice.
const FEED_CACHE = "vibemathed:notifications";

function readCache(): NotificationItem[] | null {
  try {
    const raw = sessionStorage.getItem(FEED_CACHE);
    const parsed = raw ? (JSON.parse(raw) as NotificationItem[]) : null;
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function writeCache(items: NotificationItem[]) {
  try {
    sessionStorage.setItem(FEED_CACHE, JSON.stringify(items));
  } catch {
    // Storage full or blocked; the in-memory copy still works.
  }
}
import { useViewer } from "@/components/ViewerProvider";

export function NotificationsMenu() {
  const {
    loaded,
    signedIn,
    notifications,
    isAdmin,
    pendingReviews,
    openReports,
    openMessages,
    clearNotifications,
  } = useViewer();
  // Curator queues are notifications too, so they belong on the bell rather
  // than on the account button. They are NOT cleared by opening the panel -
  // a queue stops counting when it is actually emptied, not when it is seen.
  const queued = isAdmin ? pendingReviews + openReports + openMessages : 0;
  const badge = notifications + queued;
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const prefetched = useRef(false);

  // Warm the feed as soon as we know who the viewer is, whatever the badge
  // says: an empty badge still opens a panel, and waiting for the click meant
  // a visible server round trip. Deliberately does NOT touch the watermark -
  // only opening the panel marks things seen.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!loaded || !signedIn || prefetched.current) return;
    prefetched.current = true;
    const cached = readCache();
    if (cached) setItems(cached);
    getNotifications().then((result) => {
      if (result.ok) {
        setItems(result.items);
        writeCache(result.items);
      }
    });
  }, [loaded, signedIn]);
  /* eslint-enable react-hooks/set-state-in-effect */

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
    // Everything shown is now seen: move the server watermark, zero the badge.
    void markNotificationsSeen();
    clearNotifications();
    // The panel is already painted from the prefetch or the cache; this only
    // corrects it if something landed since.
    const result = await getNotifications();
    if (!result.ok) {
      if (items === null) setError(result.error);
      return;
    }
    setItems(result.items);
    writeCache(result.items);
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={
          badge > 0 ? `Notifications (${badge} unread)` : "Notifications"
        }
        title="Notifications"
        className="relative inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] text-[var(--ink-secondary)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
      >
        <Icon name="bell" size={15} />
        {badge > 0 && (
          <span
            className="absolute -right-1.5 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums text-[var(--paper-raised)]"
            style={{ backgroundColor: "var(--accent-orange)" }}
          >
            {badge > 99 ? "99+" : badge}
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

          {/* Curator work first: these are actionable, the feed below is not. */}
          {queued > 0 && (
            <ul className="border-b border-[var(--hairline)] py-1">
              {pendingReviews > 0 && (
                <li>
                  <Link
                    href="/admin/submissions"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between gap-2 border-l-2 border-[var(--accent-orange)] px-3.5 py-2 text-xs transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)]"
                  >
                    <span className="text-[var(--ink)]">
                      {pendingReviews} {pendingReviews === 1 ? "submission" : "submissions"} awaiting review
                    </span>
                    <span aria-hidden className="text-[var(--ink-muted)]">→</span>
                  </Link>
                </li>
              )}
              {openReports > 0 && (
                <li>
                  <Link
                    href="/admin/reports"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between gap-2 border-l-2 border-[var(--accent-orange)] px-3.5 py-2 text-xs transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)]"
                  >
                    <span className="text-[var(--ink)]">
                      {openReports} open {openReports === 1 ? "report" : "reports"}
                    </span>
                    <span aria-hidden className="text-[var(--ink-muted)]">→</span>
                  </Link>
                </li>
              )}
              {openMessages > 0 && (
                <li>
                  <Link
                    href="/admin/messages"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between gap-2 border-l-2 border-[var(--accent-orange)] px-3.5 py-2 text-xs transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)]"
                  >
                    <span className="text-[var(--ink)]">
                      {openMessages} unread {openMessages === 1 ? "message" : "messages"}
                    </span>
                    <span aria-hidden className="text-[var(--ink-muted)]">→</span>
                  </Link>
                </li>
              )}
            </ul>
          )}

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
              {queued > 0
                ? "No new comments. Comments on entries you submitted or joined the discussion on show up here."
                : "Nothing yet. Comments on entries you submitted or joined the discussion on will show up here."}
            </p>
          )}

          {items !== null && items.length > 0 && (
            <ul className="max-h-96 overflow-y-auto py-1 dialog-scroll">
              {items.map((n) =>
                n.kind === "decision" && !n.entrySlug ? (
                  // A rejected submission has no public page to link to.
                  <li
                    key={n.id}
                    className={`block border-l-2 px-3.5 py-2 ${
                      n.isNew ? "border-[var(--accent-orange)]" : "border-transparent"
                    }`}
                  >
                    <span className="block text-xs leading-snug text-[var(--ink-secondary)]">
                      <span className="font-medium text-[var(--ink)]">{n.author}</span>:{" "}
                      <span className="font-medium text-[var(--ink)]">{n.entryName}</span>
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-[var(--ink-muted)]">
                      {n.snippet}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] text-[var(--ink-muted)]">
                      {n.when}
                    </span>
                  </li>
                ) : (
                <li key={n.id}>
                  <Link
                    href={
                      n.kind === "decision"
                        ? `/problem/${n.entrySlug}`
                        : `/problem/${n.entrySlug}#discussion`
                    }
                    onClick={() => setOpen(false)}
                    className={`block border-l-2 px-3.5 py-2 transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] ${
                      n.isNew ? "border-[var(--accent-orange)]" : "border-transparent"
                    }`}
                  >
                    <span className="block text-xs leading-snug text-[var(--ink-secondary)]">
                      <span className="font-medium text-[var(--ink)]">{n.author}</span>
                      {n.kind === "decision" ? ": " : " commented on "}
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
                ),
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
