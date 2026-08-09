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

import { useState } from "react";
import { useBeforePaint } from "@/lib/before-paint";
import { THEME_COLOR, THEME_KEY } from "@/lib/theme";

/// Keeps browser chrome (the mobile address bar) on the same colour as the
/// page. The boot script does this too, but metadata order in <head> relative
/// to that script is not guaranteed, so if the tag had not been emitted yet
/// this is the pass that lands.
function paintChrome(dark: boolean) {
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", dark ? THEME_COLOR.dark : THEME_COLOR.light);
}

export function ThemeToggle() {
  // null until mounted: the server cannot know the stored choice, so rendering
  // either icon during SSR guarantees a wrong one for anyone on the other
  // theme. The button reserves its space and fills in on hydration.
  const [dark, setDark] = useState<boolean | null>(null);

  // Before paint, not in a plain effect. The same reason RelativeTime uses
  // this hook: a correction that lands a frame after the paint is a visible
  // flicker, and here it would be the wrong icon briefly showing. It also
  // keeps the repo's set-state-in-effect rule satisfied, which plain useEffect
  // does not.
  useBeforePaint(() => {
    const isDark = document.documentElement.dataset.theme === "dark";
    setDark(isDark);
    paintChrome(isDark);
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
    setDark(next);
  }

  const label = dark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      onClick={toggle}
      title={label}
      aria-label={label}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] text-[var(--ink-secondary)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
    >
      {/* Show the theme you would switch TO, which is the convention readers
          expect: a moon means "go dark". Before hydration neither is drawn, so
          the button never flashes the wrong one. */}
      {dark === null ? (
        <span className="h-4 w-4" />
      ) : dark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}
