"use client";

// The one dialog a curator writes to a reader through, whether the trigger is
// a submission decision or a handled report.
//
// It was two nearly identical modals before the reports queue could reply at
// all; making it one is what keeps the two from drifting on the things that
// matter - the character cap, the "this is not public" promise, and the fact
// that the recipient may not be reachable.

import { useEffect, useRef, useState } from "react";
import { MESSAGE_MAX, type ReviewReason } from "@/lib/messages";

export interface MessageDialogProps {
  title: string;
  /// One or two sentences under the title explaining where the message goes.
  intro: string;
  /// Canned reasons. Picking one seeds the message box; omit for a plain
  /// free-text dialog.
  reasons?: ReviewReason[];
  reasonLabel?: string;
  placeholder: string;
  confirmLabel: string;
  busy: boolean;
  /// False when there is nobody to deliver to - an account that has since
  /// been deleted. The action still runs; the message simply goes nowhere,
  /// and saying so up front beats letting someone write into a void.
  canDeliver?: boolean;
  onCancel: () => void;
  onConfirm: (reason: string | null, message: string) => void;
}

export function MessageDialog({
  title,
  intro,
  reasons,
  reasonLabel = "Reason",
  placeholder,
  confirmLabel,
  busy,
  canDeliver = true,
  onCancel,
  onConfirm,
}: MessageDialogProps) {
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const areaRef = useRef<HTMLTextAreaElement>(null);
  // True once the curator has typed anything, after which picking a different
  // reason must not overwrite their words.
  const touched = useRef(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onCancel();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [busy, onCancel]);

  function pickReason(value: string) {
    setReason(value);
    const draft = reasons?.find((r) => r.value === value)?.draft ?? "";
    // Seed the box only while it is still untouched or still holds a draft
    // this dialog put there. Anything the curator wrote themselves wins.
    if (!touched.current && draft) {
      setMessage(draft);
      areaRef.current?.focus();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div
        className="absolute inset-0 bg-[rgba(20,18,12,0.45)]"
        onClick={busy ? undefined : onCancel}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-lg border border-[var(--hairline)] bg-[var(--paper)] dialog-scroll sm:max-w-md sm:rounded-lg"
      >
        <header className="border-b border-[var(--hairline)] px-5 py-3.5">
          <h2 className="font-serif text-lg text-[var(--ink)]">{title}</h2>
          <p className="mt-1 text-[11px] leading-relaxed text-[var(--ink-muted)]">
            {intro}
          </p>
          {!canDeliver && (
            <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--accent-orange)]">
              This account no longer exists, so anything written here will not
              reach anyone. The action itself still goes through.
            </p>
          )}
        </header>

        <div className="space-y-3 px-5 py-4">
          {reasons && (
            <label className="block">
              <span className="mb-1 block text-[11px] text-[var(--ink-muted)]">
                {reasonLabel}
              </span>
              <select
                value={reason}
                onChange={(e) => pickReason(e.target.value)}
                autoFocus
                className="w-full rounded border border-[var(--hairline)] bg-[var(--paper-raised)] px-2.5 py-2 text-sm text-[var(--ink)] transition-colors hover:border-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
              >
                <option value="">No reason recorded</option>
                {reasons.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          <label className="block">
            <span className="mb-1 block text-[11px] text-[var(--ink-muted)]">
              Message
            </span>
            <textarea
              ref={areaRef}
              value={message}
              maxLength={MESSAGE_MAX}
              rows={5}
              autoFocus={!reasons}
              placeholder={placeholder}
              onChange={(e) => {
                touched.current = true;
                setMessage(e.target.value);
              }}
              className="w-full resize-y rounded border border-[var(--hairline)] bg-[var(--paper-raised)] px-2.5 py-2 text-sm text-[var(--ink)] transition-colors hover:border-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
            />
            <span className="mt-1 block text-right text-[11px] text-[var(--ink-muted)]">
              {message.length}/{MESSAGE_MAX}
            </span>
          </label>
        </div>

        <footer className="flex flex-wrap items-center gap-2 border-t border-[var(--hairline)] px-5 py-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => onConfirm(reason || null, message)}
            className="rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-3 py-1.5 text-xs text-[var(--ink)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] disabled:opacity-40"
          >
            {busy ? "Saving…" : confirmLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="rounded-md px-2 py-1 text-xs text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] disabled:opacity-40"
          >
            Cancel
          </button>
        </footer>
      </div>
    </div>
  );
}
