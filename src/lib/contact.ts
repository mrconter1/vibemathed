// The contact form's vocabulary, shared by the form, the server action and the
// curator queue. Kept out of the `"use server"` module because that file may
// only export async functions.

export const CONTACT_TOPICS = [
  { value: "general", label: "Something else" },
  { value: "verification", label: "Profile verification" },
  { value: "data", label: "Dataset, API or reuse" },
  { value: "press", label: "Press or research" },
] as const;

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
  data: "The dataset is CC BY 4.0 and needs no permission - but say what you are building and we can shape the export around it.",
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
