// Publish the scl / one-relator counterexample, with the verification tier
// corrected down and a second AI system added. 30 Aug 2026.
//
// Source verified: arXiv:2608.21465v1 [math.GR], 21 Aug 2026, Artem Semidetnov,
// sole author - and the submitter's address and the repo owner (s3midetnov) both
// match, so this is an author submitting his own work. Abstract states exactly
// the entry's claim. Not a duplicate.
//
// posedBy Heuer and Löh / 2019 confirmed: their "Simplicial volume of one-relator
// groups and stable commutator length" first appeared on arXiv 6 Nov 2019 and was
// published in AGT 22 (2022). The paper cites it as [4] and attributes the
// question to them in the abstract and again in section 1.
//
// CHECKED HERE, independently of the author's code:
//   Both r = aabABabABBAbaabABBAb and r' = aabABabABabABBAbaBAb have exponent sum
//   zero in BOTH generators, so both genuinely lie in the commutator subgroup
//   F' = [F_2,F_2] - which is a hypothesis of the Heuer-Löh question, not a
//   detail. Both are cyclically reduced, both length 20, and they are distinct.
//   The words match the arXiv abstract character for character.
//
// VERIFICATION lean-verified -> UNREVIEWED. This is the substantive change.
//
// The theorem has two halves: the two one-relator groups are ISOMORPHIC, and
// their relators have DIFFERENT scl. Only the first is formalised. The Lean
// file's own docstring says so outright:
//
//   "**Theorem 1.** The one-relator groups ... are isomorphic ...
//    (The paper computes `scl r = 1 ≠ 1/2 = scl r'` with `scallop`; see `scl/`.)"
//
// So the half that makes it a counterexample - that scl differs - is a scallop
// computation, not a machine-checked proof. lean-verified means the whole result
// is kernel-checked end to end AND the formal statement independently anchored;
// neither holds. Nothing here is anchored either: it is the author's own repo,
// with no tracker acceptance and no third-party audit of the correspondence.
//
// What the Lean DOES establish is real and the note credits it: one file, 282
// lines, no sorry, no admit, no native_decide and no declared axiom, building
// Phi and Psi explicitly and proving they compose to the identity both ways, so
// the isomorphism is constructive rather than asserted. Not built here - no Lean
// toolchain on this machine, and it pins v4.28.0.
//
// The scl half was NOT reproduced here either. It is reproducible in principle:
// scl/setup_scallop.sh fetches and patches Alden Walker's scallop and
// compute_scl.py rechecks every value the paper quotes, exiting non-zero on any
// disagreement. It needs a C++11 compiler plus GLPK and GMP, none of which exist
// on this machine, and installing a toolchain to check one number is not
// proportionate. Recorded as not done rather than glossed.
//
// Worth crediting: r and r' are not hardcoded anywhere. They are parsed from a
// single words.tex that the paper \input{}s, the Lean embeds and the scripts
// read, "so the three cannot silently drift apart". That is a real anti-drift
// measure and rarer than it should be.
//
// ai-co-developed CONFIRMED, and the submitter had it right. The formal AI use
// statement is weak - "assisted in designing and orchestrating the computational
// search" - and on that sentence alone this would be ai-assisted, since building
// the search tooling is the assisted tier almost verbatim. But section 4 of the
// same paper says plainly: "Claude Desktop with Opus 5 DESIGNED AND ORCHESTRATED
// an exhaustive search through Aut(F_2)-orbits of words of length at most 20."
// The human formulated the target; the model designed and ran the search that
// solved it. That is the co-developed definition.
//
// SECOND AI SYSTEM ADDED, which the submission omitted. The same paragraph:
// "contains a Lean formalisation of the six identities used above, produced with
// the assistance of Harmonic's Aristotle [1]." Aristotle produced the very
// artifact the verification tier turns on, so leaving it out of the model field
// understates the AI involvement in the one place a reader would look.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const SLUG = "the-stable-commutator-length-of-a-relator-is-not-a-one-relator-group-invariant";
const LINK_LABEL_MAX = 120;

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const NEXT: Record<string, unknown> = {
  verification: "unreviewed",
  model: "Claude Opus 5; Harmonic Aristotle (Lean formalisation)",
  modelMaker: "Anthropic; Harmonic",
  significance: 18,
  aiRole:
    "Two systems, and the paper is more specific in its body than in its formal statement. The AI use statement reads only: \"Claude Desktop with Opus 5 assisted in designing and orchestrating the computational search for candidate counterexamples.\" Section 4 puts it more strongly: \"Claude Desktop with Opus~5 designed and orchestrated an exhaustive search through $\\operatorname{Aut}(F_2)$-orbits of words of length at most 20.\" Candidates were then filtered by first homology of low-index subgroups, Alexander polynomials and homomorphism counts to small finite groups, with explicit isomorphisms constructed for those the invariants did not separate.\n\nCo-developed rather than assisted on the strength of the second sentence: the author formulated the target - pairs in different $\\operatorname{Aut}(F_2)$-orbits whose one-relator groups are nonetheless isomorphic, which is exactly the configuration that leaves scl unconstrained - and the model designed and ran the search that found one.\n\nA second system appears in the same paragraph and is recorded here because the submission omitted it: the Lean formalisation of the six identities \"produced with the assistance of Harmonic's Aristotle\". That is the artifact this entry's verification rests on.",
  verificationNote:
    "Unreviewed, lowered from Lean-verified on inspection. A labelling correction, not a doubt about the mathematics.\n\nThe theorem has two halves - the groups are isomorphic, and the relators have different scl - and only the first is formalised. The Lean file says so itself: \"(The paper computes scl r = 1 ≠ 1/2 = scl r' with scallop; see scl/.)\" So the half that makes this a counterexample is a computation, not a machine-checked proof, and Lean-verified additionally requires the formal statement to be independently anchored, which an author's own repository is not.\n\nWhat the Lean does establish, and it is not nothing: one file, 282 lines, with no sorry, no admit, no native_decide and no declared axiom. It builds the two homomorphisms explicitly and proves they compose to the identity in both directions, so the isomorphism is constructed rather than asserted. Not built here - no Lean toolchain on this machine, and it pins v4.28.0.\n\nThe scl values were not reproduced here either. They are reproducible in principle: scl/setup_scallop.sh fetches and patches Alden Walker's scallop, and compute_scl.py rechecks every value the paper quotes against it, exiting non-zero on disagreement. It needs a C++11 compiler with GLPK and GMP, none present on this machine.\n\nChecked independently on 30 August 2026: both relators have exponent sum zero in both generators, so both do lie in $F'$ as the question requires; both are cyclically reduced, length 20, distinct, and match the abstract exactly.",
  resultNote:
    "A negative answer to Heuer and Löh's question: the isomorphism type of a one-relator group $\\langle S \\mid r\\rangle$ does not determine $\\mathrm{scl}_S(r)$. The witnesses are $r=\\mathtt{aabABabABBAbaabABBAb}$ and $r'=\\mathtt{aabABabABabABBAbaBAb}$, both length 20 in $F_2'$, with $\\langle a,b \\mid r\\rangle\\cong\\langle a,b\\mid r'\\rangle$ but $\\mathrm{scl}(r)=1$ against $\\mathrm{scl}(r')=1/2$.\n\nThe mechanism is what made the search finite: $\\mathrm{scl}$ is an $\\operatorname{Aut}(F_2)$-invariant, so a pair in *different* orbits whose one-relator groups happen to be isomorphic has its two scl values unconstrained by each other. The search was for that configuration among words of length at most 20.\n\nScope: it settles the question as posed and nothing wider. It does not say which invariants do determine scl, and this is a single pair rather than a construction giving arbitrary gaps.",
  ageNote:
    "Posed by Nicolaus Heuer and Clara Löh in \"Simplicial volume of one-relator groups and stable commutator length\", arXiv 6 Nov 2019, in Algebr. Geom. Topol. 22 (2022). The paper thanks both \"for their attention to this solution and for their helpful correspondence\", so the people who asked have seen the answer. Not peer review, and it moves no tier, but more attention than most preprints here get.",
  significanceNote:
    "A clean negative answer to a specific question by two named authors, in geometric group theory, settled by an explicit pair of 20-letter words. Its virtue is that it is completely checkable in principle - the witnesses are written down and both halves are reproducible - and its limit is that it is one question rather than a programme: it neither identifies what does determine scl nor produces a family. Placed at 18, just below the neighbouring one-relator commutator-relators entry at 20, which settles a broader statement.",
};

const LINKS = [
  {
    label: "Lean formalisation, search pipeline and scl recomputation",
    url: "https://github.com/s3midetnov/scl-one-relator",
    kind: "code",
  },
  {
    label: "Heuer and Löh, where the question is posed",
    url: "https://arxiv.org/abs/1911.02470",
    kind: "problem-record",
  },
];

const DECISION = `One tier corrected, one kept that I nearly lowered, an omission filled.

Verification goes from Lean-verified to Unreviewed. The theorem has two halves - the groups are isomorphic, the relators have different scl - and only the first is formalised. Your Lean docstring says it: "(The paper computes scl r = 1 != 1/2 = scl r' with scallop; see scl/.)" So the half making this a counterexample is a computation, not a kernel-checked proof. Lean-verified also needs the statement independently anchored, which an author's own repo is not.

A labelling change, not a doubt. The note credits the Lean: 282 lines, no sorry, admit, native_decide or declared axiom, with Phi and Psi built explicitly and proved to compose to the identity both ways - the isomorphism is constructed, not asserted. I could not build it, nor reproduce the scl values (scallop needs C++11 with GLPK and GMP). Both recorded.

AI co-developed stays, though on your formal AI use statement alone I would have moved it DOWN - "assisted in designing and orchestrating the computational search" is the assisted tier almost verbatim. Section 4 saves it: "Claude Desktop with Opus 5 designed and orchestrated an exhaustive search". You set the target, the model designed and ran the search that found it. Worth promoting that sentence into the AI use statement, which understates what the paper says three pages earlier.

The omission: Harmonic's Aristotle produced the Lean formalisation of the six identities, per your section 4, but the model field named only Claude Opus 5. Since the Lean is what the tier turns on, that understates AI involvement where a reader looks. Both now recorded.

Checked independently: both relators have exponent sum zero in both generators, so both do lie in F' as required; both cyclically reduced, length 20, distinct, matching the abstract. Parsing them from one words.tex that paper, Lean and scripts all read is more care than most show.

Also filled: result and age notes, significance 18, links.`;

async function main() {
  const cur = await prisma.problem.findUnique({
    where: { slug: SLUG },
    select: { id: true, status: true, submittedById: true, verification: true, aiContribution: true, model: true, significance: true, resolution: true },
  });
  if (!cur) throw new Error("submission not found");
  if (cur.status !== "pending") throw new Error(`status is ${cur.status}`);

  const curator = await prisma.user.findFirst({ where: { pseudonym: "Rasmus Lindahl" }, select: { id: true, pseudonym: true } });
  if (!curator) throw new Error("curator not found");

  let bad = 0;
  for (const [k, v] of Object.entries(NEXT)) {
    const lim = LIMITS.get(k);
    if (lim && typeof v === "string") {
      const over = v.length > lim;
      console.log(`  ${k}: ${v.length}/${lim}${over ? `  OVER BY ${v.length - lim}` : ""}`);
      if (over) bad++;
    }
  }
  for (const l of LINKS) {
    console.log(`  link label: ${l.label.length}/${LINK_LABEL_MAX}`);
    if (l.label.length > LINK_LABEL_MAX) bad++;
  }
  console.log(`  decision: ${DECISION.length}/${MESSAGE_MAX}${DECISION.length > MESSAGE_MAX ? `  OVER BY ${DECISION.length - MESSAGE_MAX}` : ""}`);
  if (DECISION.length > MESSAGE_MAX) bad++;
  if (bad) throw new Error(`${bad} limit violation(s)`);

  console.log(`\n${SLUG}`);
  console.log(`  verification   : ${cur.verification} -> ${NEXT.verification}`);
  console.log(`  model          : ${cur.model} -> ${NEXT.model}`);
  console.log(`  aiContribution : ${cur.aiContribution} (unchanged)`);
  console.log(`  resolution     : ${cur.resolution} (unchanged)`);
  console.log(`  significance   : ${cur.significance} -> ${NEXT.significance}`);
  console.log(`  +${LINKS.length} links, status -> published`);

  if (!APPLY) { console.log("\nDRY RUN - pass --apply to write"); return; }

  const nLinks = await prisma.problemLink.count({ where: { problemId: cur.id } });
  await prisma.$transaction([
    prisma.problem.update({
      where: { id: cur.id },
      data: {
        ...NEXT, status: "published", reviewedAt: new Date(),
        reviewMessage: DECISION, reviewReason: "downgraded",
        links: { create: LINKS.map((l, i) => ({ ...l, position: nLinks + i })) },
      } as never,
    }),
    prisma.problemActivity.create({
      data: { problemId: cur.id, userId: curator.id, userName: curator.pseudonym, type: "approved" },
    }),
    prisma.directMessage.create({
      data: { userId: cur.submittedById!, senderId: curator.id, senderName: curator.pseudonym, kind: "decision", reason: "downgraded", body: DECISION, problemId: cur.id },
    }),
  ]);
  console.log("\nPUBLISHED");
}

main().finally(() => prisma.$disconnect());
