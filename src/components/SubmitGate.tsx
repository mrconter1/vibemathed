// What a signed-out reader sees on /submit, instead of the form.
//
// The wall used to sit at the submit button: fill everything in, then discover
// you need an account. The draft survived in localStorage, so nothing was
// actually lost, but nobody knows that at the moment they hit the wall, and
// finding out a requirement at the end of a long form reads as a bait and
// switch even when it costs nothing.
//
// So the requirement is stated first, in one short page, with both providers
// right here rather than a bounce through /sign-in. Signing in returns to
// /submit, so the reader lands on the form they came for.
//
// A server component: two forms and no state.

import Link from "next/link";
import { signInWithGitHub, signInWithGoogle } from "@/app/actions/auth";

const BUTTON =
  "inline-flex w-full items-center justify-center gap-2 rounded-md border " +
  "border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-2.5 text-sm " +
  "text-[var(--ink)] transition-colors hover:border-[var(--accent-blue)] " +
  "hover:text-[var(--accent-blue)]";

export function SubmitGate() {
  return (
    <div className="rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-5 py-6 sm:px-6">
      <h2 className="font-serif text-lg text-[var(--ink)]">
        Sign in to submit an entry
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-[var(--ink-secondary)]">
        Submissions are credited to their contributor and reviewed before they
        appear, so they need an account. It takes one click, and you are
        returned straight to the form.
      </p>

      <div className="mt-5 space-y-2.5">
        <form action={signInWithGoogle}>
          <input type="hidden" name="redirectTo" value="/submit" />
          <button type="submit" className={BUTTON}>
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

        <form action={signInWithGitHub}>
          <input type="hidden" name="redirectTo" value="/submit" />
          <button type="submit" className={BUTTON}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden>
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
            Continue with GitHub
          </button>
        </form>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-[var(--ink-muted)]">
        You post under a random pseudonym. Nothing from the account you sign in
        with is shown on the site.
      </p>

      <p className="mt-4 border-t border-[var(--hairline)] pt-3 text-xs leading-relaxed text-[var(--ink-muted)]">
        Not sure it qualifies? The{" "}
        <Link href="/methodology" className="text-[var(--accent-blue)] hover:underline">
          methodology
        </Link>{" "}
        has the full criteria, and reading it first is worth more than a
        submission that gets turned down.
      </p>
    </div>
  );
}
