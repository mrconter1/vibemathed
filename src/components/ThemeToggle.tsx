"use client";

// Light/dark switch, in the header beside the account button.
//
// The DOM is the single source of truth, not React state. `<html data-theme>`
// is already set by the boot script in layout.tsx before first paint, so
// seeding state from a default here would make the button briefly disagree
// with the page it controls. It reads the attribute on mount instead, and
// writing the attribute IS the theme change: no context, no provider, no
// re-render of anything below.
//
// Storage key matches the viewer snapshot's namespace so everything this site
// keeps in localStorage sits under one prefix.

import { useEffect } from "react";
import { THEME_COLOR, THEME_KEY } from "@/lib/theme";
import { HEADER_ICON, HEADER_ICON_HOVER } from "@/lib/header-button";
import { useViewer } from "@/components/ViewerProvider";

/// Keeps browser chrome (the mobile address bar) on the same colour as the
/// page. The boot script does this too, but metadata order in <head> relative
/// to that script is not guaranteed, so if the tag had not been emitted yet
/// this is the pass that lands.
function paintChrome(dark: boolean) {
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", dark ? THEME_COLOR.dark : THEME_COLOR.light);
}

/// `icon` is the header button; `row` is the line inside the account menu.
///
/// Both exist because the control has to reach two audiences that have
/// different chrome. A signed-in reader has an account menu, which is where
/// every comparable site keeps appearance, so the header slot goes to the
/// Discord link instead. A signed-out reader has no menu at all, and taking
/// the toggle away from them would make dark mode a privilege of having an
/// account - which this header has never done. So the icon renders only when
/// signed out, and the row only inside the menu, and nobody ever sees two.
export function ThemeToggle({ variant = "icon" }: { variant?: "icon" | "row" }) {
  const { loaded, signedIn } = useViewer();

  // No state at all: the DOM attribute is the source of truth, CSS draws the
  // icon from it, and `toggle` reads it directly. The only thing left for
  // JavaScript on mount is the chrome colour, which is a DOM write rather than
  // React state.
  useEffect(() => {
    paintChrome(document.documentElement.dataset.theme === "dark");
  }, []);

  function toggle() {
    const next = !(document.documentElement.dataset.theme === "dark");
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try {
      localStorage.setItem(THEME_KEY, next ? "dark" : "light");
    } catch {
      // Private mode or a full quota: the theme still applies for this page,
      // it just will not be remembered. Not worth surfacing.
    }
    paintChrome(next);
  }

  // Both icons ship in the markup and CSS reveals the right one; the same
  // trick gives the row its label, so neither can disagree with the page
  // while React finds out what the theme is.
  const glyphs = (
    <>
      <svg className="theme-icon-moon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
      </svg>
      <svg className="theme-icon-sun" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
      </svg>
    </>
  );

  if (variant === "row") {
    return (
      <button
        type="button"
        onClick={toggle}
        className="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm text-[var(--ink-secondary)] transition-colors hover:bg-[color-mix(in_srgb,var(--ink)_5%,transparent)] hover:text-[var(--ink)]"
      >
        {glyphs}
        {/* Same reveal rule as the glyphs: the label names what you would
            switch TO, so it must flip with the attribute, not with state. */}
        <span className="theme-icon-moon">Dark theme</span>
        <span className="theme-icon-sun">Light theme</span>
      </button>
    );
  }

  // Header slot: signed-in readers get this control in the account menu
  // instead, so it would be a duplicate here. Rendering nothing until the
  // viewer snapshot loads would make the header jump, so an unknown viewer
  // is treated as signed out - the state most visitors are in.
  if (loaded && signedIn) return null;

  return (
    <button
      type="button"
      onClick={toggle}
      title="Switch between light and dark theme"
      aria-label="Switch between light and dark theme"
      // h-8 w-8 with a 15px glyph, matching the mail and bell buttons beside
      // it. This was h-9 w-9, copied from the account avatar, which is a
      // circular glyph rather than one of the square icon buttons and is
      // deliberately the larger of the two shapes.
      className={`inline-flex ${HEADER_ICON} ${HEADER_ICON_HOVER}`}
    >
      {glyphs}
    </button>
  );
}
