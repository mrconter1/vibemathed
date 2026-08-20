/// Theme constants shared by the three places that need them: the boot script
/// in layout.tsx, the header toggle, and the viewport metadata.
///
/// Kept out of ThemeToggle.tsx so the layout can import them without pulling a
/// client component into the server graph.

export const THEME_KEY = "vibemathed:theme";

/// Browser chrome colour per theme, matching `--paper` exactly. Must be
/// literal hex: this feeds a <meta name="theme-color">, which cannot read a
/// CSS custom property.
export const THEME_COLOR = {
  light: "#f3efe3",
  dark: "#17150f",
} as const;

export type ThemeName = keyof typeof THEME_COLOR;

/// The OS preference query, shared by the boot script and ThemeSync so the
/// two can never drift apart on a typo.
export const SYSTEM_DARK = "(prefers-color-scheme: dark)";

/// The reader's PINNED choice, or null when they have never used the toggle.
///
/// Null is the interesting case and the common one: it means "follow the
/// system", which is now the default. Any value other than the two known ones
/// reads as null, so a corrupted or hand-edited key falls back to following
/// the OS rather than leaving the page unstyled.
export function storedTheme(): ThemeName | null {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === "dark" || t === "light" ? t : null;
  } catch {
    // Private mode with storage blocked. Following the system is the right
    // answer for a reader whose choice we cannot read anyway.
    return null;
  }
}

/// What the page should be right now: the pinned choice if there is one, the
/// OS preference otherwise.
export function resolveTheme(): ThemeName {
  return storedTheme() ?? (window.matchMedia(SYSTEM_DARK).matches ? "dark" : "light");
}

/// Paints browser chrome (the mobile address bar) to match the page.
///
/// Strips `media` from every theme-color tag on the way past. The layout ships
/// a light/dark pair of them so the address bar is right on a cold load before
/// any script runs, but once JavaScript knows the resolved theme it is the
/// authority - and a surviving media attribute would let the OS keep
/// overruling a reader who has pinned the other one.
export function paintChrome(theme: ThemeName): void {
  for (const m of document.querySelectorAll('meta[name="theme-color"]')) {
    m.removeAttribute("media");
    m.setAttribute("content", THEME_COLOR[theme]);
  }
}
