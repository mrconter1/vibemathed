import type { Metadata } from "next";
import Link from "next/link";
import { signInWithGoogle } from "@/app/actions/auth";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to VibeMathed to vote on entries. You appear under a pseudonym; your Google name is never shown.",
  robots: { index: false, follow: false },
};

export default function SignInPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-10 sm:px-8">
      <main className="w-full max-w-md rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-6 py-8 sm:px-8">
        <h1 className="font-serif text-2xl text-[var(--ink)]">Sign in</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--ink-secondary)]">
          Signing in lets you vote on entries. It takes one click and needs nothing
          but a Google account.
        </p>

        <div className="mt-5 rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] p-3">
          <h2 className="text-xs font-medium text-[var(--ink)]">
            You stay pseudonymous
          </h2>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--ink-secondary)]">
            You are given a random display name like{" "}
            <span className="font-mono text-[var(--ink)]">BraveMongoose492</span>, and
            that is the only thing shown publicly. Your real name, email and profile
            picture from Google are never displayed anywhere on the site. You can
            change your display name at any time.
          </p>
        </div>

        <form action={signInWithGoogle} className="mt-6">
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-2.5 text-sm text-[var(--ink)] transition-colors hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
          >
            <svg width="16" height="16" viewBox="0 0 18 18" aria-hidden>
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.01-2.34z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58z"
              />
            </svg>
            Continue with Google
          </button>
        </form>

        <p className="mt-5 text-xs text-[var(--ink-muted)]">
          <Link href="/" className="text-[var(--accent-blue)] hover:underline">
            ← Back to all entries
          </Link>
        </p>
      </main>
    </div>
  );
}
