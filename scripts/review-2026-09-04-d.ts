// Review of the two submissions waiting on the evening of 4 September 2026.
// One approval, one hold - and the hold is on a ground the site has not used
// before, so it is worth stating carefully.
//
// ---------------------------------------------------------------------------
// APPROVED: the proper hat-guessing number of K7 - e (Matthew Protti)
//
// Third in a series, after K5 - e and K6 - e published on the two preceding
// days by the same author in the same format. Checked at the frozen commit
// 39f7716c:
//   - STATUS.json claims HG_P(K7-e) = 12 with mathematical_status PROVED and
//     review_disposition ACCEPT_K7E_THEOREM, review_status
//     INDEPENDENT_ADVERSARIAL_REVIEW_ACCEPTED, and two SHA-256 digests
//     pinning the review package.
//   - The ceiling checks out: Adriaensen et al.'s HG_P(G) <= n + chi(G) - 1
//     gives 7 + 6 - 1 = 12 for K7 - e, so the claim is that the ceiling is
//     attained, exactly as for K5 - e (8) and K6 - e (10).
//   - AI_USE_AND_PROVENANCE.md is present, as in both siblings.
//
// The adversarial review is the new thing here and the entry says so: it
// rebuilt both 132-block designs, all 792 pentad completions, the
// 95,040-element group and both Hall-degree censuses, and returned ACCEPT
// with no mathematical repairs. That is more than either sibling had. It is
// still not this site's own verification and not conventional peer review,
// so the tier stays Unreviewed and the status Candidate, as submitted.
//
// Significance 7, level with both siblings. Deliberately not higher for the
// third one: the series is the same method one vertex larger each time, and a
// record that advances by construction does not gain weight per rung.
//
// Worth noting for later: three entries of one parametrized family in three
// days is the case the Records work does NOT cover - HG_P(K_n - e) has no
// direction, each n is its own value. It is the "parametrized question"
// shape, which belongs to a Question graph with special-case-of edges rather
// than to a record. Filed as an observation, not acted on here.
//
// ---------------------------------------------------------------------------
// HELD: parity obstruction in the minimum-determinant problem for Latin
// squares
//
// The submission is careful in every way the site asks for. It marks itself
// partial rather than a resolution, disclaims priority on the baseline
// divisor, asks that "an odd determinant quotient" not be confused with "a
// quotient of absolute value one", and cites the 2014 Mathematics Stack
// Exchange question (886516) that posed it. The repository is unusually
// disciplined: a claim ledger, a public claim boundary, a red-team report, a
// reproduction guide and certified datasets with SHA256SUMS.
//
// What is missing is the one thing this site cannot do without: the AI
// involvement is not disclosed anywhere in the public artefact.
//
// The submission's own AI-role field says ChatGPT "generated the central
// mathematical development: the ordinary-to-centered determinant reduction,
// the exact binary rank and adjugate criteria ... and the all-order
// construction". That is a strong claim of AI authorship. Nothing public
// says it. What was checked, at commit 7e9293c1:
//   - all twelve markdown files in the repository, including CLAIM_LEDGER.md,
//     README_REVIEWER.md, RED_TEAM_REPORT.md and PUBLIC_CLAIM_BOUNDARY.md,
//     grepped for ChatGPT, GPT, LLM, "language model" and "artificial
//     intelligence": no hits;
//   - CITATION.cff: no hits;
//   - the paper itself, 106,213 characters of extracted text: no occurrence
//     of ChatGPT, GPT or "artificial", and no acknowledgements section at
//     all.
//
// So this is not "I could not find it" - it is an exhaustive check of a small
// public artefact. Which is the distinction the reviewing checklist gained
// today, and the reason this hold names what was searched.
//
// The remedy is entirely in the author's hands and is cheap: the repository
// owner appears to be the author, so a disclosure section in the paper or a
// provenance file in the repository fixes it in an afternoon. The hold says
// exactly that.
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
    slug: "the-proper-hat-guessing-number-of-k-7-e",
    action: "approve",
    reason: "edited",
    edits: {
      significance: 7,
      significanceNote:
        "One value of one graph parameter, third in a series after K5 - e and K6 - e from the same author on the two preceding days. The ceiling comes from Adriaensen et al.'s bound n + chi(G) - 1 = 12 and the work shows it is attained. Level with both siblings deliberately: the same method one vertex larger does not gain weight per rung, and the question was posed this year with no accumulated literature.",
      verificationNote:
        "Unreviewed on this site's ladder, but better evidenced than either sibling. An independent adversarial review rebuilt both 132-block S(5,6,12) completion designs, all 792 pentad completions, design disjointness, the 95,040-element group, sharp five-transitivity, all 495 set lines, all 59,400 ordered lines and both Hall-degree censuses, returning ACCEPT_K7E_THEOREM with no mathematical repairs required; STATUS.json pins the review package by SHA-256. That is a real check by someone other than the author, but it is an adversarial review of an artefact rather than a named expert endorsing the theorem or a proof assistant checking it, and this site has not rebuilt it. Conventional peer review is not claimed.",
    },
    message:
      "Published, at Candidate and Unreviewed as you set them, at significance 7 level with your K5 - e and K6 - e entries.\n\nChecked at the frozen commit 39f7716c: STATUS.json claims HG_P(K7-e) = 12 with review_disposition ACCEPT_K7E_THEOREM, the two SHA-256 digests pin the review package, and the ceiling checks out - Adriaensen et al.'s bound gives 7 + 6 - 1 = 12, so the claim is that it is attained, exactly the shape of the two smaller cases.\n\nThe adversarial review is the new thing in this one and the verification note now records what it covered: both 132-block designs, the 792 pentad completions, the 95,040-element group, sharp five-transitivity and both Hall-degree censuses, with no repairs required. That is more than either sibling carried. It does not move the tier, because it is a review of the artefact rather than a named expert endorsing the theorem, but it is worth a reader's time to know it happened.\n\nSignificance stays at 7 rather than climbing with n, and I want to be straight about why: the same method one vertex larger is not a heavier result, and all three were posed this year with no literature behind them. If K8 - e follows, it lands at 7 too.\n\nOne thing your series has now surfaced: three entries of one parametrized family in three days is a shape this site does not yet present well. It is not a record - there is no direction and no frontier, each n is simply its own value - so it wants grouping rather than a staircase. That is on the roadmap and your entries are the reason it is.",
  },
  {
    slug: "parity-obstruction-in-the-minimum-determinant-problem-for-latin-squares",
    action: "reject",
    reason: "held",
    message:
      "Held, on one ground only, and it is fixable in an afternoon: the AI involvement is not disclosed anywhere in the public artefact.\n\nYour AI-role field makes a strong claim - that ChatGPT generated the central mathematical development, naming the ordinary-to-centered reduction, the binary rank and adjugate criteria, and the all-order construction. This site's whole credibility rests on that kind of claim being documented where a reader can find it, so I check the source rather than the form every time.\n\nWhat I checked at commit 7e9293c1, so you know this is not a cursory look: all twelve markdown files in the repository, including CLAIM_LEDGER.md, PUBLIC_CLAIM_BOUNDARY.md, README_REVIEWER.md and RED_TEAM_REPORT.md, grepped for ChatGPT, GPT, LLM, \"language model\" and \"artificial intelligence\"; CITATION.cff; and the paper itself, 106,213 characters of extracted text, which contains no occurrence of ChatGPT or GPT and no acknowledgements section at all.\n\nEverything else about this submission is better than most. You marked it partial rather than a resolution, disclaimed priority on the baseline divisor, asked me to preserve the distinction between an odd determinant quotient and a quotient of absolute value one, and cited the 2014 Stack Exchange question that posed it. The repository has a claim ledger, a public claim boundary, a red-team report, a reproduction guide and certified datasets with checksums. That is a higher standard of self-discipline than the site usually sees, which is exactly why the missing disclosure stands out.\n\nThe remedy: add a short AI-use section to the paper, or a provenance file to the repository, saying which model did what. A paragraph is enough - the wording in your submission would do as it stands. Resubmit with that in place and this goes in; the mathematics is not what is being questioned.",
  },
];

async function main() {
  const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>("SELECT current_database() AS db");
  console.log(`database: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`);

  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });

  let bad = 0;
  for (const d of DECISIONS) {
    const cur = await prisma.problem.findUnique({
      where: { slug: d.slug },
      select: { id: true, status: true, name: true },
    });
    if (!cur) throw new Error(`not found on ${db}: ${d.slug}`);
    if (cur.status !== "pending") throw new Error(`${d.slug} is ${cur.status}, not pending`);

    console.log(`${d.action === "reject" ? "HOLD   " : "APPROVE"}  ${cur.name.slice(0, 58)}`);
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
  if (!curator) throw new Error("curator not found on this database");

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
          ...(d.links?.length ? { links: { create: d.links.map((l, i) => ({ ...l, position: n + i })) } } : {}),
          status: d.action === "approve" ? "published" : "rejected",
          reviewedAt: new Date(),
          reviewMessage: d.message,
          reviewReason: d.reason,
        } as never,
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
    // Activity row written separately with explicit columns: production does
    // not yet have ProblemActivity.recordId, which the generated client on
    // this branch insists on sending. Remove once PR #22 has merged and the
    // production schema has caught up.
    await prisma.$executeRawUnsafe(
      `INSERT INTO "ProblemActivity" ("problemId", "userId", "userName", "type") VALUES ($1, $2, $3, $4)`,
      cur.id,
      curator.id,
      curator.pseudonym,
      d.action === "approve" ? "approved" : "rejected",
    );
    console.log(`applied: ${d.action} ${d.slug}`);
  }

  console.log("\nAPPLIED. Public caches lag until the next deploy; entry pages are right immediately.");
}

main().finally(() => prisma.$disconnect());
