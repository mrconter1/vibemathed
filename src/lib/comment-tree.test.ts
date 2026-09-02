import { describe, expect, it } from "vitest";
import type { CommentView } from "@/lib/comments";
import {
  buildCommentTree,
  commentScore,
  countLive,
  countReplies,
  isCommentSort,
} from "@/lib/comment-tree";

function c(
  id: string,
  iso: string,
  parentId: string | null = null,
  votes: [number, number] = [0, 0],
  deleted = false,
): CommentView {
  return {
    id,
    authorId: "u",
    authorName: "Someone",
    authorPseudonym: "Someone",
    html: deleted ? "" : `<p>${id}</p>`,
    source: deleted ? "" : id,
    createdAt: iso,
    createdAtIso: iso,
    edited: false,
    parentId,
    upvotes: votes[0],
    downvotes: votes[1],
    deleted,
  };
}

const T1 = "2026-09-01T10:00:00.000Z";
const T2 = "2026-09-01T11:00:00.000Z";
const T3 = "2026-09-01T12:00:00.000Z";
const T4 = "2026-09-01T13:00:00.000Z";

describe("buildCommentTree", () => {
  const list = [
    c("a", T1),
    c("b", T2),
    c("a1", T3, "a", [5, 0]),
    c("a2", T4, "a", [1, 0]),
    c("a1x", T4, "a1"),
  ];

  it("nests replies under their parents with depths", () => {
    const tree = buildCommentTree(list, "oldest");
    expect(tree.map((n) => n.comment.id)).toEqual(["a", "b"]);
    const a = tree[0];
    expect(a.replies.map((n) => n.comment.id)).toEqual(["a1", "a2"]);
    expect(a.replies[0].replies[0].comment.id).toBe("a1x");
    expect(a.replies[0].replies[0].depth).toBe(2);
  });

  it("applies the sort at every level", () => {
    const newest = buildCommentTree(list, "newest");
    expect(newest.map((n) => n.comment.id)).toEqual(["b", "a"]);
    expect(newest[1].replies.map((n) => n.comment.id)).toEqual(["a2", "a1"]);
    // Under Top the two roots tie at 0 and the newer (b) comes first, so
    // look a up by id rather than by position.
    const top = buildCommentTree(list, "top");
    expect(top.map((n) => n.comment.id)).toEqual(["b", "a"]);
    const a = top.find((n) => n.comment.id === "a")!;
    expect(a.replies.map((n) => n.comment.id)).toEqual(["a1", "a2"]);
  });

  it("breaks score ties by recency under Top", () => {
    const tied = [c("x", T1, null, [2, 0]), c("y", T2, null, [2, 0])];
    expect(buildCommentTree(tied, "top").map((n) => n.comment.id)).toEqual(["y", "x"]);
  });

  it("promotes an orphan to the top level rather than dropping it", () => {
    const tree = buildCommentTree([c("r", T1, "missing")], "newest");
    expect(tree.map((n) => n.comment.id)).toEqual(["r"]);
    expect(tree[0].depth).toBe(0);
  });

  it("counts replies at every depth", () => {
    const [a] = buildCommentTree(list, "oldest");
    expect(countReplies(a)).toBe(3);
  });

  it("does not mutate the input", () => {
    const copy = list.slice();
    buildCommentTree(list, "top");
    expect(list).toEqual(copy);
  });
});

describe("helpers", () => {
  it("scores as up minus down", () => {
    expect(commentScore({ upvotes: 3, downvotes: 5 })).toBe(-2);
  });

  it("counts only comments that still say something", () => {
    expect(countLive([c("a", T1), c("b", T2, "a", [0, 0], true)])).toBe(1);
  });

  it("recognises the three sorts and nothing else", () => {
    expect(isCommentSort("top")).toBe(true);
    expect(isCommentSort("hot")).toBe(false);
    expect(isCommentSort(undefined)).toBe(false);
  });
});
