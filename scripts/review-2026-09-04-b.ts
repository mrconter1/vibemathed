// Review of the one submission that arrived after the morning batch on
// 4 September 2026: Sean Curry's counterexample to the Trautman conjecture.
//
// Source checked against the arXiv API: title and abstract match the
// submission verbatim; single author; comments field "Preliminary version.
// Comments welcome"; math.CV / math.DG; posted 2 September 22:29 UTC.
//
// The AI disclosure is the first paragraph of the acknowledgements, quoted:
// "The counterexample construction presented below was discovered through
// experimentation using ChatGPT Plus on August 18, 2026. ChatGPT was also
// used to create an initial rough draft of this manuscript (which has since
// been thoroughly revised) and in the proofreading process. The author
// independently checked all calculations and arguments presented here and
// takes full responsibility for the contents of the paper." The submitted
// aiRole is a faithful paraphrase. ai-discovered is right: the model produced
// the central object.
//
// One correction to the model field. "ChatGPT Plus" is a subscription tier,
// not a model, and the paper names no model. The entry records that rather
// than inventing one.
//
// Provenance: the conjecture is reference [34], A. Trautman, "On complex
// structures in physics", in On Einstein's Path (Springer 1999),
// arXiv:math-ph/9809022 - September 1998. The submitted 1998 stands.
//
// The second acknowledgement paragraph is worth recording: Curry thanks
// Jacobowitz, Schmalz and Taghavi-Chabert "for sharing their skepticism
// regarding the Trautman conjecture". So the conjecture was doubted by
// specialists before it fell; the counterexample confirms a suspicion rather
// than overturning a consensus, which bears on significance, not on validity.
//
// No related entry in the catalog (the name matches on "CR" were noise).
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
    slug: "a-smooth-counterexample-to-the-trautman-conjecture",
    action: "approve",
    reason: "edited",
    edits: {
      model: "ChatGPT (model not named; the paper says ChatGPT Plus)",
      significance: 25,
      significanceNote:
        "A named conjecture of Andrzej Trautman from 1998, at the meeting point of CR geometry and exact solutions of the Maxwell and Einstein equations, open for 28 years and settled outright by a strongly pseudoconvex counterexample. Real and old, but invisible outside CR geometry: no Wikipedia article, and the paper thanks three CR specialists for their scepticism about the conjecture, so this confirms a doubt rather than overturns a consensus. Level with the xz-conjecture counterexample at 25, another named conjecture refuted by an explicit witness; below the Hessian counterexample at 30.",
      renownLangs: 0,
      renownNote:
        "No Wikipedia article for the conjecture in any language. Trautman himself has one in ten, and CR manifolds in three; the conjecture lives in the literature only.",
      verificationNote:
        "Unreviewed. A single-author arXiv preprint two days old, labelled by its author \"Preliminary version. Comments welcome.\" The author states he independently checked all calculations and arguments. The construction is a modification of a standard nonembeddable strongly pseudoconvex CR 3-manifold, arranged so that the canonical bundle keeps a nowhere-zero closed section, so it is checkable by anyone who knows the Rosay-type examples; three CR specialists are thanked in the paper but none is on the record as having checked it. No peer review, no formalisation.",
    },
    message:
      "Published. Title and abstract match arXiv 2609.03198 exactly, and the AI statement is the first paragraph of the acknowledgements: the construction \"was discovered through experimentation using ChatGPT Plus on August 18, 2026\", with the model also drafting and proofreading and Curry checking everything and taking responsibility. Your AI-role field paraphrases that faithfully and AI-discovered is the right tier: the model produced the object.\n\nOne edit to the model field. \"ChatGPT Plus\" is a subscription plan, not a model, and the paper never names the model. The entry now says exactly that rather than guessing at one, and if Curry ever says which model it was, edit it in.\n\nI checked the 1998: the conjecture is reference [34], Trautman's \"On complex structures in physics\", arXiv math-ph/9809022 from September 1998, printed in 1999. Your year stands.\n\nCurator-only fields added: significance 25 with its note, a renown count (no article for the conjecture in any language), and a verification note that records the paper's own \"Preliminary version\" label and the fact that three CR specialists are thanked for their scepticism about the conjecture, which is context a reader deserves.",
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
        console.log(`  ${k.padEnd(17)}: ${JSON.stringify(v).slice(0, 70)}`);
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
