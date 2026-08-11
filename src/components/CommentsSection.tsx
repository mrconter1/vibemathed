"use client";

// Discussion on an entry page.
//
// The initial list is server-rendered (and cached), so comments are in the
// static shell and get indexed. This component layers the interactive parts on
// top: posting, editing your own, deleting your own. Server actions return the
// re-rendered HTML for a comment, so edits show their math immediately without
// a page reload and without shipping KaTeX to the browser.

import { useRef, useState } from "react";
import Link from "next/link";
import {
  addComment,
  deleteComment,
  editComment,
} from "@/app/actions/comments";
import { COMMENT_MAX_LENGTH, type CommentView } from "@/lib/comments";
import { useViewer } from "@/components/ViewerProvider";
import { Icon } from "@/components/Icons";

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
  busy,
  onSubmit,
  onCancel,
  autoFocus,
}: {
  initial?: string;
  submitLabel: string;
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
      <textarea
        ref={taRef}
        value={text}
        onChange={(e) => {
          const v = e.target.value;
          // Insertion only: deleting back onto a ":" should not spring the
          // picker open under the reader's cursor.
          const typed = v.length > text.length;
          setText(v);
          setPicker(typed && v.slice(0, e.target.selectionStart).endsWith(":"));
        }}
        onBlur={() => setPicker(false)}
        autoFocus={autoFocus}
        placeholder="Add a comment. Math works: wrap it in $…$ or $$…$$."
        aria-label="Comment"
        className={textareaClass}
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

function Comment({
  comment,
  slug,
  onChanged,
  onRemoved,
}: {
  comment: CommentView;
  slug: string;
  onChanged: (c: CommentView) => void;
  onRemoved: (id: string) => void;
}) {
  const { userId } = useViewer();
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Ownership is re-checked on the server; this only controls the affordance.
  const mine = userId !== null && comment.authorId === userId;

  async function save(text: string): Promise<boolean> {
    setBusy(true);
    setError(null);
    const result = await editComment(comment.id, text, slug);
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
    const result = await deleteComment(comment.id, slug);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onRemoved(comment.id);
  }

  return (
    <article className="border-t border-[var(--hairline)] py-4 first:border-t-0 first:pt-0">
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
        <span className="text-[var(--ink-muted)]">{comment.createdAt}</span>
        {comment.edited && <span className="text-[var(--ink-muted)]">· edited</span>}
        {mine && !editing && (
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
                <button
                  type="button"
                  className={deleteBtn}
                  disabled={busy}
                  onClick={remove}
                >
                  Really delete?
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
              <button
                type="button"
                className={deleteBtn}
                onClick={() => setConfirmDelete(true)}
              >
                Delete
              </button>
            )}
          </span>
        )}
      </div>

      {editing ? (
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

      {error && (
        <p className="mt-1.5 text-[11px] text-[var(--status-critical)]">{error}</p>
      )}
    </article>
  );
}

export function CommentsSection({
  slug,
  initial,
}: {
  slug: string;
  initial: CommentView[];
}) {
  const { signedIn, loaded } = useViewer();
  const [comments, setComments] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function post(text: string): Promise<boolean> {
    setBusy(true);
    setError(null);
    const result = await addComment(slug, text);
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
      <h2 className="font-serif text-lg text-[var(--ink)]">
        Discussion
        {comments.length > 0 && (
          <span className="ml-2 font-sans text-sm font-normal text-[var(--ink-muted)]">
            {comments.length}
          </span>
        )}
      </h2>

      {comments.length > 0 && (
        <div className="mt-3">
          {comments.map((c) => (
            <Comment
              key={c.id}
              comment={c}
              slug={slug}
              onChanged={(updated) =>
                setComments((prev) =>
                  prev.map((x) => (x.id === updated.id ? updated : x)),
                )
              }
              onRemoved={(id) =>
                setComments((prev) => prev.filter((x) => x.id !== id))
              }
            />
          ))}
        </div>
      )}

      <div className="mt-5">
        {!loaded ? (
          <div className="h-24 rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)]" />
        ) : signedIn ? (
          <>
            <Composer submitLabel="Post comment" busy={busy} onSubmit={post} />
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
