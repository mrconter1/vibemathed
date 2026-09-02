import type { Metadata } from "next";
import Link from "next/link";
import {
  AI_CONTRIBUTIONS,
  PUBLICATION_STATUSES,
  RESOLUTION_METHODS,
  RESOLUTION_STATUSES,
  type AiContribution,
  type PublicationStatus,
  type ResolutionMethod,
  type ResolutionStatus,
  type VerificationStatus,
} from "@/lib/problems";
import {
  AI_CONTRIBUTION,
  NOTABILITY_HELP,
  PUBLICATION,
  RESOLUTION,
  RESOLUTION_METHOD,
  VERIFICATION,
} from "@/lib/display";
import { StatusIcon } from "@/components/StatusIcon";

// The permanent home for the rules that otherwise live only in tooltips and
// code comments: what qualifies for the record, and how entries are labeled.
// The ladders render from the same constants the cards use, so this page
// cannot drift from what the UI actually shows.

const DESCRIPTION =
  "How VibeMathed decides what counts as a math problem solved with AI, and how every entry's status and verification level are classified.";

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
    "A formal proof machine-checked end to end by the Lean kernel, AND the formal statement independently anchored: the canonical tracker accepted the claim, the statement is pinned in a community-reviewed repository such as Formal Conjectures, or someone with no stake in the proof audited the informal-to-formal correspondence. Both halves are required, because the kernel checks the proof against the supplied statement and nothing can make it check the statement against the problem as posed. Entries checked modulo explicitly named literature inputs, or leaning on native_decide, say so in their verification note.",
  "expert-verified":
    "Checked and endorsed by named domain experts with no stake in the claim. Slower and much rarer than formalization, and it catches what a kernel cannot: a formal statement that drifted from the informal problem, a result already sitting in the literature, a proof that answers the neighbouring question. The authors checking their own work does not count, however expert they are, and that stays Unreviewed.",
  "site-confirmed":
    "Either the canonical community tracker accepted the claim - for Erdős problems, erdosproblems.com marks it solved - or this site reproduced the artifact itself: re-ran a finite certificate, re-derived a counterexample in exact arithmetic, rebuilt a formalization and audited which axioms its theorem really uses. The entry's verification note always says which of the two happened, and exactly what was run.",
  "lean-checked":
    "The Lean artifact compiles with no sorry and no stray axioms, but nobody independent has audited whether the formal statement faithfully expresses the original conjecture - typically because the same system produced both the proof and its formalization. A valid kernel check of an unaudited statement can still concern a nearby, weakened or otherwise unintended claim, and statement fidelity is exactly where an autonomous prover is most likely to fail silently. This tier used to be folded into Lean-verified; splitting them is what makes the top rung mean what it says.",
  unreviewed:
    "Nobody independent has checked the mathematics yet, whatever venue the claim lives in.",
  contested:
    "Actively disputed, walked back, or withdrawn outright. The entry stays listed so the dispute is on record.",
};

const PUBLICATION_DETAIL: Record<PublicationStatus, string> = {
  announcement:
    "The claim lives in a blog post, a repository, a tracker page or a social post - no manuscript venue.",
  preprint: "A manuscript on arXiv or a similar server, not yet refereed.",
  "peer-reviewed": "Accepted by a journal or a conference.",
};

const METHOD_DETAIL: Record<ResolutionMethod, string> = {
  construction:
    "An explicit object settles it: a counterexample, a witness, a presentation. Classified by the decisive step per the source.",
  computation:
    "A finite certificate or an exhaustive case analysis carries the result - neither an object nor a theory.",
  argument: "A conceptual proof: the resolution is an idea, not a search hit.",
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

/// Anchor id from the heading text. The contents list and the sections both
/// call this, so a link and its target cannot drift apart: there is no second
/// place where an id is written down.
function anchor(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/// The page in three parts. Six of the nine sections define a label that
/// appears on every entry, which is most of the page and was previously an
/// undifferentiated run of headings; naming that group is what makes the
/// shape legible.
const CONTENTS: { group: string; titles: string[] }[] = [
  {
    group: "Scope",
    titles: ["What belongs here", "Where entries come from"],
  },
  {
    group: "What each label means",
    titles: [
      "Result and status",
      "How much the AI did",
      "The verification ladder",
      "Significance",
      "Notability",
      "Years open",
    ],
  },
  { group: "The data", titles: ["The dataset"] },
];

function Contents() {
  return (
    <nav
      aria-label="On this page"
      className="mt-6 rounded-lg border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3.5"
    >
      <h2 className="text-xs font-medium text-[var(--ink)]">On this page</h2>
      <div className="mt-2.5 grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-3">
        {CONTENTS.map((part) => (
          <div key={part.group}>
            <p className="text-[10px] font-medium uppercase tracking-wide text-[var(--ink-muted)]">
              {part.group}
            </p>
            <ul className="mt-1 space-y-0.5">
              {part.titles.map((t) => (
                <li key={t}>
                  <a
                    href={`#${anchor(t)}`}
                    className="text-xs text-[var(--ink-secondary)] transition-colors hover:text-[var(--accent-blue)]"
                  >
                    {t}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}

/// The label above the first section of each part, repeating the contents
/// list's grouping in the body so the reader can see where they are without
/// scrolling back up.
function GroupLabel({ children }: { children: string }) {
  return (
    <p className="mt-10 border-b border-[var(--hairline)] pb-1.5 text-[10px] font-medium uppercase tracking-wide text-[var(--ink-muted)]">
      {children}
    </p>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    // scroll-mt clears the sticky header: without it a jump from the contents
    // list parks the heading underneath the bar.
    <section id={anchor(title)} className="mt-8 scroll-mt-20">
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

      <Contents />

      <GroupLabel>Scope</GroupLabel>

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
          constructions that do not resolve a stated question. A proof that
          merely reproves something already settled without AI is out too,
          because it cannot be shown to be independent of the work it follows.
        </p>
        <p>
          <strong className="text-[var(--ink)]">Concurrent independent proofs
          are the exception to that last rule.</strong> When two proofs of the
          same problem appear within weeks by demonstrably different methods,
          and the authors state they worked independently, the later one is not
          derivative work: it is ordinary mathematics, which has always
          produced simultaneous discoveries. An AI-assisted proof in that
          situation stays in the record, because a model genuinely contributed
          to proving the thing. What such an entry may not do is imply a
          priority it lacks, so it names the competing proof in its result
          note, links it, and says plainly that the first proof of the problem
          may not have been the AI-assisted one. Crouzeix&apos;s conjecture is
          the worked example.
        </p>
        <p>
          <strong className="text-[var(--ink)]">Extraordinary claims are held, not
          listed.</strong> A claim that would be a major result by any expert&apos;s
          standard - a famous conjecture, a problem with decades of failed
          attempts, an object the field expected not to exist - is not published
          at Unreviewed, and not published as a Candidate either, because a
          listing here puts the site&apos;s name beside a claim it has not read.
          It waits until a named expert with no stake in it has checked the
          argument or a formal proof exists, and the submitter is told so in as
          many words, with the way back. The test is the size of the claim, not
          the credentials behind it: the rule is the same for a preprint by
          known authors and for an anonymous agent. This record is not where a
          landmark result is announced; it is where the announcement is
          recorded once it has stood up.
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

      <GroupLabel>What each label means</GroupLabel>

      <Section title="Result and status">
        <p>
          Every entry carries a result - <strong className="text-[var(--ink)]">proved</strong>,{" "}
          <strong className="text-[var(--ink)]">disproved</strong> or{" "}
          <strong className="text-[var(--ink)]">independent</strong> - and a status saying what
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
          The result records the fate of the statement <em>as it was posed</em>
          - a proof of X is logically a disproof of not-X, so proved versus
          disproved tracks whether the community&apos;s expectation held, not a
          property of the mathematics.
        </p>
        <p>
          <strong className="text-[var(--ink)]">Independent</strong>{" "}
          is a third outcome rather than a variety of the first two. The statement is
          neither provable nor refutable from the ambient axioms, and that is
          itself the theorem. Recording such a result as proved would describe
          the metatheorem rather than the problem, and recording it as disproved
          would describe nothing at all, so the axis has three values. The
          problem still counts as resolved: the answer to &ldquo;which is
          it?&rdquo; turned out to be &ldquo;neither, provably&rdquo;, which is
          an answer.
        </p>
        <p>
          What the resolution actually consisted of is the{" "}
          <strong className="text-[var(--ink)]">method</strong>:
        </p>
        <dl className="space-y-2.5">
          {RESOLUTION_METHODS.map((m) => (
            <div key={m}>
              <dt className="font-medium text-[var(--ink)]">{RESOLUTION_METHOD[m].label}</dt>
              <dd className="text-[var(--ink-secondary)]">{METHOD_DETAIL[m]}</dd>
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
          Status says what happened; verification says how the mathematics was
          checked. The tiers run strongest to weakest with one deliberate
          exception: the top two are not comparable. A Lean kernel and an
          independent expert catch different mistakes, so an entry at either
          tier is well checked, and the rare entry at both is as good as this
          record gets.
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
          A listing in the{" "}
          <a
            href="https://palomar-registry.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent-blue)] hover:underline"
          >
            Palomar registry
          </a>{" "}
          is recorded on an entry when it exists, and it is worth saying exactly
          what it buys. Palomar requires the Lean FRO&apos;s comparator, which
          forces the statement of a theorem to be separated from its proof and
          to depend on Mathlib alone. That turns &ldquo;clone the repository and
          work out which files you have to trust&rdquo; into something a
          stranger can check in a minute, which is the practical obstacle that
          has kept most formalized entries at Lean-checked rather than
          Lean-verified.
        </p>
        <p>
          What it does not do is decide whether the formal statement says what
          the informal problem said. Palomar states plainly that a listing
          &ldquo;does not constitute a certificate of novelty, nor a
          certification of relevance&rdquo;, and separating a statement from a
          proof does not make that statement faithful. So a listing is treated
          here as a strong precondition rather than as the anchoring itself: it
          makes the audit cheap, someone still has to do it.
        </p>
        <p>
          Peer review is deliberately not a rung on this ladder. It answers a
          different question, where the claim sits in the scholarly pipeline,
          and every entry records that separately. The two axes are
          independent, and a Lean-verified result can sit in a bare company
          announcement. Most currently do: journals move far slower than these
          results arrive, which is exactly why refereeing cannot be the spine
          of this scale.
        </p>
        <dl className="space-y-2.5">
          {PUBLICATION_STATUSES.map((v) => (
            <div key={v}>
              <dt
                className="inline-flex items-center gap-1.5 font-medium"
                style={{ color: PUBLICATION[v].color }}
              >
                <StatusIcon kind={PUBLICATION[v].icon} color={PUBLICATION[v].color} />
                {PUBLICATION[v].label}
              </dt>
              <dd className="text-[var(--ink-secondary)]">{PUBLICATION_DETAIL[v]}</dd>
            </div>
          ))}
        </dl>
        <p>
          Status, verification and publication are editable by signed-in
          readers, because they genuinely change over an entry&apos;s life - a
          preprint gets refereed, a candidate gets accepted, a claim gets
          walked back. Changing any of them requires updating the verification
          note in the same edit, and every change lands in the entry&apos;s
          public changelog.
        </p>
      </Section>

      <Section title="Significance">
        <p>
          Every entry carries an <strong className="text-[var(--ink)]">AI-estimated
          significance score</strong>: how much mathematics cared about the problem{" "}
          {/* Explicit, like the {" "} on the line above. A literal space
              between a closing tag and a text node that then wraps is eaten by
              JSX, which is how this rendered as "beforeit was solved". */}
          <em>before</em>{" "}
          it was solved, as an integer from 0 to 100. It is
          calibrated against an anchored ladder - the Riemann hypothesis is 100,
          Collatz sits near 80, the Jacobian conjecture near 65, a conjecture
          famous within one research community around 30, a typical numbered
          Erdős problem around 10, and machine-generated conjectures around 5 -
          and, since v2 of the scoring prompt (August 2026), each score is
          placed comparatively against a fixed spine of catalog entries whose
          scores are frozen by editorial decree. A single problem judged in
          isolation is only honest to a band of about five points; one-point
          resolution comes from answering &quot;above or below <em>that</em>{" "}
          one?&quot; against named neighbours. Ties are deliberate: problems of
          genuinely similar standing share a score rather than being forced
          into spurious distinct integers. The whole catalog was rescored
          under v2 on 6 August 2026.
        </p>
        <p>
          The score is a curator measurement, never self-reported: it is
          assigned at review time by an AI model applying a fixed rubric, with
          a one-line justification stored on the entry, and the whole catalog
          gets a pairwise consistency sweep. The score describes the problem as
          it stood before its resolution, so attention triggered by the
          solution itself can never inflate it. Scores are editorial estimates,
          stable to within a band - challenge one in the entry&apos;s
          discussion thread. The verbatim scoring prompt is public:{" "}
          <a
            href="/significance-prompt.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--accent-blue)] hover:underline"
          >
            significance-prompt.md
          </a>
          , versioned in the repository; any wholesale rescore is documented
          there.
        </p>
        <p>
          One cluster gets a further, evidence-based pass rather than resting
          on comparative judgment alone: the numbered Erdős problems, which
          made up two large ties at the bottom of the scale. Erdős priced the
          problems he cared most about himself, in dollars, and
          erdosproblems.com records how much literature and discussion each
          one has attracted - both are real per-problem signals, not
          guesses. On 6 August 2026 every numbered entry was checked against
          both: a documented prize or an unusually dense reference trail
          moved a problem up within its band. This is promotion-only - a
          thin page is evidence of nothing, not of insignificance - and the
          large tie that remains after this check is stamped as examined
          (each such entry&apos;s note says so explicitly) rather than left
          as an unexamined default. A shared score should mean &quot;checked
          and found comparable,&quot; never &quot;never looked.&quot;
        </p>
      </Section>

      <Section title="Notability">
        <p>{NOTABILITY_HELP}</p>
        <p>
          The count is a frozen snapshot on purpose: coverage triggered by the
          solution itself can never inflate a problem&apos;s fame after the
          fact. It now lives as a supporting fact on entry pages - most genuine
          AI solves score zero, which is itself a finding - while the headline
          metric on cards is the significance score, which the Wikipedia count
          keeps honest: a high score beside &quot;no dedicated article&quot; is
          a visible tension anyone can challenge.
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

      <GroupLabel>The data</GroupLabel>

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
