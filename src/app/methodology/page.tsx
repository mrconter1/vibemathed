import type { Metadata } from "next";
import Link from "next/link";
import {
  AI_CONTRIBUTIONS,
  RESOLUTION_STATUSES,
  type AiContribution,
  type ResolutionStatus,
  type VerificationStatus,
} from "@/lib/problems";
import { AI_CONTRIBUTION, NOTABILITY_HELP, RESOLUTION, VERIFICATION } from "@/lib/display";
import { StatusIcon } from "@/components/StatusIcon";

// The permanent home for the rules that otherwise live only in tooltips and
// code comments: what qualifies for the record, and how entries are labeled.
// The ladders render from the same constants the cards use, so this page
// cannot drift from what the UI actually shows.

const DESCRIPTION =
  "How VibeMathed decides what counts as a math problem solved by AI, and how every entry's status and verification level are classified.";

export const metadata: Metadata = {
  title: "Methodology",
  description: DESCRIPTION,
  alternates: { canonical: "/methodology" },
  openGraph: {
    type: "website",
    title: "Methodology · VibeMathed",
    description: DESCRIPTION,
    url: "/methodology",
  },
};

/// One line per verification tier, in ladder order. Kept beside the page
/// rather than in display.ts because only this page needs the long form.
const VERIFICATION_DETAIL: Record<VerificationStatus, string> = {
  "lean-verified":
    "A formal proof machine-checked end to end by the Lean kernel - the strongest evidence a proof can carry. Entries checked modulo explicitly named literature inputs say so in their verification note.",
  "expert-verified": "Independently checked and endorsed by named domain experts.",
  "site-confirmed":
    "For Erdős problems: erdosproblems.com officially marks the problem solved, without a formal proof artifact.",
  "preprint-unrefereed": "Written up in a public preprint that has not yet been peer-reviewed.",
  "announced-unreviewed":
    "Publicly claimed with enough detail to check, but nobody independent has checked it yet.",
  contested:
    "Actively disputed or partially walked back. The entry stays listed so the dispute is on record.",
};

const AI_CONTRIBUTION_DETAIL: Record<AiContribution, string> = {
  "ai-discovered":
    "The model produced the central proof or object - the counterexample, the construction, the argument - and humans verified and wrote it up.",
  "ai-co-developed":
    "Named, essential steps came from the model inside a human-led proof: a key lemma, a construction idea, a subproblem the authors formulated and the model solved.",
  "ai-assisted":
    "Instrumental but human-led: the model built the search or verification tooling, checked proofs, or otherwise contributed work the authors call material to the result.",
};

const RESOLUTION_DETAIL: Record<ResolutionStatus, string> = {
  resolved: "The stated problem is fully proved or disproved.",
  partial:
    "A real advance - a new bound, a resolved special case - but the problem itself remains open.",
  variant: "Only a variant, or a literal reading of the historical wording, was resolved.",
  candidate:
    "A full solution is claimed and publicly checkable, but authoritative review (a community tracker, referees) is still pending.",
  retracted: "The claim was withdrawn or refuted after publication. Kept on record, not deleted.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-serif text-xl text-[var(--ink)]">{title}</h2>
      <div className="mt-2 space-y-3 text-sm leading-relaxed text-[var(--ink-secondary)]">
        {children}
      </div>
    </section>
  );
}

export default function MethodologyPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 pb-4 pt-8 sm:px-8 sm:pt-10">
      <h1 className="font-serif text-3xl tracking-tight text-[var(--ink)]">Methodology</h1>
      <p className="mt-3 text-sm leading-relaxed text-[var(--ink-secondary)]">
        What qualifies for this record, where entries come from, and what every
        label on an entry means.
      </p>

      <Section title="What belongs here">
        <p>
          The inclusion test is one sentence: <strong className="text-[var(--ink)]">a precisely
          stated open question whose answer is now a proved or disproved theorem, with an AI
          model substantively in the loop</strong>. Any field of mathematics qualifies,
          theoretical computer science included - a complexity-theory theorem is
          as much mathematics as a number-theory one.
        </p>
        <p>
          Deliberately out of scope: formalizations of results humans had
          already proved (formalizing a 1963 proof is valuable, but it is not a
          problem no human had solved), empirical results such as cryptanalytic
          attacks with measured work factors, and heuristic or record-improving
          constructions that do not resolve a stated question.
        </p>
      </Section>

      <Section title="Where entries come from">
        <p>
          Three ways: marquee results curated by hand; Erdős-problem solves
          imported from Terence Tao&apos;s AI-contributions wiki (full solutions
          only, each verified against its erdosproblems.com page); and reader
          submissions, which are reviewed before publishing and credited to the
          submitter by pseudonym. Every entry must cite a real, checkable
          primary source.
        </p>
      </Section>

      <Section title="Result and status">
        <p>
          Every entry carries a result - <strong className="text-[var(--ink)]">proved</strong> or{" "}
          <strong className="text-[var(--ink)]">disproved</strong> - and a status saying what
          actually happened to the problem:
        </p>
        <dl className="space-y-2.5">
          {RESOLUTION_STATUSES.map((r) => (
            <div key={r}>
              <dt className="font-medium" style={{ color: RESOLUTION[r].color }}>
                {RESOLUTION[r].label}
              </dt>
              <dd className="text-[var(--ink-secondary)]">{RESOLUTION_DETAIL[r]}</dd>
            </div>
          ))}
        </dl>
        <p>
          Separately, an entry can carry a <strong className="text-[var(--status-critical)]">claim
          issue</strong>: a documented problem with the claim itself, such as a refuted
          lemma or a misformalized formal statement. Claim issues render as a
          visible flag, never as a silent deletion.
        </p>
      </Section>

      <Section title="How much the AI did">
        <p>
          Disclosures range from &quot;the proof is found by the model&quot; to
          &quot;the model helped with one lemma&quot;, and those must not carry
          the same weight. Every new entry is classified by degree of AI
          involvement, strongest first:
        </p>
        <dl className="space-y-2.5">
          {AI_CONTRIBUTIONS.map((c) => (
            <div key={c}>
              <dt className="font-medium" style={{ color: AI_CONTRIBUTION[c].color }}>
                {AI_CONTRIBUTION[c].label}
              </dt>
              <dd className="text-[var(--ink-secondary)]">{AI_CONTRIBUTION_DETAIL[c]}</dd>
            </div>
          ))}
        </dl>
        <p>
          Below the bottom tier there is no tier: papers where AI only wrote,
          proofread, drew figures or ran routine code checks are out of scope
          entirely - as is any paper whose authors state the mathematics is
          theirs alone. Classification takes the authors&apos; own disclosure at
          face value, and a vague disclosure gets the lower tier. Entries added
          before this axis existed are unclassified until reviewed; an
          unclassified entry says nothing about the degree of involvement.
        </p>
      </Section>

      <Section title="The verification ladder">
        <p>
          Status says what happened; verification says how strongly you should
          trust it. Strongest first:
        </p>
        <dl className="space-y-2.5">
          {(Object.keys(VERIFICATION) as VerificationStatus[]).map((v) => (
            <div key={v}>
              <dt
                className="inline-flex items-center gap-1.5 font-medium"
                style={{ color: VERIFICATION[v].color }}
              >
                <StatusIcon kind={VERIFICATION[v].icon} color={VERIFICATION[v].color} />
                {VERIFICATION[v].label}
              </dt>
              <dd className="text-[var(--ink-secondary)]">{VERIFICATION_DETAIL[v]}</dd>
            </div>
          ))}
        </dl>
        <p>
          Both the status and the verification tier are editable by signed-in
          readers, because they genuinely change over an entry&apos;s life - a
          preprint gets refereed, a candidate gets accepted, a claim gets
          walked back. Changing either requires updating the verification note
          in the same edit, and every change lands in the entry&apos;s public
          changelog.
        </p>
      </Section>

      <Section title="Notability">
        <p>{NOTABILITY_HELP}</p>
        <p>
          The count is a frozen snapshot on purpose: coverage triggered by the
          solution itself can never inflate a problem&apos;s fame after the
          fact.
        </p>
      </Section>

      <Section title="Years open">
        <p>
          The posed year is the earliest cited reference for the problem, so
          ages are close estimates rather than exact anniversaries. Entries
          where the span oversells how fully the problem is closed carry a
          footnote next to the age.
        </p>
      </Section>

      <Section title="The dataset">
        <p>
          Everything on this site is free to reuse under{" "}
          <a
            href="https://creativecommons.org/licenses/by/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent-blue)] hover:underline"
          >
            CC BY 4.0
          </a>
          , and the complete, always-current dataset is one request away:{" "}
          <a
            href="/api/dataset"
            className="text-[var(--accent-blue)] hover:underline"
          >
            vibemathed.com/api/dataset
          </a>{" "}
          (JSON, every published entry with all fields). Spotted an error?
          Every entry has an edit button and a discussion thread, or you can{" "}
          <Link href="/submit" className="text-[var(--accent-blue)] hover:underline">
            submit
          </Link>{" "}
          a solve we are missing.
        </p>
      </Section>
    </main>
  );
}
