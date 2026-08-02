"use client";

// The public message form. Works signed out on purpose - the people most
// worth hearing from (a mathematician who spotted a wrong entry, a journalist)
// should not have to make an account to say so.

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { sendSiteMessage } from "@/app/actions/contact";
import {
  BODY_MAX,
  CONTACT_TOPICS,
  DEFAULT_TOPIC,
  REPLY_MAX,
  isContactTopic,
  topicHint,
} from "@/lib/contact";
import { useViewer } from "@/components/ViewerProvider";

const FIELD =
  "mt-1 w-full rounded border border-[var(--hairline)] bg-[var(--paper-raised)] px-2.5 py-2 text-sm text-[var(--ink)] transition-colors hover:border-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]";
const LABEL = "block text-[11px] font-medium text-[var(--ink-secondary)]";

export function ContactForm() {
  // `?topic=verification` lets other pages deep-link into the right subject.
  const params = useSearchParams();
  const initialTopic = params.get("topic");

  const viewer = useViewer();

  const [topic, setTopic] = useState(
    initialTopic && isContactTopic(initialTopic) ? initialTopic : DEFAULT_TOPIC,
  );
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  const hint = topicHint(topic);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await sendSiteMessage({ topic, body, replyTo, company });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSent(true);
      setBody("");
    });
  }

  if (sent) {
    return (
      <div className="rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-5 py-6">
        <p className="font-serif text-base text-[var(--ink)]">Message sent.</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
          It lands in the curators&apos; queue.{" "}
          {replyTo.trim()
            ? `Any reply will go to ${replyTo.trim()}.`
            : "You did not leave a reply address, so treat this as one-way."}
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="mt-4 rounded-md border border-[var(--hairline)] bg-[var(--paper)] px-3 py-1.5 text-xs text-[var(--ink-secondary)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
        >
          Write another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-4 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-5 py-5 sm:px-6"
    >
      <div>
        <label htmlFor="c-topic" className={LABEL}>
          What is this about?
        </label>
        <select
          id="c-topic"
          value={topic}
          onChange={(e) => setTopic(e.target.value as typeof topic)}
          className={FIELD}
        >
          {CONTACT_TOPICS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        {hint && (
          <p className="mt-1.5 text-[11px] leading-relaxed text-[var(--ink-muted)]">
            {hint}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="c-body" className={LABEL}>
          Message
        </label>
        <textarea
          id="c-body"
          value={body}
          maxLength={BODY_MAX}
          onChange={(e) => setBody(e.target.value)}
          rows={8}
          className={`${FIELD} resize-y`}
          placeholder="Links to sources help more than anything else."
        />
        <p className="mt-1 text-right text-[10px] tabular-nums text-[var(--ink-muted)]">
          {body.length}/{BODY_MAX}
        </p>
      </div>

      <div>
        <label htmlFor="c-reply" className={LABEL}>
          Email for a reply <span className="font-normal">(optional)</span>
        </label>
        <input
          id="c-reply"
          type="email"
          value={replyTo}
          maxLength={REPLY_MAX}
          onChange={(e) => setReplyTo(e.target.value)}
          className={FIELD}
          placeholder="you@example.com"
        />
        <p className="mt-1 text-[11px] leading-relaxed text-[var(--ink-muted)]">
          {viewer.signedIn && viewer.pseudonym
            ? `Sent as ${viewer.pseudonym}. Leave an address if you want an answer - the account alone is not a mailbox.`
            : "Without one there is no way to answer you."}
        </p>
      </div>

      {/* Honeypot: off-screen and hidden from assistive tech, so only a bot
          filling every field on the page will touch it. */}
      <div className="absolute left-[-9999px]" aria-hidden>
        <label htmlFor="c-company">Company</label>
        <input
          id="c-company"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
      </div>

      {error && <p className="text-xs text-[var(--status-critical)]">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending || body.trim() === ""}
          className="rounded-md border border-[var(--accent-blue)] bg-[var(--accent-blue)] px-3.5 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {pending ? "Sending…" : "Send message"}
        </button>
      </div>
    </form>
  );
}
