"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOutEverywhere } from "@/app/actions/auth";
import { clearViewerCache, useViewer } from "@/components/ViewerProvider";

/// The colored initial standing in for an avatar - the site never shows the
/// real Google picture, so the pseudonym's first letter is the identity mark.
function AvatarInitial({ name, size }: { name: string; size: "sm" | "lg" }) {
  const cls =
    size === "sm"
      ? "h-5 w-5 text-[10px]"
      : "h-9 w-9 text-base";
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--accent-blue)_14%,transparent)] font-semibold uppercase text-[var(--accent-blue)] ${cls}`}
    >
      {name.trim().charAt(0) || "?"}
    </span>
  );
}

export function AuthMenu() {
  const {
    loaded,
    signedIn,
    pseudonym,
    isAdmin,
  } = useViewer();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);


  // Close on outside click or Escape.
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




  // Reserve the slot while loading so the header does not jump, and so a
  // signed-in visitor never sees a "Sign in" flash.
  if (!loaded) {
    return <span className="h-8 w-24 rounded bg-[var(--hairline)]/40" aria-hidden />;
  }

  if (!signedIn) {
    return (
      <Link
        href="/sign-in"
        className="inline-flex h-8 items-center rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-3 text-xs text-[var(--ink)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
      >
        Sign in
      </Link>
    );
  }

  const name = pseudonym ?? "Anonymous";

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        // Phones show the avatar alone: the name costs ~90px next to the
        // bell and the wordmark, and the initial already identifies you.
        // Queue counts live on the bell now, so this button carries none.
        className="inline-flex h-8 max-w-[14rem] items-center gap-2 truncate rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] pl-1.5 pr-1.5 text-xs text-[var(--ink)] transition-colors hover:border-[var(--accent-blue)] sm:pr-3"
        aria-label={`Account: ${name}`}
      >
        <AvatarInitial name={name} size="sm" />
        <span className="hidden truncate sm:inline">{name}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Your account"
          className="absolute right-0 z-50 mt-2 w-72 rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] shadow-lg"
        >
          {/* Identity block: who the site thinks you are, and the way out to
              the public profile that name carries. */}
          <div className="flex items-center gap-3 border-b border-[var(--hairline)] px-3.5 py-3">
            <AvatarInitial name={name} size="lg" />
            <div className="min-w-0">
              <p className="truncate font-serif text-base leading-tight text-[var(--ink)]">
                {name}
              </p>
              {pseudonym ? (
                <Link
                  href={`/user/${encodeURIComponent(pseudonym)}`}
                  onClick={() => setOpen(false)}
                  className="text-[11px] text-[var(--accent-blue)] hover:underline"
                >
                  View your public profile
                </Link>
              ) : (
                <p className="text-[11px] text-[var(--ink-muted)]">
                  No public name assigned yet
                </p>
              )}
            </div>
          </div>

          {/* Editing moved to the profile page, where the result is
              visible. This stays a signpost, not a second editor. */}
          <div className="px-3.5 py-3">
            {pseudonym ? (
              <Link
                href={`/user/${encodeURIComponent(pseudonym)}`}
                onClick={() => setOpen(false)}
                className="inline-flex items-center rounded-md border border-[var(--hairline)] bg-[var(--paper)] px-2.5 py-1.5 text-xs text-[var(--ink)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
              >
                Edit name, bio and role
              </Link>
            ) : (
              <p className="text-[11px] text-[var(--ink-muted)]">
                No public name assigned yet.
              </p>
            )}
            <p className="mt-1.5 text-[11px] leading-snug text-[var(--ink-muted)]">
              You appear publicly as your display name only. Your Google name
              and picture are never shown on the site.
            </p>
            {/* The bell announces new mail, but only while it is unread. This
                is how someone gets back to a message they have already read. */}
            <Link
              href="/inbox"
              onClick={() => setOpen(false)}
              className="mt-2.5 inline-block text-xs text-[var(--accent-blue)] hover:underline"
            >
              Inbox
            </Link>
          </div>

          {isAdmin && (
            <div className="space-y-1.5 border-t border-[var(--hairline)] px-3.5 py-3">
              {/* Plain links: what needs acting on is counted on the bell,
                  so repeating the numbers here just competed with it. */}
              <Link
                href="/admin/submissions"
                onClick={() => setOpen(false)}
                className="block text-xs text-[var(--accent-blue)] hover:underline"
              >
                Review submissions
              </Link>
              <Link
                href="/admin/reports"
                onClick={() => setOpen(false)}
                className="block text-xs text-[var(--accent-blue)] hover:underline"
              >
                Review reports
              </Link>
              <Link
                href="/admin/messages"
                onClick={() => setOpen(false)}
                className="block text-xs text-[var(--accent-blue)] hover:underline"
              >
                Inbox
              </Link>
              <Link
                href="/admin/stats"
                onClick={() => setOpen(false)}
                className="block text-xs text-[var(--accent-blue)] hover:underline"
              >
                Site stats
              </Link>
            </div>
          )}

          <form
            action={signOutEverywhere}
            onSubmit={clearViewerCache}
            className="border-t border-[var(--hairline)] px-3.5 py-2.5"
          >
            <button
              type="submit"
              className="text-xs text-[var(--accent-blue)] hover:underline"
            >
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
