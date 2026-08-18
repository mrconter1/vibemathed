// Review of StormyRaven240's cyclic-conjugation in-tree submission, 17 Aug 2026.
//
// A blog post, not a preprint, and the author is an amateur who says outright
// that he cannot check the 12-page proof. That is exactly the case where the
// entry is worth only as much as the checking behind it, and this one turns
// out to be unusually checkable: the claim is a formula for a quantity that
// can be computed from the definition.
//
// check_intree.py, written from the entry's statement:
//
//  - exhaustive, every n-cycle enumerated and the whole functional graph
//    built, for n = 2..10. |D^{-1}(s)| = phi(n) at every n. Depth matches the
//    formula at every n, including the two nontrivial cases in range: 3 at
//    n = 8 (2^{e-1}-1) and 3 at n = 9 (p^{e-1}). The squarefree n and n = 4
//    give 1 as predicted.
//
//  - backward BFS past what enumeration can reach, since the preimages of a
//    cycle q are x0 s^k for a single x0 and so cost n checks rather than
//    (n-1)!. Depth 7 at n = 16, 5 at n = 25, 9 at n = 27 (472,392 nodes),
//    3 at n = 18, 1 at n = 12 - all exactly the predicted values, and n = 27
//    is far outside brute-force range.
//
//  - the Hull-Dobell mechanism, directly. The preimages of the translation
//    t_a are exactly the affine maps i -> ai + c, Hull-Dobell decides which of
//    those are n-cycles, and the threshold "8 | n or p^2 | n for odd p"
//    predicts a nonempty level 2 exactly, at n = 6, 8, 9, 12, 16, 18, 25, 27.
//    No exceptions on any of the three.
//
//  - the survey paper's basin-count sequence, recounted from scratch:
//    1, 2, 2, 6, 7, 18, 17, 29 for n = 3..10, matching its first eight terms.
//    OEIS has no hit for the full sequence, so "appears to be new" survives a
//    check as far as I can take it.
//
// None of that verifies the proof, which is the novelty, and the paper itself
// says so in a footnote on page one: "An end-to-end verification of the
// assembled whole, and human peer review, remain to be done; the argument
// should be examined critically before being relied upon." Unreviewed and
// Candidate, which is what the submitter asked for.
//
// Three corrections, all found by checking the submission against its own
// cited sources rather than by judgment:
//
//  - the model in phase one was Opus 4.8, not 4.6. The blog says "j'ai
//    enchaine avec le modele le plus fort disponible: Opus 4.8 en mode
//    thinking". 4.6 is the model in the Knuth quote the same post opens with,
//    which is presumably where the slip came from.
//  - the question was posed in 2006, not 2012. The Wayback copy of
//    permutationc.free.fr is stamped "Published On: sept. 18, 2006", and the
//    entry URLs carry 2006 timestamps. The site's rule is the earliest cited
//    reference, and that is now six years earlier than submitted.
//  - the author signs both papers Frederic Lefebvre-Nare, not Lefebvre.
import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "depth-of-the-in-tree-of-s-in-the-graph-of-q-qsq-1-in-the-symmetric-group";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const EDITS: { field: string; key: string; value: unknown }[] = [
  {
    field: "Name",
    key: "name",
    value: "Depth of the in-tree of $s$ under $q \\mapsto q s q^{-1}$ on $n$-cycles",
  },
  { field: "Short name", key: "shortName", value: "In-tree depth under cyclic conjugation" },
  { field: "Field detail", key: "field", value: "Permutation combinatorics / functional graphs" },
  { field: "Posed by", key: "posedBy", value: "Frédéric Lefebvre-Naré" },
  // Wayback: the entries on permutationc.free.fr are stamped September 2006.
  { field: "Year posed", key: "yearPosed", value: 2006 },
  {
    field: "Statement",
    key: "statement",
    value:
      "Fix an $n$-cycle $s$ and map every $n$-cycle $q$ to its conjugate $D(q) = q s q^{-1}$, which is the same as reading the one-line word $(q(0), \\ldots, q(n-1))$ back as a cycle. Iterating $D$ turns the $(n-1)!$ $n$-cycles into a functional graph. Its only fixed point is $s$, and the cycles that eventually reach $s$ form a tree feeding into it. How deep is that tree?\n\nExactly $\\varphi(n)$ cycles map directly onto $s$, and the tree stays shallow - depth 1 - unless $8 \\mid n$ or $p^2 \\mid n$ for an odd prime $p$, which is the Hull-Dobell threshold for the existence of a full-period non-translation affine map on $\\mathbb{Z}/n$. Past it the depth is $p^{e-1}$ for $n = p^e$ with $p$ odd, $2^{e-1} - 1$ for $n = 2^e$, and for general $n$ the largest of these over the prime powers dividing $n$.",
  },
  {
    // The blog names Opus 4.8; 4.6 is the model in the Knuth quote it cites.
    field: "What the AI did",
    key: "aiRole",
    value:
      "Claude Opus 4.8 in a first phase, then Claude FABLE 5, which obtained the result, did 99.9% of the research, in manual mode (that is, with more than 50 human prompts by an amateur, and step-by-step approvals). OpenAI's GPT-5.5 and others were used to proofread; all corrections after human and AI proofreading were made by Claude. Diagrams were made by Claude under human instructions.",
  },
  {
    field: "What was actually shown",
    key: "resultNote",
    value:
      "Opus 4.8 constructed a branch of the stated depth, giving a lower bound, and believed it had a matching upper bound; that proof was wrong and the statement stayed a conjecture. FABLE 5 later proved it. In the author's summary of the method: \"The proof turns conjugation, near $s$, into base-$p$ arithmetic.\" A cycle near the fixed point splits into a coarse base permutation and a vector of carries in $\\mathbb{Z}/p$, $D$ acts on the carries by the carrying of ordinary base-$p$ addition, and the depth comes out as the nilpotency length of a shift difference - exactly that for odd $p$, one less for $p = 2$. The single missing carry that odd primes absorb and $2$ cannot is what produces the two-branch answer.\n\nA companion survey paper covers the rest of the graph: the other periodic orbits, congruences on basin sizes, and a cyclic-sieving count. The depth theorem is the substantive part.",
  },
  {
    field: "Verification note",
    key: "verificationNote",
    value:
      "Not refereed, not formalised, and the paper says so itself on page one: \"An end-to-end verification of the assembled whole, and human peer review, remain to be done; the argument should be examined critically before being relied upon.\" The author, an amateur, states plainly that he cannot check the proof. So this stays Unreviewed and Candidate.\n\nThe claim is unusually checkable, though, and this site checked it independently, from the statement rather than from the author's code. Enumerating every $n$-cycle and building the whole functional graph for $n \\le 10$: $|D^{-1}(s)| = \\varphi(n)$ at every $n$, and the depth matches the formula at every $n$, including both nontrivial cases in range, depth 3 at $n = 8$ and at $n = 9$. Walking the tree backwards, which costs $n$ checks per node instead of $(n-1)!$, reaches depth 7 at $n = 16$, 5 at $n = 25$, 3 at $n = 18$, and 9 at $n = 27$ across 472,392 nodes - every one the predicted value. The Hull-Dobell mechanism was checked directly: preimages of a translation are exactly the affine maps with that multiplier, Hull-Dobell decides which are $n$-cycles, and the threshold predicts a nonempty second level exactly, no exceptions at $n = 6, 8, 9, 12, 16, 18, 25, 27$. The survey's basin-count sequence recounts to 1, 2, 2, 6, 7, 18, 17, 29 for $n = 3 \\ldots 10$, matching, and OEIS returns nothing for it.\n\nWhat none of that touches is the proof, which is the novelty: a formula confirmed at every $n$ reachable is not a theorem for all $n$.",
  },
  { field: "Significance", key: "significance", value: 3 },
  {
    field: "Significance note",
    key: "significanceNote",
    value:
      "Below the anchor at 5, which covers machine-generated conjectures and recent one-paper questions. This one is a real, precisely posed question about a natural object, but it was asked by a high-school pupil in about 1980, put on a personal blog in 2006, and engaged with by nobody in the twenty years since - no citations, no literature, no community. A Graffiti conjecture at least lands on a list a research community reads. Above the floor because the question is genuine rather than generated, and the submitter says the same thing: this is not about an important issue in mathematics.",
  },
  {
    field: "Age footnote",
    key: "ageNote",
    value:
      "The author first asked the question as a school pupil around 1980 and posted his hand and Excel explorations to a dedicated blog, archived by the Wayback Machine with entries stamped September 2006 - the earliest citable reference, which is what the posed year records. The precise question answered here, the exact depth of the in-tree, was only formulated in the June 2026 dialogue with the model.",
  },
  { field: "Source name", key: "sourceName", value: "Data Stratégies (the author's blog)" },
];

const LINKS = [
  {
    label: "The depth theorem, with the full proof (companion paper, 24 July 2026)",
    url: "https://www.datastrategies.fr/sites/default/files/documents/2026-07/depth_companion_1.pdf",
    kind: "paper",
  },
  {
    label: "The functional graph of the whole map (survey paper, 25 July 2026)",
    url: "https://www.datastrategies.fr/sites/default/files/documents/2026-07/derivation_2.pdf",
    kind: "paper",
  },
  {
    label: "The author's 2006 blog on the same question, via the Wayback Machine",
    url: "https://web.archive.org/web/2012/http://permutationc.free.fr/B1703659376/",
    kind: "problem-record",
  },
];

const MESSAGE = `Published as Candidate, significance 3, with three corrections.

Your submission is honest about what this is, which made it easy to take seriously. The claim is also unusually checkable, so rather than judge the 12-page proof I recomputed what it predicts, from your statement rather than any code of yours.

Enumerating every n-cycle and building the whole graph for n up to 10: |D^-1(s)| = phi(n) everywhere, and the depth matches everywhere, including both nontrivial cases in range - 3 at n=8 and 3 at n=9. Walking the tree backwards instead, which costs n checks per node rather than (n-1)!, gives depth 7 at n=16, 5 at n=25, 3 at n=18 and 9 at n=27 over 472,392 nodes - every one the predicted value, and n=27 far outside brute-force range. I checked the Hull-Dobell mechanism directly too: preimages of a translation are exactly the affine maps with that multiplier, Hull-Dobell decides which are n-cycles, and the threshold predicts a nonempty second level exactly. And the survey's basin-count sequence recounts to 1, 2, 2, 6, 7, 18, 17, 29 for n=3..10, matching; OEIS returns nothing for it, so "appears to be new" survives too.

None of that verifies the proof, which is the novelty, so the tier stays Unreviewed - as the paper's own status footnote says better than I could.

The corrections:

Opus 4.8, not 4.6. Your blog says you moved to "Opus 4.8 en mode thinking"; 4.6 is the model in the Knuth quote the post opens with.

Posed 2006, not 2012. The Wayback copy of permutationc.free.fr is stamped "Published On: sept. 18, 2006", and the entry URLs carry 2006 timestamps. This site records the earliest citable reference, so the question is six years older than you gave.

And you sign both papers Lefebvre-Naré, so the entry does too.

Significance 3 sits below the 5 the ladder gives machine-generated conjectures, because those at least land on a list a research community reads. That is about the audience the question had, not about the work - and it is what your own note says.`;

async function main() {
  const admin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!admin) throw new Error("no admin");

  const p = await prisma.problem.findUnique({ where: { slug: SLUG }, include: { links: true } });
  if (!p) throw new Error(`no entry ${SLUG}`);
  if (p.status !== "pending") throw new Error(`${SLUG} is ${p.status}`);

  const row = p as unknown as Record<string, unknown>;
  const data: Record<string, unknown> = {};
  const changes: { field: string; oldValue: string | null; newValue: string | null }[] = [];
  const fmt = (v: unknown) => (v === null || v === undefined ? null : String(v));

  let bad = 0;
  for (const e of EDITS) {
    const lim = LIMITS.get(e.key);
    if (lim && typeof e.value === "string" && e.value.length > lim) {
      console.log(`  ${e.key} OVER BY ${e.value.length - lim} (${e.value.length}/${lim})`);
      bad++;
    }
    if (fmt(row[e.key]) === fmt(e.value)) continue;
    data[e.key] = e.value;
    changes.push({ field: e.field, oldValue: fmt(row[e.key]), newValue: fmt(e.value) });
  }
  for (const l of LINKS) {
    if (l.label.length > 120) {
      console.log(`  link label OVER BY ${l.label.length - 120}: ${l.label}`);
      bad++;
    }
  }

  console.log(`${SLUG}: approve (edited)\n`);
  for (const c of changes) {
    const short = (s: string | null) => (s === null ? "(empty)" : s.length > 90 ? `${s.slice(0, 90)}...` : s);
    console.log(`  ${c.field}:\n    - ${short(c.oldValue)}\n    + ${short(c.newValue)}`);
  }
  console.log(`\n  links: ${p.links.length} -> ${LINKS.length}`);
  console.log(`  unchanged: resolution=${p.resolution}, verification=${p.verification}, publication=${p.publication}, ai=${p.aiContribution}, model=${p.model}, sourceUrl=${p.sourceUrl}`);
  console.log(`  message: ${MESSAGE.length}/${MESSAGE_MAX}`);
  if (MESSAGE.length > MESSAGE_MAX) bad++;
  if (bad) throw new Error("fix the flagged fields before applying");

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to write");
    return;
  }

  await prisma.$transaction([
    prisma.problem.update({
      where: { id: p.id },
      data: {
        ...data,
        links: { deleteMany: {}, create: LINKS.map((l, position) => ({ ...l, position })) },
        status: "published",
        reviewedAt: new Date(),
        reviewMessage: MESSAGE,
        reviewReason: "edited",
      },
    }),
    prisma.problemActivity.createMany({
      data: changes.map((c) => ({
        problemId: p.id,
        userId: admin.id,
        userName: admin.pseudonym ?? null,
        type: "updated" as const,
        field: c.field,
        oldValue: c.oldValue,
        newValue: c.newValue,
      })),
    }),
    prisma.problemActivity.create({
      data: { problemId: p.id, userId: admin.id, userName: admin.pseudonym ?? null, type: "approved" },
    }),
    ...(p.submittedById
      ? [
          prisma.directMessage.create({
            data: {
              userId: p.submittedById,
              senderId: admin.id,
              senderName: admin.pseudonym ?? null,
              kind: "decision",
              reason: "edited",
              body: MESSAGE,
              problemId: p.id,
            },
          }),
        ]
      : []),
  ]);

  const left = await prisma.problem.count({ where: { status: "pending" } });
  const published = await prisma.problem.count({ where: { status: "published" } });
  console.log(`APPLIED - ${left} pending, ${published} published`);
}

main().finally(() => prisma.$disconnect());
