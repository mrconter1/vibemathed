"use client";

// Renders a set of entry fields as form controls. Shared by the edit dialog and
// the submission form so the two stay visually and behaviourally identical -
// they differ only in which fields they are handed.

import type { ReactNode } from "react";
import { charLength } from "@/lib/char-length";
import { LinkRows } from "@/components/LinkRows";
import { RelationRows } from "@/components/RelationRows";
import { TeXPreviewTextarea } from "@/components/TeXPreviewTextarea";

export interface RenderableField {
  key: string;
  label: string;
  kind: "text" | "textarea" | "number" | "list" | "url" | "choice" | "links" | "relations";
  required?: boolean;
  help?: string;
  options?: { value: string; label: string }[];
  /// "$" is refused by the server; warn live while typing instead of at save.
  plainText?: boolean;
  /// The server's cap for this field, so the count can be shown while typing.
  /// The field specs have carried this all along; the form simply never read
  /// it, so the only way to learn a note was too long was to have it refused
  /// on save with no number to compare against.
  maxLength?: number;
}

// White, not a paper tone: a form field should read as a fillable well, and on
// the cream page white is what marks "you type here".
const controlClass =
  "w-full rounded border border-[var(--hairline)] bg-[var(--field)] px-2.5 py-1.5 text-sm text-[var(--ink)] transition-colors hover:border-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]";

export function EntryFields({
  fields,
  values,
  onChange,
  idPrefix,
  renderAfter,
  ownSlug,
  texPreview,
}: {
  fields: RenderableField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  idPrefix: string;
  /// Extra content under a given field's control, above its help text. Exists
  /// so the submission form can hang a duplicate check off the title without
  /// this component knowing anything about duplicates; the edit dialog passes
  /// nothing and renders exactly as before.
  renderAfter?: (key: string) => ReactNode;
  /// The entry being edited, so the relation picker can exclude it from its
  /// search results. Absent on the submission form, which has no slug yet -
  /// and no relations field either.
  ownSlug?: string;
  /// Opt every textarea in this field set into the Text / LaTeX preview
  /// control. Submission and existing-entry authoring forms enable it.
  texPreview?: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      {fields.map((spec) => {
        const id = `${idPrefix}-${spec.key}`;
        // Link and relation rows need the full row for their controls.
        const wide =
          spec.kind === "textarea" || spec.kind === "links" || spec.kind === "relations";
        const value = values[spec.key] ?? "";

        return (
          <div key={spec.key} className={wide ? "sm:col-span-2" : undefined}>
            <label
              htmlFor={id}
              className="block text-xs font-medium text-[var(--ink-secondary)]"
            >
              {spec.label}
              {spec.required && <span className="ml-1 text-[var(--accent-orange)]">*</span>}
            </label>

            {spec.kind === "links" ? (
              <LinkRows
                id={id}
                value={value}
                onChange={(next) => onChange(spec.key, next)}
              />
            ) : spec.kind === "relations" ? (
              <RelationRows
                id={id}
                value={value}
                ownSlug={ownSlug ?? ""}
                onChange={(next) => onChange(spec.key, next)}
              />
            ) : spec.kind === "textarea" ? (
              texPreview ? (
                <TeXPreviewTextarea
                  id={id}
                  value={value}
                  onChange={(next) => onChange(spec.key, next)}
                  className={controlClass}
                  label={spec.label}
                  monospace
                />
              ) : (
                <textarea
                  id={id}
                  value={value}
                  rows={3}
                  onChange={(e) => onChange(spec.key, e.target.value)}
                  className={`${controlClass} mt-1 resize-y`}
                />
              )
            ) : spec.kind === "choice" ? (
              <select
                id={id}
                value={value}
                onChange={(e) => onChange(spec.key, e.target.value)}
                className={`${controlClass} mt-1`}
              >
                <option value="">Choose…</option>
                {(spec.options ?? []).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={id}
                value={value}
                inputMode={spec.kind === "number" ? "numeric" : undefined}
                onChange={(e) => onChange(spec.key, e.target.value)}
                className={`${controlClass} mt-1`}
              />
            )}

            {/* Character count, once there is something to count.
                Deliberately absent while the field is empty, so a form of
                thirty fields is not a wall of "0/1000".

                Counted the way the server counts, and the way a person does:
                characters, not UTF-16 units (see lib/char-length). The two
                disagree on blackboard bold and friends, which is how a note
                measured at 998 characters could be refused as over 1000 with
                no counter on screen to argue with.

                No maxLength attribute on the control. A hard stop silently
                swallows the end of a paste, which is worse than showing a red
                number and letting the writer decide what to cut. */}
            {spec.maxLength != null && value.trim() !== "" && (
              <p
                className={`mt-1 text-right text-[10px] tabular-nums ${
                  charLength(value.trim()) > spec.maxLength
                    ? "text-[var(--status-critical)]"
                    : "text-[var(--ink-muted)]"
                }`}
              >
                {charLength(value.trim())}/{spec.maxLength}
              </p>
            )}

            {/* Live version of the server's plain-text rule, so nobody types
                a full LaTeX title and learns at save time that titles don't
                render math. */}
            {spec.plainText && value.includes("$") && (
              <p className="mt-1 text-[11px] leading-snug text-[var(--status-warning)]">
                {spec.label} is plain text and can&apos;t render math - write L^p or n=5
                instead of $...$. The statement field is where $math$ renders.
              </p>
            )}

            {renderAfter?.(spec.key)}

            {spec.help && (
              <p className="mt-1 text-[11px] leading-snug text-[var(--ink-muted)]">
                {spec.help}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
