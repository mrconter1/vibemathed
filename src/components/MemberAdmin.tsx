"use client";

// Curator controls on a member's profile: verified (with what was checked),
// the citation snapshot (with its source), and the staff role. Renders only
// for viewers who may manage members, and the server action re-checks that,
// so this is a convenience for admins and invisible to everyone else.
//
// Client-side gating, like ProfileEditor: the profile page is prerendered and
// cached for everyone, so it cannot know who is looking. The viewer fetch
// does, after hydration.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getMemberFlags, setMemberFlags, type MemberFlags } from "@/app/actions/members";
import { STAFF_ROLE, STAFF_ROLES } from "@/lib/curators";
import { useViewer } from "@/components/ViewerProvider";

const field =
  "mt-1 w-full rounded-md border border-[var(--hairline)] bg-[var(--paper)] px-2.5 py-1.5 text-sm text-[var(--ink)] " +
  "focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--accent-blue)]";
const label = "block text-xs text-[var(--ink-muted)]";

export function MemberAdmin({ pseudonym }: { pseudonym: string }) {
  const { loaded, isSiteAdmin } = useViewer();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [flags, setFlags] = useState<MemberFlags | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Seed the form the first time it opens, not on mount: most admins never
  // open it, and the read is gated on the server anyway.
  useEffect(() => {
    if (!open || flags) return;
    let alive = true;
    getMemberFlags(pseudonym).then((f) => {
      if (alive && f) setFlags(f);
    });
    return () => {
      alive = false;
    };
  }, [open, flags, pseudonym]);

  if (!loaded || !isSiteAdmin) return null;

  async function save() {
    if (!flags) return;
    setBusy(true);
    setError(null);
    setSaved(false);
    const res = await setMemberFlags(pseudonym, flags);
    setBusy(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setSaved(true);
    // The profile is a cached server render; the action dropped the tag, so
    // a refresh shows the new badge and count.
    router.refresh();
  }

  const set = (patch: Partial<MemberFlags>) => flags && setFlags({ ...flags, ...patch });

  return (
    <section className="mt-4 rounded-md border border-dashed border-[var(--accent-orange)] px-4 py-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="text-xs font-medium text-[var(--accent-orange)] hover:underline"
        aria-expanded={open}
      >
        {open ? "Hide curator controls" : "Curator controls"}
      </button>

      {open && flags && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm text-[var(--ink)] sm:col-span-2">
            <input
              type="checkbox"
              checked={flags.verified}
              onChange={(e) => set({ verified: e.target.checked })}
            />
            Verified: identity or affiliation was checked
          </label>
          <label className={`${label} sm:col-span-2`}>
            What was checked (shown on hover of the badge)
            <input
              className={field}
              value={flags.verifiedNote}
              onChange={(e) => set({ verifiedNote: e.target.value })}
              placeholder="e.g. Email at their institution confirmed by reply, 2 Sep 2026"
            />
          </label>
          <label className={label}>
            Citations
            <input
              className={field}
              inputMode="numeric"
              value={flags.citations}
              onChange={(e) => set({ citations: e.target.value })}
              placeholder="e.g. 3945"
            />
          </label>
          <label className={label}>
            Citation source and date
            <input
              className={field}
              value={flags.citationsNote}
              onChange={(e) => set({ citationsNote: e.target.value })}
              placeholder="e.g. Google Scholar, 2 Sep 2026"
            />
          </label>
          <label className={label}>
            Staff role
            <select
              className={field}
              value={flags.staffRole}
              onChange={(e) => set({ staffRole: e.target.value })}
            >
              <option value="">None</option>
              {STAFF_ROLES.map((r) => (
                <option key={r} value={r}>
                  {STAFF_ROLE[r].label}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={save}
              className="rounded-md bg-[var(--accent-blue)] px-3 py-1.5 text-xs text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {busy ? "Saving…" : "Save"}
            </button>
            {saved && <span className="text-xs text-[var(--status-good)]">Saved.</span>}
            {error && <span className="text-xs text-[var(--status-critical)]">{error}</span>}
          </div>
        </div>
      )}
    </section>
  );
}
