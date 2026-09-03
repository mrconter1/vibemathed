import type { Metadata } from "next";
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

      <p className="mt-3 text-sm leading-relaxed text-[var(--ink-secondary)]">
        This reaches the people who keep the record. Messages are private and
        go straight to a curator.{" "}
        <strong className="font-medium text-[var(--ink)]">No account needed</strong>, which
        matters most for the reasons below.
      </p>
      {/* The rights route, said plainly and above the form. Someone whose
          work or reputation is affected by an entry should not have to read a
          policy page to find out how to say so, and should never have to join
          the site first. */}
      <p className="mt-2 mb-6 text-sm leading-relaxed text-[var(--ink-secondary)]">
        If something here reproduces your work beyond a quotation, says
        something untrue about you, carries personal information, or
        impersonates you, pick the matching topic. Those go to the front of the
        queue, we act on them rather than debate them, and you will hear what
        was done.{" "}
        <Link href="/data-license" className="text-[var(--accent-blue)] hover:underline">
          What is and is not licensed
        </Link>{" "}
        may answer a copyright question before you write.
      </p>
      <p className="mb-6 text-sm leading-relaxed text-[var(--ink-secondary)]">
        A mathematical error is different and faster to fix in the open: every
        entry has an edit button and a discussion thread, and a wrong claim can
        be reported from the entry itself.
      </p>

      {/* No Suspense: the form reads nothing uncached, so it prerenders into
          the static HTML and works before hydration. */}
      <ContactForm />
    </main>
  );
}
