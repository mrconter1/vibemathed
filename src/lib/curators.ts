// Who may do what on the site, beyond what any signed-in member can do.
//
// Two sources of authority, deliberately:
//
// 1. ADMIN_EMAILS in the environment (src/lib/admin.ts). The founders. It
//    cannot be edited from the site, so a compromised curator account cannot
//    promote itself or anyone else past it, and an empty variable fails closed.
// 2. User.staffRole in the database, set by an env admin from a member's
//    profile page. This is how moderators are added without a deploy, which
//    the environment list could not do.
//
// The roles, and what each carries:
//
//   admin      everything a moderator can, plus member management: verify,
//              set citations, grant or remove staff roles.
//   moderator  review submissions, handle reports, edit curator-only entry
//              fields, write to members' inboxes. This is the role the site
//              adds people to.
//   developer  a credit, not a permission. Listed on the About page; no more
//              access than any member. Code access is a GitHub matter.
//
// Every permission check in a server action or page goes through the two
// functions at the bottom, never through isAdmin() directly, so a rule change
// is one edit. `staffRole` rides on the session (see src/auth.ts) so the
// checks stay synchronous and cost no query.

import { isAdmin } from "@/lib/admin";

export const STAFF_ROLES = ["admin", "moderator", "developer"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export const STAFF_ROLE: Record<StaffRole, { label: string; help: string }> = {
  admin: {
    label: "Admin",
    help: "Runs the site: reviews submissions and manages members.",
  },
  moderator: {
    label: "Moderator",
    help: "Reviews submissions and handles reports.",
  },
  developer: {
    label: "Developer",
    help: "Builds the site. A credit, not a permission.",
  },
};

export function isStaffRole(value: string | null | undefined): value is StaffRole {
  return (STAFF_ROLES as readonly string[]).includes(value ?? "");
}

/// The slice of a session user (or a User row) the checks need.
export interface Principal {
  email?: string | null;
  staffRole?: string | null;
}

/// May review submissions, handle reports, edit curator-only fields and
/// write to inboxes. Env admins always; database admins and moderators too.
export function canReview(u: Principal | null | undefined): boolean {
  if (!u) return false;
  if (isAdmin(u.email)) return true;
  return u.staffRole === "admin" || u.staffRole === "moderator";
}

/// May verify members, set their citation counts and change staff roles. Env
/// admins and database admins only - a moderator cannot make moderators.
export function canManageMembers(u: Principal | null | undefined): boolean {
  if (!u) return false;
  if (isAdmin(u.email)) return true;
  return u.staffRole === "admin";
}
