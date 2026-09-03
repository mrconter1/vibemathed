// Review of the two submissions that arrived on 3 September after the morning
// queue was cleared. Both from the same submitter, both arXiv preprints, both
// approved with curator edits.
//
// ---------------------------------------------------------------------------
// 1. Rank-Two Poisson counterexample (arXiv 2608.23777, Christopher D. Long)
//
// Source checked against the arXiv API rather than the submission: the title,
// the abstract and the statement field match verbatim, so the submitter
// transcribed rather than paraphrased.
//
// The AI attribution is real and is in the paper, not the abstract page. The
// section "AI provenance, use, and author responsibility" says the
// four-variable construction "including the Hamiltonian correction H, was
// produced during an interactive research session with ChatGPT 5.6 Sol", that
// the model also did the differential-form organisation, symbolic
// verification, literature checking and drafting, and that Claude Fable 5
// supplied independent algebraic audits afterwards. The human author takes
// full responsibility. The submitted aiRole tracks that closely.
//
// UPGRADED the tier from ai-co-developed to ai-discovered. The tier definition
// is "the model produced the central proof or object", and the central object
// here IS the four-variable construction, which the paper says the model
// produced. The three-variable core it descends from is Alpoge/Fable and is
// already in the catalog as `jacobian-conjecture` (ai-discovered, 65).
//
// posedBy and yearPosed stay NULL, deliberately. PC(n) is the Poisson
// formulation in the Adjamagbo-van den Essen equivalence (the paper cites
// [1, Section 1] for the indexing convention), and its content descends from
// Keller 1939 via the Jacobian conjecture. Adjamagbo and van den Essen proved
// an equivalence; they did not pose PC as an open problem, and writing them in
// would be the same mistake as "posed by Justin Leder" on the percolation
// entry this morning. Blank is honest; ageNote says why.
//
// ---------------------------------------------------------------------------
// 2. Logarithmic basis number (arXiv 2609.02080, Kolja Knauer)
//
// Source likewise verified verbatim. The AI statement is its own numbered
// section 7, "Statement of AI use": the proof "was found with the help of
// OpenAI's GPT-5.6 Sol", also used for strategy, literature and drafting, with
// the author independently checking and taking full responsibility. That is
// co-developed, not discovered - "with the help of" is doing real hedging and
// the submitter read it the same way. Tier kept.
//
// CORRECTED yearPosed 2026 -> 2024. The submitter took the date from Knauer's
// bibliography, which lists Bazargani et al. as (2026), the journal version.
// The question is asked in Section 5 of arXiv 2412.18595, posted 24 December
// 2024. The site's age-at-resolution measures first public posing, so 2024 is
// the right year; this moves the entry onto the scatter at ~1.7 years rather
// than ~0.
//
// SET resolutionMethod to "argument" (was null): weighted cycle-basis bounds,
// LP duality and dependent randomized rounding is an argument, not a
// construction or a computation.
//
// ---------------------------------------------------------------------------
// Significance is curator-only, so both needed one, placed against named
// neighbours already in the catalog.
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
    slug: "an-explicit-counterexample-to-the-rank-two-poisson-conjecture",
    action: "approve",
    reason: "edited",
    edits: {
      aiContribution: "ai-discovered",
      significance: 35,
      significanceNote:
        "The Poisson, Jacobian and Dixmier conjectures are equivalent, so once the Jacobian conjecture fell in July 2026 the others followed in principle. What is new is explicit and minimal: the counterexample descends to two canonical pairs, the smallest rank where the statement can fail, and the appendix kills the fourth Dixmier conjecture outright. Well below the Jacobian conjecture at 65, the result this is a consequence of and on Smale's list. Above the five-variable Hessian counterexample at 30: Dixmier is the more famous name, and this covers every rank at least two rather than one dimension.",
      renownLangs: 4,
      renownNote:
        "The Dixmier conjecture has Wikipedia articles in English, German, French and Swedish. The Poisson formulation has none of its own; it is known through that equivalence.",
      verificationNote:
        "Unreviewed. A preprint with no peer review and no proof-assistant verification. What it does have is unusual for the tier: every Poisson identity is verified directly in the paper, there is an exact symbolic audit of the polynomial identities, and the noninjectivity is exhibited as a fiber of exactly three explicit points. All of that is four polynomials in four variables, so any reader with a computer algebra system can check the whole claim in minutes. Claude Fable 5 supplied an independent algebraic audit, which is not independent human expert review. Nobody has done that on the record.",
      ageNote:
        "No posed year, deliberately. PC(n) is the Poisson-algebra formulation used by Adjamagbo and van den Essen in their equivalence theorem rather than a conjecture either of them posed, and its content reaches back to Keller's 1939 Jacobian conjecture through that equivalence. Dating it to any one of those would be a guess, so the entry stays off the age chart.",
    },
    links: [
      {
        label: "Dixmier conjecture",
        url: "https://en.wikipedia.org/wiki/Dixmier_conjecture",
        kind: "wikipedia",
      },
    ],
    message:
      "Published, with the AI tier raised. You set it to co-developed; I moved it to AI-discovered, which is the tier for the model producing the central proof or object. The paper's provenance section says the four-variable construction including the Hamiltonian correction was produced during an interactive session with ChatGPT 5.6 Sol, and that construction is the whole result. The three-variable core it descends from is Alpoge and Fable, and is already here as the Jacobian conjecture entry.\n\nI checked the source rather than the form. Title, abstract and your statement field match arXiv 2608.23777 word for word, and the AI credit is a dedicated section well down the paper rather than anything the abstract page shows. Your submitter note on the lineage from the July Jacobian counterexample is accurate and is why this was quick to review.\n\nOne thing I left blank on purpose: posed-by and posed-year. PC(n) is the Poisson formulation in the Adjamagbo-van den Essen equivalence rather than a problem either of them posed, and its content goes back to Keller in 1939 through that equivalence. Naming any of them as the poser would be a guess, so the entry carries a note saying so and stays off the age chart.\n\nAdded the curator-only fields: significance 35 with its note, a renown count for the Dixmier articles, and a Wikipedia link. The verification note now also says the thing that makes this checkable, which is that it is four polynomials in four variables and any reader with a CAS can confirm the identities.",
  },
  {
    slug: "logarithmic-basis-number-of-graphs",
    action: "approve",
    reason: "edited",
    edits: {
      yearPosed: 2024,
      resolutionMethod: "argument",
      significance: 15,
      significanceNote:
        "A stated conjecture (Miraftab, Morin and Yuditsky, Conjecture 12) settled at the optimal order rather than improved: O(log n) against a matching classical Omega(log n), and the same for cycle rank and Euler genus. The area is live, with Geniet and Giocanti and the Miraftab-Morin-Yuditsky group both publishing on basis number in 2026, which is what lifts it above a one-off. Still narrow: one graph parameter, unknown outside structural graph theory. Tied with the Tu-Deng conjecture at 15, likewise a named conjecture with a real specialist following.",
      ageNote:
        "The question is asked in Section 5 of Bazargani, Biedl, Bose, Maheshwari and Miraftab, posted to arXiv on 24 December 2024, and restated as Conjecture 12 by Miraftab, Morin and Yuditsky in January 2026. The submitted year of 2026 came from Knauer's bibliography, which cites the journal version; the site dates a problem from when it was first posed in public.",
      verificationNote:
        "Unreviewed. A nine-page preprint one day old at submission, with no peer review and no formal verification. The argument is conventional and self-contained - weighted cycle-basis bounds, minimax duality and dependent randomized rounding - so it is readable by any combinatorialist, and the author states he checked the arguments and references himself. Nobody independent has.",
    },
    links: [
      {
        label: "Bazargani, Biedl, Bose, Maheshwari and Miraftab, where the question is asked (Section 5)",
        url: "https://arxiv.org/abs/2412.18595",
        kind: "problem-record",
      },
      {
        label: "Miraftab, Morin and Yuditsky, who state it as Conjecture 12",
        url: "https://arxiv.org/abs/2601.14095",
        kind: "problem-record",
      },
    ],
    message:
      "Published. Clean submission: title, abstract and statement match arXiv 2609.02080 exactly, and the AI disclosure is its own numbered section rather than something buried, so the aiRole field was checkable in one read. Co-developed is the right tier - \"found with the help of\" is doing real hedging and you did not oversell it.\n\nOne correction, and it is a small one you could not easily have caught. You gave the posed year as 2026, which is what Knauer's bibliography says, but that entry is the journal version. The question is actually asked in Section 5 of arXiv 2412.18595, posted 24 December 2024, and Miraftab, Morin and Yuditsky restated it as Conjecture 12 in January 2026. The site dates a problem from when it was first posed in public, so I set 2024. That matters more than it looks: it moves the entry onto the age chart at about a year and eight months instead of sitting at zero.\n\nI added links to both of those papers so a reader can see where the question came from and where it became a conjecture. Also set the resolution method to argument, which was blank.\n\nCurator-only fields: significance 15 with its note. What lifted it above a narrow one-off is that the area is genuinely active right now, with Geniet and Giocanti and the Miraftab-Morin-Yuditsky group all publishing on basis number this year, and that the bounds are optimal rather than improved.",
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
