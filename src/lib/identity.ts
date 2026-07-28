// Resolves how a user is displayed in public places (votes, comments, activity).
//
// The public identity is the user's PSEUDONYM - the only name shown anywhere.
// The real OAuth name and avatar are never exposed, so `image` is always null.
// Users without a pseudonym yet (the brief window before assignment) and
// deleted users (no linked record) fall back to "Anonymous"; curator-authored
// activity, which has no user at all, falls back to "Curator".

export interface UserIdentityInput {
  pseudonym?: string | null;
}

export interface ResolvedIdentity {
  name: string;
  image: null;
}

export const ANONYMOUS_NAME = "Anonymous";
export const CURATOR_NAME = "Curator";

export function resolveIdentity(user: UserIdentityInput | null | undefined): ResolvedIdentity {
  const pseudonym = user?.pseudonym?.trim();
  if (pseudonym) {
    return { name: pseudonym, image: null };
  }
  return { name: ANONYMOUS_NAME, image: null };
}

// For records that snapshot a display name at write time (comments, activity).
// A null snapshot with no linked user means the curator did it, not a person
// who deleted their account.
export function resolveSnapshot(
  userName: string | null | undefined,
  hasUser: boolean,
): string {
  const name = userName?.trim();
  if (name) return name;
  return hasUser ? ANONYMOUS_NAME : CURATOR_NAME;
}
