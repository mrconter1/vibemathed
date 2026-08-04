import { useEffect, useLayoutEffect } from "react";

/// `useLayoutEffect` on the client, `useEffect` on the server.
///
/// Everything this site restores from storage - the viewer's identity, the
/// list's remembered sort, a timestamp's relative wording - has the same
/// shape: the server cannot know it, so the markup ships with a placeholder
/// and the real value arrives once. Doing that in a plain effect means the
/// browser paints the placeholder first and the correction lands a frame
/// later, which is the flicker. A layout effect is flushed before the paint,
/// so the correction is invisible.
///
/// The alternative, reading storage in a lazy `useState` initializer, renders
/// the right value even earlier but makes the client's first render disagree
/// with the server HTML, which is a hydration mismatch React has to patch.
/// This trades one frame for no mismatch at all.
///
/// React warns that layout effects do nothing during SSR, so on the server it
/// falls back to `useEffect`, which is a no-op there anyway.
export const useBeforePaint =
  typeof window === "undefined" ? useEffect : useLayoutEffect;
