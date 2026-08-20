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
  /// The viewer's own bio, for seeding the editor. Null if unset.
  bio: string | null;
  /// Self-declared role, for seeding the editor. Null if unset.
  role: string | null;
  /// Whether a curator has verified this member's identity.
  verified: boolean;
  /// The viewer's own privacy toggles, for seeding the profile editor: show
  /// the Google name / email on the public profile. Both default off.
  showGoogleName: boolean;
  showGoogleEmail: boolean;
  /// The viewer's own discoverability toggles, also for seeding the editor.
  /// Both default ON: neither publishes anything that was private, they only
  /// govern whether it is gathered in one place (see the schema).
  listed: boolean;
  showComments: boolean;
  /// Whether this viewer may review submissions. The UI uses it to decide what
  /// to show; every privileged action re-checks server-side regardless.
  isAdmin: boolean;
  /// Submissions awaiting review. Always 0 for non-admins, so the count is
  /// never disclosed to anyone who could not act on it.
  pendingReviews: number;
  /// Entry reports awaiting a curator. Same admin-only rule as pendingReviews.
  openReports: number;
  /// Unread notifications for THIS viewer: comments by others, newer than
  /// their seen-watermark, on entries they submitted or commented on.
  notifications: number;
  /// Unread curator mail for THIS viewer. Counted for everyone, unlike the
  /// three queue counts above, and on its own watermark so glancing at the
  /// bell does not mark an unread letter as read.
  unreadInbox: number;
  /// The viewer's own votes, keyed by problem slug.
  votes: Record<string, VoteKind>;
}

export const SIGNED_OUT: ViewerState = {
  signedIn: false,
  userId: null,
  pseudonym: null,
  bio: null,
  role: null,
  verified: false,
  showGoogleName: false,
  showGoogleEmail: false,
  // Signed out has no profile to list, so the values here are inert.
  listed: true,
  showComments: true,
  isAdmin: false,
  pendingReviews: 0,
  openReports: 0,
  notifications: 0,
  unreadInbox: 0,
  votes: {},
};
