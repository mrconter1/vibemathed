"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOutEverywhere } from "@/app/actions/auth";
import { updatePseudonym } from "@/app/actions/profile";
import { PSEUDONYM_MAX } from "@/lib/pseudonym";
import { useViewer } from "@/components/ViewerProvider";

export function AuthMenu() {
  const { loaded, signedIn, pseudonym, isAdmin, setPseudonym } = useViewer();
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

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="inline-flex h-8 max-w-[12rem] items-center gap-1.5 truncate rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-3 text-xs text-[var(--ink)] transition-colors hover:border-[var(--accent-blue)]"
      >
        <span
          aria-hidden
          className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: "var(--status-good)" }}
        />
        <span className="truncate">{pseudonym ?? "Anonymous"}</span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Your account"
          className="absolute right-0 z-50 mt-2 w-72 rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] p-3 text-left shadow-lg"
        >
          <p className="text-[11px] leading-snug text-[var(--ink-muted)]">
            You appear publicly as this name only. Your Google name and picture are
            never shown on the site.
          </p>

          <label
            htmlFor="pseudonym"
            className="mt-3 block text-[11px] font-medium text-[var(--ink-secondary)]"
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

          {error && (
            <p className="mt-1.5 text-[11px] text-[var(--status-critical)]">{error}</p>
          )}
          {saved && !error && (
            <p className="mt-1.5 text-[11px] text-[var(--status-good)]">Name updated.</p>
          )}

          {isAdmin && (
            <div className="mt-3 border-t border-[var(--hairline)] pt-3">
              <Link
                href="/admin/submissions"
                onClick={() => setOpen(false)}
                className="text-xs text-[var(--accent-blue)] hover:underline"
              >
                Review submissions
              </Link>
            </div>
          )}

          <form action={signOutEverywhere} className="mt-3 border-t border-[var(--hairline)] pt-3">
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
