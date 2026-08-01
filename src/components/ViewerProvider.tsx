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
import { SIGNED_OUT, type ViewerState } from "@/lib/viewer";

interface ViewerContextValue extends ViewerState {
  /// False until the first fetch resolves, so controls can avoid flashing a
  /// "signed out" state at someone who is signed in.
  loaded: boolean;
  setVote: (slug: string, vote: VoteKind | null) => void;
  setPseudonym: (pseudonym: string) => void;
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

export function ViewerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ViewerState>(SIGNED_OUT);
  const [loaded, setLoaded] = useState(false);
  // Bumping this re-runs the fetch below.
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    getViewerState()
      .then((next) => {
        if (alive) setState(next);
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

  const clearNotifications = useCallback(() => {
    setState((prev) => ({ ...prev, notifications: 0 }));
  }, []);

  const value = useMemo(
    () => ({ ...state, loaded, setVote, setPseudonym, clearNotifications, refresh }),
    [state, loaded, setVote, setPseudonym, clearNotifications, refresh],
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
