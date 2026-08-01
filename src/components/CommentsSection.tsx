"use client";

// Discussion on an entry page.
//
// The initial list is server-rendered (and cached), so comments are in the
// static shell and get indexed. This component layers the interactive parts on
// top: posting, editing your own, deleting your own. Server actions return the
// re-rendered HTML for a comment, so edits show their math immediately without
// a page reload and without shipping KaTeX to the browser.

import { useState } from "react";
import Link from "next/link";
import {
  addComment,
  deleteComment,
  editComment,
} from "@/app/actions/comments";
import { COMMENT_MAX_LENGTH, type CommentView } from "@/lib/comments";
import { useViewer } from "@/components/ViewerProvider";

const textareaClass =
  "w-full min-h-[96px] resize-y rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-3 py-2 text-sm leading-relaxed text-[var(--ink)] transition-colors placeholder:text-[var(--ink-muted)] hover:border-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]";
const primaryBtn =
  "rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-3 py-1.5 text-xs text-[var(--ink)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)] disabled:opacity-40";
const quietBtn =
  "rounded-md px-2 py-1 text-xs text-[var(--ink-muted)] transition-colors hover:text-[var(--ink)] disabled:opacity-40";

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
  onSubmit: (text: string) => void;
  onCancel?: () => void;
  autoFocus?: boolean;
}) {
  const [text, setText] = useState(initial ?? "");
  const empty = text.trim().length === 0;
  const tooLong = text.trim().length > COMMENT_MAX_LENGTH;

  return (
    <div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        autoFocus={autoFocus}
        placeholder="Add a comment. Math works: wrap it in $…$ or $$…$$."
        aria-label="Comment"
        className={textareaClass}
        onKeyDown={(e) => {
          // Ctrl/Cmd+Enter submits, matching most comment boxes.
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !empty && !tooLong) {
            e.preventDefault();
            onSubmit(text);
          }
        }}
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className={primaryBtn}
          disabled={busy || empty || tooLong}
          onClick={() => onSubmit(text)}
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

  async function save(text: string) {
    setBusy(true);
    setError(null);
    const result = await editComment(comment.id, text, slug);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onChanged(result.comment);
    setEditing(false);
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
            <button type="button" className={quietBtn} onClick={() => setEditing(true)}>
              Edit
            </button>
            {confirmDelete ? (
              <>
                <button
                  type="button"
                  className="rounded-md px-2 py-1 text-xs text-[var(--status-critical)] transition-colors hover:underline disabled:opacity-40"
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
                className={quietBtn}
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

  async function post(text: string) {
    setBusy(true);
    setError(null);
    const result = await addComment(slug, text);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setComments((prev) => [...prev, result.comment]);
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
