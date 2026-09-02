// Review of the three submissions pending on 2 Sep 2026. Same mechanics as
// review-2026-09-01.ts, and the same caveats: updateTag cannot run from a
// script, so public caches lag until the next deploy; sendDirectMessage bails
// without a session, so the inbox rows are written directly.
//
// ---------------------------------------------------------------------------
// 1. Graffiti Conjecture 806 (VibeGene / AI Village) - APPROVE, site-confirmed.
//
// Written on the Wall I, conjecture 806: for G = PR[S], S the square-free
// integers in [2..n], adjacency when not coprime, the largest eigenvalue is at
// most the number of distinct degrees. The AI Village repository refutes it
// with exact integer Rayleigh certificates - an integer vector x with
// x^T A x > D x^T x, so lambda_1 > D with no floating point anywhere.
//
// Re-run here on 2 Sep 2026 with the repository's own verify_wow1_806.py:
// fast mode 160 assertions, full mode 175 assertions, both ALL CHECKS PASSED,
// 21 seconds. That is the site reproducing the artifact, which is what
// Site-confirmed means. The verifier's check against the original Written on
// the Wall text file was skipped (not in the repository), so statement
// fidelity rests on the transcription in the script header plus the
// neighbouring-conjecture controls, which passed.
//
// Model confirmed from the README ("Claude Opus 5 (AI Village ...)"); the
// submission had "Clade Opus 5", which the family filter would not match.
// Renamed to match the catalog's convention for Fajtlowicz's list ("Graffiti
// Conjecture N"; "Written on the Wall II" is DeLaviña's, a different corpus
// that shares numbers). Resolution candidate -> resolved: a disproof by an
// exact certificate, reproduced, is not pending anything. Significance 5 with
// the standing note, like every other machine-generated conjecture here.
//
// The README claims 197 refutations. The batch policy is still open; this
// one is published individually because its certificate was re-run here.
//
// 2. Randomized metric distortion 2.3282 (VibeGene / Nisarg Shah) - APPROVE.
//
// arXiv 2608.29308, cs.GT, Shah (Toronto), one of the field's leading
// researchers. The disclosure is in the paper: "All the proofs in this
// document were obtained using GPT-5.6-Sol with guidance from the author", and
// the model is credited with introducing the stable-lottery ingredients. The
// open question - the optimal randomized distortion, lower bound ~2.1126,
// previous upper 2.5 - is explicitly stated as open. Partial is right: a bound
// moved, the constant is not determined. ai-discovered stands on the paper's
// own words. Curator fields only, plus the author as collaborator.
//
// 3. Positive sectional curvature on S^2 x S^3 (Saul Schleimer) - HOLD.
//
// arXiv 2608.22133, math.DG, Guo, Fang and Lu (Harvard Biostatistics), proof
// credited to an "Odin Automatic AI Research Agent" with no builder, URL or
// disclosure anywhere in the paper, posted three days after Brendle and Hung's
// (human, unrelated) S^2 x S^2 paper it builds on. A landmark claim by any
// geometer's standard, with nobody independent on record. Held under the
// extraordinary-claims rule added to the methodology today; mechanically a
// rejection with reason "other" and a message that says how to come back.
// Not a judgement on the mathematics, which nobody here is placed to make.
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

export const GRAFFITI_806_EDITS: Record<string, unknown> = {
  slug: "graffiti-conjecture-806",
  name: "Graffiti Conjecture 806",
  shortName: "Graffiti 806",
  field: "Spectral graph theory",
  posedBy: "Graffiti (Siemion Fajtlowicz's program)",
  model: "Claude Opus 5 (AI Village)",
  publication: "announcement",
  sourceName: "AI Village graffiti-verification (GitLab)",
  resolution: "resolved",
  verification: "site-confirmed",
  significance: 5,
  significanceNote: "Machine-generated (Graffiti); real but unfamous by construction.",

  statement:
    "Let $S$ be the set of square-free integers in $[2, n]$ and $G = PR[S]$ the graph on $S$ in which two integers are adjacent when they are not coprime. From the cases $n \\le 100$ and about twenty further values $n \\le 200$, Graffiti conjectured that the largest adjacency eigenvalue $\\lambda_1(G)$ is at most the number of distinct vertex degrees.\n\nFalse. At $n = 51$ the graph has $31$ vertices, $11$ distinct degrees and $\\lambda_1 > 11.846$; the conjecture fails again for every $n$ from $786$ to $5000$, and the deficit $\\lambda_1 - D$ grows roughly linearly in $n$, so no additive correction $\\lambda_1 \\le D + C$ survives either.",

  verificationNote:
    "Site-confirmed: the repository's verifier, verify_wow1_806.py, was re-run here on 2 September 2026. Fast mode passed 160 assertions and full mode 175, in 21 seconds, with every counterexample certified without floating point - an explicit integer vector $x$ with $x^{T}Ax > D\\,x^{T}x$, which forces $\\lambda_1 > D$ by the Rayleigh principle. For $n = 51$ the certificate is $x^{T}Ax = 1117310362790 > 11 \\cdot 94319113125$.\n\nThe verifier also confirms the graph construction against direct gcd tests, scans every $n \\le 300$ for the least counterexample (it is $51$), and checks the neighbouring conjectures 802, 805, 807 and 808 of the same block as controls, which hold on Graffiti's stated range. Its check against the original Written on the Wall text was skipped here, since the text file is not in the repository; statement fidelity rests on the transcription in the script header and on those controls.\n\nNo independent specialist review.",

  resultNote:
    "The repository supplies an executable verifier in exact integer arithmetic; for $n = 51$ an integer vector $x$ satisfies $x^{T}Ax > 11\\,x^{T}x$, so $\\lambda_1 > 11 = D$. The deficit $\\lambda_1(n) - D(n)$ grows through $n = 5000$ in the repository's computations, but no asymptotic theorem proving divergence is claimed, so \"false for every constant $C$\" is a computed pattern, not a proved one.\n\nOne anomaly, which the repository records itself: $n = 51$ lies inside the range Graffiti is said to have tested when it made the conjecture.",
};

export const DISTORTION_EDITS: Record<string, unknown> = {
  humanCollaborators: ["Nisarg Shah"],
  significance: 18,
  significanceNote:
    "The optimal randomized metric distortion is the central remaining open question of the metric distortion programme in computational social choice; its deterministic half was a well-known conjecture settled at 3 in 2020. A tracked constant with a documented ladder, 3 to 2.753 to 2.5 and now 2.3282, against a lower bound near 2.1126. Above the Max-k-CSP approximation constant at 15, a similar tracked ladder with a narrower audience; below Courtade-Kumar at 22, one of the best-known open problems in analysis of Boolean functions.",
  verificationNote:
    "Unreviewed. The author states that he verified all final mathematical details; by this site's ladder an author's own check does not move the tier, however expert, and Shah is among the leading researchers on metric distortion. The bound $11641/5000$ rests, per the abstract, on an exact rational verification via polynomial nonnegativity in the Bernstein basis, which is checkable in principle but has not been re-run here. No referee and no formalization.",
  ageNote:
    "The paper gives no origin for the question of the optimal randomized distortion, so no year is recorded. The randomized side of metric distortion has been studied at least since Anshelevich and Postl's 2016 work on randomized social choice under metric preferences, which gave the first bounds.",
  aiRole:
    "GPT-5.6 Sol derived all mathematical proofs in the paper from research directions, literature connections, proof and search strategies, and inspiration supplied by Nisarg Shah. It autonomously introduced stable-lottery ingredients, developed progressively stronger bounds, and derived the proofs leading to $2.3282$. Shah then generalized one proposed lottery to random-size stable lotteries, guided the search over distributions, verified all final mathematical details, and rewrote and simplified the exposition with GPT-5.6 Sol and Claude Opus 5.\n\nThe disclosure is in the paper itself, not only in this entry: \"All the proofs in this document were obtained using GPT-5.6-Sol with guidance from the author.\"",
};

const DECISIONS: Decision[] = [
  {
    slug: "written-on-the-wall-conjecture-806",
    action: "approve",
    reason: "edited",
    edits: GRAFFITI_806_EDITS,
    links: [
      {
        label: "Repository: 197 refutations, each with a verifier script",
        url: "https://gitlab.com/ai-village-agents/village/graffiti-verification",
        kind: "code",
      },
    ],
    message:
      "Published, at Site-confirmed rather than Unreviewed: I re-ran verify_wow1_806.py here, fast and full mode, 160 and 175 assertions, all passed in 21 seconds. Exact integer certificates, no floating point, is exactly the kind of artifact that tier is for. The one check I could not run is the one against the original Written on the Wall text, since wow_clean.txt is not in the repository; the entry says so.\n\nEdits: renamed to Graffiti Conjecture 806, which is how the catalog names Fajtlowicz's list (Written on the Wall II is DeLaviña's, a different corpus that shares numbers); model corrected from \"Clade\" to Claude, which the family filter would otherwise miss; resolution from candidate to resolved, since a reproduced disproof is not pending anything; statement rewritten in TeX from the verifier's header; publication set to announcement; significance 5 with the standing note for machine-generated conjectures. Your result note and the n=51 anomaly are kept.\n\nOne question back. The README says 197 refutations. We have not yet decided whether a sweep like that enters the catalog one entry per conjecture or grouped per sweep, and your view would be useful before more arrive. Until it is settled, an individual entry goes in only when its certificate has been re-run here, as this one was.",
  },
  {
    slug: "improving-randomized-metric-distortion-to-2-3282",
    action: "approve",
    reason: "edited",
    edits: DISTORTION_EDITS,
    message:
      "Published. Curator-side changes only: significance and its note, a verification note, an age note, and Nisarg Shah added as the human collaborator. Your AI-role text stands, with one sentence appended recording that the disclosure is in the paper itself - \"All the proofs in this document were obtained using GPT-5.6-Sol with guidance from the author\" - which is what makes ai-discovered defensible rather than a submitter's reading.\n\nKept at Unreviewed and Partial as you set them. The constant is still open, and an author's own check, however expert, does not move the tier. The Bernstein-basis certificate is the kind of thing this site could re-run for Site-confirmed; not done here.",
  },
  {
    slug: "a-metric-with-positive-sectional-curvature-on-s-2-times-s-3",
    action: "reject",
    reason: "other",
    message:
      "Thanks for this one, and for the pointer to Brendle and Hung. I am holding it rather than publishing it, under a rule that went into the methodology today because of this case and yesterday's: extraordinary claims are held, not listed.\n\nA metric of positive sectional curvature on S^2 x S^3 would be a landmark by any geometer's standard. This one is three days downstream of Brendle-Hung, credited to an agent with no builder, URL or disclosure anywhere in the paper, from authors outside the field, and nobody independent has read it. Listing it, even as a candidate, would put the site's name beside a claim it has not checked. So it waits until a named geometer with no stake in it has gone through the argument, or a formal proof exists.\n\nYou are better placed than most to be that geometer, if you were inclined. Either way, resubmit the moment such a check exists and it will be reviewed at that tier. The hold is about the size of the claim, not about the submission, which was careful.",
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
      select: { id: true, status: true, name: true, submittedById: true },
    });
    if (!cur) throw new Error(`not found: ${d.slug}`);
    if (cur.status !== "pending") throw new Error(`${d.slug} is ${cur.status}, not pending`);

    console.log(`\n${d.action.toUpperCase()}  ${cur.name.slice(0, 66)}`);
    console.log(`  reason  : ${d.reason}`);
    console.log(`  message : ${d.message.length}/${MESSAGE_MAX}${d.message.length > MESSAGE_MAX ? "  OVER" : ""}`);
    if (d.message.length > MESSAGE_MAX) bad++;

    for (const [k, v] of Object.entries(d.edits ?? {})) {
      const lim = LIMITS.get(k);
      if (typeof v === "string" && lim) {
        const over = v.length > lim;
        console.log(`  ${k.padEnd(17)}: ${v.length}/${lim}${over ? `  OVER BY ${v.length - lim}` : ""}`);
        if (over) bad++;
      } else {
        console.log(`  ${k.padEnd(17)}: ${JSON.stringify(v).slice(0, 70)}`);
      }
    }
    for (const l of d.links ?? []) {
      console.log(`  link             : ${l.label.length}/${LINK_LABEL_MAX}  ${l.url}`);
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
