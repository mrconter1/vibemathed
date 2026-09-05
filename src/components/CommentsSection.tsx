"use client";

// Discussion on an entry page.
//
// The initial list is server-rendered (and cached), so comments are in the
// static shell and get indexed. This component layers the interactive parts on
// top: posting, replying, voting, editing your own, deleting your own. Server
// actions return the re-rendered HTML for a comment, so edits show their math
// immediately without a page reload. The composer lazy-loads browser KaTeX
// only if its LaTeX preview tab is opened.
//
// Threads. The server sends one flat list with a parentId per comment; the
// tree is built here (src/lib/comment-tree.ts) and re-sorted when the reader
// picks a different order, with no round trip. Nesting indents up to
// MAX_INDENT levels and then stops indenting - a twelve-deep exchange on a
// phone would otherwise be a one-word column - and past that depth each reply
// says who it answers instead.

import { useId, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import type { VoteKind } from "@prisma/client";
import {
  addComment,
  deleteComment,
  editComment,
} from "@/app/actions/comments";
import { voteOnComment } from "@/app/actions/vote";
import { COMMENT_MAX_LENGTH, type CommentView } from "@/lib/comments";
import {
  COMMENT_SORTS,
  buildCommentTree,
  commentScore,
  countLive,
  countReplies,
  isCommentSort,
  type CommentNode,
  type CommentSort,
} from "@/lib/comment-tree";
import { useViewer } from "@/components/ViewerProvider";
import type { Subject } from "@/lib/subject";
import { Icon } from "@/components/Icons";
import { TeXPreviewTextarea } from "@/components/TeXPreviewTextarea";
import { useBeforePaint } from "@/lib/before-paint";

const textareaClass =
  "w-full min-h-[96px] resize-y rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-3 py-2 text-sm leading-relaxed text-[var(--ink)] transition-colors placeholder:text-[var(--ink-muted)] hover:border-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]";
const primaryBtn =
  "rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-3 py-1.5 text-xs text-[var(--ink)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] disabled:opacity-40";
const quietBtn =
  "rounded-md px-2 py-1 text-xs text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] disabled:opacity-40";
/// Edit is an icon, not a word, so it reads at a glance without competing
/// with the author name and timestamp already on this line. `ink-secondary`,
/// not `ink-muted` - muted is the token for metadata (the timestamp right
/// next to this), and using it on the button too was why it read as more
/// metadata rather than a control. The border gets the same bump so the
/// button's outline doesn't fade into the row along with its icon.
const editIconBtn =
  "inline-flex h-6 w-6 items-center justify-center rounded-md border border-[var(--ink-muted)] text-[var(--ink-secondary)] transition-colors hover:border-[var(--ink)] hover:bg-[color-mix(in_srgb,var(--ink)_6%,transparent)] hover:text-[var(--ink)] disabled:opacity-40";
/// Delete keeps its word - unlike Edit, a bare trash icon here would be read
/// too quickly, and this is the one action on a comment that cannot be undone.
/// Bordered like a real button rather than the quiet text link it used to be,
/// so it does not read as just another piece of comment metadata.
const deleteBtn =
  "inline-flex items-center rounded-md border border-[var(--ink-muted)] px-2 py-1 text-xs text-[var(--ink-secondary)] transition-colors hover:border-[var(--status-critical)] hover:text-[var(--status-critical)] disabled:opacity-40";

/// How many levels indent before replies stop moving right. Five is about the
/// most a phone can show before the text column is narrower than a word.
const MAX_INDENT = 5;

/// Remembered per browser: someone who reads Top once probably wants Top.
const SORT_KEY = "vibemathed:comment-sort";
const DEFAULT_SORT: CommentSort = "newest";

/// The ten that actually get used under a result. No search, no categories,
/// no picker library: typing ":" is a shortcut for people who already know
/// what they want, and a grid of 1800 emoji would be slower than the keyboard.
///
/// Stored and rendered as plain Unicode. The comment renderer escapes only
/// & < > " and leaves every other character alone, so these survive the round
/// trip untouched, including the ZWJ and variation-selector sequences.
const EMOJI = ["👍", "🎉", "🔥", "👏", "🤯", "🤔", "😂", "🙌", "✅", "❤️"];

function Composer({
  initial,
  submitLabel,
  placeholder,
  busy,
  onSubmit,
  onCancel,
  autoFocus,
}: {
  initial?: string;
  submitLabel: string;
  placeholder?: string;
  busy: boolean;
  /// Resolves true on success, so the composer knows to clear itself - a
  /// posted comment must not linger in the box.
  onSubmit: (text: string) => Promise<boolean>;
  onCancel?: () => void;
  autoFocus?: boolean;
}) {
  const [text, setText] = useState(initial ?? "");
  // Open only while the caret sits directly after a just-typed ":".
  const [picker, setPicker] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const textareaId = useId();
  const empty = text.trim().length === 0;
  const tooLong = text.trim().length > COMMENT_MAX_LENGTH;

  async function submit() {
    if (empty || tooLong) return;
    const ok = await onSubmit(text);
    if (ok) setText("");
    setPicker(false);
  }

  /// Swaps the ":" that opened the picker for the emoji, then puts the caret
  /// after it. Without restoring the caret the reader is dumped at the end of
  /// the box, which is wrong whenever they were editing mid-sentence.
  function insertEmoji(emoji: string) {
    const ta = taRef.current;
    const caret = ta?.selectionStart ?? text.length;
    const before = text.slice(0, caret);
    // The colon is immediately behind the caret when the picker is open, but
    // guard anyway: a stale open state must not eat an unrelated character.
    const start = before.endsWith(":") ? caret - 1 : caret;
    const next = text.slice(0, start) + emoji + text.slice(caret);
    setText(next);
    setPicker(false);
    const at = start + emoji.length;
    requestAnimationFrame(() => {
      ta?.focus();
      ta?.setSelectionRange(at, at);
    });
  }

  return (
    <div className="relative">
      <TeXPreviewTextarea
        id={textareaId}
        label="Comment"
        textareaRef={taRef}
        value={text}
        onChange={(value, event) => {
          // Insertion only: deleting back onto a ":" should not spring the
          // picker open under the reader's cursor.
          const typed = value.length > text.length;
          setText(value);
          setPicker(
            typed && value.slice(0, event.target.selectionStart).endsWith(":"),
          );
        }}
        onBlur={() => setPicker(false)}
        autoFocus={autoFocus}
        placeholder={placeholder ?? "Add a comment. Math works: wrap it in $…$ or $$…$$."}
        className={textareaClass}
        rows={3}
        heightClass="min-h-[96px]"
        onKeyDown={(e) => {
          // Ctrl/Cmd+Enter submits, matching most comment boxes.
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !empty && !tooLong) {
            e.preventDefault();
            void submit();
          }
          // Escape dismisses the picker without disturbing the text, and
          // without bubbling out to close a surrounding dialog.
          if (e.key === "Escape" && picker) {
            e.preventDefault();
            e.stopPropagation();
            setPicker(false);
          }
        }}
      />

      {picker && (
        <div
          role="listbox"
          aria-label="Insert emoji"
          // Sits under the box rather than at the caret: measuring a caret's
          // pixel position in a textarea means cloning it into a mirror div,
          // which is a lot of machinery for a ten-item row.
          className="absolute left-1 top-full z-30 -mt-1 flex gap-0.5 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] p-1 shadow-lg"
        >
          {EMOJI.map((e) => (
            <button
              key={e}
              type="button"
              role="option"
              aria-selected={false}
              aria-label={`Insert ${e}`}
              // mousedown, not click: the textarea's blur would close the
              // picker first and the click would land on nothing.
              onMouseDown={(ev) => {
                ev.preventDefault();
                insertEmoji(e);
              }}
              className="rounded-md px-1.5 py-1 text-base leading-none transition-colors hover:bg-[color-mix(in_srgb,var(--accent-blue)_12%,transparent)]"
            >
              {e}
            </button>
          ))}
        </div>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={primaryBtn}
          disabled={busy || empty || tooLong}
          onClick={() => void submit()}
        >
          {busy ? "Saving…" : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className={quietBtn} disabled={busy} onClick={onCancel}>
            Cancel
          </button>
        )}
        <span className="ml-auto text-[11px] text-[var(--ink-muted)]">
          {tooLong ? (
            <span className="text-[var(--status-critical)]">
              {text.trim().length} / {COMMENT_MAX_LENGTH}
            </span>
          ) : (
            "Ctrl+Enter to save"
          )}
        </span>
      </div>
    </div>
  );
}

function Arrow({ dir }: { dir: "up" | "down" }) {
  return (
    <svg width={10} height={10} viewBox="0 0 16 16" fill="currentColor" aria-hidden>
      <path d={dir === "up" ? "M8 3l5.5 8H2.5L8 3z" : "M8 13L2.5 5h11L8 13z"} />
    </svg>
  );
}

/// Up, score, down - one compact row, the way most discussion sites lay it
/// out. The tally is optimistic and rolled back if the server disagrees, same
/// as the entry votes.
function CommentVotes({
  comment,
  subject,
  onCounts,
}: {
  comment: CommentView;
  subject: Subject;
  onCounts: (upvotes: number, downvotes: number) => void;
}) {
  const { signedIn, loaded, commentVotes, setCommentVote } = useViewer();
  const mine = commentVotes[comment.id] ?? null;
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function cast(vote: VoteKind) {
    if (!signedIn) {
      setError("Sign in to vote.");
      return;
    }
    const previous = mine;
    const next = previous === vote ? null : vote;
    // Optimistic: move the tally now, confirm or roll back after.
    let up = comment.upvotes;
    let down = comment.downvotes;
    if (previous === "up") up -= 1;
    if (previous === "down") down -= 1;
    if (next === "up") up += 1;
    if (next === "down") down += 1;
    setCommentVote(comment.id, next);
    onCounts(Math.max(0, up), Math.max(0, down));
    setError(null);

    startTransition(async () => {
      const result = await voteOnComment(comment.id, vote, subject);
      if (!result.ok) {
        setCommentVote(comment.id, previous);
        onCounts(comment.upvotes, comment.downvotes);
        setError(result.error);
        return;
      }
      setCommentVote(comment.id, result.userVote);
      onCounts(result.upvotes, result.downvotes);
    });
  }

  const btn =
    "inline-flex h-6 w-6 items-center justify-center rounded border transition-colors disabled:opacity-50";
  const inactive =
    "border-[var(--hairline)] text-[var(--ink-muted)] hover:border-[var(--ink-muted)] hover:text-[var(--ink)]";
  const score = commentScore(comment);

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        onClick={() => cast("up")}
        disabled={pending || !loaded}
        aria-pressed={mine === "up"}
        aria-label={`Upvote (${comment.upvotes})`}
        title={signedIn ? "Upvote" : "Sign in to vote"}
        className={`${btn} ${
          mine === "up"
            ? "border-[var(--status-good)] bg-[color-mix(in_srgb,var(--status-good)_10%,transparent)] text-[var(--status-good)]"
            : inactive
        }`}
      >
        <Arrow dir="up" />
      </button>
      <span
        className={`min-w-[1.5ch] text-center text-[11px] font-medium tabular-nums ${
          score > 0
            ? "text-[var(--status-good)]"
            : score < 0
              ? "text-[var(--status-critical)]"
              : "text-[var(--ink-muted)]"
        }`}
        title={`${comment.upvotes} up, ${comment.downvotes} down`}
      >
        {score}
      </span>
      <button
        type="button"
        onClick={() => cast("down")}
        disabled={pending || !loaded}
        aria-pressed={mine === "down"}
        aria-label={`Downvote (${comment.downvotes})`}
        title={signedIn ? "Downvote" : "Sign in to vote"}
        className={`${btn} ${
          mine === "down"
            ? "border-[var(--status-critical)] bg-[color-mix(in_srgb,var(--status-critical)_10%,transparent)] text-[var(--status-critical)]"
            : inactive
        }`}
      >
        <Arrow dir="down" />
      </button>
      {error && <span className="ml-1 text-[11px] text-[var(--status-critical)]">{error}</span>}
    </span>
  );
}

function CommentItem({
  node,
  subject,
  parentName,
  onChanged,
  onRemoved,
  onReply,
}: {
  node: CommentNode;
  subject: Subject;
  /// Who this answers, shown only once indentation has stopped conveying it.
  parentName: string | null;
  onChanged: (c: CommentView) => void;
  onRemoved: (id: string) => void;
  onReply: (parentId: string, text: string) => Promise<boolean>;
}) {
  const { comment, depth, replies } = node;
  const { userId, signedIn, loaded } = useViewer();
  const [editing, setEditing] = useState(false);
  const [replying, setReplying] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Ownership is re-checked on the server; this only controls the affordance.
  const mine = userId !== null && comment.authorId === userId;
  const indented = depth > 0 && depth <= MAX_INDENT;
  const replyCount = countReplies(node);

  async function save(text: string): Promise<boolean> {
    setBusy(true);
    setError(null);
    const result = await editComment(comment.id, text);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    onChanged(result.comment);
    setEditing(false);
    return true;
  }

  async function remove() {
    setBusy(true);
    setError(null);
    const result = await deleteComment(comment.id);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (result.removed) onRemoved(comment.id);
    else onChanged(result.comment);
  }

  async function reply(text: string): Promise<boolean> {
    setBusy(true);
    setError(null);
    const ok = await onReply(comment.id, text);
    setBusy(false);
    if (ok) {
      setReplying(false);
      setCollapsed(false);
    }
    return ok;
  }

  return (
    <article
      className={`${
        indented
          ? "mt-3 border-l-2 border-[var(--hairline)] pl-3 sm:pl-4"
          : depth === 0
            ? "border-t border-[var(--hairline)] py-4 first:border-t-0 first:pt-0"
            : "mt-3"
      }`}
    >
      <div className="flex flex-wrap items-baseline gap-x-2 text-xs">
        {comment.authorPseudonym ? (
          <Link
            href={`/user/${encodeURIComponent(comment.authorPseudonym)}`}
            className="font-medium text-[var(--ink)] hover:text-[var(--accent-blue)] hover:underline"
          >
            {comment.authorName}
          </Link>
        ) : (
          <span className="font-medium text-[var(--ink)]">{comment.authorName}</span>
        )}
        {depth > MAX_INDENT && parentName && (
          <span className="text-[var(--ink-muted)]">replying to {parentName}</span>
        )}
        <span className="text-[var(--ink-muted)]">{comment.createdAt}</span>
        {comment.edited && !comment.deleted && (
          <span className="text-[var(--ink-muted)]">· edited</span>
        )}
        {mine && !editing && !comment.deleted && (
          <span className="ml-auto flex items-center gap-1">
            <button
              type="button"
              className={editIconBtn}
              onClick={() => setEditing(true)}
              title="Edit comment"
              aria-label="Edit comment"
            >
              <Icon name="pencil" size={12} />
            </button>
            {confirmDelete ? (
              <>
                <button type="button" className={deleteBtn} disabled={busy} onClick={remove}>
                  {replyCount > 0 ? "Really delete? Replies stay." : "Really delete?"}
                </button>
                <button
                  type="button"
                  className={quietBtn}
                  disabled={busy}
                  onClick={() => setConfirmDelete(false)}
                >
                  No
                </button>
              </>
            ) : (
              <button type="button" className={deleteBtn} onClick={() => setConfirmDelete(true)}>
                Delete
              </button>
            )}
          </span>
        )}
      </div>

      {comment.deleted ? (
        <p className="mt-1.5 text-sm italic text-[var(--ink-muted)]">
          Deleted by its author. The replies below stay.
        </p>
      ) : editing ? (
        <div className="mt-2">
          <Composer
            initial={comment.source}
            submitLabel="Save changes"
            busy={busy}
            onSubmit={save}
            onCancel={() => {
              setEditing(false);
              setError(null);
            }}
            autoFocus
          />
        </div>
      ) : (
        <div
          className="comment-body mt-1.5 text-sm leading-relaxed text-[var(--ink-secondary)]"
          dangerouslySetInnerHTML={{ __html: comment.html }}
        />
      )}

      {!editing && !comment.deleted && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <CommentVotes
            comment={comment}
            subject={subject}
            onCounts={(upvotes, downvotes) => onChanged({ ...comment, upvotes, downvotes })}
          />
          {loaded && signedIn && !replying && (
            <button type="button" className={quietBtn} onClick={() => setReplying(true)}>
              Reply
            </button>
          )}
          {replyCount > 0 && (
            <button
              type="button"
              className={quietBtn}
              onClick={() => setCollapsed((c) => !c)}
              aria-expanded={!collapsed}
            >
              {collapsed
                ? `Show ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`
                : `Hide ${replyCount === 1 ? "reply" : "replies"}`}
            </button>
          )}
        </div>
      )}

      {replying && (
        <div className="mt-2">
          <Composer
            submitLabel="Post reply"
            placeholder={`Reply to ${comment.authorName}. Math works: $…$ or $$…$$.`}
            busy={busy}
            onSubmit={reply}
            onCancel={() => {
              setReplying(false);
              setError(null);
            }}
            autoFocus
          />
        </div>
      )}

      {error && <p className="mt-1.5 text-[11px] text-[var(--status-critical)]">{error}</p>}

      {!collapsed &&
        replies.map((child) => (
          <CommentItem
            key={child.comment.id}
            node={child}
            subject={subject}
            parentName={comment.authorName}
            onChanged={onChanged}
            onRemoved={onRemoved}
            onReply={onReply}
          />
        ))}
    </article>
  );
}

export function CommentsSection({
  subject,
  initial,
}: {
  subject: Subject;
  initial: CommentView[];
}) {
  const { signedIn, loaded } = useViewer();
  const [comments, setComments] = useState(initial);
  const [sort, setSort] = useState<CommentSort>(DEFAULT_SORT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The remembered sort, restored before paint so a returning reader does not
  // see the list reorder itself. One-time hydration from storage is the
  // sanctioned exception to the set-state-in-effect rule (same pattern as the
  // list settings). Storage may be blocked; then the default simply stands.
  useBeforePaint(() => {
    try {
      const stored = localStorage.getItem(SORT_KEY);
      if (isCommentSort(stored) && stored !== DEFAULT_SORT) setSort(stored);
    } catch {
      // Nothing to restore.
    }
  }, []);

  function chooseSort(next: CommentSort) {
    setSort(next);
    try {
      localStorage.setItem(SORT_KEY, next);
    } catch {
      // A sort that is not remembered is still applied.
    }
  }

  const tree = useMemo(() => buildCommentTree(comments, sort), [comments, sort]);
  const live = countLive(comments);

  const onChanged = (updated: CommentView) =>
    setComments((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
  const onRemoved = (id: string) => setComments((prev) => prev.filter((x) => x.id !== id));

  async function post(text: string, parentId: string | null = null): Promise<boolean> {
    setBusy(true);
    setError(null);
    const result = await addComment(subject, text, parentId);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    setComments((prev) => [...prev, result.comment]);
    return true;
  }

  return (
    <section id="discussion" className="mt-10 scroll-mt-20">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-serif text-lg text-[var(--ink)]">
          Discussion
          {live > 0 && (
            <span className="ml-2 font-sans text-sm font-normal text-[var(--ink-muted)]">{live}</span>
          )}
        </h2>
        {comments.length > 1 && (
          <div
            role="radiogroup"
            aria-label="Sort comments"
            className="inline-flex items-center gap-0.5 rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] p-0.5 text-xs"
          >
            {COMMENT_SORTS.map((s) => (
              <button
                key={s.key}
                type="button"
                role="radio"
                aria-checked={sort === s.key}
                onClick={() => chooseSort(s.key)}
                className={`rounded px-2 py-0.5 transition-colors ${
                  sort === s.key
                    ? "bg-[color-mix(in_srgb,var(--ink)_8%,transparent)] text-[var(--ink)]"
                    : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {tree.length > 0 && (
        <div className="mt-3">
          {tree.map((node) => (
            <CommentItem
              key={node.comment.id}
              node={node}
              subject={subject}
              parentName={null}
              onChanged={onChanged}
              onRemoved={onRemoved}
              onReply={(parentId, text) => post(text, parentId)}
            />
          ))}
        </div>
      )}

      <div className="mt-5">
        {!loaded ? (
          <div className="h-24 rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)]" />
        ) : signedIn ? (
          <>
            <Composer submitLabel="Post comment" busy={busy} onSubmit={(t) => post(t)} />
            {error && (
              <p className="mt-1.5 text-xs text-[var(--status-critical)]">{error}</p>
            )}
          </>
        ) : (
          <p className="rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3 text-sm text-[var(--ink-secondary)]">
            <Link href="/sign-in" className="text-[var(--accent-blue)] hover:underline">
              Sign in
            </Link>{" "}
            to join the discussion. You post under a pseudonym.
          </p>
        )}
      </div>
    </section>
  );
}
