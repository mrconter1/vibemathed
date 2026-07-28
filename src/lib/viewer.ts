// Shape of "who is looking at this page", shared by the server action that
// produces it and the client provider that consumes it.
//
// This lives here rather than beside the action because a `"use server"` module
// may only export async functions - a plain constant like `SIGNED_OUT` in that
// file is a build error.

import type { VoteKind } from "@prisma/client";

export interface ViewerState {
  signedIn: boolean;
  /// The viewer's own user id, used to decide which comments they may edit.
  /// Null when signed out.
  userId: string | null;
  /// The viewer's public identity. Null when signed out.
  pseudonym: string | null;
  /// Whether this viewer may review submissions. The UI uses it to decide what
  /// to show; every privileged action re-checks server-side regardless.
  isAdmin: boolean;
  /// The viewer's own votes, keyed by problem slug.
  votes: Record<string, VoteKind>;
}

export const SIGNED_OUT: ViewerState = {
  signedIn: false,
  userId: null,
  pseudonym: null,
  isAdmin: false,
  votes: {},
};
