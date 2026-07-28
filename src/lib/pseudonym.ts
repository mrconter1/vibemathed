// Pseudonyms are the only public identity on VibeMathed. They are auto-assigned
// at sign-up (adjective + noun + number, e.g. "BraveMongoose492") and can be
// changed by the user in settings. This module owns generation and validation.
//
// The noun list is deliberately animals rather than mathematical terms: a
// pseudonym like "SwiftLemma" or "GoldenGauss" reads as a claim about a real
// mathematician, and on a site about who proved what that ambiguity is the one
// thing a pseudonym must never introduce.

import type { PrismaClient } from "@prisma/client";

const ADJECTIVES = [
  "Brave", "Silent", "Cosmic", "Rusty", "Velvet", "Golden", "Wild", "Lucky",
  "Quiet", "Swift", "Hidden", "Crimson", "Frosty", "Stormy", "Lone", "Bold",
  "Witty", "Mellow", "Nimble", "Rapid", "Shadow", "Spry", "Sunny", "Vivid",
  "Zesty", "Amber", "Cobalt", "Dusky", "Feral", "Jolly", "Lucid", "Plucky",
];

const NOUNS = [
  "Mongoose", "Falcon", "Otter", "Badger", "Lynx", "Heron", "Marten", "Raven",
  "Bison", "Gecko", "Puffin", "Walrus", "Ibis", "Tapir", "Stoat", "Osprey",
  "Narwhal", "Quokka", "Lemur", "Panther", "Wombat", "Kestrel", "Manta", "Vulture",
  "Beetle", "Cobra", "Dingo", "Egret", "Ferret", "Gander", "Hawk", "Jackal",
];

// Display constraints for user-chosen pseudonyms.
export const PSEUDONYM_MIN = 3;
export const PSEUDONYM_MAX = 24;
// Letters, numbers, and single separators (space, _, -) between characters.
const PSEUDONYM_PATTERN = /^[A-Za-z0-9]+(?:[ _-][A-Za-z0-9]+)*$/;

// Substrings we never allow in a chosen name (reserved / impersonation).
// "curator" is reserved because curator-authored activity renders under it.
const RESERVED = [
  "anonymous",
  "admin",
  "moderator",
  "curator",
  "official",
  "system",
  "vibemathed",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// One random candidate; not guaranteed unique - callers must check the DB.
export function randomPseudonym(): string {
  const n = Math.floor(Math.random() * 900) + 100; // 100-999
  return `${pick(ADJECTIVES)}${pick(NOUNS)}${n}`;
}

// Generates a pseudonym guaranteed not to collide with an existing one.
// Falls back to ever-larger random suffixes if the namespace gets crowded.
export async function generateUniquePseudonym(prisma: PrismaClient): Promise<string> {
  for (let attempt = 0; attempt < 12; attempt++) {
    const candidate = randomPseudonym();
    const taken = await prisma.user.findUnique({
      where: { pseudonym: candidate },
      select: { id: true },
    });
    if (!taken) return candidate;
  }
  // Extremely unlikely fallback: wide random suffix.
  return `${pick(ADJECTIVES)}${pick(NOUNS)}${Math.floor(Math.random() * 1_000_000)}`;
}

export interface PseudonymValidation {
  ok: boolean;
  error?: string;
}

// Validates a user-supplied pseudonym (format only; uniqueness is checked
// separately against the DB at save time).
export function validatePseudonym(raw: string): PseudonymValidation {
  const value = raw.trim();
  if (value.length < PSEUDONYM_MIN) {
    return { ok: false, error: `Must be at least ${PSEUDONYM_MIN} characters.` };
  }
  if (value.length > PSEUDONYM_MAX) {
    return { ok: false, error: `Must be ${PSEUDONYM_MAX} characters or fewer.` };
  }
  if (!PSEUDONYM_PATTERN.test(value)) {
    return {
      ok: false,
      error: "Use letters, numbers, and single spaces, hyphens, or underscores.",
    };
  }
  const lower = value.toLowerCase();
  if (RESERVED.some((word) => lower.includes(word))) {
    return { ok: false, error: "That name is reserved. Please choose another." };
  }
  return { ok: true };
}
