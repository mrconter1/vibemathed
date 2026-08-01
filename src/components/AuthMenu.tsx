"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOutEverywhere } from "@/app/actions/auth";
import { updatePseudonym } from "@/app/actions/profile";
import { PSEUDONYM_MAX } from "@/lib/pseudonym";
import { useViewer } from "@/components/ViewerProvider";

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
    pendingReviews,
    openReports,
    setPseudonym,
  } = useViewer();
  // Anything a curator should act on: submissions waiting plus open reports.
  const actionable = isAdmin ? pendingReviews + openReports : 0;
  const hasPending = actionable > 0;
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Seed the form when the panel opens. Done here rather than in an effect
  // keyed on `open` so there is no cascading render on every toggle.
  function openPanel() {
    setDraft(pseudonym ?? "");
    setError(null);
    setSaved(false);
    setOpen(true);
  }

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

  async function save() {
    setSaving(true);
    setError(null);
    const result = await updatePseudonym(draft);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setPseudonym(result.pseudonym);
    setSaved(true);
  }

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
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={`inline-flex h-8 max-w-[14rem] items-center gap-2 truncate rounded-md border bg-[var(--paper-raised)] pl-1.5 pr-3 text-xs text-[var(--ink)] transition-colors hover:border-[var(--accent-blue)] ${
          hasPending ? "border-[var(--accent-orange)]" : "border-[var(--hairline)]"
        }`}
      >
        <AvatarInitial name={name} size="sm" />
        <span className="truncate">{name}</span>

        {/* Only an admin ever sees this, and only when something waits. */}
        {hasPending && (
          <span
            className="ml-0.5 inline-flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums text-[var(--paper-raised)]"
            style={{ backgroundColor: "var(--accent-orange)" }}
            aria-label={`${actionable} ${actionable === 1 ? "item" : "items"} awaiting review`}
          >
            {actionable}
          </span>
        )}
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

          <div className="px-3.5 py-3">
            <label
              htmlFor="pseudonym"
              className="block text-[11px] font-medium text-[var(--ink-secondary)]"
            >
              Display name
            </label>
            <div className="mt-1 flex gap-1.5">
              <input
                id="pseudonym"
                value={draft}
                maxLength={PSEUDONYM_MAX}
                onChange={(e) => {
                  setDraft(e.target.value);
                  setSaved(false);
                }}
                className="min-w-0 flex-1 rounded border border-[var(--hairline)] bg-[var(--paper)] px-2 py-1.5 text-xs text-[var(--ink)] transition-colors hover:border-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
              />
              <button
                type="button"
                onClick={save}
                disabled={saving || draft.trim() === (pseudonym ?? "")}
                className="rounded border border-[var(--hairline)] px-2.5 py-1.5 text-xs text-[var(--ink-secondary)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] disabled:opacity-40"
              >
                {saving ? "…" : "Save"}
              </button>
            </div>
            <p className="mt-1.5 text-[11px] leading-snug text-[var(--ink-muted)]">
              You appear publicly as this name only. Your Google name and
              picture are never shown on the site.
            </p>

            {error && (
              <p className="mt-1.5 text-[11px] text-[var(--status-critical)]">{error}</p>
            )}
            {saved && !error && (
              <p className="mt-1.5 text-[11px] text-[var(--status-good)]">Name updated.</p>
            )}
          </div>

          {isAdmin && (
            <div className="space-y-1.5 border-t border-[var(--hairline)] px-3.5 py-3">
              <Link
                href="/admin/submissions"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 text-xs text-[var(--accent-blue)] hover:underline"
              >
                Review submissions
                {pendingReviews > 0 && (
                  <span
                    className="inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums text-[var(--paper-raised)]"
                    style={{ backgroundColor: "var(--accent-orange)" }}
                  >
                    {pendingReviews}
                  </span>
                )}
              </Link>
              <Link
                href="/admin/reports"
                onClick={() => setOpen(false)}
                className="flex items-center gap-1.5 text-xs text-[var(--accent-blue)] hover:underline"
              >
                Review reports
                {openReports > 0 && (
                  <span
                    className="inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold tabular-nums text-[var(--paper-raised)]"
                    style={{ backgroundColor: "var(--accent-orange)" }}
                  >
                    {openReports}
                  </span>
                )}
              </Link>
              {!hasPending && (
                <p className="text-[11px] text-[var(--ink-muted)]">
                  Both queues are empty.
                </p>
              )}
            </div>
          )}

          <form
            action={signOutEverywhere}
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
