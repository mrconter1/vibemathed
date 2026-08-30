// The prime-gaps entry gets a large upgrade. 30 Aug 2026.
//
// The erdosproblems.com proof claim for #4 turns out to be THE SAME RESULT, not a
// second one. The external link on that claim is
//   github.com/DottedCalculator/ai-math/blob/main/Erdos_4_GPT_5.6_Sol.pdf
// which is the same filename stem as the .tex in Alexeev's Lean repo. So no new
// entry - this enriches the one already published.
//
// WHAT THE THREAD ADDS is the thing the entry most lacked: real expert scrutiny,
// from the people best placed to be hostile to it.
//
// Ben Green, a co-author of the FGKMT bound being beaten:
//   26 Aug: "This paper makes an important claim ... Whilst the paper survives an
//   initial plausibility check (including asking ChatGPT 5.6Pro to referee it),
//   the exposition is truly horrible ... I guess I will discuss with my coauthors."
//   27 Aug: "Following a few hours thought and some conversations with Terry Tao
//   and James Maynard I became more or less convinced this is correct. ... a lean
//   formalisation exists so we know it's correct, and experts closest to the area
//   basically understand informally what the key ideas are and why the proof
//   works." (5 upvotes)
//   28 Aug: "It isn't quite fair to say that this incrementally improves on
//   [FGKMT]. The sieving procedure is different to the Erdos-Rankin one which
//   underpinned all bounds on the problem since 1938 ... one now wins basically
//   (log_3 N)^2 over Rankin's 1938 bound. A particular point is that this new
//   sieving procedure by itself could have claimed the Erdos 10000 dollars for
//   this question, and it could have been discovered in the 1960s."
//
// Boris Alexeev, the formaliser: "This result has been formalized unconditionally
// in Lean." That is independent confirmation of the axiom audit done here.
//
// => verification moves lean-checked -> expert-verified. Named domain experts, no
// stake in the claim (Green has the opposite of a stake), on the record.
//
// NOT lean-verified, and the reason is precise. That tier needs the kernel check
// AND independent anchoring of the formal statement. erdosproblems.com hosts this
// under its standing disclaimer that listing is "no guarantee of proof
// correctness" - it has NOT accepted the claim - and nobody without a stake has
// audited the informal-to-formal correspondence. The Lean was not built here.
//
// RESOLUTION STAYS `partial`, now vindicated by the tracker's own maintainer.
// Thomas Bloom relabelled the claim from full to partial: "since the original
// question of Erdős was already answered it doesn't make a lot of sense with
// either label, but this seems as good a place as any for people to report
// further improvements". Exactly the reasoning used when the entry was created.
//
// THE HUMAN IN THE LOOP is now identifiable and, importantly, disclaims the
// mathematics: DottedCalculator, "I am not familiar with sieve theory." That
// strengthens ai-discovered rather than weakening it.
//
// significance 50 -> 60. Green calls it "such a significant result" and recalls
// Tao offering 10,000 USD for this exact improvement. Still not top band: it
// improves a bound rather than settling a question, and no referee has read it.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "tilted-residue-class-construction-for-long-prime-free-intervals";
const LINK_LABEL_MAX = 120;

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const NEXT: Record<string, unknown> = {
  verification: "expert-verified",
  significance: 60,
  humanCollaborators: ["DottedCalculator (prompting and submission)", "Boris Alexeev (Lean formalisation)"],
  sourceUrl: "https://github.com/DottedCalculator/ai-math/blob/main/Erdos_4_GPT_5.6_Sol.pdf",

  verificationNote:
    "Expert-verified, by an unusually well-placed expert: Ben Green, a co-author of the FGKMT bound this beats, so a reader with every incentive to be sceptical rather than generous.\n\nOn 26 August he called it \"an important claim\" that \"survives an initial plausibility check\", while warning that \"the exposition is truly horrible\" and that verifying it would take time. On 27 August, after \"a few hours thought and some conversations with Terry Tao and James Maynard\", he wrote that he \"became more or less convinced this is correct\", adding that \"a lean formalisation exists so we know it's correct, and experts closest to the area basically understand informally what the key ideas are and why the proof works\". Boris Alexeev, who formalised it, states that the result is \"formalized unconditionally in Lean\".\n\nThat matches the audit done here on 30 August: 403 Lean files, 56,614 lines, no $\\texttt{sorry}$, no $\\texttt{admit}$, no $\\texttt{native\\_decide}$ and not one declared axiom, with the terminal theorem stated in primitive Mathlib terms and carrying no hypotheses at all.\n\nShort of Lean-verified on the anchoring half. erdosproblems.com hosts this as a proof claim under its standing disclaimer that listing is \"no guarantee of proof correctness\" - it has not accepted the claim - and nobody without a stake has audited the informal-to-formal correspondence. The Lean was not built here - no toolchain. No referee has read it, and Green expects a human-written exposition to take months.",

  aiRole:
    "The paper has no human author. Its title block reads \\author{GPT 5.6 Sol} and the PDF metadata records the same, with no acknowledgements section and no human contributor named anywhere in the manuscript.\n\nThe human in the loop is the pseudonymous submitter DottedCalculator, who prompted the model and whose own account of that role is unusually direct: \"I am not familiar with sieve theory. The first draft was much shorter (19 pages) but I couldn't understand the sieve theoretical jargons and there were a few small steps missing that I had a really hard time with. I asked for all of the details self-contained to make checking the argument easier.\" So the human contribution was prompting, iteration and a request for self-contained detail - explicitly not the mathematics. Ben Green notes the contributor \"seems to wish to stay anonymous\".\n\nOne attribution discrepancy, recorded rather than smoothed over: the manuscript and its filename say GPT 5.6 Sol, while the erdosproblems.com claim was filed as \"GPT 5.6 Pro (using GPT 5.6 Pro)\" and the discussion refers throughout to ChatGPT 5.6 Pro.\n\nBoris Alexeev's Lean development is downstream and formal - it transcribes the manuscript rather than producing it.",

  resultNote:
    "Claims $G(T)\\gg\\log T\\log_2 T/\\log_4 T$ against FGKMT's $\\log T\\log_2 T\\log_4 T/\\log_3 T$, a gain of $\\log_3 T/(\\log_4 T)^2$, together with $Y(X)\\gg X\\log X/\\log_3 X$ for the covering problem behind it.\n\nBen Green resists calling it incremental: \"The sieving procedure is different to the Erdos-Rankin one which underpinned all bounds on the problem since 1938, and it wins $\\log_3 N$ over that procedure. The [FGKMT] paper also wins a $\\log_3 N$. These wins are essentially independent of one another so one now wins basically $(\\log_3 N)^2$ over Rankin's 1938 bound.\" He adds that the new sieve \"by itself could have claimed the Erdos 10000 dollars for this question\".\n\nWhat is new is narrow: only the intermediate sieve is replaced, its hard cutoff smoothed into a probabilistic tilt; the hypergraph covering theorem and Maynard weight come from FGKMT. Readers on the thread note that several later sections reproduce FGKMT with no new content, and Green calls the exposition \"horrific\".",

  significanceNote:
    "Among the most-worked quantitative questions in prime number theory, and the first movement on the record since Ford, Green, Konyagin, Maynard and Tao's Annals bound. Green called it \"an important claim\" and \"such a significant result\", and recalls that Terry Tao had offered 10,000 USD for exactly this improvement. On his reading it beats Rankin's 1938 procedure by $(\\log_3 N)^2$.\n\nHeld below the top band because it improves a bound rather than settling a question - Erdős's #4 was answered in 2016 and the $(\\log n)^{1+c}$ target stands - and because no referee has read it.",

  ageNote:
    "Dated to Erdős's 1955 statement, earliest of many. The question as posed was answered in 2016; what stands open is the $(\\log n)^{1+c}$ form he reserved the larger prize for in 1997, having reduced the problem itself to 5,000 dollars. Thomas Bloom, who maintains erdosproblems.com, relabelled this claim from full to partial for the same reason: \"the original question of Erdős was already answered\".",
};

const LINKS = [
  {
    label: "Proof claim and expert discussion: Green, Bloom, Alexeev",
    url: "https://www.erdosproblems.com/forum/thread/4/proof-claims",
    kind: "independent",
  },
  {
    label: "Manuscript source (TeX) in the Lean repository",
    url: "https://github.com/plby/lean-proofs/blob/main/output/pdf/Erdos_4_GPT_5.6_Sol.tex",
    kind: "paper",
  },
];

async function main() {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true, verification: true, resolution: true, significance: true, sourceUrl: true },
  });
  if (!cur) throw new Error("entry not found");
  if (cur.status !== "published") throw new Error(`status is ${cur.status}`);

  const curator = await prisma.user.findFirst({ where: { pseudonym: "Rasmus Lindahl" }, select: { id: true, pseudonym: true } });
  if (!curator) throw new Error("curator not found");

  const existing = await prisma.problemLink.findMany({ where: { problemId: cur.id }, select: { url: true } });
  const have = new Set(existing.map((l) => l.url));
  const add = LINKS.filter((l) => !have.has(l.url));

  let bad = 0;
  for (const [k, v] of Object.entries(NEXT)) {
    const lim = LIMITS.get(k);
    if (lim && typeof v === "string") {
      const over = v.length > lim;
      console.log(`  ${k}: ${v.length}/${lim}${over ? `  OVER BY ${v.length - lim}` : ""}`);
      if (over) bad++;
    }
  }
  for (const l of add) {
    console.log(`  link label: ${l.label.length}/${LINK_LABEL_MAX}`);
    if (l.label.length > LINK_LABEL_MAX) bad++;
  }
  if (bad) throw new Error(`${bad} limit violation(s)`);

  console.log(`\n${SLUG}`);
  console.log(`  verification : ${cur.verification} -> ${NEXT.verification}`);
  console.log(`  significance : ${cur.significance} -> ${NEXT.significance}`);
  console.log(`  resolution   : ${cur.resolution} (unchanged, and now vindicated by Bloom)`);
  console.log(`  sourceUrl    : -> ${NEXT.sourceUrl}`);
  console.log(`  +${add.length} links (${LINKS.length - add.length} already present)`);

  if (!APPLY) { console.log("\nDRY RUN - pass --apply to write"); return; }

  const n = existing.length;
  await prisma.$transaction([
    prisma.problem.update({
      where: { id: cur.id },
      data: { ...NEXT, links: { create: add.map((l, i) => ({ ...l, position: n + i })) } } as never,
    }),
    prisma.problemActivity.create({
      data: {
        problemId: cur.id, userId: curator.id, userName: curator.pseudonym,
        type: "updated", field: "Verification", oldValue: cur.verification, newValue: NEXT.verification as string,
      },
    }),
  ]);
  console.log("\nAPPLIED");
}

main().finally(() => prisma.$disconnect());
