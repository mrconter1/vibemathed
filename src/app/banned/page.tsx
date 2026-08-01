import type { Metadata } from "next";
import Link from "next/link";

// Where a banned account lands when it tries to sign in (see the signIn
// callback in src/auth.ts). Deliberately a dead end: no sign-in link, no
// appeal form - just the fact and a way back to reading the record, which
// needs no account.

export const metadata: Metadata = {
  title: "Account banned",
  robots: { index: false, follow: false },
};

export default function BannedPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-4 pt-16 sm:px-8">
      <div className="mx-auto max-w-md rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-6 py-8 text-center">
        <h1 className="font-serif text-2xl text-[var(--ink)]">
          This account has been banned
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ink-secondary)]">
          Your account was banned due to misconduct and can no longer sign in.
        </p>
        <p className="mt-6 text-sm">
          <Link href="/" className="text-[var(--accent-blue)] hover:underline">
            Back to the record
          </Link>
        </p>
      </div>
    </main>
  );
}
