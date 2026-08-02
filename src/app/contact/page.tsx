import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";

const DESCRIPTION =
  "Write to the people who keep VibeMathed: corrections, results that belong in the record, questions about the dataset.";

export const metadata: Metadata = {
  title: "Contact",
  description: DESCRIPTION,
  alternates: { canonical: "/contact" },
  openGraph: {
    type: "website",
    title: "Contact · VibeMathed",
    description: DESCRIPTION,
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 pb-10 pt-8 sm:px-8 sm:pt-10">
      <h1 className="font-serif text-3xl tracking-tight text-[var(--ink)]">Contact</h1>

      <p className="mt-3 mb-6 text-sm leading-relaxed text-[var(--ink-secondary)]">
        This reaches the curators directly. Corrections to an entry are the most
        useful thing you can send - if the mathematics is wrong somewhere, say
        so and it gets fixed. For a result you think belongs in the record, the{" "}
        <Link href="/submit" className="text-[var(--accent-blue)] hover:underline">
          submission form
        </Link>{" "}
        is faster, and small fixes can be made directly on an entry page.
      </p>

      {/* The form reads ?topic= from the URL, which is uncached data, so it
          needs its own boundary for this route to prerender. */}
      <Suspense
        fallback={
          <div className="h-96 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)]" />
        }
      >
        <ContactForm />
      </Suspense>
    </main>
  );
}
