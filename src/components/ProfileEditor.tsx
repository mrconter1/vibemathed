"use client";

// Owner-only editing, in place on the public profile.
//
// The profile page is prerendered, so "is this me?" cannot be answered on the
// server without making every profile dynamic. This component answers it on
// the client from the viewer state instead: it renders nothing at all unless
// the signed-in viewer's pseudonym matches the page, so the static shell is
// identical for everyone and the personalisation appears after hydration.
//
// Editing lives here rather than in the header dropdown because this is where
// the result is visible: you change your bio next to the bio.

import { useState } from "react";
import { updateBio, updatePseudonym, updateRole } from "@/app/actions/profile";
import { BIO_MAX, PSEUDONYM_MAX } from "@/lib/pseudonym";
import { ROLE_OPTIONS } from "@/lib/roles";
import { useViewer } from "@/components/ViewerProvider";

export function ProfileEditor({ pseudonym }: { pseudonym: string }) {
  const viewer = useViewer();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [bioDraft, setBioDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Not your profile (or not signed in): render nothing, not even a gap.
  if (!viewer.loaded || !viewer.signedIn || viewer.pseudonym !== pseudonym) {
    return null;
  }

  function start() {
    setName(viewer.pseudonym ?? "");
    setBioDraft(viewer.bio ?? "");
    setError(null);
    setSaved(false);
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    setError(null);

    // Name first: a rename changes this page's URL, so it has to succeed
    // before anything else is worth writing.
    if (name.trim() !== (viewer.pseudonym ?? "")) {
      const r = await updatePseudonym(name);
      if (!r.ok) {
        setSaving(false);
        setError(r.error);
        return;
      }
      viewer.setPseudonym(r.pseudonym);
    }

    if (bioDraft.trim() !== (viewer.bio ?? "")) {
      const r = await updateBio(bioDraft);
      if (!r.ok) {
        setSaving(false);
        setError(r.error);
        return;
      }
      viewer.setBio(r.bio);
    }

    setSaving(false);
    setSaved(true);
    // The page itself is server-rendered from cached data; a reload is the
    // honest way to show the saved values rather than faking them locally.
    window.location.href = `/user/${encodeURIComponent(name.trim() || pseudonym)}`;
  }

  async function pickRole(next: string) {
    setError(null);
    const previous = viewer.role ?? "";
    viewer.setRole(next === "" ? null : next);
    const r = await updateRole(next);
    if (!r.ok) {
      viewer.setRole(previous === "" ? null : previous);
      setError(r.error);
      return;
    }
    window.location.reload();
  }

  if (!open) {
    return (
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={start}
          className="inline-flex items-center gap-1.5 rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-2.5 py-1.5 text-xs text-[var(--ink-secondary)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
        >
          Edit profile
        </button>
        {!viewer.verified && (
          <a
            href={`mailto:rasmus.lindahl1996@gmail.com?subject=${encodeURIComponent(
              "VibeMathed: profile verification request",
            )}&body=${encodeURIComponent(
              `My VibeMathed profile is ${pseudonym}.\n\nI would like the verified badge. Here is something that ties this account to me (a university page, an arXiv author page, a personal site linking back, or a message from an institutional address):\n\n`,
            )}`}
            className="text-xs text-[var(--accent-blue)] hover:underline"
          >
            Request verification
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] p-4">
      <label
        htmlFor="p-name"
        className="block text-[11px] font-medium text-[var(--ink-secondary)]"
      >
        Display name
      </label>
      <input
        id="p-name"
        value={name}
        maxLength={PSEUDONYM_MAX}
        onChange={(e) => setName(e.target.value)}
        className="mt-1 w-full max-w-xs rounded border border-[var(--hairline)] bg-[var(--paper)] px-2 py-1.5 text-sm text-[var(--ink)] transition-colors hover:border-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
      />
      <p className="mt-1 text-[11px] text-[var(--ink-muted)]">
        The only name shown publicly. Renaming changes your profile URL, and
        the old one stops working.
      </p>

      <label
        htmlFor="p-bio"
        className="mt-3 block text-[11px] font-medium text-[var(--ink-secondary)]"
      >
        Bio{" "}
        <span className="font-normal text-[var(--ink-muted)]">
          ({bioDraft.length}/{BIO_MAX})
        </span>
      </label>
      <textarea
        id="p-bio"
        value={bioDraft}
        maxLength={BIO_MAX}
        rows={2}
        placeholder="A line about you."
        onChange={(e) => setBioDraft(e.target.value)}
        className="mt-1 w-full resize-none rounded border border-[var(--hairline)] bg-[var(--paper)] px-2 py-1.5 text-sm text-[var(--ink)] transition-colors hover:border-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
      />

      <label
        htmlFor="p-role"
        className="mt-3 block text-[11px] font-medium text-[var(--ink-secondary)]"
      >
        Role
      </label>
      <select
        id="p-role"
        value={viewer.role ?? ""}
        onChange={(e) => pickRole(e.target.value)}
        className="mt-1 w-full max-w-xs rounded border border-[var(--hairline)] bg-[var(--paper)] px-2 py-1.5 text-sm text-[var(--ink)] transition-colors hover:border-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
      >
        <option value="">Not saying</option>
        {ROLE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <p className="mt-1 text-[11px] text-[var(--ink-muted)]">
        Saves immediately. Shown as self-declared, because nobody checks it.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--hairline)] pt-3">
        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-md border border-[var(--hairline)] bg-[var(--paper)] px-3 py-1.5 text-xs text-[var(--ink)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={saving}
          className="rounded-md px-2 py-1 text-xs text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] disabled:opacity-40"
        >
          Cancel
        </button>
        {error && <span className="text-[11px] text-[var(--status-critical)]">{error}</span>}
        {saved && !error && (
          <span className="text-[11px] text-[var(--status-good)]">Saved.</span>
        )}
      </div>
    </div>
  );
}
