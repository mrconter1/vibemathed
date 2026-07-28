// Admin emails can approve or reject submitted entries, and are exempt from
// the submission rate limit. Configurable via the ADMIN_EMAILS env var
// (comma-separated); falls back to the site owner.
//
// Same shape as wilhelm-scream-db's src/lib/admin.ts, deliberately - one
// mental model across both sites.

const FALLBACK_ADMINS = ["rasmus.lindahl1996@gmail.com"];

function adminList(): string[] {
  const fromEnv = process.env.ADMIN_EMAILS;
  if (fromEnv && fromEnv.trim()) {
    return fromEnv
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  }
  return FALLBACK_ADMINS.map((e) => e.toLowerCase());
}

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminList().includes(email.toLowerCase());
}
