"use client";

// Holds who the viewer is and how they have voted, fetched once after hydration
// and shared by the header and every vote control on the page. See
// `src/app/actions/viewer.ts` for why this is client-side rather than read
// during render.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { VoteKind } from "@prisma/client";
import { getViewerState } from "@/app/actions/viewer";
import { useBeforePaint } from "@/lib/before-paint";
import { SIGNED_OUT, type ViewerState } from "@/lib/viewer";

interface ViewerContextValue extends ViewerState {
  /// False until the first fetch resolves, so controls can avoid flashing a
  /// "signed out" state at someone who is signed in.
  loaded: boolean;
  setVote: (slug: string, vote: VoteKind | null) => void;
  setPseudonym: (pseudonym: string) => void;
  setBio: (bio: string) => void;
  setRole: (role: string | null) => void;
  setGoogleVisibility: (field: "name" | "email", show: boolean) => void;
  setPrivacy: (field: "listed" | "showComments", on: boolean) => void;
  /// Zeroes the unread-notification badge locally, after the server watermark
  /// has been moved (opening the notifications panel does both).
  clearNotifications: () => void;
  /// Re-reads viewer state from the server. Needed after an action changes
  /// something this state counts - approving a submission, for instance, must
  /// decrement the pending-review badge, and `router.refresh()` cannot do that
  /// because this state lives on the client.
  refresh: () => void;
}

const ViewerContext = createContext<ViewerContextValue | null>(null);

/// Last known viewer state. Seeding from it makes the header controls render
/// instantly instead of waiting a server round trip; the real fetch then
/// corrects anything stale.
///
/// localStorage, not sessionStorage. Per-tab storage is empty on the first
/// load in any new tab, which is exactly when the header sat on a skeleton
/// for a whole round trip - the case the cache was supposed to cover. Nothing
/// here is a credential: it is a snapshot of what the last fetch returned,
/// and every privileged action re-checks on the server regardless.
const CACHE_KEY = "vibemathed:viewer";

/// Drops the cached snapshot. Called on sign-out: the seed is what makes the
/// header render before the fetch resolves, so leaving a signed-in snapshot
/// behind would greet a signed-out visitor with their own avatar until the
/// fetch corrected it. Latent with sessionStorage, which already survived the
/// redirect; now that the cache outlives the tab it would survive a restart.
export function clearViewerCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // Nothing to do: a cache we cannot clear is one we could not have read.
  }
}

function readCache(): ViewerState | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as ViewerState;
    return typeof cached?.signedIn === "boolean" ? { ...SIGNED_OUT, ...cached } : null;
  } catch {
    return null;
  }
}

export function ViewerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ViewerState>(SIGNED_OUT);
  const [loaded, setLoaded] = useState(false);
  // Bumping this re-runs the fetch below.
  const [nonce, setNonce] = useState(0);

  // Optimistic seed from the cache, before the fetch resolves. Effect (not
  // initial state): storage does not exist during SSR/hydration. One-time
  // hydration from storage is the sanctioned exception to the
  // set-state-in-effect rule (same pattern as the list settings restore).
  //
  // Before paint, so a returning visitor's header renders as itself rather
  // than painting the loading placeholder first and swapping.
  useBeforePaint(() => {
    const cached = readCache();
    if (cached) {
      setState(cached);
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    let alive = true;
    getViewerState()
      .then((next) => {
        if (!alive) return;
        setState(next);
        try {
          localStorage.setItem(CACHE_KEY, JSON.stringify(next));
        } catch {
          // Storage full or blocked - the fetch still populated the state.
        }
      })
      .catch((error) => {
        console.error("Could not load viewer state", error);
      })
      .finally(() => {
        if (alive) setLoaded(true);
      });
    return () => {
      alive = false;
    };
  }, [nonce]);

  const refresh = useCallback(() => setNonce((n) => n + 1), []);

  // Background poll, one viewer-state read a minute, so a new notification
  // or a letter reaches the badges while the tab just sits there. Hidden
  // tabs skip the tick and catch up the moment they are looked at again -
  // that is what the visibilitychange arm is for, and it is also why coming
  // back to a day-old tab does not wait up to a minute for fresh counts.
  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const id = setInterval(tick, 60_000);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [refresh]);

  // Keep the cache in step with local mutations (a vote cast, the badge
  // cleared, a rename), so the next navigation's seed is not stale.
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(state));
    } catch {
      // Best effort only.
    }
  }, [state, loaded]);

  const setVote = useCallback((slug: string, vote: VoteKind | null) => {
    setState((prev) => {
      const votes = { ...prev.votes };
      if (vote === null) {
        delete votes[slug];
      } else {
        votes[slug] = vote;
      }
      return { ...prev, votes };
    });
  }, []);

  const setPseudonym = useCallback((pseudonym: string) => {
    setState((prev) => ({ ...prev, pseudonym }));
  }, []);

  const setBio = useCallback((bio: string) => {
    setState((prev) => ({ ...prev, bio: bio === "" ? null : bio }));
  }, []);

  const setRole = useCallback((role: string | null) => {
    setState((prev) => ({ ...prev, role }));
  }, []);

  const setGoogleVisibility = useCallback(
    (field: "name" | "email", show: boolean) => {
      setState((prev) =>
        field === "name"
          ? { ...prev, showGoogleName: show }
          : { ...prev, showGoogleEmail: show },
      );
    },
    [],
  );

  const setPrivacy = useCallback((field: "listed" | "showComments", on: boolean) => {
    setState((prev) =>
      field === "listed" ? { ...prev, listed: on } : { ...prev, showComments: on },
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setState((prev) => ({ ...prev, notifications: 0 }));
  }, []);

  const value = useMemo(
    () => ({ ...state, loaded, setVote, setPseudonym, setBio, setRole, setGoogleVisibility, setPrivacy, clearNotifications, refresh }),
    [state, loaded, setVote, setPseudonym, setBio, setRole, setGoogleVisibility, setPrivacy, clearNotifications, refresh],
  );

  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>;
}

export function useViewer(): ViewerContextValue {
  const ctx = useContext(ViewerContext);
  if (!ctx) {
    throw new Error("useViewer must be used inside a ViewerProvider");
  }
  return ctx;
}
