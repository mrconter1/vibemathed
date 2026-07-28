// Shape of "who is looking at this page", shared by the server action that
// produces it and the client provider that consumes it.
//
// This lives here rather than beside the action because a `"use server"` module
// may only export async functions - a plain constant like `SIGNED_OUT` in that
// file is a build error.

import type { VoteKind } from "@prisma/client";

export interface ViewerState {
  signedIn: boolean;
  /// The viewer's public identity. Null when signed out.
  pseudonym: string | null;
  /// The viewer's own votes, keyed by problem slug.
  votes: Record<string, VoteKind>;
}

export const SIGNED_OUT: ViewerState = {
  signedIn: false,
  pseudonym: null,
  votes: {},
};
