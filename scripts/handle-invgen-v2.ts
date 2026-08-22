// Acting on RustyKestrel290's inbox report of a v2 of arXiv:2608.06272.
//
// Three things, all checked against the v2 PDF rather than the message.
//
// 1. The existing entry's AI disclosure is out of date, and not trivially.
//    v1 said the models were used "to explore proof strategies and to check
//    intermediate steps", crediting ChatGPT 5.6 Pro AND Claude Fable 5. v2
//    replaces that with a more specific statement that names a step - the
//    adaptation of Ansorena's work to obtain the explicit Schauder basis in
//    Proposition 2.1 - and drops Claude Fable 5 entirely. So the model and
//    vendor fields change, and the aiRole records both the new wording and the
//    fact that a credit was withdrawn, rather than letting it vanish.
//
//    The tier stays ai-assisted. v2 names a step, which is the co-developed
//    trigger, but every verb in it is assistive and human-led: "was used to
//    explore", "was assisted by", "was carried out by carefully dissecting
//    every step of the proof with". Upgrading on "assisted by" would read more
//    than the words support.
//
// 2. v2 adds a solution to Question 6.1 of Chalmoukis, Tsikalas and
//    Yakubovich, "Operators with small Kreiss constants" (arXiv:2512.10025).
//    That is a separately posed question by different authors, so it gets its
//    own entry rather than a line on this one - the Kourovka and Zeilberger
//    precedent - joined by a same-work relation.
//
// 3. A reply to RustyKestrel290 in the thread the report arrived on.
//
// Dry run by default. Pass --apply to write.
import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const OLD = "a-counterexample-to-the-inverse-generator-problem-and-related-questions";
const NEW = "separation-of-ordinary-and-strong-kreiss-constants";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const V2_AIROLE =
  "The v2 disclosure in full: \"ChatGPT 5.6 Pro by OpenAI was used to explore various Schauder basis counterexamples to the inverse generator problem. Moreover, the adaptation of the work of Ansorena to obtain the explicit Schauder basis in Proposition 2.1 was assisted by ChatGPT 5.6 Pro. Furthermore, optimization of the explicit constants in both Theorem 1.1 and Proposition 2.1 was carried out by carefully dissecting every step of the proof with ChatGPT 5.6 Pro, searching for numerical improvements. The authors take full responsibility for the content of this note.\" This names a step, unlike v1's \"explore proof strategies and check intermediate steps\", but every verb stays assistive and human-led, so the tier is unchanged. Worth recording that v1 also credited Claude Fable 5 with checking arguments and detecting mistakes; v2 drops that credit, so this entry no longer carries it.";

const OLD_FIELDS: Record<string, unknown> = {
  sourceName: "arXiv:2608.06272 - A solution to the inverse generator problem and related questions",
  model: "ChatGPT 5.6 Pro",
  modelMaker: "OpenAI",
  aiRole: V2_AIROLE,
  resultNote:
    "One finite-dimensional construction settles several related questions. Besides the inverse generator problem, it gives a generator whose Cayley transforms satisfy the ordinary Kreiss resolvent condition but are neither strongly Kreiss bounded nor power bounded, and it shows the Crank-Nicolson scheme is unstable in operator norm both over long times at fixed step size and under mesh refinement at fixed final time. Version 2 adds Theorem 1.4, whose part (i) solves Question 6.1 of Chalmoukis, Tsikalas and Yakubovich; that question is tracked as its own entry.",
};

const NEW_FIELDS: Record<string, unknown> = {
  name: "Separation Between the Ordinary and Strong Kreiss Constants",
  shortName: "Kreiss constant separation",
  fieldGroup: "Analysis",
  field: "Operator theory",
  statement:
    "Question 6.1 of Chalmoukis, Tsikalas and Yakubovich asks how far the strong Kreiss constant of a matrix can exceed its ordinary Kreiss constant. Answered: for every $K > 1$ there are matrices whose Cayley transforms satisfy $K(C_h(A_{n,h})) \\le K$ while $K_s(C_h(A_{n,h})) \\ge \\tfrac{1}{2}Cn^{\\alpha_K}$ with $\\alpha_K = (K-1)/(C+K-1)$. Since the Kreiss matrix theorem gives $K_s(T) \\le P(T) \\le edK(T)$ in dimension $d$, the exponent $\\alpha < 1$ is optimal up to an arbitrarily small power loss.",
  posedBy: "Nikolaos Chalmoukis, Georgios Tsikalas and Dmitry Yakubovich",
  yearPosed: 2025,
  solveType: "proved",
  resolution: "resolved",
  resolutionMethod: "construction",
  solveDate: "2026-08-19",
  model: "ChatGPT 5.6 Pro",
  modelMaker: "OpenAI",
  humanCollaborators: ["Emiel Lorist", "Martin Meyries", "Mark Veraar"],
  aiRole:
    "The same disclosure as the inverse generator entry, since both fall to one paper: ChatGPT 5.6 Pro explored Schauder basis counterexamples, assisted the adaptation of Ansorena's work that produces the explicit basis in Proposition 2.1, and helped optimize the explicit constants. Note the boundary honestly - the disclosure names Proposition 2.1 and Theorem 1.1, not Theorem 1.4. Proposition 2.1 is the finite-dimensional construction every result in the paper is deduced from, including this one, so the model is in the loop for the machinery rather than for this theorem's derivation.",
  aiContribution: "ai-assisted",
  verification: "unreviewed",
  verificationNote:
    "Checked by this site on 22 August 2026 against the v2 PDF (arXiv:2608.06272v2, 19 Aug): the paper states \"We furthermore note that Theorem 1.4(i) solves [6, Question 6.1]\" and gives the explicit constants quoted in the statement, and reference [6] is Chalmoukis, Tsikalas and Yakubovich, arXiv:2512.10025. The mathematics of Theorem 1.4 was not checked here, though a curator numerical check of Proposition 2.1 - the construction it is deduced from - was carried out for the sibling entry and confirmed its bounds up to n = 256.",
  significance: 12,
  significanceNote:
    "A question posed in December 2025 and answered nine months later, in a corner of operator theory read by the numerical-analysis and semigroup communities. Real and precisely stated, but young and narrow, so well below the sibling inverse generator problem at 22, which had stood since 1988.",
  publication: "preprint",
  sourceUrl: "https://arxiv.org/abs/2608.06272",
  sourceName: "arXiv:2608.06272 - A solution to the inverse generator problem and related questions",
  renownLangs: 0,
};

const NEW_LINKS = [
  { label: "Chalmoukis, Tsikalas and Yakubovich, Operators with small Kreiss constants (Question 6.1)", url: "https://arxiv.org/abs/2512.10025", kind: "problem-record" },
];

const RELATION_NOTE =
  "Both are deduced from the same finite-dimensional construction in Proposition 2.1; the Kreiss separation was added in version 2 of the paper.";

const REPLY = `Thank you - acted on all three.

The AI statement was the one that mattered. v1 said the models were used to explore proof strategies and check intermediate steps, crediting ChatGPT 5.6 Pro and Claude Fable 5. v2 names a step instead: the adaptation of Ansorena's work to obtain the explicit Schauder basis in Proposition 2.1. It also drops Claude Fable 5 entirely, so the entry no longer credits Anthropic. I recorded the withdrawal explicitly rather than letting a credit quietly disappear.

I kept the tier at assisted. Naming a step is normally the co-developed trigger, but every verb in the v2 statement is human-led - "was used to explore", "was assisted by", "was carried out by carefully dissecting every step of the proof with". Reading co-developed into "assisted by" would claim more than the authors wrote. Tell me if you read it differently; you have been closer to this paper than I have.

Question 6.1 is now its own entry rather than a line on the existing one, since it was posed by different authors in a different paper - Chalmoukis, Tsikalas and Yakubovich, arXiv:2512.10025. The two entries are joined by a same-work relation, so either one leads to the other. Significance 12 against the inverse generator's 22: a good question, but posed in December 2025 rather than 1988.

The entry title stays as the problem name rather than the paper title, which is the house convention, but sourceName now carries the new title.`;

async function main() {
  const old = await prisma.problem.findUnique({
    where: { slug: OLD },
    select: { id: true, status: true, model: true, modelMaker: true },
  });
  if (!old) throw new Error("existing entry not found");

  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });
  const rusty = await prisma.user.findFirst({
    where: { pseudonym: "RustyKestrel290" },
    select: { id: true, pseudonym: true },
  });
  if (!curator || !rusty) throw new Error("user not found");

  const msg = await prisma.directMessage.findFirst({
    where: { userId: curator.id, senderId: rusty.id, readAt: null },
    orderBy: { createdAt: "desc" },
    select: { id: true, parentId: true, problemId: true },
  });
  if (!msg) throw new Error("unread message from RustyKestrel290 not found");

  for (const [k, v] of Object.entries({ ...OLD_FIELDS, ...NEW_FIELDS })) {
    const lim = LIMITS.get(k);
    if (lim && typeof v === "string" && v.length > lim) {
      throw new Error(`${k} over by ${v.length - lim} (${v.length}/${lim})`);
    }
  }
  if (RELATION_NOTE.length > 200) throw new Error("relation note too long");
  if (REPLY.length > MESSAGE_MAX) throw new Error(`reply over by ${REPLY.length - MESSAGE_MAX}`);

  const exists = await prisma.problem.findUnique({ where: { slug: NEW } });
  console.log(`update ${OLD}`);
  console.log(`  model      : ${old.model} -> ${OLD_FIELDS.model}`);
  console.log(`  modelMaker : ${old.modelMaker} -> ${OLD_FIELDS.modelMaker}`);
  console.log(`  + aiRole, sourceName, resultNote`);
  console.log(`create ${NEW}${exists ? "  (EXISTS - skip)" : ""}`);
  console.log(`  ${NEW_FIELDS.name}`);
  console.log(`  ${NEW_FIELDS.solveType}/${NEW_FIELDS.resolution} sig=${NEW_FIELDS.significance} ai=${NEW_FIELDS.aiContribution}`);
  console.log(`relation same-work, reply ${REPLY.length}/${MESSAGE_MAX} chars, mark message read`);

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  // 1. Update the existing entry, one changelog row per changed field.
  const before = await prisma.problem.findUnique({
    where: { id: old.id },
    select: { sourceName: true, model: true, modelMaker: true, aiRole: true, resultNote: true },
  });
  await prisma.$transaction([
    prisma.problem.update({ where: { id: old.id }, data: OLD_FIELDS as never }),
    prisma.problemActivity.createMany({
      data: Object.keys(OLD_FIELDS).map((field) => ({
        problemId: old.id,
        userId: curator.id,
        userName: curator.pseudonym,
        type: "updated" as const,
        field,
        oldValue: (before as Record<string, string | null>)[field] ?? null,
        newValue: String(OLD_FIELDS[field]),
      })),
    }),
  ]);

  // 2. The new entry.
  if (!exists) {
    await prisma.$transaction([
      prisma.problem.create({
        data: {
          slug: NEW,
          ...(NEW_FIELDS as object),
          status: "published",
          links: { create: NEW_LINKS.map((l, position) => ({ ...l, position })) },
        } as never,
      }),
      prisma.problemActivity.create({
        data: { problem: { connect: { slug: NEW } }, user: { connect: { id: curator.id } }, userName: curator.pseudonym, type: "created" },
      }),
    ]);
    const fresh = await prisma.problem.findUnique({ where: { slug: NEW }, select: { id: true } });
    await prisma.problemRelation.create({
      data: { fromId: fresh!.id, toId: old.id, kind: "same-work", note: RELATION_NOTE, position: 0 },
    });
  }

  // 3. Reply in the thread, and mark the report read.
  await prisma.$transaction([
    prisma.directMessage.create({
      data: {
        userId: rusty.id,
        senderId: curator.id,
        senderName: curator.pseudonym,
        kind: "reply",
        body: REPLY,
        problemId: msg.problemId,
        parentId: msg.parentId ?? msg.id,
      },
    }),
    prisma.directMessage.update({ where: { id: msg.id }, data: { readAt: new Date() } }),
  ]);

  console.log("\nDONE: entry updated, new entry created, relation added, reply sent, message marked read");
}

main().finally(() => prisma.$disconnect());
