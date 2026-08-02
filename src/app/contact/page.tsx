import type { Metadata } from "next";
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
        This reaches the people who keep the record. Messages are private and
        go straight to a curator.
      </p>

      {/* No Suspense: the form reads nothing uncached, so it prerenders into
          the static HTML and works before hydration. */}
      <ContactForm />
    </main>
  );
}
