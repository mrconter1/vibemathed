// Member roles: a self-declared answer to "what is your relationship to the
// mathematics?", shown beside a pseudonym so a reader can weigh a comment.
//
// Four options, deliberately. The list has to be short enough that nobody
// agonises, broad enough that nobody is forced to misdescribe themselves, and
// free of any rung that sounds like a rank - this is context, not status.
// "Enthusiast" is last but not lesser: the site's own About page names
// enthusiasts alongside mathematicians, and several of the catalog's better
// submissions came from outside academia.
//
// Roles are UNVERIFIABLE by construction. Anyone can pick "Research
// mathematician". That is tolerable precisely because `User.verified` is a
// separate, curator-set flag: the role says what you call yourself, the
// verified badge says someone checked. Never conflate them in the UI.

export const MEMBER_ROLES = [
  "researcher",
  "student",
  "practitioner",
  "enthusiast",
] as const;

export type MemberRole = (typeof MEMBER_ROLES)[number];

export const MEMBER_ROLE: Record<MemberRole, { label: string; help: string }> = {
  researcher: {
    label: "Research mathematician",
    help: "Works on mathematics research, in academia or industry.",
  },
  student: {
    label: "Student",
    help: "Studying mathematics or a closely related subject.",
  },
  practitioner: {
    label: "Engineer / AI practitioner",
    help: "Builds software or AI systems, including the ones that appear in this record.",
  },
  enthusiast: {
    label: "Enthusiast",
    help: "Follows the mathematics for its own sake, outside a professional role.",
  },
};

export function isMemberRole(value: string): value is MemberRole {
  return (MEMBER_ROLES as readonly string[]).includes(value);
}

export const ROLE_OPTIONS = MEMBER_ROLES.map((r) => ({
  value: r,
  label: MEMBER_ROLE[r].label,
}));

/// Shown wherever the verified badge appears.
export const VERIFIED_HELP =
  "A curator confirmed this member's identity or affiliation. It says nothing about whether their mathematics is right, and its absence says nothing against a member: most people never ask.";
