// Review of the two submissions that arrived late morning on 4 September 2026.
// One approval, one hold.
//
// ---------------------------------------------------------------------------
// APPROVED
//
// A quantum oracle separation between QMA(2) and QMA (arXiv 2609.02865;
// Bostanci, Grewal, Haferkamp, Huang, Hwang, Natarajan, Nirkhe). Title and
// abstract match the arXiv record verbatim. The disclosure is a dedicated
// "Tool and computational resource disclosure" section: "we disclose that the
// proof idea underlying the main theorem was generated using ChatGPT 5.6 Sol.
// Our initial prompts directed the model to the work of She and Yuen [SY23],
// and, through subsequent prompting with minimal additional guidance, the
// model proposed the proof idea presented in this paper. The authors
// subsequently verified, simplified, and developed the argument". Later:
// "connecting these pieces to formulate a complete proof is precisely a strong
// point of generative AI models." ai-discovered, as filed, is right: the
// central idea was the model's.
//
// Scope is honest in the submission and kept: a unitary-oracle separation,
// not the unrelativized one and not a classical oracle; the paper says so.
// The no-disentanglers conjecture is Watrous's, "as reported in [ABDFS09]"
// (Aaronson, Beigi, Drucker, Fefferman, Shor, 2009); posedBy is tidied to say
// exactly that. No related entry in the catalog.
//
// ---------------------------------------------------------------------------
// HELD
//
// Smooth autonomous fast dynamo (arXiv 2609.04153), second filing. The paper
// was held this morning under the extraordinary-claims rule, on a submission
// by a different member (TeaTime) who asked for the hold themselves. This
// filing, by VibeGene, marks it "expert-verified". Its verification note
// names no expert: it says the three authors "state that all AI-generated
// suggestions, computations, and references were independently verified" -
// which is the authors checking their own paper, and every paper says that.
// Expert-verified on this site's ladder means a named person with no stake
// has read it. Checked again before deciding: the arXiv record is still v1
// with the same comment, and two web searches turn up no blog, forum post or
// named endorsement. Nothing has changed since 06:34, so neither does the
// decision. Rejected with reason "held", pointing at what lifts it.
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
    slug: "a-quantum-oracle-separation-between-mathsf-qma-2-and-mathsf-qma",
    action: "approve",
    reason: "edited",
    edits: {
      posedBy: "John Watrous (the no-disentanglers conjecture, as reported by Aaronson, Beigi, Drucker, Fefferman and Shor)",
      significance: 36,
      significanceNote:
        "Whether two unentangled quantum proofs beat one, QMA versus QMA(2), has been one of the central open questions of quantum complexity since Aaronson, Beigi, Drucker, Fefferman and Shor posed it in 2009, and Watrous's no-disentanglers conjecture is its best-known sharpening. This gives the first oracle separation, relative to a unitary oracle, and settles the conjecture; the unrelativized and classical-oracle questions stay open. Just above the Werner two-copy distillability entry at 35, the catalog's top quantum entry, because this question is followed across the whole field.",
      renownLangs: 6,
      renownNote:
        "The QMA article exists in six Wikipedia languages; the QMA versus QMA(2) question has no article of its own and is known through it.",
      verificationNote:
        "Unreviewed. A 25-page preprint two days old, no peer review, no formalisation. Seven authors, including several who work on exactly this, state that they \"verified, simplified, and developed\" the model's proof idea and take full responsibility. The argument reduces to the approximate degree of OR through the She-Yuen unitary polynomial method, so it is checkable by anyone who knows that toolkit. Nobody outside the author list has done so on the record.",
    },
    links: [
      {
        label: "Aaronson, Beigi, Drucker, Fefferman and Shor, The Power of Unentanglement, where the question is posed",
        url: "https://arxiv.org/abs/0804.0802",
        kind: "problem-record",
      },
    ],
    message:
      "Published. Title and abstract match arXiv 2609.02865 exactly, and the disclosure is a dedicated section that says more than most: \"the proof idea underlying the main theorem was generated using ChatGPT 5.6 Sol\", with the authors pointing it at She and Yuen and the model proposing the argument \"with minimal additional guidance\". AI-discovered is the right tier and I kept it.\n\nYour submitter note scoping this to a unitary-oracle separation, with the unrelativized and classical-oracle questions still open, is exactly right and the paper says the same. It is kept as the tail of the entry's framing rather than lost.\n\nOne tidy: posed-by now reads as Watrous's no-disentanglers conjecture as reported in Aaronson, Beigi, Drucker, Fefferman and Shor, which is how the paper itself attributes it, and that 2009 paper is linked as the problem record.\n\nCurator-only fields added: significance 36 with its note, which puts it just above the catalog's top quantum entry because this question is followed across the whole field; a renown count; and a verification note.",
  },
  {
    slug: "smooth-autonomous-fast-dynamo-on-the-three-torus-2",
    action: "reject",
    reason: "held",
    message:
      "Held, for the same reason it was held this morning when another member filed the same paper and asked for the hold themselves. Nothing has changed since: the arXiv record is still v1 with the same comment, and I searched twice for any blog post, forum thread or named mathematician saying they had read it, and found none.\n\nYour filing marks it Expert-verified, and I want to be precise about why that does not hold. Your verification note says the three authors \"state that all AI-generated suggestions, computations, and references were independently verified\". That is the authors checking their own paper, which every paper says. On this site's ladder Expert-verified means a named person with no stake in the result has read the argument and said so publicly. There is no such person yet, and labelling it as though there were is the one thing a submission must not do, because readers trust the label.\n\nThe paper claims to resolve the Zeldovich-Sakharov fast dynamo conjecture, Arnold's Problem 1994-28, in 69 pages posted yesterday. That is exactly the shape the extraordinary-claims rule exists for, and strong authors do not lift it; a named disinterested expert does, or a formal proof.\n\nWhen either appears, resubmit with the link and this goes up at a high significance, related to the two dynamo variants already in the catalog. One more note for then: the paper's own AI statement describes specific suggestions inside a human-led proof and says \"The resulting document is entirely human written\", which is co-developed, not AI-assisted.",
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
