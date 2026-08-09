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
