// Afternoon of 15 September 2026: one hold, one withdrawal, one report.
//
// 1. MATROID SECRETARY - HOLD. Sahil Singla, "The Matroid Secretary Conjecture
//    is True", arXiv:2609.14555, 13 September, with the central algorithm
//    credited to ChatGPT Astra. The conjecture (Babaioff, Immorlica and
//    Kleinberg, 2007) is one of the best-known open problems in online
//    algorithms; the best prior guarantee was O(log log rank). A constant
//    4-competitive algorithm for every matroid would settle it. Singla is an
//    established researcher in exactly this area and the disclosure is
//    careful, which is the Ishiki situation of 10 September: held as a
//    timing decision, not a doubt. Two days old, no independent reading, no
//    formal proof. Fields fixed now so it can be re-published unchanged.
//
// 2. R_3 = 10 - WITHDRAWN, solved-elsewhere-first. Approved this morning at
//    lean-checked, 12. The submitter then reported his own entry: Tarannikov
//    and Kirienko (IACR ePrint 2000/050) proved p(4) = 10 for resilient
//    functions, and under f' = f * chi_[n] "degree <= d" is "(n-d-1)-
//    resilient" and "irrelevant" is "linear", so R_d = p(d+1) and R_3 = 10
//    has been known since 2000. Checked here in Krotov and Valyuzhenich,
//    Discrete Math. 347 (2024), arXiv:2311.05566: Lemma 1(a) and (c) are
//    that dictionary verbatim, and the introduction says "they also proved
//    that p(4) = 10 (a computer-free proof was later suggested by Zverev)"
//    and "a Boolean function of degree at most 3 cannot have more than 10
//    essential arguments". The ePrint PDF itself would not download from
//    here; the 2024 journal paper is a sufficient and independent citation.
//    My prior-art check this morning searched "R_3" and "relevant variables"
//    and never the resilient-function literature; that miss is mine. The
//    entry comes down. Nothing is wrong with the mathematics or the Lean; a
//    new proof of a 2000 theorem is out of scope, and the site rule is that
//    the question must have been open when the AI answered it.
//
// 3. REPORT 63b8cfbd - handled by (2). The reporter is thanked in the
//    withdrawal message; his report is exactly what the report button is for.
//
// Dry run by default. --lint checks lengths and rules with no database.
// --apply writes. Production writes are the curator's to run.

import { guardedPrisma } from "./lib/guarded-prisma";
import { checkStoredEntry } from "../src/lib/field-validation";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";
import { charLength, canonical } from "../src/lib/char-length";

const APPLY = process.argv.includes("--apply");
const LINT = process.argv.includes("--lint");
const SPECS = [...EDITABLE_FIELDS, ...CURATOR_FIELDS];

const REPORT_ID = "63b8cfbd-04e0-49d0-81e8-833ee552ba3b";

interface Decision {
  slug: string;
  /// "hold" and "withdraw" both land as status rejected; they differ in
  /// what the row was before (pending vs published) and in the reason.
  action: "hold" | "withdraw";
  expectStatus: "pending" | "published";
  reason: string;
  message: string;
  edits?: Record<string, unknown>;
  reviewNote?: string;
}

const DECISIONS: Decision[] = [
  {
    slug: "matroid-secretary-conjecture",
    action: "hold",
    expectStatus: "pending",
    reason: "held",
    edits: {
      name: "The matroid secretary conjecture",
      shortName: "Matroid secretary",
      statement:
        "In the matroid secretary problem the elements of a matroid arrive one by one in uniformly random order, each revealing its weight on arrival, and an element must be accepted or rejected irrevocably while keeping the accepted set independent. Babaioff, Immorlica and Kleinberg conjectured in 2007 that a constant-competitive algorithm exists for every matroid. The best guarantee before 2026 was $O(\\log\\log \\mathrm{rank})$. Is there an online algorithm whose expected accepted weight is within a constant factor of the maximum-weight independent set, for every matroid?",
      posedBy: "Moshe Babaioff, Nicole Immorlica and Robert Kleinberg, SODA 2007",
      model: "GPT-6 Astra (via ChatGPT); Claude Opus 5 for presentation",
      humanCollaborators: ["Sahil Singla"],
      publication: "preprint",
      sourceName: "arXiv:2609.14555 v1, 13 September 2026",
    },
    reviewNote:
      "Held 15 Sep 2026 under the extraordinary-claims rule: arXiv 2609.14555 v1, two days old, claiming a 4-competitive algorithm for the matroid secretary problem on every matroid, settling the 2007 Babaioff-Immorlica-Kleinberg conjecture. Best prior guarantee O(log log rank) (Lachish 2014; Feldman-Svensson-Zenklusen 2015). Singla is an established researcher in exactly this area and the AI disclosure names the model that found the algorithm and separates it from editorial use, so this is the Ishiki situation: a timing decision, not a doubt. Re-publish as submitted (Resolved, Unreviewed, significance to be set, likely 45: a famous named conjecture in online algorithms, below union-closed at 50) once a named expert with no stake has read the argument, the paper is accepted, or a machine-checked proof exists. Name, statement and attribution fixed now. Watch arXiv 2609.14555 for v2 and for commentary.",
    message: [
      "Held, not declined, and only because of the size of the claim.",
      "",
      "A 4-competitive algorithm for every matroid settles a conjecture that has been one of the best-known open problems in online algorithms since 2007, where the previous record stood at O(log log rank). The site's rule for a claim of that size is that it is held until a named expert with no stake has read the argument, the paper is accepted somewhere, or a machine-checked proof exists. The preprint is two days old, so none of those has had time to happen.",
      "",
      "This is not a doubt. The author is an established researcher in exactly this area, and the disclosure is careful in a way few submissions manage: it names the model that produced the central algorithm, says which of several explored approaches it came from, and separates that from the editorial use of Astra and Claude Opus 5. All of that is recorded on the row.",
      "",
      "Nothing needs to change in your submission. The entry's name, statement and attribution were tidied so it can be published exactly as it stands the day one of the three conditions is met; its verification will be Unreviewed at that point, as you yourself proposed, and the significance will sit around 45. If you know of a specialist who has read the proof, or when v2 or an acceptance appears, message us and it goes up the same day.",
      "",
      "Your note about the two deferred extensions (the single-sample prophet inequality and the k-matroid intersection) is right and is why they are not on the row.",
    ].join("\n"),
  },
  {
    slug: "the-maximum-number-of-relevant-variables-of-a-degree-3-boolean-function-is-r-3-1",
    action: "withdraw",
    expectStatus: "published",
    reason: "solved-elsewhere-first",
    reviewNote:
      "Withdrawn 15 Sep 2026, hours after publication, on the submitter's own report. R_3 = 10 was proved in 2000: Tarannikov and Kirienko, IACR ePrint 2000/050, show p(4) = 10 for resilient functions, and the dictionary f' = f * chi_[n] turns degree <= d into (n-d-1)-resilient and an irrelevant variable into a linear one, so R_d = p(d+1). Checked in Krotov and Valyuzhenich, Discrete Math. 347 (2024), arXiv:2311.05566: Lemma 1(a),(c) is the dictionary; the introduction states p(4) = 10, credits a later computer-free proof to Zverev, and says outright that a degree-3 Boolean function has at most 10 essential arguments. The morning approval's prior-art check searched the relevant-variables literature and not the resilient-function one; the miss was the curator's, not the submitter's. The mathematics and the Lean core stand as a new proof of a known theorem, which is out of scope.",
    message: [
      "Withdrawn, on your own report, and thank you for making it.",
      "",
      "You are right on every point. Krotov and Valyuzhenich's Lemma 1 is the dictionary exactly as you state it, their introduction says Tarannikov and Kirienko proved p(4) = 10 with a computer-free proof later given by Zverev, and they say in as many words that a degree-3 Boolean function has at most 10 essential arguments. So R_3 = 10 has been a theorem since 2000, and this entry recorded a rediscovery as a resolution. That is the one thing the catalog must not do, and the entry has been taken down.",
      "",
      "The miss was the reviewer's, not yours. The morning check searched for R_3 and for relevant variables of low-degree functions and never for resilient functions, which is the language the 2000 literature used. Your submission also said Tao's page listed R_3 as unknown, which it does not, but the approval already corrected that and it is not why the entry is down.",
      "",
      "What stands: your finite encoding F(11), F(12) is a correct machine-checked proof of a known theorem by a new route, and a Lean-checked core for a result that previously rested on a 2000 computation and a later hand proof has real value. It is out of scope here only because the question was not open when the AI answered it. If a formalisation venue or the Tao ledger's issue thread wants it, that is where it belongs.",
      "",
      "Reporting your own entry within hours of publication is the best thing anyone has done with the report button.",
    ].join("\n"),
  },
];

async function connectWithRetry(prisma: {
  $queryRawUnsafe: <T>(q: string) => Promise<T>;
}): Promise<string> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= 8; attempt++) {
    try {
      const [{ db }] = await prisma.$queryRawUnsafe<{ db: string }[]>(
        "SELECT current_database() AS db",
      );
      return db;
    } catch (e) {
      lastError = e;
      console.log(`connection attempt ${attempt} failed; retrying in 5s`);
      await new Promise((r) => setTimeout(r, 5000));
    }
  }
  throw lastError;
}

function lint(): number {
  let bad = 0;
  const limit = new Map<string, number>();
  for (const s of SPECS) if (s.maxLength) limit.set(s.key, s.maxLength);
  for (const d of DECISIONS) {
    console.log(`${d.action.toUpperCase().padEnd(8)} ${d.slug.slice(0, 56)}`);
    const n = charLength(canonical(d.message));
    console.log(`  message : ${n}/${MESSAGE_MAX}${n > MESSAGE_MAX ? "  OVER" : ""}`);
    if (n > MESSAGE_MAX) bad++;
    for (const [k, v] of Object.entries(d.edits ?? {})) {
      if (typeof v === "string") {
        const c = charLength(canonical(v));
        const lim = limit.get(k);
        const over = lim !== undefined && c > lim;
        console.log(`  ${k.padEnd(17)}: ${c}${lim ? `/${lim}` : ""}${over ? "  OVER" : ""}`);
        if (over) bad++;
      } else console.log(`  ${k.padEnd(17)}: ${JSON.stringify(v)}`);
    }
    if (d.reviewNote) console.log(`  reviewNote        : ${charLength(canonical(d.reviewNote))} (curator table, no cap)`);
    const v = checkStoredEntry({ specs: SPECS, fields: d.edits ?? {} });
    for (const x of v) console.log(`  RULE: ${x.field}: ${x.problem}`);
    bad += v.length;
    console.log();
  }
  return bad;
}

async function main() {
  const localBad = lint();
  if (LINT) {
    console.log(localBad ? `${localBad} local violation(s)` : "local checks ok");
    process.exitCode = localBad ? 1 : 0;
    return;
  }
  if (localBad) throw new Error(`${localBad} local violation(s) - nothing written`);

  const prisma = guardedPrisma();
  try {
    const db = await connectWithRetry(prisma);
    console.log(`\ndatabase: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`);

    const curator = await prisma.user.findFirst({
      where: { pseudonym: "Rasmus Lindahl" },
      select: { id: true, pseudonym: true },
    });

    for (const d of DECISIONS) {
      const cur = await prisma.problem.findUnique({
        where: { slug: d.slug },
        select: { id: true, status: true, name: true, sourceUrl: true, submittedById: true, links: { select: { label: true, url: true } } },
      });
      if (!cur) throw new Error(`not found on ${db}: ${d.slug}`);
      if (cur.status !== d.expectStatus) throw new Error(`${d.slug} is ${cur.status}, expected ${d.expectStatus}`);
      const v = checkStoredEntry({ specs: SPECS, fields: d.edits ?? {}, links: cur.links, sourceUrl: cur.sourceUrl });
      console.log(`${d.action.toUpperCase().padEnd(8)} ${cur.name.slice(0, 60)}  [${cur.status}] -> merged check: ${v.length ? "FAILED" : "ok"}`);
      for (const x of v) console.log(`    - ${x.field}: ${x.problem}`);
      if (v.length) throw new Error("would be refused");
      if (!cur.submittedById) console.log("  NOTE: no submitter, no message sent");
    }

    const report = await prisma.problemReport.findUnique({
      where: { id: REPORT_ID },
      select: { id: true, status: true, userName: true, problem: { select: { slug: true } } },
    });
    if (!report) throw new Error("report not found");
    console.log(`REPORT   ${report.id.slice(0, 8)} by ${report.userName} on ${report.problem?.slug?.slice(0, 40)} [${report.status}] -> will mark handled`);
    if (report.status !== "open") throw new Error(`report is ${report.status}, not open`);

    if (!APPLY) {
      console.log("\nDRY RUN - pass --apply to write");
      return;
    }
    if (!curator) throw new Error("curator not found on this database");

    for (const d of DECISIONS) {
      const cur = await prisma.problem.findUnique({
        where: { slug: d.slug },
        select: { id: true, submittedById: true },
      });
      if (!cur) throw new Error(`vanished: ${d.slug}`);
      await prisma.problem.update({
        where: { id: cur.id },
        data: {
          ...(d.edits ?? {}),
          status: "rejected",
          reviewedAt: new Date(),
          reviewMessage: d.message,
          reviewReason: d.reason,
        } as never,
      });
      console.log(`${d.action}: ${d.slug}`);
      if (cur.submittedById) {
        await prisma.directMessage.create({
          data: {
            userId: cur.submittedById,
            senderId: curator.id,
            senderName: curator.pseudonym,
            kind: "decision",
            reason: d.reason,
            body: d.message.slice(0, MESSAGE_MAX),
            problemId: cur.id,
          },
        });
        console.log(`messaged: ${d.slug}`);
      }
      await prisma.problemActivity.create({
        data: { problemId: cur.id, userId: curator.id, userName: curator.pseudonym, type: "rejected" },
      });
      if (d.reviewNote) {
        await prisma.reviewNote.create({
          data: { problemId: cur.id, userId: curator.id, userName: curator.pseudonym, body: d.reviewNote },
        });
        console.log(`review note: ${d.slug}`);
      }
    }

    await prisma.problemReport.update({
      where: { id: REPORT_ID },
      data: { status: "handled", handledAt: new Date() },
    });
    console.log("report marked handled");

    console.log("\nAPPLIED. The withdrawn entry's page goes with the next revalidation or");
    console.log("deploy; the lists lag by up to an hour. Held rows are not public.");
  } finally {
    await prisma.$disconnect();
  }
}

main();
