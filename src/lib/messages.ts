// Curator mail: the vocabulary shared by the inbox, the review queue and the
// reports queue.
//
// Everything a curator sends a reader travels as a DirectMessage row, whatever
// prompted it. One shape rather than three means the inbox needs one reader
// and one unread count, and a fourth reason to write to someone later costs a
// `kind` and nothing else.

/// What prompted a message. Labels it in the inbox; carries no behaviour.
export const MESSAGE_KINDS = {
  decision: "About your submission",
  report: "About a report you sent",
  note: "From the curators",
  /// A conversation somebody started from the composer, reader or curator.
  /// The only kind whose root carries a `subject`, which is what heads it;
  /// this label is the fallback for the row line when a subject is missing.
  message: "Direct message",
  /// Only ever a message inside a thread, never the one that starts it, so
  /// this label heads nothing. It exists so the stored `kind` has a name and
  /// does not fall through to "From the curators", which a reader's own reply
  /// is not.
  reply: "Reply",

  /// The contact form, one kind per topic.
  ///
  /// One kind each rather than a single `contact` plus the topic in another
  /// column, because the topic belongs in the heading a curator reads first
  /// and this keeps that a plain lookup. The suffixes are the CONTACT_TOPICS
  /// values in src/lib/contact.ts, so adding a topic there means adding a kind
  /// here; `contactKind` below is the one place that has to agree.
  "contact-general": "Contact form: Something else",
  "contact-verification": "Contact form: Profile verification",
  "contact-data": "Contact form: Dataset, API or reuse",
  "contact-press": "Contact form: Press or research",
} as const;

/// The message kind for a contact-form topic.
export function contactKind(topic: string): string {
  const kind = `contact-${topic}`;
  return kind in MESSAGE_KINDS ? kind : "contact-general";
}

export type MessageKind = keyof typeof MESSAGE_KINDS;

export function messageKindLabel(kind: string): string {
  return MESSAGE_KINDS[kind as MessageKind] ?? MESSAGE_KINDS.note;
}

/// Canned decision reasons.
///
/// These are the actual rejection grounds from the queue's history, not a
/// guess at what reviewers might want to say. A dropdown here is not a
/// shortcut for writing: the reason is stored as its own column so decisions
/// stay countable, and the free-text message still carries the specifics.
///
/// `value` is what lands in `Problem.reviewReason`. Never renumber or reword a
/// value in place - it is stored data. Add a new one and leave the old.
export interface ReviewReason {
  value: string;
  label: string;
  /// Seeds the message box when the reason is picked, so the common case is
  /// edit-and-send rather than write-from-nothing. Never sent unedited: the
  /// curator sees it in the textarea first.
  draft: string;
}

export const REJECT_REASONS: ReviewReason[] = [
  {
    value: "duplicate",
    label: "Already in the catalog",
    draft:
      "Thanks for this, and the submission itself was sound. We already have this one, though, so I am closing it as a duplicate rather than for any problem with what you sent.",
  },
  {
    value: "solved-elsewhere-first",
    label: "Solved without AI first",
    draft:
      "Thanks for this, but the problem had already been solved before this work, without AI. This site records problems first solved with AI in the loop, so a later proof cannot be shown to be independent.",
  },
  {
    value: "no-open-question",
    label: "No stated open question",
    draft:
      "Thanks for sending this. The inclusion test is a precisely stated open question whose answer is now a proved or disproved theorem. This is a real advance, but it improves on previous work rather than settling a question someone had posed, so it falls outside what the record tracks.",
  },
  {
    value: "no-ai-contribution",
    label: "AI role too thin",
    draft:
      "Thanks for sending this. The problem qualifies, but the paper's only mention of a model is an acknowledgement of general discussion, which is not enough to say a model was substantively in the loop. If a later version attributes a specific step, it would be worth resubmitting.",
  },
  {
    value: "formalization",
    label: "Formalization of a known result",
    draft:
      "Thanks for sending this. Formalizing an existing proof is valuable work, but the record is for problems no human had solved, so machine-checking a result that was already known is out of scope.",
  },
  {
    value: "source",
    label: "Source not checkable",
    draft:
      "Thanks for sending this. Every entry has to cite a primary source anyone can open and check, and this one is not publicly readable. arXiv, or anything with an open record, works well. Happy to look again with a different link.",
  },
  {
    value: "other",
    label: "Something else",
    draft: "",
  },
];

export const APPROVE_REASONS: ReviewReason[] = [
  {
    value: "as-submitted",
    label: "Published as submitted",
    draft: "Published as you sent it. Thanks for the submission.",
  },
  {
    value: "edited",
    label: "Published with edits",
    draft:
      "Published, with some edits before it went live. Nothing about the result changed; have a look and tell me if I have misread anything.",
  },
  {
    value: "downgraded",
    label: "Published at a lower tier",
    draft:
      "Published, but at a lower tier than you set. The mathematics is not in question; the tier records how checked it is, and nobody independent has checked this yet.",
  },
  {
    value: "other",
    label: "Something else",
    draft: "",
  },
];

export function reasonLabel(value: string | null | undefined): string | null {
  if (!value) return null;
  const hit = [...REJECT_REASONS, ...APPROVE_REASONS].find((r) => r.value === value);
  return hit?.label ?? null;
}

/// One cap for every kind of curator mail. Long enough for a real
/// explanation, short enough that it stays a message rather than a review.
/// `REVIEW_MESSAGE_MAX` in submission.ts re-exports this so the review dialog
/// and the reports dialog cannot drift apart.
///
/// Raised from 600. That figure was set when a message was one note attached
/// to one decision, and it held for that. It stopped holding once the inbox
/// became a conversation: the replies worth writing are the ones that explain
/// a correction and answer a question in the same breath, and 600 characters
/// cut those off mid-sentence. Still well under the comment cap of 5000,
/// because this is mail and not an essay.
///
/// The silent truncation this used to cause was the worse half of the
/// problem. `sendDirectMessage` slices to this length without telling the
/// sender, so an over-long decision note lost its ending with no warning, on
/// exactly the messages that most needed their reasoning intact. The reply
/// path validates and refuses instead; the review dialogs count down against
/// this same constant.
export const MESSAGE_MAX = 2000;

/// Cap for the composer's subject line. A subject is a headline for a list
/// row, not a first paragraph; anything that needs more room belongs in the
/// body it is introducing.
export const SUBJECT_MAX = 120;

/// "Show the inbox list", broadcast by the header's envelope and heard by the
/// inbox page.
///
/// The two are in different trees, and what has to change is component state
/// rather than a URL: an open conversation is deliberately not addressable
/// (see the note at the top of InboxList), so pressing the envelope while
/// already on /inbox is a soft navigation to the current route and moves
/// nothing. Named here rather than in either component so neither can rename
/// it alone and leave the other listening for a string nobody sends.
export const INBOX_HOME_EVENT = "vibemathed:inbox-home";
