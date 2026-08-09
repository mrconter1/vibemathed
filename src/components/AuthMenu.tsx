"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOutEverywhere } from "@/app/actions/auth";
import { HEADER_ICON, HEADER_ICON_HOVER } from "@/lib/header-button";
import { clearViewerCache, useViewer } from "@/components/ViewerProvider";

/// The colored initial standing in for an avatar in the DROPDOWN's identity
/// block - the site never shows the real Google picture. The header button
/// deliberately does not use this: there the initial renders as a plain
/// glyph, so the account control matches the envelope and the bell beside it
/// instead of being the one button with its own colored fill.
function AvatarInitial({ name }: { name: string }) {
  return (
    <span
      aria-hidden
      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full sm:h-9 sm:w-9 bg-[color-mix(in_srgb,var(--accent-blue)_14%,transparent)] text-base font-semibold uppercase text-[var(--accent-blue)]"
    >
      {name.trim().charAt(0) || "?"}
    </span>
  );
}

/// One row of the dropdown: full-width, quiet, lit by hover. The menu is a
/// list of places, so every row is a link (or, for sign out, styled as one).
const ROW =
  "flex w-full items-center px-3.5 py-2 text-left text-sm text-[var(--ink-secondary)] transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] hover:text-[var(--ink)]";

export function AuthMenu() {
  const { loaded, signedIn, pseudonym, isAdmin } = useViewer();
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

  const signInLink = (
    <Link
      href="/sign-in"
      className="inline-flex h-8 items-center rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-3 text-xs text-[var(--ink)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
    >
      Sign in
    </Link>
  );

  // Before the viewer is known, ship BOTH variants and let the inline script's
  // `data-viewer` attribute choose between them in CSS. This used to be a grey
  // placeholder, which meant the account button was simply missing until a
  // round trip finished - the header's most-used control, absent on every
  // cold load. The signed-in variant here is a shell: real button geometry,
  // letter supplied by the same script through a custom property.
  if (!loaded) {
    return (
      <>
        <span className="viewer-out contents">{signInLink}</span>
        <span
          className={`viewer-in ${HEADER_ICON}`}
          aria-hidden
        >
          <span className="viewer-initial text-[13px] font-semibold uppercase text-[var(--ink-secondary)]" />
        </span>
      </>
    );
  }

  if (!signedIn) {
    return signInLink;
  }

  const name = pseudonym ?? "Anonymous";

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        // The initial as a plain glyph in the same square as the envelope
        // and the bell: three controls, one treatment. The full name and the
        // colored avatar live in the dropdown.
        className={`relative inline-flex ${HEADER_ICON} ${HEADER_ICON_HOVER}`}
        aria-label={`Account: ${name}`}
      >
        <span aria-hidden className="text-[13px] font-semibold uppercase">
          {name.trim().charAt(0) || "?"}
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Your account"
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] shadow-lg"
        >
          {/* Identity, not a menu row: who the site thinks you are. */}
          <div className="flex items-center gap-3 border-b border-[var(--hairline)] px-3.5 py-3">
            <AvatarInitial name={name} />
            <p className="min-w-0 truncate font-serif text-base leading-tight text-[var(--ink)]">
              {name}
            </p>
          </div>

          <nav className="py-1">
            {pseudonym && (
              <Link
                href={`/user/${encodeURIComponent(pseudonym)}`}
                onClick={() => setOpen(false)}
                className={ROW}
              >
                Public profile
              </Link>
            )}
          </nav>

          {isAdmin && (
            <nav className="border-t border-[var(--hairline)] py-1">
              {/* Plain rows: what needs acting on is counted on the bell, so
                  repeating the numbers here just competed with it. */}
              <Link href="/admin/submissions" onClick={() => setOpen(false)} className={ROW}>
                Reviews
              </Link>
              <Link href="/admin/reports" onClick={() => setOpen(false)} className={ROW}>
                Reports
              </Link>
              <Link href="/admin/stats" onClick={() => setOpen(false)} className={ROW}>
                Site stats
              </Link>
            </nav>
          )}

          <form
            action={signOutEverywhere}
            onSubmit={clearViewerCache}
            className="border-t border-[var(--hairline)] py-1"
          >
            <button type="submit" className={ROW}>
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
