// Second review batch of 5 September 2026: three submissions that arrived
// during the day.
//
//   - Wong's MathOverflow question 235893 (connectedness-preserving bijection
//     of R^n with a non-connectedness-preserving inverse), submitted by a new
//     member with the MathOverflow page as Source URL and two Zenodo preprints
//     as links. Read: both preprints in full (pypdf), the MathOverflow page
//     including all five answers (top answer, score 40, is an explicit partial
//     result for a map R -> R^2; the newest, 5 September, is the submitter's),
//     and Banakh-Banakh arXiv 1809.00401 which calls the problem "still open"
//     and poses Problems 1.7 and 1.8. The entry bundled two results; it is
//     narrowed to Wong's question and the second is asked for as its own entry.
//   - Latin squares, resubmitted after yesterday's disclosure-only hold. The
//     disclosure now exists: AI_USE.md at commit ff9431c and page 19 of the
//     paper, both read.
//   - YAH scalar arctic first step. The note itself says the exact subquestion
//     was not posed anywhere and the full scalar lemma is routine.
//
// Dry run by default. Pass --apply to write. Production writes are the
// curator's to run.

import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const LINK_LABEL_MAX = 120;

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS])
  if (s.maxLength) LIMITS.set(s.key, s.maxLength);

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
  // ------------------------------------------- Wong's question, MO 235893
  {
    slug: "does-there-exist-a-bijection-of-mathbb-r-n-to-itself-such-that-the-forward-map-i",
    action: "approve",
    reason: "edited",
    edits: {
      shortName: "Wong's connectedness-preserving bijection",
      sourceUrl: "https://doi.org/10.5281/zenodo.22346412",
      sourceName:
        "Recurrent tubes and connectedness-preserving bijections of Euclidean spaces (Zenodo preprint, 5 Sep 2026)",
      model: "GPT-6 (Codex, Ultra effort), Claude Fable 5.1",
      modelMaker: "OpenAI, Anthropic",
      humanCollaborators: ["Peter L."],
      aiContribution: "ai-discovered",
      resolution: "candidate",
      posedBy: "Willie Wong, MathOverflow question 235893",
      yearPosed: 2016,
      statement:
        "Willie Wong asked on MathOverflow in April 2016: if $f:\\mathbb R^n\\to\\mathbb R^n$ is a bijection that maps every connected set to a connected set, must $f^{-1}$ do the same? By Tanaka's theorem and invariance of domain this is equivalent to asking whether every connectedness-preserving bijection of $\\mathbb R^n$ is continuous. For $n=1$ the answer is yes. For $n\\ge 2$ the question stayed open for a decade: the top-voted answer constructs such a bijection only from $\\mathbb R$ to $\\mathbb R^2$, and Banakh and Banakh (2020) proved continuity in several compact settings while calling Wong's problem still open.",
      resultNote:
        "Answered in the negative for every $n\\ge 2$. The preprint constructs a bijection $F:\\mathbb R^n\\to\\mathbb R^n$ that maps every connected set to a connected set, is continuous exactly off the closed ray $[0,\\infty)\\times\\{0\\}^{n-1}$, and pulls the straight segment $\\{(1,0,\\dots,0)\\}\\times[0,1]$ back to the middle-thirds Cantor set on that ray, so $F^{-1}$ is not connectedness-preserving. The construction extends a thin solid tube by finger moves so its cross-sections recur near every point of the complementary compactum, collapses the ray onto the tube's ideal end, and certifies arbitrary connected sets by a separation argument; $F$ and $F^{-1}$ can be taken Borel. The same author's companion note on Darboux injections from closed manifolds (Banakh-Banakh Problems 1.7 and 1.8) is a separate result and belongs in its own entry.",
      aiRole:
        "The preprint's own disclosure: the paper \"is the outcome of a research program conducted with two AI systems under the author's direction: OpenAI's Codex (GPT-6, Ultra effort), which produced the structural theory, the constructions, the adversarial audits, the verification of the argument, and the draft; and Anthropic's Claude Fable 5.1 (Extra effort), which planned the program, reviewed the successive run reports, and proposed the single-line coloring that makes the construction uniform in the dimension.\" The author chose the problem, wrote the briefs and ran the audits between systems. Appendix A separates ideas taken from the literature from ideas first recorded within the program.",
      verificationNote:
        'Unreviewed. The 17-page preprint (Zenodo 10.5281/zenodo.22346412, version 1, dated 5 September 2026) was read here on the day it appeared; the theorem, the construction outline and the disclosure match the submission. Nobody outside the author\'s program has checked the argument, and the preprint is visibly unfinished: its acknowledgements read "to be supplied by the author" and its disclosure ends with a bracketed statement "to be completed after review" that the author has verified the mathematics and accepts responsibility. Candidate until that statement is filled in and someone independent has read the proof. The question\'s history warrants care: it drew five answers over ten years, all partial, and a 2020 paper by Banakh and Banakh devoted to it.',
      significance: 22,
      significanceNote:
        "A MathOverflow question open since 2016 with a real following: a score of 40 on the top partial answer, a 2020 arXiv paper by Banakh and Banakh built around it, and its own name in the literature (Darboux bijections of R^n). A clean negative answer to a decade-old question in general topology, one rung above the numbered-Erdős level; well below structural conjectures, since it settles one question rather than a programme.",
    },
    links: [
      {
        label:
          "Wong's question on MathOverflow (2016), with the five partial answers",
        url: "https://mathoverflow.net/questions/235893",
        kind: "problem-record",
      },
      {
        label:
          "Banakh and Banakh, The continuity of Darboux injections between manifolds (2020), which calls the problem still open",
        url: "https://arxiv.org/abs/1809.00401",
        kind: "paper",
      },
    ],
    message:
      "Published, at Candidate and Unreviewed, with the Source URL corrected as you asked on Discord and the entry narrowed to one question. Nothing needs resubmitting for this one.\n\nSource URL now points at the preprint (Zenodo 22346412), which is the thing under review; the MathOverflow page moved to a problem-record link. Both DOIs you gave resolve to the versioned records already attached, so nothing was lost.\n\nThe entry bundled two results, and this site lists one question per entry: Wong's question is answered by the tubes preprint, and Banakh-Banakh Problems 1.7 and 1.8 are answered by the Darboux-injections note with a different model (GPT-5.5 Pro). This entry is now Wong's question only. Please submit the Banakh-Banakh result as its own entry with the Darboux note as Source URL; it is a real answer to two posed problems and should take minutes to review, since I have already read the paper.\n\nWhat I checked: both preprints in full, the MathOverflow page with all five answers (the top one, score 40, is a partial result for a map from the line to the plane; yours is the fifth), and Banakh and Banakh's 2020 paper, which poses 1.7 and 1.8 and calls Wong's problem still open. So the question was open and the claim is what you say it is.\n\nCandidate rather than Resolved for two reasons a reader can see for themselves. The preprint is dated today and nobody outside the program has read it. And it is visibly unfinished: the acknowledgements say \"to be supplied by the author\" and the disclosure ends with a bracketed statement, to be completed after review, that the author has verified the mathematics and takes responsibility. Fill that in, and the moment someone independent has read the argument, this moves to Resolved.\n\nModel field normalised to what the paper says: GPT-6 via Codex at Ultra effort, and Claude Fable 5.1. Significance 22.",
  },

  // ------------------------------------------- Latin squares, resubmitted
  {
    slug: "parity-obstruction-in-the-minimum-determinant-problem-for-latin-squares-2",
    action: "approve",
    reason: "edited",
    edits: {
      significance: 10,
      significanceNote:
        "A 2014 Mathematics Stack Exchange question about when the divisibility lower bound for Latin-square determinants is attained, with a conjecture that only orders 4 and 6 fail. This is partial progress: an exact parity criterion and a family with odd quotient for every n = 2 mod 4, removing one obstruction without settling attainment. A precise question with a small literature, at the numbered-Erdős level.",
    },
    message:
      "Published, at Partial and Unreviewed as you set them, at significance 10.\n\nYesterday's hold was on one ground and you fixed it: at commit ff9431c the repository carries AI_USE.md and the paper carries the same statement on page 19, naming GPT-5.4 and saying exactly what it did and what you did. That is what the site needs and it is now the model for how to do it.\n\nThe distinctions you asked to preserve are preserved: the entry says odd quotient, not quotient of absolute value one; it says partial, not resolution; and it credits the baseline divisor to the literature. The mathematics was never in question and I have not re-reviewed it; the certified datasets and the passing verifier are as described.\n\nSignificance 10: a precise 2014 question with a conjecture attached and partial progress toward it.",
  },

  // ----------------------------------------------- YAH scalar arctic step
  {
    slug: "yah-mixed-base-collatz-system-scalar-arctic-first-step-obstruction",
    action: "reject",
    reason: "no-open-question",
    message:
      "Declined, on the ground you anticipated in your note, and with respect for how carefully you framed it.\n\nThis site lists results that settle, or make measurable progress on, a question somebody posed before the work began. Your own scope statement says the exact scalar subquestion was not separately posed in Yolcu, Aaronson and Heule, that the full scalar lemma is routine, and that the contribution is the combined top/labelled certificate package, whose novelty you could not establish beyond a bounded search. Section 6 of YAH raises a direction, not a question with a yes or no; a restriction of a direction that the authors of the restriction chose themselves is not something the catalog can hold, however sound the certificates are.\n\nWhat would qualify, from the same programme: a result on the question YAH actually leave open, whether matrix interpretations of any dimension can prove termination of the mixed-base system, in either direction; or a reframing where a named, previously stated conjecture or problem is the target. If you get there, submit it and cite this note as prior work.\n\nThe replayable certificates, the honest attribution note and the explicit non-claims are all in the right spirit. It is the shape of the question, not the quality of the work, that keeps it out.",
  },
];

async function main() {
  const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>(
    "SELECT current_database() AS db",
  );
  console.log(
    `database: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`,
  );

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
    if (cur.status !== "pending")
      throw new Error(`${d.slug} is ${cur.status}, not pending`);

    console.log(
      `${d.action === "reject" ? "REJECT " : "APPROVE"}  ${cur.name.slice(0, 58)}  [${d.reason}]`,
    );
    console.log(
      `  message : ${d.message.length}/${MESSAGE_MAX}${d.message.length > MESSAGE_MAX ? "  OVER" : ""}`,
    );
    if (d.message.length > MESSAGE_MAX) bad++;
    for (const [k, v] of Object.entries(d.edits ?? {})) {
      const lim = LIMITS.get(k);
      if (typeof v === "string" && lim) {
        const over = v.length > lim;
        console.log(
          `  ${k.padEnd(17)}: ${v.length}/${lim}${over ? `  OVER BY ${v.length - lim}` : ""}`,
        );
        if (over) bad++;
      } else {
        console.log(`  ${k.padEnd(17)}: ${JSON.stringify(v).slice(0, 70)}`);
      }
    }
    for (const l of d.links ?? []) {
      console.log(
        `  link             : ${l.label.length}/${LINK_LABEL_MAX}  ${l.kind}`,
      );
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
      select: {
        id: true,
        submittedById: true,
        _count: { select: { links: true } },
      },
    });
    if (!cur) throw new Error(`vanished: ${d.slug}`);
    const n = cur._count.links;

    await prisma.$transaction([
      prisma.problem.update({
        where: { id: cur.id },
        data: {
          ...(d.edits ?? {}),
          ...(d.links?.length
            ? {
                links: {
                  create: d.links.map((l, i) => ({ ...l, position: n + i })),
                },
              }
            : {}),
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
      prisma.problemActivity.create({
        data: {
          problemId: cur.id,
          userId: curator.id,
          userName: curator.pseudonym,
          type: d.action === "approve" ? "approved" : "rejected",
        },
      }),
    ]);
    console.log(`applied: ${d.action} ${d.slug}`);
  }

  console.log(
    "\nAPPLIED. Public caches lag until the next deploy; entry pages are right immediately.",
  );
}

main().finally(() => prisma.$disconnect());
