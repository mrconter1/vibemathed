"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOutEverywhere } from "@/app/actions/auth";
import { updateBio, updatePseudonym, updateRole } from "@/app/actions/profile";
import { BIO_MAX, PSEUDONYM_MAX } from "@/lib/pseudonym";
import { ROLE_OPTIONS } from "@/lib/roles";
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
    bio,
    role,
    verified,
    setBio,
    setRole,
    setPseudonym,
  } = useViewer();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [bioDraft, setBioDraft] = useState("");
  const [bioSaved, setBioSaved] = useState(false);
  const [bioSaving, setBioSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Seed the form when the panel opens. Done here rather than in an effect
  // keyed on `open` so there is no cascading render on every toggle.
  function openPanel() {
    setDraft(pseudonym ?? "");
    setBioDraft(bio ?? "");
    setBioSaved(false);
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

  async function saveBio() {
    setBioSaving(true);
    setError(null);
    const result = await updateBio(bioDraft);
    setBioSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setBio(result.bio);
    setBioSaved(true);
  }

  async function saveRole(next: string) {
    setError(null);
    const previous = role ?? "";
    setRole(next === "" ? null : next); // optimistic: it is a single select
    const result = await updateRole(next);
    if (!result.ok) {
      setRole(previous === "" ? null : previous);
      setError(result.error);
    }
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

            <label
              htmlFor="bio"
              className="mt-3 block text-[11px] font-medium text-[var(--ink-secondary)]"
            >
              Bio{" "}
              <span className="font-normal text-[var(--ink-muted)]">
                ({bioDraft.length}/{BIO_MAX})
              </span>
            </label>
            <textarea
              id="bio"
              value={bioDraft}
              maxLength={BIO_MAX}
              rows={2}
              placeholder="A line about you, shown on your profile."
              onChange={(e) => {
                setBioDraft(e.target.value);
                setBioSaved(false);
              }}
              className="mt-1 w-full resize-none rounded border border-[var(--hairline)] bg-[var(--paper)] px-2 py-1.5 text-xs text-[var(--ink)] transition-colors hover:border-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
            />
            <div className="mt-1 flex items-center gap-2">
              <button
                type="button"
                onClick={saveBio}
                disabled={bioSaving || bioDraft.trim() === (bio ?? "")}
                className="rounded border border-[var(--hairline)] px-2.5 py-1 text-xs text-[var(--ink-secondary)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] disabled:opacity-40"
              >
                {bioSaving ? "…" : "Save bio"}
              </button>
              {bioSaved && (
                <span className="text-[11px] text-[var(--status-good)]">Bio updated.</span>
              )}
            </div>

            <label
              htmlFor="role"
              className="mt-3 block text-[11px] font-medium text-[var(--ink-secondary)]"
            >
              Role
            </label>
            <select
              id="role"
              value={role ?? ""}
              onChange={(e) => saveRole(e.target.value)}
              className="mt-1 w-full rounded border border-[var(--hairline)] bg-[var(--paper)] px-2 py-1.5 text-xs text-[var(--ink)] transition-colors hover:border-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
            >
              <option value="">Not saying</option>
              {ROLE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[11px] leading-snug text-[var(--ink-muted)]">
              {verified ? (
                <>
                  Shown on your profile as self-declared. Your identity is
                  verified, which is shown separately.
                </>
              ) : (
                <>
                  Shown on your profile as self-declared, because nobody checks
                  it.{" "}
                  <a
                    href={`mailto:rasmus.lindahl1996@gmail.com?subject=${encodeURIComponent(
                      "VibeMathed: profile verification request",
                    )}&body=${encodeURIComponent(
                      `My VibeMathed profile is ${name}.

I would like the verified badge. Here is something that ties this account to me (a university page, an arXiv author page, a personal site linking back, or a message from an institutional address):

`,
                    )}`}
                    className="text-[var(--accent-blue)] hover:underline"
                  >
                    Request verification
                  </a>{" "}
                  to have it checked.
                </>
              )}
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
