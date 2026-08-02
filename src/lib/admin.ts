// Admin emails can approve or reject submitted entries, review reports and
// read the inbox, and are exempt from the submission rate limit.
//
// Set entirely by the ADMIN_EMAILS env var (comma-separated). There is
// deliberately no hardcoded fallback: this repository is public, and a default
// in the source would publish a private address to everyone who clones it. An
// unset variable means nobody is an admin, which fails closed.

function adminList(): string[] {
  const fromEnv = process.env.ADMIN_EMAILS;
  if (!fromEnv?.trim()) return [];
  return fromEnv
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminList().includes(email.toLowerCase());
}
