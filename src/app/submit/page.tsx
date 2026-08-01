import type { Metadata } from "next";
import { SubmitForm } from "@/components/SubmitForm";

export const metadata: Metadata = {
  title: "Submit an entry",
  description:
    "Propose a math problem resolved with an AI model in the loop. Submissions are reviewed before they appear.",
  alternates: { canonical: "/submit" },
};

export default function SubmitPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-4 pt-8 sm:px-8 sm:pt-10">
      <h1 className="font-serif text-3xl tracking-tight text-[var(--ink)]">
        Submit an entry
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--ink-secondary)]">
        Know of a problem proved or disproved with an AI model in the loop that
        isn&apos;t tracked here? Propose it. A reviewer checks the source before it
        goes live, and the published entry credits you by pseudonym.
      </p>

      <div className="mt-6">
        <SubmitForm />
      </div>
    </main>
  );
}
