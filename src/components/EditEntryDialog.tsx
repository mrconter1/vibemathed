"use client";

// Community editing for an entry.
//
// The form only offers the fields in EDITABLE_FIELDS, and the server action
// whitelists against that same list - hiding a field here is a UI decision, not
// the security boundary. Every saved change is recorded in the changelog.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateProblem } from "@/app/actions/update-problem";
import {
  fieldsFor,
  PROTECTED_FIELDS_NOTE,
  type EditableValues,
} from "@/lib/editable";
import { EntryFields } from "@/components/EntryFields";
import { Icon } from "@/components/Icons";
import { CORNER_ICON_BUTTON } from "@/components/ReportEntryDialog";
import { useViewer } from "@/components/ViewerProvider";

export function EditEntryDialog({
  slug,
  initial,
}: {
  slug: string;
  initial: EditableValues;
}) {
  // The curator fields are offered only to curators. This is convenience, not
  // the control: the server whitelists against the same split, so a forged
  // post cannot write them either.
  const { signedIn, loaded, isAdmin } = useViewer();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<EditableValues>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lock background scroll while the dialog is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function openDialog() {
    // Re-seed from the server's current values each time it opens.
    setValues(initial);
    setError(null);
    setOpen(true);
  }

  async function save() {
    setSaving(true);
    setError(null);
    const result = await updateProblem(slug, values);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setOpen(false);
    // Pull the refreshed entry and changelog from the server.
    router.refresh();
  }

  if (!loaded) {
    return (
      <span className="inline-block h-[34px] w-[34px] rounded bg-[var(--hairline)]/40" aria-hidden />
    );
  }

  if (!signedIn) {
    return (
      <Link
        href="/sign-in"
        className={CORNER_ICON_BUTTON}
        title="Sign in to edit this entry"
        aria-label="Sign in to edit this entry"
      >
        <Icon name="pencil" size={14} />
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={openDialog}
        className={CORNER_ICON_BUTTON}
        title="Edit entry"
        aria-label="Edit this entry"
      >
        <Icon name="pencil" size={14} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="absolute inset-0 bg-[rgba(20,18,12,0.45)]"
            onClick={() => setOpen(false)}
            aria-hidden
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label="Edit entry"
            className="relative flex max-h-[88dvh] w-full flex-col rounded-t-lg border border-[var(--hairline)] bg-[var(--paper)] sm:max-w-2xl sm:rounded-lg"
          >
            <header className="border-b border-[var(--hairline)] px-5 py-3.5">
              <h2 className="font-serif text-lg text-[var(--ink)]">Edit entry</h2>
              <p className="mt-1 text-[11px] leading-relaxed text-[var(--ink-muted)]">
                {PROTECTED_FIELDS_NOTE} Every change is recorded in the changelog
                under your pseudonym.
              </p>
            </header>

            <div className="dialog-scroll flex-1 px-5 py-4">
              <EntryFields
                fields={fieldsFor(isAdmin)}
                values={values}
                onChange={(key, value) =>
                  setValues((v) => ({ ...v, [key]: value }) as EditableValues)
                }
                idPrefix="edit"
              />
            </div>

            <footer className="flex flex-wrap items-center gap-2 border-t border-[var(--hairline)] px-5 py-3">
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-3 py-1.5 text-xs text-[var(--ink)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] disabled:opacity-40"
              >
                {saving ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={saving}
                className="rounded-md px-2 py-1 text-xs text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] disabled:opacity-40"
              >
                Cancel
              </button>
              {error && (
                <span className="text-[11px] text-[var(--status-critical)]">{error}</span>
              )}
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
