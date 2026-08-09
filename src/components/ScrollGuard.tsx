"use client";

// Stops in-page scroll containers from stealing a page scroll that is already
// under way.
//
// The problem: scrolling the home page with the cursor anywhere over the
// activity feed hands the wheel to the feed instead. The page stops, the feed
// scrolls, and getting out means moving the pointer somewhere else. Each wheel
// tick is its own gesture, so the browser re-picks a target every time and
// picks whatever is under the cursor.
//
// The fix is the reader's own intuition: an inner scroller should only take
// over when the page is at rest. While the document is scrolling, and for a
// beat afterwards, `<html>` carries `data-scrolling` and the CSS in
// globals.css drops those containers to `overflow-y: hidden`, so the wheel has
// nowhere to go but the page. Their scrollbars are already hidden, so nothing
// moves on screen when the property flips.
//
// `overflow` rather than `pointer-events: none`, which would also kill hover
// and clicks on the links inside for the duration.
//
// Deliberately NOT applied to `.dialog-scroll`: inside a dialog or a dropdown
// the cursor is over that panel on purpose, and capturing the wheel is the
// correct behaviour there.

import { useEffect } from "react";

/// How long after the last scroll event the page counts as still moving.
/// Long enough to cover the gap between wheel ticks in a continuous scroll,
/// short enough that stopping to read and then scrolling the feed feels
/// immediate.
const SETTLE_MS = 150;

export function ScrollGuard() {
  useEffect(() => {
    let timer: number | undefined;

    const onScroll = () => {
      document.documentElement.dataset.scrolling = "1";
      if (timer) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        delete document.documentElement.dataset.scrolling;
      }, SETTLE_MS);
    };

    // Only the document's own scroll. `scroll` does not bubble, so scrolling
    // the feed itself never sets the flag and cannot lock the reader out of
    // the thing they are deliberately scrolling.
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (timer) window.clearTimeout(timer);
      delete document.documentElement.dataset.scrolling;
    };
  }, []);

  return null;
}
