"use client";

// The consolidated filter control: one button carrying an active-count badge,
// opening a panel of facet pill groups - a bottom sheet on phones, an
// anchored popover on desktop. Replaces the row of four native selects that
// was outgrowing the control bar.
//
// Selections apply instantly (the list refilters client-side, so an Apply
// button would only add ceremony). Tapping the active pill again clears that
// facet back to "all". State lives in ProblemCards, exactly where the old
// selects kept it, so persistence and counting are untouched.

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/Icons";

export interface FilterFacet {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

export function FilterPanel({
  facets,
  values,
  onChange,
}: {
  facets: FilterFacet[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  // Horizontal offset for the DESKTOP popover so it never leaves the
  // viewport: null on mobile, where the sheet is inset-x-0 fixed and an
  // inline `left` would break it.
  const [shift, setShift] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const activeCount = facets.filter((f) => (values[f.key] ?? "all") !== "all").length;

  // Clamp the desktop popover inside the viewport. The anchor button's
  // position depends on how the control row wrapped, so this is measured
  // rather than a fixed alignment, and re-measured on resize.
  useEffect(() => {
    if (!open) return;
    function position() {
      const root = rootRef.current;
      const panel = panelRef.current;
      if (!root || !panel || !window.matchMedia("(min-width: 640px)").matches) {
        setShift(null);
        return;
      }
      const rootLeft = root.getBoundingClientRect().left;
      // clientWidth, NOT innerWidth: innerWidth includes the scrollbar lane
      // (always reserved here via scrollbar-gutter), which let the panel
      // slide underneath it.
      const viewport = document.documentElement.clientWidth;
      const overflowRight = rootLeft + panel.offsetWidth - (viewport - 8);
      setShift(overflowRight > 0 ? -overflowRight : 0);
    }
    position();
    window.addEventListener("resize", position);
    return () => window.removeEventListener("resize", position);
  }, [open]);

  // Close on Escape and on any pointer press outside the control.
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPress(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPress);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPress);
    };
  }, [open]);

  const pill = (active: boolean) =>
    `inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-1 text-xs transition-colors ${
      active
        ? "border-[var(--accent-blue)] bg-[color-mix(in_srgb,var(--accent-blue)_10%,transparent)] font-medium text-[var(--accent-blue)]"
        : "border-[var(--hairline)] bg-[var(--paper)] text-[var(--ink-secondary)]"
    }`;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={panelId}
        className={`inline-flex h-9 items-center gap-1.5 rounded border px-2.5 text-xs transition-colors ${
          activeCount > 0
            ? "border-[var(--accent-blue)] bg-[color-mix(in_srgb,var(--accent-blue)_10%,transparent)] font-medium text-[var(--accent-blue)]"
            : "border-[var(--hairline)] bg-[var(--paper-raised)] text-[var(--ink-secondary)]"
        }`}
      >
        <Icon name="funnel" />
        Filters
        {activeCount > 0 && (
          <span className="font-mono text-[11px] tabular-nums">{activeCount}</span>
        )}
      </button>

      {/* Backdrop: dims the page behind the mobile sheet; invisible on
          desktop, where the outside-press listener does the closing. */}
      {open && (
        <div
          aria-hidden
          className="fixed inset-0 z-40 bg-[color-mix(in_srgb,var(--ink)_35%,transparent)] sm:hidden"
        />
      )}

      {open && (
        <div
          id={panelId}
          ref={panelRef}
          role="dialog"
          aria-label="Filter entries"
          style={shift !== null ? { left: shift } : undefined}
          className="fixed inset-x-0 bottom-0 z-50 max-h-[75vh] overflow-y-auto rounded-t-xl border-t border-[var(--hairline)] bg-[var(--paper-raised)] px-5 pb-6 pt-4 shadow-lg sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:top-full sm:mt-2 sm:w-[22rem] sm:rounded-lg sm:border sm:px-4 sm:pb-4"
        >
          <div className="flex items-center justify-between">
            <span className="font-serif text-base text-[var(--ink)]">Filters</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close filters"
              className="rounded px-2 py-1 text-sm text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
            >
              ✕
            </button>
          </div>

          {facets.map((f) => {
            const current = values[f.key] ?? "all";
            return (
              <fieldset key={f.key} className="mt-4">
                <legend className="text-xs text-[var(--ink-muted)]">{f.label}</legend>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {f.options.map((o) => {
                    const active = current === o.value;
                    return (
                      <button
                        key={o.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => onChange(f.key, active ? "all" : o.value)}
                        className={pill(active)}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}

          <div className="mt-5 flex items-center justify-between border-t border-[var(--hairline)] pt-3">
            <button
              type="button"
              onClick={() => facets.forEach((f) => onChange(f.key, "all"))}
              disabled={activeCount === 0}
              className="text-xs text-[var(--accent-blue)] hover:underline disabled:pointer-events-none disabled:opacity-40"
            >
              Clear filters
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md border border-[var(--hairline)] bg-[var(--paper)] px-3 py-1.5 text-xs text-[var(--ink)] transition-colors hover:border-[var(--ink-muted)]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
