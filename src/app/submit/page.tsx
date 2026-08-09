import type { Metadata } from "next";
import { SubmitForm } from "@/components/SubmitForm";
import { SubmitGate } from "@/components/SubmitGate";

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

      {/* Both ship; CSS picks, keyed off the data-viewer attribute the boot
          script writes before first paint. The gate is the default because no
          attribute means unknown, and showing a stranger the sign-in prompt is
          the cheaper mistake: a signed-in reader sees it for one frame, where
          the reverse would let someone start typing into a form they cannot
          submit. Same mechanism as the header's two account variants. */}
      <div className="viewer-out mt-6">
        <SubmitGate />
      </div>
      <div className="viewer-in-block mt-6">
        <SubmitForm />
      </div>
    </main>
  );
}
