"use client";

// Keeps the page on the OS theme for as long as the reader has not pinned one.
//
// The boot script in layout.tsx already resolved the theme before first paint;
// this is only about what happens AFTERWARDS, when the OS flips - a laptop
// crossing into its night schedule while a tab sits open.
//
// It lives here, mounted by the layout, rather than in ThemeToggle. The
// toggle's row variant renders inside the account menu, which is unmounted
// until the menu is opened, so a listener there would simply not exist for a
// signed-in reader who never opens it. Following the system is not a property
// of a control being on screen.
//
// Renders nothing.

import { useEffect } from "react";
import { SYSTEM_DARK, paintChrome, storedTheme } from "@/lib/theme";

export function ThemeSync() {
  useEffect(() => {
    const mq = window.matchMedia(SYSTEM_DARK);

    const follow = () => {
      // A pinned choice always wins. Re-read it on every event rather than
      // caching: the reader may pin one in this tab, or in another, between
      // now and the next OS change.
      if (storedTheme() !== null) return;
      const next = mq.matches ? "dark" : "light";
      document.documentElement.dataset.theme = next;
      paintChrome(next);
    };

    // One pass on mount. The boot script sets the chrome colour too, but the
    // order of <head> metadata relative to that script is not guaranteed, so
    // if the tags had not been emitted yet this is the pass that lands.
    paintChrome(
      document.documentElement.dataset.theme === "dark" ? "dark" : "light",
    );

    mq.addEventListener("change", follow);
    return () => mq.removeEventListener("change", follow);
  }, []);

  return null;
}
