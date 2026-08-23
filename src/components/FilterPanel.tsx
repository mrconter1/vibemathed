"use client";

// The consolidated filter control: one button carrying an active-count badge,
// opening a panel of facet pill groups - a bottom sheet on phones, an
// anchored popover on desktop. Replaces the row of four native selects that
// was outgrowing the control bar.
//
// Selections apply instantly (the list refilters client-side, so an Apply
// button would only add ceremony). A facet takes as many options as you like:
// pills toggle, so tapping an active one removes just that option and tapping
// another adds it alongside. Options within a facet are alternatives (any of),
// which is why picking a second one widens the list while picking a second
// FACET narrows it. State lives in ProblemCards, exactly where the old selects
// kept it, so persistence is untouched.

import { useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/Icons";
import { parseSelection, toggleSelection } from "@/lib/list-settings";

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
  /// Per facet: "all", or the chosen option values joined by commas.
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

  // Conditions, not facets: with several options allowed per facet, counting
  // facets would show "1" for a three-way AI-contribution choice and stop
  // moving as more were added, which is the opposite of what a count on a
  // collapsed control is for.
  const activeCount = facets.reduce((n, f) => n + parseSelection(values[f.key]).length, 0);

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
          // dialog-scroll (globals.css) replaces the UA scrollbar, which read
          // as a heavy grey slab down the side of the panel, with a thin
          // rounded thumb on a transparent track.
          className="dialog-scroll fixed inset-x-0 bottom-0 z-50 max-h-[75vh] rounded-t-xl border-t border-[var(--hairline)] bg-[var(--paper-raised)] px-5 pb-6 pt-4 shadow-lg sm:absolute sm:inset-x-auto sm:bottom-auto sm:left-0 sm:top-full sm:mt-2 sm:w-[22rem] sm:rounded-lg sm:border sm:px-4 sm:pb-4"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="font-serif text-base text-[var(--ink)]">Filters</span>
            <span className="flex items-center gap-1">
              {/* In the HEADER, not only at the foot of the panel. Seven
                  facets are taller than the panel, so the footer copy sat
                  below the fold on any short window - the one control a
                  reader wants when the list has gone empty was the one they
                  had to scroll to find. Rendered only when it would do
                  something, so it never reads as a live control on a clean
                  panel. The same pill as the chip row's outside, so the two
                  clears read as one control in two places. */}
              {activeCount > 0 && (
                <button
                  type="button"
                  onClick={() => facets.forEach((f) => onChange(f.key, "all"))}
                  className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-[var(--hairline)] bg-[var(--paper)] px-2.5 py-1 text-xs font-medium text-[var(--ink-secondary)] transition-colors hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)]"
                >
                  <Icon name="close" size={11} />
                  Clear filters
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close filters"
                className="rounded px-2 py-1 text-sm text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)]"
              >
                ✕
              </button>
            </span>
          </div>

          {facets.map((f) => {
            const current = values[f.key] ?? "all";
            const chosen = parseSelection(current);
            return (
              <fieldset key={f.key} className="mt-4">
                <legend className="text-xs text-[var(--ink-muted)]">
                  {f.label}
                  {/* Only once a second option is picked, because that is the
                      only moment the reader needs telling: one pill is
                      unambiguous, two could plausibly mean "both at once",
                      which here would match nothing. */}
                  {chosen.length > 1 && (
                    <span className="ml-1.5 text-[var(--ink-muted)] opacity-70">any of</span>
                  )}
                </legend>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {f.options.map((o) => {
                    const active = chosen.includes(o.value);
                    return (
                      <button
                        key={o.value}
                        type="button"
                        aria-pressed={active}
                        onClick={() => onChange(f.key, toggleSelection(current, o.value))}
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

          <div className="mt-5 flex items-center justify-end border-t border-[var(--hairline)] pt-3">
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
