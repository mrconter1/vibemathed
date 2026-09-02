// The discussion as a tree, and the three orders it can be read in.
//
// Pure: takes the flat list the server sends (one row per comment with a
// parentId) and returns nested nodes. Lives apart from the component so it can
// be unit-tested and so the server could use the same shape if it ever needed
// to render the tree itself.

import type { CommentView } from "@/lib/comments";

export type CommentSort = "newest" | "oldest" | "top";

export const COMMENT_SORTS: { key: CommentSort; label: string }[] = [
  { key: "newest", label: "Newest" },
  { key: "oldest", label: "Oldest" },
  { key: "top", label: "Top" },
];

export function isCommentSort(value: unknown): value is CommentSort {
  return COMMENT_SORTS.some((s) => s.key === value);
}

export interface CommentNode {
  comment: CommentView;
  replies: CommentNode[];
  /// 0 for a top-level comment.
  depth: number;
}

export function commentScore(c: Pick<CommentView, "upvotes" | "downvotes">): number {
  return c.upvotes - c.downvotes;
}

/// Sort order for siblings. "Top" breaks ties by recency so two comments with
/// the same score are not in arbitrary order.
export function compareComments(a: CommentView, b: CommentView, sort: CommentSort): number {
  switch (sort) {
    case "oldest":
      return a.createdAtIso.localeCompare(b.createdAtIso);
    case "top": {
      const d = commentScore(b) - commentScore(a);
      return d !== 0 ? d : b.createdAtIso.localeCompare(a.createdAtIso);
    }
    case "newest":
    default:
      return b.createdAtIso.localeCompare(a.createdAtIso);
  }
}

/// Nests replies under their parents. The sort applies at every level, so a
/// thread reads the same way top to bottom.
///
/// A reply whose parent is missing from the list - which cannot happen from
/// the server, but can from a client list mid-edit - is promoted to the top
/// level rather than dropped: losing a comment silently is the worse failure.
export function buildCommentTree(list: CommentView[], sort: CommentSort): CommentNode[] {
  const byId = new Map(list.map((c) => [c.id, c]));
  const children = new Map<string | null, CommentView[]>();
  for (const c of list) {
    const parent = c.parentId !== null && byId.has(c.parentId) ? c.parentId : null;
    const bucket = children.get(parent);
    if (bucket) bucket.push(c);
    else children.set(parent, [c]);
  }
  const build = (parent: string | null, depth: number): CommentNode[] =>
    (children.get(parent) ?? [])
      .slice()
      .sort((a, b) => compareComments(a, b, sort))
      .map((c) => ({ comment: c, depth, replies: build(c.id, depth + 1) }));
  return build(null, 0);
}

/// Replies under a node, at every depth.
export function countReplies(node: CommentNode): number {
  return node.replies.reduce((n, r) => n + 1 + countReplies(r), 0);
}

/// What the "Discussion" heading counts: comments that still say something.
export function countLive(list: CommentView[]): number {
  return list.filter((c) => !c.deleted).length;
}
