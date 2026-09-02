// Shared comment types and limits, used by both the server action and the
// client UI. Kept free of Prisma and KaTeX imports so the client can import it.

/// A comment as the client sees it: body already rendered to HTML on the server.
export interface CommentView {
  id: string;
  /// Author's user id, for deciding whether the viewer may edit this comment.
  /// No more revealing than `authorName`, which is the author's public identity.
  authorId: string | null;
  /// Pseudonym snapshot from when the comment was posted.
  authorName: string;
  /// The author's CURRENT pseudonym, for linking to their profile page - null
  /// when the account is gone (the snapshot name still renders, unlinked).
  authorPseudonym: string | null;
  /// Server-rendered HTML (escaped text + KaTeX math). See `comment-render.ts`.
  /// Empty for a deleted comment.
  html: string;
  /// The original plain text, so the author edits what they actually wrote.
  /// Sent for every comment - it is the same content as `html`, just unrendered,
  /// so there is nothing to withhold and the list stays publicly cacheable.
  source: string;
  /// Display form, "2 Sep 2026, 11:14 UTC".
  createdAt: string;
  /// Raw ISO timestamp, the only thing the client can sort by.
  createdAtIso: string;
  edited: boolean;
  /// The comment this one answers, or null for a top-level comment. The tree
  /// is built client-side from this field; see src/lib/comment-tree.ts.
  parentId: string | null;
  upvotes: number;
  downvotes: number;
  /// Blanked by its author while replies existed. The row stays so the thread
  /// under it keeps its shape; the UI shows a placeholder and no controls.
  deleted: boolean;
}

export const COMMENT_MAX_LENGTH = 5000;
/// Minimum gap between one person's comments.
export const COMMENT_RATE_LIMIT_MS = 10_000;
