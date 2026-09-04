// Review of the eight submissions waiting on the morning of 4 September 2026.
// Five approvals, three holds. Every source was opened and read; every AI
// disclosure below is quoted from the paper or repository, not from the form.
//
// ---------------------------------------------------------------------------
// APPROVED
//
// 1. Anari's Bethe permanent conjecture (arXiv 2609.02017, Dong and Jain).
//    Title and abstract match the arXiv record verbatim. "Statement on AI use"
//    at the end of the paper: the authors had a strategy for a weaker bound,
//    "ChatGPT 5.6 Sol Pro was able to develop a version of this strategy into a
//    proof with f(g) = Theta(g / log g)", and later Sol Ultra sessions "led to
//    the development of the present proof". Codex for the manuscript. Tier
//    co-developed, as filed: the strategy was the authors', the model carried
//    it to the optimal bound. Posed year left blank: Anari's conjecture comes
//    from the Anari-Rezaei line of work and neither the paper nor the form
//    dates it; ageNote says so rather than guessing.
//
// 3. Improved maximal prime-gap lower bound (OpenAI PDF, "GPT 6 Astra").
//    8-page PDF, no human author, first line of the proof section: "The proof
//    is due to GPT 6 Astra". Lean repository openai/LongGapsBetweenPrimes at
//    03a1190d: formalization.yaml reports the three main declarations at
//    sorry_count 0 on propext / Classical.choice / Quot.sound; comparator.json
//    checks long_prime_gaps against Challenge.lean. I read Challenge.lean:
//    it states, for some c > 0 and all large X, a consecutive prime gap below
//    X exceeding c * log X * (log_2 X)^2 * log_4 X / (log_3 X)^2, which is
//    exactly the claimed bound. The site's verify-lean workflow was dispatched
//    on that commit (run 33843996072); if it passes before this is applied the
//    tier goes to site-confirmed, otherwise it stays at the claimed
//    lean-verified. Extraordinary-claims rule: satisfied by the formal proof,
//    modulo the statement fidelity I checked by hand. Significance level with
//    the tilted entry at 60, deliberately: same problem (Erdos #4), strictly
//    stronger bound, and erdosproblems.com already records the tilted step as
//    the state of the art this improves.
//
// 4. The proper hat-guessing number of K6 - e (Matthew Protti, GitHub commit
//    8f36d8c). Mirror of the K5 - e entry published yesterday, same author,
//    same disclosure format: STATUS.json claims HG_P(K6-e) = 10 with
//    "ADVERSARIAL_REVIEW_COMPLETED_CONVENTIONAL_PEER_REVIEW_PENDING", the
//    preprint derives the upper bound 6 + 5 - 1 = 10 from Adriaensen et al.'s
//    HG_P(G) <= n + chi(G) - 1 (Lemma 1.2 of arXiv 2603.04909, which I
//    checked), and constructs the ten-colour strategy. Approved at Candidate /
//    Unreviewed exactly as filed, significance 7 like its sibling.
//
// 7. Depth-1 distinctness for pseudorandom unitaries (arXiv 2609.03065, Raza,
//    Eisert, Fefferman). The paper's own words: the main results predate the
//    AI work "with the notable exception of Proposition III.5, which was
//    proposed by ChatGPT 5.6 Sol as a counter-example to authors' conjecture
//    that a negl(n)-distinct ensemble must be entangling". So the entry is
//    the counterexample, not the paper. Three edits follow from that: the
//    result is DISPROVED (the submitter asked exactly this question), the
//    method is a construction, and the tier is ai-discovered, because the
//    model produced the central object. Posed-by is the authors themselves;
//    it was a working conjecture, never published as open, so significance is
//    low and says why.
//
// 8. Conway's refinement conjecture for omnific integers (GitHub
//    gaearon/conway-refinement at 264445c9, Dan Abramov). Two Lean statements
//    of the conjecture, one over CombinatorialGames and one Mathlib-only, both
//    proved on the three standard axioms with a CI linter banning others;
//    comparator.json + Challenge.lean for Palomar. The README is unusually
//    candid: "It is still quite possible that one or both of these statements
//    do not correspond to Conway's conjecture in some small or big way".
//    Verify-lean dispatched (run 33843993855), same tier rule as entry 3.
//    Kept at Candidate as filed, because statement fidelity is the one thing
//    a kernel cannot check and no mathematician has yet.
//
// ---------------------------------------------------------------------------
// HELD (rejected with a hold message, under the extraordinary-claims rule)
//
// 2. Prime gaps at most 186 (GitHub openai/PrimeGaps186). The Lean development
//    is honest about itself - README: "The Lean results remain conditional on
//    three explicit input axioms" - and formalization.yaml lists them:
//    kloosterman3_bound, kloosterman2_correlation_bound,
//    physical_integral_bounds. So this is not a formal proof of DHL[40,2]; it
//    is a formal proof that three unformalised statements imply it. The
//    submitter's "lean-verified" would have been wrong on the ladder anyway
//    (lean-checked at most). What decides the hold: the mathematics it
//    formalises, "Improved Gaps Between Primes" by OpenAI, is cited in the
//    repository metadata and exists nowhere I can find - not on arXiv, not on
//    the OpenAI CDN, not in the repo. Bounded gaps 246 -> 186 would be the
//    first movement on the Polymath record since 2014. Held until the paper is
//    public and a named analytic number theorist has read it.
//
// 5. Catalan's constant is irrational (arXiv 2609.04176, Zhi-Wei Sun). A
//    160-year-old open problem, single author, and the paper's own account of
//    verification is: "The whole proof has passed the verification of Chatgpt
//    5.6 Solar." That is the textbook case for the rule. Not a judgement on
//    Sun, who is a real and prolific number theorist, or on the weights idea.
//
// 6. Smooth autonomous fast dynamo on T^3 (arXiv 2609.04153, Coti Zelati,
//    Sorella, Villringer). The submitter requested the hold themselves and
//    was right to: "This resolves the Fast Dynamo Conjecture of Zeldovich and
//    Sakharov", Arnold's Problem 1994-28, 69 pages, one day old. Strong
//    authors do not lift the rule; a named disinterested expert does. Two
//    notes for when it comes back: the tier should be co-developed, not
//    ai-discovered - the paper credits specific suggestions (the anisotropic
//    space, the Grubb boundary calculus) and says "The resulting document is
//    entirely human written" - and it should be related to the two existing
//    dynamo variants.
//
// Dry run by default. Pass --apply to write.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const LINK_LABEL_MAX = 120;

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

type LinkIn = { label: string; url: string; kind: string };
type Decision = {
  slug: string;
  action: "approve" | "reject";
  reason: string;
  message: string;
  edits?: Record<string, unknown>;
  links?: LinkIn[];
};

const DECISIONS: Decision[] = [
  {
    slug: "anari-s-bethe-permanent-conjecture",
    action: "approve",
    reason: "edited",
    edits: {
      significance: 22,
      significanceNote:
        "A named conjecture of Nima Anari, settled at the optimal order rather than improved: the girth-dependent factor 2^(2n/g) is attained by disjoint unions of g-cycles, so nothing is left. The Bethe approximation is a real tool in approximate counting, and the Gurvits and Anari-Rezaei bounds it refines are standard. Still one inequality in one corner of the field. Just below the PSD-permanent approximation entry at 28, which reaches a wider algorithms audience; above the Kim-Roush permanent entry at 20, which answers a narrower question.",
      ageNote:
        "No posed year. The conjecture is Anari's and arises from the Anari-Rezaei analysis of the Bethe permanent, but neither the paper nor the form dates it and guessing would be worse than a blank.",
      verificationNote:
        "Unreviewed. A 21-page preprint two days old, no peer review, no formal verification. The optimality half is checkable by anyone: the paper exhibits the equality cases explicitly. The upper-bound argument is conventional and the authors take responsibility for it. Nobody independent has read it on the record.",
    },
    message:
      "Published. Title, abstract and statement match arXiv 2609.02017 exactly, and the disclosure is a dedicated \"Statement on AI use\" at the end of the paper that says what your AI-role field says: your strategy for a weaker bound, carried by ChatGPT 5.6 Sol Pro to a proof with a logarithmic loss, then by Sol Ultra to the optimal one. Co-developed is the right tier for that and I kept it.\n\nOne thing left blank on purpose: the posed year. The conjecture is Anari's, but neither the paper nor your form dates it, and the entry carries a note saying so rather than a guess. If you know the year, edit it in.\n\nAdded the curator-only fields: significance 22 with its note, and a verification note.",
  },
  {
    slug: "prime-gaps-at-most-186",
    action: "reject",
    reason: "held",
    message:
      "Held rather than published, under the extraordinary-claims rule. Not a judgement on the work, which nobody here is placed to make.\n\nThe repository is admirably honest about what it is. Its README: \"The Lean results remain conditional on three explicit input axioms\", and formalization.yaml names them: a rank-three hyper-Kloosterman bound, a rank-two Kloosterman correlation bound, and the package of numerical inequalities. So the kernel has checked that those three statements imply DHL[40,2] and the bound 186. It has not checked DHL[40,2]. On this site's ladder that is lean-checked at most, not lean-verified, and your own submitter note already said as much.\n\nWhat decides the hold is the mathematics behind it. The repository says it formalises \"Improved Gaps Between Primes\" by OpenAI. I cannot find that paper anywhere: not on arXiv, not on the OpenAI CDN, not in the repository, which carries only the numerics note. Bounded gaps going from 246 to 186 would be the first movement on the Polymath record since 2014, and the argument for it is not public.\n\nWhen the paper appears and a named analytic number theorist has read it, resubmit and it will be reviewed at whatever tier it has earned. If the three axioms are also discharged in Lean, that tier is a high one. Thank you for filing it with the caveats in place; that made this a clean decision rather than a correction.",
  },
  {
    slug: "improved-maximal-prime-gap-lower-bound",
    action: "approve",
    reason: "edited",
    edits: {
      posedBy: "Paul Erdős",
      yearPosed: 1955,
      significance: 60,
      significanceNote:
        "Erdős Problem #4, the quantitative long-gaps question, worked on since Rankin in 1938 and carrying Erdős's largest prize. Strictly stronger than the tilted residue-class result the site records at 60, and than the Ford-Green-Konyagin-Maynard-Tao Annals bound before it, by the unbounded factor log_2 X (log_4 X)^2 / (log_3 X)^2. Level with the tilted entry deliberately: same problem, second step on it in a fortnight, and a problem does not become more important because a stronger step followed. The prize condition, a power (log X)^(1+c), is still far off, which is why this is partial.",
      verificationNote:
        "Lean-verified, as claimed and as checked here in outline. The repository openai/LongGapsBetweenPrimes at commit 03a1190d reports the three main declarations at zero sorry on the three standard axioms, with a comparator configuration checking long_prime_gaps against Challenge.lean. I read Challenge.lean: it asserts, for some c > 0 and all sufficiently large X, a consecutive prime gap below X exceeding c times log X (log_2 X)^2 log_4 X / (log_3 X)^2, which is the claimed bound and not a weaker cousin of it. The site's own build of that commit has been dispatched; this note is updated if it passes. No human author and no named mathematician has commented yet.",
    },
    links: [
      { label: "Lean formalisation, openai/LongGapsBetweenPrimes", url: "https://github.com/openai/LongGapsBetweenPrimes", kind: "lean-proof" },
      { label: "Challenge.lean, the statement the comparator checks", url: "https://github.com/openai/LongGapsBetweenPrimes/blob/master/Challenge.lean", kind: "lean-statement" },
      { label: "Abridged chain of thought", url: "https://cdn.openai.com/pdf/51126fac-1b68-4128-9666-c908bcc16033/long_gaps_abridged_cot.pdf", kind: "transcript" },
      { label: "Erdős Problem #4", url: "https://www.erdosproblems.com/4", kind: "problem-record" },
      { label: "The tilted residue-class construction this improves", url: "https://vibemathed.com/problem/tilted-residue-class-construction-for-long-prime-free-intervals", kind: "other" },
    ],
    message:
      "Published at Lean-verified and Partial. This one I checked further than most: the PDF says plainly \"The proof is due to GPT 6 Astra\", and the Lean repository it names reports all three main declarations at zero sorry on the three standard axioms. Then I read Challenge.lean itself, because a kernel-checked proof of the wrong statement is worth nothing, and it says what the paper says: for some c > 0 and all large X, a gap below X exceeding c log X (log_2 X)^2 log_4 X / (log_3 X)^2. That is the bound, not a weaker relative.\n\nThe site's own Lean build of that commit is running now. If it passes the entry moves to Site-confirmed.\n\nYour note relating this to the tilted residue-class entry is correct and useful and is now a link on the entry. Significance is set level with that entry at 60, deliberately: same problem, strictly stronger bound, but a second step on a problem does not make the problem more important than the first step did. Added Erdős as poser with 1955, matching how the site records Problem #4, plus links to the Lean repo, the statement file, the chain of thought and the Erdős record.",
  },
  {
    slug: "the-proper-hat-guessing-number-of-k-6-e",
    action: "approve",
    reason: "as-submitted",
    edits: {
      significance: 7,
      significanceNote:
        "One value of one graph parameter, from the question Adriaensen et al. posed this year, where their bound HG_P(G) <= n + chi(G) - 1 already gave 10 as the ceiling. Narrow by construction and recent. Tied at 7 with the K5 - e entry it extends, which is the same author, the same method and the same disclosure format one vertex smaller.",
    },
    message:
      "Published, at Candidate and Unreviewed exactly as you set them, at significance 7 level with your K5 - e entry.\n\nWhat I checked: the frozen commit 8f36d8c is the one you cited and its STATUS.json claims HG_P(K6-e) = 10 with review status ADVERSARIAL_REVIEW_COMPLETED_CONVENTIONAL_PEER_REVIEW_PENDING, which is the honest label. The upper bound in your preprint follows from Lemma 1.2 of Adriaensen et al., HG_P(G) <= n + chi(G) - 1, which I confirmed in arXiv 2603.04909 gives 6 + 5 - 1 = 10. The construction is yours to be checked by others.\n\nSame caveat as last time: your verifier is dependency-free Python, and running it is what Site-confirmed means here, but there is still no sandboxed Python workflow on this site. When there is, both of your entries are first in line.",
  },
  {
    slug: "catalan-s-constant-is-irrational",
    action: "reject",
    reason: "held",
    message:
      "Held rather than published, under the extraordinary-claims rule in the methodology. Not a judgement on the mathematics, or on the author.\n\nThe irrationality of Catalan's constant has been open since the 1860s and is one of the named problems of the field. The paper is single-author, one day old, and its own account of checking is the acknowledgement: \"The whole proof has passed the verification of Chatgpt 5.6 Solar.\" A model's approval of a proof it helped write is not verification in the sense this site needs, and the paper offers nothing else yet: no independent reader, no formalisation, no acceptance.\n\nZhi-Wei Sun is a real and prolific number theorist and the weighted-tails idea may well be the right one. None of that changes what the rule asks for, which is a named expert with no stake in it saying they have checked the argument, or a formal proof. Either of those and this comes straight in, at a very high significance. If you see one before I do, resubmit with the link.",
  },
  {
    slug: "smooth-autonomous-fast-dynamo-on-the-three-torus",
    action: "reject",
    reason: "held",
    message:
      "Held, exactly as you asked, and you were right to ask. The abstract says \"This resolves the Fast Dynamo Conjecture of Zeldovich and Sakharov\", the introduction places it as Arnold's Problem 1994-28, the preprint is 69 pages and one day old. That is the shape the extraordinary-claims rule exists for, and three strong authors do not lift it; a named disinterested expert does.\n\nYour submission was the best-prepared of the day: the hold requested up front, the two related entries named, the posed year left blank with the reason. Two notes for when it comes back so the resubmission is quick:\n\nThe tier. You filed AI-discovered. The paper's AI statement credits specific contributions - ChatGPT 5.5 Pro proposing the full derivative cocycle and the microlocal symbol for the space X, ChatGPT 5.6 Sol suggesting Grubb's boundary calculus and helping with the section-return computation - and then says \"The resulting document is entirely human written\" and that all AI suggestions were independently verified. That is co-developed: named essential steps from the model inside a human-led proof.\n\nThe relations. When it publishes it should be related to both the Lipschitz autonomous and the smooth random entries, which sit at 30 as complementary variants; this would be the result they were variants of.\n\nThank you for the care. It made this a two-minute decision.",
  },
  {
    slug: "depth-1-distinctness-for-pseudorandom-unitaries",
    action: "approve",
    reason: "edited",
    edits: {
      solveType: "disproved",
      resolutionMethod: "construction",
      aiContribution: "ai-discovered",
      posedBy: "Raza, Eisert and Fefferman (the authors' own working conjecture)",
      significance: 6,
      significanceNote:
        "A counterexample to a conjecture the authors held while writing the paper, never published as open, in a technical corner of quantum pseudorandomness. The consequence is real for the PFC construction - a depth-1 layer replaces a depth-log n design - but the question it answers existed for a few months inside one research group. Just below the hat-guessing entries at 7, which at least settle a question that was posed in print.",
      ageNote:
        "No posed year. The conjecture was the authors' own working hypothesis during a project begun in early 2025 and was refuted before the paper was written, so it was never open in public and dating it would be artificial.",
    },
    message:
      "Published, with the framing changed in the direction your own note pointed. You asked whether this is a proof or a disproof: the paper answers it. Its AI statement says the main results predate the AI work \"with the notable exception of Proposition III.5, which was proposed by ChatGPT 5.6 Sol as a counter-example to authors' conjecture that a negl(n)-distinct ensemble must be entangling.\" So the entry is that counterexample, and three fields follow from it. The result is disproved, not proved; the method is a construction; and the tier is AI-discovered rather than co-developed, because the model produced the central object outright. Posed-by is the authors themselves, since it was their working conjecture.\n\nThat also fixes the significance low, at 6: a real consequence for the PFC construction, but the conjecture it refutes lived inside one group for a few months and was never posed in print. The posed year is blank with a note explaining why.\n\nGood catch on the ambiguity. Most submitters would have picked one and moved on.",
  },
  {
    slug: "conway-s-refinement-conjecture-for-omnific-integers",
    action: "approve",
    reason: "edited",
    edits: {
      significance: 28,
      significanceNote:
        "Conway posed it in On Numbers and Games in 1976 and it stood for fifty years, with partial progress by L'Innocente and Mantova. Well known to everyone who works with surreal numbers and to few others, which puts it in the same band as Crouzeix and the Lonely Runner at 30, field-famous problems with a long literature that never crossed over. A touch below them because the surreal-number community is smaller. Above the Kawauchi mod-4 entry at 20, a named conjecture with a thinner trail.",
      verificationNote:
        "Lean-verified, as claimed and as checked here in outline. Two formulations of the conjecture, one over the CombinatorialGames Surreal type and one inlined over Mathlib alone, each proved with #print axioms reporting only propext, Classical.choice and Quot.sound, and a CI linter that fails the build on any other axiom. The one thing a kernel cannot check is whether the Lean statement is Conway's, and the author says so himself: \"It is still quite possible that one or both of these statements do not correspond to Conway's conjecture in some small or big way.\" The definition used - an omnific integer is a cut x = {x - 1 | x + 1} - is Conway's own, and the statement is short enough to read in a minute. No mathematician has put their name to that reading yet, which is why this is Candidate. The site's own build of commit 264445c9 has been dispatched; this note is updated if it passes.",
    },
    links: [
      { label: "CombinatorialGames statement of the conjecture", url: "https://github.com/gaearon/conway-refinement/blob/main/ConwayRefinement/Standalone/CombinatorialGames/ConwayRefinement.lean", kind: "lean-statement" },
      { label: "Proof of that statement", url: "https://github.com/gaearon/conway-refinement/blob/main/ConwayRefinement/Standalone/CombinatorialGames/ConwayRefinementProof.lean", kind: "lean-proof" },
      { label: "Mathlib-only statement, no CombinatorialGames dependency", url: "https://github.com/gaearon/conway-refinement/blob/main/ConwayRefinement/Standalone/Mathlib/InlineConwayRefinement.lean", kind: "lean-statement" },
      { label: "Palomar provenance and the comparator statement", url: "https://github.com/gaearon/conway-refinement/blob/main/PALOMAR-PROVENANCE.md", kind: "palomar" },
    ],
    message:
      "Published at Lean-verified and Candidate, as filed. The repository is the best-documented Lean submission this site has had: two independent statements of the conjecture, one over CombinatorialGames and one inlined over Mathlib so a reader need not trust the Surreal type, both proved on the three standard axioms with CI that fails on any other, a Palomar challenge file, and a proof guide. And the README says the one true thing most such repositories do not: that Lean cannot tell you whether the statement is Conway's.\n\nThat is why it stays at Candidate rather than Resolved. The definition of an omnific integer used is Conway's own cut x = {x - 1 | x + 1} and the statement is a few lines, so a surreal-number specialist can settle the fidelity question in an afternoon. When one does on the record, this becomes Resolved.\n\nThe site's own Lean build of commit 264445c9 is running; if it passes the entry moves to Site-confirmed. Added significance 28 with its note, a verification note, and links to both statement files, the proof and the Palomar provenance.",
  },
];

async function main() {
  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });
  if (!curator) throw new Error("curator not found");

  let bad = 0;
  for (const d of DECISIONS) {
    const cur = await prisma.problem.findUnique({
      where: { slug: d.slug },
      select: { id: true, status: true, name: true },
    });
    if (!cur) throw new Error(`not found: ${d.slug}`);
    if (cur.status !== "pending") throw new Error(`${d.slug} is ${cur.status}, not pending`);

    const verb = d.action === "reject" ? (d.reason === "duplicate" ? "DUPLICATE" : "HOLD") : "APPROVE";
    console.log(`\n${verb.padEnd(9)} ${cur.name.slice(0, 60)}`);
    console.log(`  message : ${d.message.length}/${MESSAGE_MAX}${d.message.length > MESSAGE_MAX ? "  OVER" : ""}`);
    if (d.message.length > MESSAGE_MAX) bad++;

    for (const [k, v] of Object.entries(d.edits ?? {})) {
      const lim = LIMITS.get(k);
      if (typeof v === "string" && lim) {
        const over = v.length > lim;
        console.log(`  ${k.padEnd(17)}: ${v.length}/${lim}${over ? `  OVER BY ${v.length - lim}` : ""}`);
        if (over) bad++;
      } else {
        console.log(`  ${k.padEnd(17)}: ${JSON.stringify(v).slice(0, 60)}`);
      }
    }
    for (const l of d.links ?? []) {
      console.log(`  link             : ${l.label.length}/${LINK_LABEL_MAX}  ${l.kind}`);
      if (l.label.length > LINK_LABEL_MAX) bad++;
    }
  }
  if (bad) throw new Error(`${bad} limit violation(s)`);

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  for (const d of DECISIONS) {
    const cur = await prisma.problem.findUnique({
      where: { slug: d.slug },
      select: { id: true, submittedById: true, _count: { select: { links: true } } },
    });
    if (!cur) throw new Error(`vanished: ${d.slug}`);
    const n = cur._count.links;

    await prisma.$transaction([
      prisma.problem.update({
        where: { id: cur.id },
        data: {
          ...(d.edits ?? {}),
          ...(d.links?.length
            ? { links: { create: d.links.map((l, i) => ({ ...l, position: n + i })) } }
            : {}),
          status: d.action === "approve" ? "published" : "rejected",
          reviewedAt: new Date(),
          reviewMessage: d.message,
          reviewReason: d.reason,
        } as never,
      }),
      prisma.problemActivity.create({
        data: {
          problemId: cur.id,
          userId: curator.id,
          userName: curator.pseudonym,
          type: d.action === "approve" ? "approved" : "rejected",
        },
      }),
      prisma.directMessage.create({
        data: {
          userId: cur.submittedById!,
          senderId: curator.id,
          senderName: curator.pseudonym,
          kind: "decision",
          reason: d.reason,
          body: d.message.slice(0, MESSAGE_MAX),
          problemId: cur.id,
        },
      }),
    ]);
    console.log(`applied: ${d.action} ${d.slug}`);
  }

  console.log("\nAPPLIED. Public caches lag until the next deploy; entry pages are right immediately.");
}

main().finally(() => prisma.$disconnect());
