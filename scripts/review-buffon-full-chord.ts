// Review of GoldenMongoose827's Buffon discrepancy submission, 17 Aug 2026.
//
// Steinerberger posed the Buffon discrepancy problem in March 2026 and listed
// four open questions. Question 3, verbatim from arXiv:2603.27807:
//
//   "What happens if we were to restrict ourselves to only working with sets S
//    that are a union of intersections of lines with Omega? This would include
//    all Steinhaus sets but would eliminate examples like Fig. 3. Would this
//    fundamentally change the problem?"
//
// That is what this paper answers, and the answer is yes: Steinerberger gets
// discrepancy <= 100 in the disk with concentric circles, and this paper shows
// every full-chord construction in the disk is >= c log L. A genuine
// separation, so a genuine answer.
//
// Two things checked here, written from the paper's statements rather than run
// out of anything of the author's:
//
//  1. Lemma 3.1, the load-bearing reduction: in endpoint-pair space the chords
//     crossing a test line form a union of two rectangles of measure
//     2*H1(l ∩ Omega)/Lambda. Confirmed exactly for the disk by quadrature
//     against the closed form, at five arc widths, to 1e-9. Confirmed for an
//     ellipse (a = 1, b = 0.4) by sampling the kinematic measure in (p, theta)
//     - a parametrisation that knows nothing about endpoint pairs - and
//     reading the arcs off the sampled lines: agreement to 0.2% on four test
//     lines, with the implied Lambda matching the perimeter (4.6012 vs
//     4.6026). This is the whole idea of the paper and it holds.
//
//  2. The Aistleitner-Bilyk-Nikolov citation. Their abstract gives
//     (log N)^(d-1/2)/N for arbitrary normalised measures on [0,1]^d, so d = 2
//     is (log N)^(3/2)/N. Quoted faithfully, exponent and all.
//
// And an exact Buffon-discrepancy harness, written independently, reproduces
// the two growth rates that are already known: Steinhaus-style constructions
// (directions x offsets, up to L = 6438) fit disc ~ L^0.289 against
// Steinerberger's proved L^(1/3), and i.i.d. chords fit L^0.511 against the
// expected square root. So the measuring instrument is sound.
//
// What that instrument could NOT check is Theorem 1.1 itself. Its polylog
// bound comes from ABN, which is an existence theorem proved by transference,
// with no explicit construction attached. The nearest thing I could build - a
// Halton set pushed through the Rosenblatt transform of mu - fits L^0.346,
// i.e. no better than Steinhaus. That is a fact about my proxy, not evidence
// against the theorem: an existence result reached by a counting argument is
// exactly the kind that cheap explicit constructions do not realise. Theorem
// 1.2's log L is likewise far below what any feasible experiment resolves.
// Verification therefore stays Unreviewed.
//
// Three curation calls that go against the submission:
//
//  - Status partial, not resolved. Question 3 is answered, but the headline
//    Buffon problem - Steinerberger's question 1, whether O(1) is reachable
//    for every convex body - is untouched, and even inside the full-chord
//    model the order is only pinned between log L and (log L)^(3/2). The
//    submitter's own statement says these results "*mostly*" answer the
//    questions, which is partial by this site's definition.
//
//  - AI-assisted, not AI co-developed. The acknowledgement reserves the
//    mathematics: "The proof idea and the direction of the argument are due to
//    the author", crediting GPT-5.5 with "the detailed computations and
//    preparing an initial draft". Co-developed requires a named essential step
//    from the model, and the methodology says a vague disclosure gets the lower
//    tier. Reversible if the author names lemmas GPT actually proved.
//
//  - The statement's parenthetical said it is still open whether o(log L) is
//    possible without the full-chord restriction. In the disk it is not open:
//    Steinerberger already has O(1) there. The open case is general convex
//    bodies, which is what the paper's own closing line says.
import { PrismaClient } from "@prisma/client";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const ADMIN_EMAIL = "rasmus.lindahl1996@gmail.com";
const SLUG = "polylogarithmic-full-chord-buffon-discrepancy";

const LIMITS = new Map<string, number>();
for (const s of [...EDITABLE_FIELDS, ...CURATOR_FIELDS]) if (s.maxLength) LIMITS.set(s.key, s.maxLength);

const EDITS: { field: string; key: string; value: unknown }[] = [
  {
    field: "Short name",
    key: "shortName",
    value: "Buffon discrepancy of full chords",
  },
  { field: "Field detail", key: "field", value: "Discrepancy theory / integral geometry" },
  { field: "Posed by", key: "posedBy", value: "Stefan Steinerberger" },
  { field: "Year posed", key: "yearPosed", value: 2026 },
  {
    // Steinerberger's question 3 is answered; his question 1, the headline
    // problem, is not. The submitter's own "mostly" is the tell.
    field: "Status",
    key: "resolution",
    value: "partial",
  },
  { field: "Method", key: "resolutionMethod", value: "argument" },
  {
    // The paper reserves the mathematics for the author; the model did the
    // details and the draft.
    field: "How much the AI did",
    key: "aiContribution",
    value: "ai-assisted",
  },
  {
    field: "Statement",
    key: "statement",
    value:
      "Steinerberger introduced the Buffon discrepancy problem, asking how accurately a one-dimensional set of length $L$ in a convex body $\\Omega$ can match the Crofton-predicted line-intersection counts, and proved an $O(L^{1/3})$ upper bound via a Steinhaus longimeter construction. His third open question asks whether restricting to sets built from full chords - intersections of lines with $\\Omega$, the class containing every Steinhaus set - fundamentally changes the problem.\n\nIt does. Using the Aistleitner-Bilyk-Nikolov star-discrepancy theorem for arbitrary measures, full-chord constructions with discrepancy $O\\left((\\log L)^{3/2}\\right)$ are shown to exist for every compact convex body with finite piecewise $C^2$ boundary. In the disk, every full-chord construction is shown to have discrepancy at least $\\Omega(\\log L)$, via Schmidt's two-dimensional rectangle lower bound - where Steinerberger's concentric-circle construction, which is not full-chord, achieves discrepancy at most $100$.",
  },
  {
    field: "What was actually shown",
    key: "resultNote",
    value:
      "This settles Steinerberger's third open question and separates the two models: in the disk, full chords cost you a factor growing like $\\log L$ over what is achievable without the restriction. It also improves the Steinhaus-type $O(L^{1/3})$ to polylogarithmic within the full-chord class.\n\nIt does not settle the Buffon discrepancy problem itself. Steinerberger's first question - whether every convex body admits a set of discrepancy $O(1)$, and if not what the truth is - is untouched, and the paper's closing line names it as the natural next question. Inside the full-chord model the order is pinned only between $\\Omega(\\log L)$ and $O\\left((\\log L)^{3/2}\\right)$, and the lower bound is proved for the disk alone. The paper says the exponents are unlikely to be sharp.\n\nThe upper bound is an existence statement: it inherits the Aistleitner-Bilyk-Nikolov theorem, which is proved by transference and supplies no explicit construction.",
  },
  {
    field: "Verification note",
    key: "verificationNote",
    value:
      "A preprint by a single author, not refereed and not endorsed by anyone independent, so this stays Unreviewed.\n\nThis site checked the reduction the note rests on. Lemma 3.1 says the chords crossing a test line form a union of two rectangles in endpoint-pair space, of measure $2\\mathcal{H}^1(\\ell \\cap \\Omega)/\\Lambda_\\Omega$ - the identity that turns a Buffon problem into a two-dimensional rectangle discrepancy problem. It was confirmed exactly for the disk by quadrature at five arc widths (agreement to $10^{-9}$), and for an ellipse by sampling the kinematic measure in $(p,\\theta)$ coordinates, which know nothing about endpoint pairs, giving agreement within 0.2% and an implied $\\Lambda_\\Omega$ of 4.6012 against a perimeter of 4.6026. The Aistleitner-Bilyk-Nikolov bound is quoted faithfully: their $(\\log N)^{d-1/2}/N$ at $d=2$ is $(\\log N)^{3/2}/N$. An independent exact-supremum harness reproduces both known growth rates: $L^{0.289}$ for Steinhaus-type constructions against the proved $L^{1/3}$, and $L^{0.511}$ for i.i.d. chords against the square root.\n\nNeither theorem itself was checked. The upper bound rests on an existence result with no explicit construction, and the closest thing this site could build - a Halton set pushed through the Rosenblatt transform of $\\mu_\\Omega$ - fits $L^{0.346}$, no better than Steinhaus. That is a limitation of the proxy, not evidence against the theorem. The $\\Omega(\\log L)$ lower bound is below the resolution of any feasible experiment.",
  },
  { field: "Significance", key: "significance", value: 5 },
  {
    field: "Significance note",
    key: "significanceNote",
    value:
      "Exactly the anchor case for 5: a question posed in one paper in March 2026 and answered seven weeks later, with no prior literature. The two follow-ups it has are both by the author of this one, so the problem had drawn no independent attention before it was answered. It sits above the U_30 phase-ambiguity question at 4 because discrepancy theory is a mainstream area with a real audience, and well below a typical numbered Erdos problem at 10, which carries decades of documented attack.",
  },
  {
    field: "Age footnote",
    key: "ageNote",
    value:
      "Posed 29 March 2026 in Steinerberger's paper and answered 18 May 2026 - seven weeks, so the years-open figure rounds to zero rather than being unknown.",
  },
  { field: "Source URL", key: "sourceUrl", value: "https://arxiv.org/abs/2605.23020" },
  { field: "Source name", key: "sourceName", value: "arXiv" },
];

const LINKS = [
  {
    label: "Steinerberger - Buffon discrepancy and the Steinhaus longimeter (the problem, open question 3)",
    url: "https://arxiv.org/abs/2603.27807",
    kind: "problem-record",
  },
  {
    label: "Korsky - Randomly shifted Steinhaus longimeters and Buffon discrepancy (the earlier attempt)",
    url: "https://arxiv.org/abs/2605.10096",
    kind: "paper",
  },
  {
    label: "Aistleitner, Bilyk, Nikolov - the arbitrary-measure star-discrepancy theorem behind the upper bound",
    url: "https://arxiv.org/abs/1703.06127",
    kind: "paper",
  },
];

const MESSAGE = `Published, with the status and the AI axis moved.

The framing holds. I pulled Steinerberger's source and found his question 3 verbatim - would restricting to unions of lines cut by Omega "fundamentally change the problem?" - and the theorems answer it: his concentric circles get discrepancy at most 100 in the disk, and every full-chord set is now at least c log L.

I checked Lemma 3.1 rather than taking it on trust, since the note rests on it: exactly for the disk by quadrature at five arc widths, and for an ellipse by sampling the kinematic measure in (p, theta) and reading the arcs off the sampled lines, agreeing within 0.2%. The ABN bound is quoted faithfully. My own exact-supremum harness reproduces Steinerberger's L^(1/3) for Steinhaus sets (L^0.289) and the square root for i.i.d. chords (L^0.511), so the instrument is sound. It could not confirm Theorem 1.1: ABN is an existence theorem with no construction attached, and a Halton set pushed through the Rosenblatt transform of mu gives me only L^0.346 - my proxy failing, not your theorem, and the note says so.

Status is now Partial. Question 3 is answered, but question 1 - is O(1) reachable for every convex body - is untouched, and inside the full-chord model the order sits between log L and (log L)^(3/2). Your own statement says the results "mostly" answer the questions; partial is this site's word for that.

The AI axis is now AI-assisted. The acknowledgement reserves the mathematics - "The proof idea and the direction of the argument are due to the author" - and credits GPT-5.5 with the detailed computations and an initial draft. Co-developed means a named essential step came from the model, and a disclosure naming none gets the lower tier by rule. If specific lemmas were GPT's, say which and I will move it up.

One correction: the statement said it is open whether o(log L) is possible without the full-chord restriction. In the disk it is not - Steinerberger has O(1). The open case is general convex bodies.`;

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

  console.log(`${SLUG}: approve (edited)\n`);
  for (const c of changes) {
    const short = (s: string | null) => (s === null ? "(empty)" : s.length > 90 ? `${s.slice(0, 90)}...` : s);
    console.log(`  ${c.field}:\n    - ${short(c.oldValue)}\n    + ${short(c.newValue)}`);
  }
  console.log(`\n  links: ${p.links.length} -> ${LINKS.length}`);
  console.log(`  unchanged: solveType=${p.solveType}, verification=${p.verification}, publication=${p.publication}, model=${p.model}`);
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
