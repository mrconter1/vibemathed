import type { Metadata } from "next";
import Link from "next/link";
import { getMemberDirectory, getVerifiedCount } from "@/lib/data";
import { SITE_URL } from "@/lib/site";
import { Icon } from "@/components/Icons";
import { MEMBER_ROLE, VERIFIED_HELP, type MemberRole } from "@/lib/roles";
import { InfoTip } from "@/components/Tooltip";

// Who is behind the record.
//
// Every pseudonym here was already public - on the entries these members
// submitted, under their comments, in the homepage activity feed. What this
// page adds is ENUMERATION: one place that lists them all, which is a real
// exposure even when each part was already visible. That is why the profile
// carries an opt-out and why this page never lists anyone who used it.
//
// Deliberately NOT in the sitemap (see src/app/sitemap.ts). The directory is
// for people already here, not a set of profiles to be indexed and ranked.

export const metadata: Metadata = {
  title: "Members",
  description:
    "The people curating VibeMathed: who has submitted entries, written comments and edited the record.",
  alternates: { canonical: "/users" },
  openGraph: {
    type: "website",
    title: "Members · VibeMathed",
    description:
      "The people curating VibeMathed: who has submitted entries, written comments and edited the record.",
    url: `${SITE_URL}/users`,
  },
};

export default async function UsersPage() {
  const [members, verified] = await Promise.all([getMemberDirectory(), getVerifiedCount()]);

  const contributors = members.filter((m) => m.contributions > 0);
  const quiet = members.length - contributors.length;

  return (
    <main className="mx-auto w-full max-w-4xl px-4 pb-12 pt-5 sm:px-8 sm:pt-6">
      <h1 className="font-serif text-2xl text-[var(--ink)]">Members</h1>
      <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[var(--ink-secondary)]">
        Everyone who has submitted an entry, written a comment or edited the
        record, most active first. Members choose whether to appear here; the
        list is not the whole membership.
      </p>
      {/* The count is across everyone, listed or not; the number names nobody.
          "Members", not "mathematicians": the badge says a curator checked
          who someone is, not what they do. */}
      {verified > 0 && (
        <p className="mt-1.5 flex items-center gap-1 text-sm text-[var(--ink-secondary)]">
          <span className="font-medium text-[var(--status-good)]">{verified}</span>
          {verified === 1 ? " member is verified" : " members are verified"}
          <InfoTip content={VERIFIED_HELP} label="Verified" />
        </p>
      )}

      {members.length === 0 ? (
        <p className="mt-8 text-sm text-[var(--ink-muted)]">
          Nobody is listed yet.
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-2">
          {contributors.map((m) => (
            <li
              key={m.pseudonym}
              className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3"
            >
              <Link
                href={`/user/${encodeURIComponent(m.pseudonym)}`}
                className="font-serif text-base text-[var(--ink)] transition-colors hover:text-[var(--accent-blue)] hover:underline"
              >
                {m.pseudonym}
              </Link>

              {m.verified && (
                <span className="inline-flex items-center gap-1 text-[11px] text-[var(--status-good)]">
                  <Icon name="shield" />
                  Verified
                  <InfoTip content={VERIFIED_HELP} label="Verified" />
                </span>
              )}

              {m.role && m.role in MEMBER_ROLE && (
                <span className="text-xs text-[var(--ink-muted)]">
                  {MEMBER_ROLE[m.role as MemberRole].label}
                </span>
              )}

              {/* Counts sit right-aligned so the column of pseudonyms stays
                  scannable however long the roles are. */}
              <span className="ml-auto flex items-center gap-3 font-mono text-xs tabular-nums text-[var(--ink-muted)]">
                <span title="Published entries submitted">
                  {m.entries} {m.entries === 1 ? "entry" : "entries"}
                </span>
                <span title="Comments written">
                  {m.comments} {m.comments === 1 ? "comment" : "comments"}
                </span>
                <span title="Field-level edits to entries">
                  {m.edits} {m.edits === 1 ? "edit" : "edits"}
                </span>
                <span className="hidden sm:inline" title="Member since">
                  {m.joined}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {quiet > 0 && (
        <p className="mt-4 text-xs text-[var(--ink-muted)]">
          {quiet} more {quiet === 1 ? "member has" : "members have"} an account
          but nothing published yet.
        </p>
      )}
    </main>
  );
}
