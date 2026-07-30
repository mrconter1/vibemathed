"use client";

// Renders a set of entry fields as form controls. Shared by the edit dialog and
// the submission form so the two stay visually and behaviourally identical -
// they differ only in which fields they are handed.

export interface RenderableField {
  key: string;
  label: string;
  kind: "text" | "textarea" | "number" | "list" | "url" | "choice";
  required?: boolean;
  help?: string;
  options?: { value: string; label: string }[];
}

// White, not a paper tone: a form field should read as a fillable well, and on
// the cream page white is what marks "you type here".
const controlClass =
  "w-full rounded border border-[var(--hairline)] bg-white px-2.5 py-1.5 text-sm text-[var(--ink)] transition-colors hover:border-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]";

export function EntryFields({
  fields,
  values,
  onChange,
  idPrefix,
}: {
  fields: RenderableField[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  idPrefix: string;
}) {
  return (
    <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      {fields.map((spec) => {
        const id = `${idPrefix}-${spec.key}`;
        const wide = spec.kind === "textarea";
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

            {spec.kind === "textarea" ? (
              <textarea
                id={id}
                value={value}
                rows={3}
                onChange={(e) => onChange(spec.key, e.target.value)}
                className={`${controlClass} mt-1 resize-y`}
              />
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
