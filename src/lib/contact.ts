// The contact form's vocabulary, shared by the form, the server action and the
// curator queue. Kept out of the `"use server"` module because that file may
// only export async functions.

export const CONTACT_TOPICS = [
  { value: "general", label: "Something else" },
  { value: "verification", label: "Profile verification" },
  { value: "data", label: "Dataset, API or reuse" },
  { value: "press", label: "Press or research" },
  // The rights topics. Split from "something else" because they need
  // different information and different urgency, and because a rightsholder
  // scanning a list should see their own case named rather than guess.
  // They are also the reason this form takes no account: someone whose work
  // or reputation is affected must not have to join the site to say so.
  { value: "copyright", label: "Copyright or attribution" },
  { value: "reputation", label: "Unlawful or damaging statement" },
  { value: "personal-data", label: "Personal data or privacy" },
  { value: "impersonation", label: "Impersonation" },
  { value: "security", label: "Security vulnerability" },
] as const;

/// The topics that are a legal or rights notice rather than ordinary mail.
/// The curator queue sorts on this, and the form shows the extra guidance.
export const RIGHTS_TOPICS: readonly ContactTopic[] = [
  "copyright",
  "reputation",
  "personal-data",
  "impersonation",
  "security",
];

export function isRightsTopic(value: string): boolean {
  return (RIGHTS_TOPICS as readonly string[]).includes(value);
}

export type ContactTopic = (typeof CONTACT_TOPICS)[number]["value"];

export const DEFAULT_TOPIC: ContactTopic = "general";

export const BODY_MAX = 4000;
export const REPLY_MAX = 200;

export function isContactTopic(value: string): value is ContactTopic {
  return CONTACT_TOPICS.some((t) => t.value === value);
}

export function topicLabel(value: string): string {
  return CONTACT_TOPICS.find((t) => t.value === value)?.label ?? value;
}

/// What the curators need in order to act, said before the message is written
/// rather than in a reply asking for it. Verification carries the instructions
/// that used to live in a mailto body.
const TOPIC_HINTS: Partial<Record<ContactTopic, string>> = {
  verification:
    "Include something that ties this account to you: a university page, an arXiv author page, a personal site that links back here, or a message from an institutional address. Profile links are the easiest evidence, so add them first.",
  data: "What this site wrote is CC BY 4.0 and needs no permission (see /data-license for what that covers) - but say what you are building and we can shape the export around it.",
  copyright:
    "Link the exact entry or page, say which passage reproduces your work, and link the original. We can shorten a quotation, replace it with our own summary, fix the attribution or remove the material. You do not need to cite a statute; describe the problem and we will act on it.",
  reputation:
    "Link the exact entry, comment or page and quote the passage. Say what is untrue or unlawful about it and, where you can, point at something that shows the correct position. We can correct, annotate, restrict or remove it, and we will tell you what we did.",
  "personal-data":
    "Say which page carries the information and what you want done - correction, removal, or removal from search. If it is about your own account, the profile settings already control what is shown, and we can go further.",
  impersonation:
    "Tell us which account or content is impersonating you and how we can tell it is not you. A link from a page you control back to here is the quickest evidence.",
  security:
    "Please do not open a public issue. Describe the problem and how to reproduce it, and give us reasonable time to fix it before publishing. We will confirm receipt and tell you when it is closed.",
};

export function topicHint(value: string): string | null {
  return isContactTopic(value) ? (TOPIC_HINTS[value] ?? null) : null;
}

/// Deliberately loose. This address is only ever used by a human deciding
/// whether to reply, so the only real failures worth catching are the ones
/// that mean the sender fat-fingered it and will never hear back.
export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}
