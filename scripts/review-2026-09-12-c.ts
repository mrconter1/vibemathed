// Review of the four submissions pending on the evening of 12 September 2026,
// plus one verification the evidence now settles.
//
// Two in, two declined, and the two declines are the submitters' own reading.
//
// ---------------------------------------------------------------------------
// STONEHAM TWO-SUM (CaptainSude) - approved, Lean-verified, resolved,
// ai-discovered, significance 25.
//
// The question is real, published and precisely stated. Bailey and Borwein,
// "Nonnormality of Stoneham constants", Ramanujan J. 29 (2012) 409-422,
// Section 4, read here at source:
//
//   "Under the hypothesis b, c1, c2 >= 2, with (b,c1) coprime and (b,c2)
//    coprime, we know from Theorem 1 that alpha_{b,c1} and alpha_{b,c2} are
//    each b-normal. But it is not known at the present time whether the sum
//    alpha_{b,c1} + alpha_{b,c2} is b-normal."
//
// The submission said Section 6; the repository's own Challenge.lean is more
// accurate and says Section 4 with Section 6 repeating it. posedBy is
// corrected to match the paper.
//
// Worth stating because it is easy to conflate: Bailey and Borwein PROVED a
// sum result in that same paper - Theorem 3, that a sum of two B-NONnormal
// Stoneham constants is B-nonnormal. That is a different base and the
// opposite property. What they left open, and what this settles, is
// normality in the common defining base.
//
// Checked at commit f4d3d1f:
//   - Challenge.lean imports only Mathlib, writes the Stoneham series out in
//     full, and states normality of the sum directly: for every word length l
//     and every j < b^l, the proportion of overlapping starting positions
//     n < M landing in the half-open radix cylinder tends to b^-l, with the
//     coprimality hypotheses the paper asks for. No project definition.
//   - Solution.lean proves `solution : BaileyBorweinTwoSum` by unfolding
//     definitions only, adding no analytic or normality assumption.
//   - Audit.lean pins the axiom lists of six declarations, `solution`
//     included, with #guard_msgs, so a changed list fails the build.
//   - CI builds from the pinned toolchain (Lean 4.34.0-rc2) and mathlib
//     commit, runs that audit, AND checks a sha256 fingerprint of the
//     submitted statement - two green runs on 10 September.
//
// Unlike this author's xi-normality repository there is no comparator.json,
// so there is no independent-kernel replay. The statement fingerprint covers
// the failure comparator would otherwise catch here, and Lean's own
// typechecking is what anchors solution to the challenge. Lean-verified
// stands; the note says what is and is not there.
//
// Significance 25, level with the Erdos-Borwein 2-density entry, which
// answers a 2002 question of Crandall. Same shape: a named question about a
// named constant, posed in print, narrow readership. Well above this author's
// xi entry at 15, which answered no prior conjecture at all.
//
// ---------------------------------------------------------------------------
// MAHLER Z-NUMBERS (Ralf Stephan) - approved as Partial, Lean-checked,
// ai-discovered, significance 30.
//
// Mahler's 1968 Z-number problem, generalised to Z_{p/q}(s, s+t), is a real
// named problem and remains open; this is a record window, which is how this
// catalog files record improvements. Theorem E gives
// Z_{3/2}(2/7, 5/7) = empty, a window of length 3/7 = 0.428571..., beating
// the 31/81 of [Dub19, Thm. 1.2] AND dropping that paper's algebraicity
// hypothesis on xi.
//
// The repository is unusually candid and that is worth rewarding rather than
// punishing. Challenge2.lean is a trusted statement of record that imports
// nothing but Mathlib, redeclares every definition verbatim, states the
// lettered theorems with sorry, and is consumed by leanprover/comparator
// through comparator2.json - which checks constant identity across the two
// environments, the permitted axiom list, and kernel re-acceptance from a
// fresh export with no olean loaded. PRIOR_ART.md then says the search "was
// targeted, not exhaustive", records that the whole of section 3 was found in
// print (Theorems 3.5 and 3.6 being a machine-checked fragment of [Bug04,
// Thm. 1]), and concludes "Novelty is therefore recorded as unknown".
//
// Kept at the submitted Lean-checked rather than lifted: the comparator
// configuration is there and reads well, but no CI run could be found on the
// repository and the run was not reproduced here, so the machine check is
// the author's report. That is exactly the Lean-checked rung.
//
// ---------------------------------------------------------------------------
// AFFINE HJELMSLEV LINE CODES (Babanskyy) - declined, no-open-question.
//
// The submitter asks outright: "Please assess whether this provenance meets
// the antecedent-question requirement". It does not, and the submission says
// why in its own fields: posedBy reads "Oleksiy Babanskyy, in the development
// of this manuscript (2026); no equivalent externally posed conjecture
// identified", and the note adds that the repository was created on
// 12 September 2026, so the commit dates do not establish pre-solution public
// posting. The inclusion test needs a question somebody else posed.
//
// This is a careful submission and the decline is not a judgement on the
// mathematics. The reply says what would change it.
//
// ---------------------------------------------------------------------------
// EVGENY'S THEOREM - declined, no-open-question.
//
// Self-posed and self-named, and the submitter states it plainly: "The result
// is presented as a newly constructed mathematical theorem rather than as a
// solution to a previously established named open problem." yearPosed is
// null and posedBy is "Evgeny". The evidence is numerical - the repository
// itself notes the path-class argument "is not presented as a formally
// certified exhaustive combinatorial proof". Two independent reasons, either
// enough on its own.
//
// The aiRole field also arrived holding "GitHub repository with reproducible
// verification", which is the sourceName - the form was filled in wrong. That
// is mentioned in the reply as a practical note, not as a reason.
//
// ---------------------------------------------------------------------------
// VERIFICATION: theabbie, now the account SilentBison701.
//
// Asked on 9 August, replied to on 12 September asking for a two-way link.
// It exists, and was checked here through the GitHub API rather than a
// rendered page: github.com/theabbie publishes email abhishek7gg7@gmail.com,
// which is exactly this account's email, and a bio linking to
// vibemathed.com/user/theabbie. Page he controls -> this site, plus a
// matching public address. Note records the pseudonym change, since that
// profile URL no longer resolves.
//
// ---------------------------------------------------------------------------
// --lint runs every local check with no database. Dry run by default. Pass
// --apply to write. Production writes are the curator's to run.

import { guardedPrisma } from "./lib/guarded-prisma";
import { checkStoredEntry } from "../src/lib/field-validation";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../src/lib/editable";
import { MESSAGE_MAX } from "../src/lib/messages";
import { charLength, canonical } from "../src/lib/char-length";

const APPLY = process.argv.includes("--apply");
const LINT = process.argv.includes("--lint");
const SPECS = [...EDITABLE_FIELDS, ...CURATOR_FIELDS];
const LINK_LABEL_MAX = 120;

const SH = "https://github.com/CaptainSude/Stoneham-sum-normal";
const SH_SHA = "f4d3d1f01d00c57425c684409849053e58e42261";
const CC = "https://github.com/rwst/Confinement-Certificates";

interface Decision {
  slug: string;
  action: "approve" | "reject";
  reason: string;
  message: string;
  edits?: Record<string, unknown>;
  links?: { label: string; url: string; kind: string }[];
}

const DECISIONS: Decision[] = [
  {
    slug: "normality-of-sum-of-two-stoneham-constants",
    action: "approve",
    reason: "edited",
    edits: {
      name: "Normality of a sum of two Stoneham constants",
      field: "Normal numbers and digit expansions",
      statement:
        "For coprime $b,c\\ge 2$ the Stoneham constant $\\alpha_{b,c}=\\sum_{k\\ge1}1/(c^{k}b^{c^{k}})$ is known to be $b$-normal. Bailey and Borwein asked in 2012 what happens to a sum of two of them sharing the base: with $b,c_1,c_2\\ge2$, $(b,c_1)$ and $(b,c_2)$ coprime, is $\\alpha_{b,c_1}+\\alpha_{b,c_2}$ normal in base $b$? In their words, \"it is not known at the present time whether the sum $\\alpha_{b,c_1}+\\alpha_{b,c_2}$ is $b$-normal\".",
      posedBy:
        "David H. Bailey and Jonathan M. Borwein, \"Nonnormality of Stoneham constants\", Ramanujan J. 29 (2012) 409-422, Section 4 (repeated in Section 6)",
      resultNote:
        "Yes: the sum of two Stoneham constants sharing a base is normal in that base, for every admissible pair of parameters, with overlapping occurrences counted. Not to be confused with what the same 2012 paper proves: its Theorem 3 shows a sum of two $B$-NONnormal Stoneham constants is $B$-nonnormal, which concerns a different base and the opposite property. The open half was normality in the common defining base $b$, and that is what this settles.",
      verificationNote:
        "Checked here on 12 September 2026 by reading the repository at commit f4d3d1f. Challenge.lean imports only Mathlib, writes the Stoneham series out in full, and states normality of the sum directly: for every length $l$ and every $j<b^{l}$, the proportion of overlapping starting positions $n<M$ whose shifted fractional part lands in the half-open radix cylinder tends to $b^{-l}$, under the coprimality hypotheses the paper asks for. Nothing project-defined appears in it. Solution.lean proves that exact proposition by unfolding definitions only, adding no analytic or normality assumption. Audit.lean pins the axiom lists of six declarations including the solution with #guard_msgs, so a changed list fails the build rather than printing a note, and GitHub Actions built from the pinned toolchain (Lean 4.34.0-rc2) and mathlib commit, ran that audit, and separately verified a sha256 fingerprint of the submitted statement - two green runs on 10 September. Unlike this author's xi-normality repository there is no comparator configuration, so there is no independent-kernel replay; the statement fingerprint covers statement tampering and Lean's own typechecking anchors the solution to the challenge. The build was not repeated here, and the correspondence to the 2012 paper was checked by reading Section 4 at source.",
      aiRole:
        "The submitter states that the model chose the problem, proved it and produced the Lean formalisation. That is their account of their own project and is recorded at face value; as with this author's earlier xi-normality entry, the repository does not separate what a model did from what a person did, and the manuscript carries no author byline, so nothing found in review corroborates the autonomy claim beyond the submitter's word and nothing contradicts it.",
      significance: 25,
      significanceNote:
        "A question posed in print, by name, in a journal paper: Bailey and Borwein set it out in Section 4 of their 2012 Ramanujan Journal article and left it open. Level with the Erdos-Borwein 2-density entry at 25, which answers a 2002 question of Crandall - the same shape, a named question about named constants with a narrow readership. Well above this author's xi-normality entry at 15, which answered no previously stated conjecture at all.",
      sourceUrl: `${SH}/tree/${SH_SHA}`,
      sourceName: "GitHub repository, pinned to the reviewed commit",
    },
    links: [
      {
        kind: "lean-statement",
        label: "Challenge.lean: the question stated against plain Mathlib",
        url: `${SH}/blob/${SH_SHA}/Challenge.lean`,
      },
      {
        kind: "lean-proof",
        label: "Solution.lean and Audit.lean: the bridge and the pinned axiom lists",
        url: `${SH}/blob/${SH_SHA}/Audit.lean`,
      },
      {
        kind: "problem-record",
        label: "Bailey and Borwein 2012, where the question is posed (Section 4)",
        url: "https://doi.org/10.1007/s11139-012-9417-3",
      },
    ],
    message: [
      "Approved and published at Lean-verified, resolved, significance 25.",
      "",
      "I read Bailey and Borwein at source to check the question is really posed, and it is, word for word: \"it is not known at the present time whether the sum alpha_{b,c1} + alpha_{b,c2} is b-normal\". One correction - that sits in Section 4, not Section 6; Section 6 repeats it. Your own Challenge.lean has this right, so the fix is only to the submission form. posedBy now carries the full citation.",
      "",
      "The entry also spells out a distinction that is easy to lose: the same 2012 paper PROVES a sum result, Theorem 3, that a sum of two B-nonnormal Stoneham constants is B-nonnormal. Different base, opposite property. Someone skimming could think the question was already answered, so the result note says which half was open.",
      "",
      "What was checked at commit f4d3d1f: Challenge.lean imports only Mathlib and states the frequency limit with nothing project-defined in it; Solution.lean proves that proposition by unfolding alone; Audit.lean pins six axiom lists with #guard_msgs; and CI builds from the pinned toolchain and mathlib commit, runs the audit, and checks a sha256 fingerprint of the statement. That fingerprint check is a good idea and does real work here, because unlike your xi repository this one has no comparator configuration, so there is no independent-kernel replay. The note says so plainly. Add comparator and it is strictly stronger.",
      "",
      "Significance 25, level with the Erdos-Borwein 2-density entry, which answers a 2002 question of Crandall. That is ten above your xi entry, and the reason is exactly the difference you closed: this one answers a question somebody actually asked.",
    ].join("\n"),
  },
  {
    slug: "mahler-s-z-number-problem-in-its-generalized-form",
    action: "approve",
    reason: "edited",
    edits: {
      field: "Distribution mod one; Mahler's Z-numbers",
      resultNote:
        "Theorem E gives $Z_{3/2}(\\tfrac27,\\tfrac57)=\\emptyset$: a window of length $\\tfrac37=0.428571\\ldots$ at base $3/2$, beating the $31/81$ of [Dub19, Thm. 1.2], and with no assumption on the arithmetic nature of $\\xi$, where that result needs algebraicity. Mahler's problem itself is untouched: for which parameters $Z$ is empty remains open, and this is a record window rather than a classification.",
      verificationNote:
        "Filed at Lean-checked, as submitted. Challenge2.lean is a trusted statement of record that imports nothing but Mathlib, redeclares verbatim every definition occurring in the certified theorems, and states the paper's lettered results with sorry proofs; comparator2.json names fourteen of them and, as configured, checks constant identity across the challenge and solution environments, restricts axioms to propext, Quot.sound and Classical.choice, and requires the Lean kernel to re-accept the solution from a fresh export with no olean loaded. That configuration reads correctly. It is not lifted to Lean-verified because no CI run was found on the repository and the comparator run was not reproduced here, so the machine check rests on the author's report - which is what Lean-checked means. PRIOR_ART.md is unusually candid and worth reading: it records that the search was targeted rather than exhaustive, that the whole of Section 3 was found in print with Theorems 3.5 and 3.6 a machine-checked fragment of [Bug04, Thm. 1], and concludes \"Novelty is therefore recorded as unknown\". Not peer reviewed and no independent expert endorsement.",
      significance: 30,
      significanceNote:
        "Mahler's 1968 Z-number problem is a named problem in distribution mod one, closely tied to the 3/2 problem, and open in the form stated here. Above the Dubickas Problem 3 entry at 20, which the catalog notes borrows its interest from Mahler's 3/2 problem sitting at the same kind of alpha; below the 40-50 band, since the audience is the Diophantine-approximation community rather than number theory at large. The score is for the problem, not for the window: the entry is filed Partial.",
    },
    links: [
      {
        kind: "lean-statement",
        label: "Challenge2.lean: the trusted statement of record, Mathlib only",
        url: `${CC}/blob/main/Challenge2.lean`,
      },
      {
        kind: "other",
        label: "PRIOR_ART.md: the literature search, with novelty recorded as unknown",
        url: `${CC}/blob/main/PRIOR_ART.md`,
      },
    ],
    message: [
      "Approved and published as Partial at Lean-checked, significance 30.",
      "",
      "Partial because Mahler's problem is not solved: Theorem E is a record window, the longest excluded window at base 3/2, and the entry says so. That is how this catalog files record improvements, alongside the prime-gap and rank records. The result note keeps both of the things that make it a real advance - the 3/7 against Dubickas's 31/81, and that you drop his algebraicity hypothesis.",
      "",
      "Kept at Lean-checked rather than lifted to Lean-verified, and the reason is narrow. Challenge2.lean is one of the best statement surfaces this site has seen: Mathlib-only, definitions redeclared verbatim, lettered theorems with sorry, and comparator2.json naming fourteen of them with kernel re-acceptance from a fresh export. The configuration reads correctly. But I could not find a CI run on the repository, and I did not reproduce the comparator run, so the machine check is your report rather than something a reader can watch happen. Wire the comparator run into Actions and send the link, and it moves.",
      "",
      "PRIOR_ART.md deserves saying out loud. Recording that the search was targeted rather than exhaustive, that the whole of Section 3 turned out to be in print, and that novelty is therefore \"unknown\", is the opposite of what usually arrives here. It made the entry easier to write honestly, and the verification note quotes it.",
      "",
      "The verification note you submitted said only that Palomar accepted the repository. That is worth having but it is not a check of the mathematics, so the note now says what was and was not established.",
    ].join("\n"),
  },
  {
    slug: "uniform-binary-ranks-of-affine-hjelmslev-line-codes",
    action: "reject",
    reason: "no-open-question",
    message: [
      "Declined, and you asked the right question yourself: \"Please assess whether this provenance meets the antecedent-question requirement\". It does not.",
      "",
      "The inclusion test is a precisely stated open question, posed by somebody, whose answer is now a proved or disproved theorem. Your own fields give the answer: posedBy reads \"Oleksiy Babanskyy, in the development of this manuscript (2026); no equivalent externally posed conjecture identified\", and your note adds that the repository was created on 12 September 2026, so the commit dates do not establish pre-solution public posting. A question formulated in the same manuscript that answers it has nobody on the other side of it, and that is the whole of the test.",
      "",
      "This is not a judgement on the mathematics, and the submission is one of the more careful ones this site has received - separating the generators from the undetermined full rank across commits, disclosing that the Z4 case is already covered by the Depth Two entry, naming the two full texts you had not examined, and making no exhaustive novelty claim. That is how it should be done.",
      "",
      "What would change the answer: if the uniform Galois-ring dimension is asked as an open question in someone else's published work - Bajalan-Landjev-Rousseva or Honold-Landjev are the natural places, and you have already flagged both as unread - then the entry becomes an answer to that question and is in scope immediately. Send the citation and it will be reviewed on that basis.",
      "",
      "One thing worth knowing for a future submission: an AI-assisted disclosure is fine here and does not lower the bar. It was the posing, not the model's role, that decided this.",
    ].join("\n"),
  },
  {
    slug: "evgeny-s-theorem",
    action: "reject",
    reason: "no-open-question",
    message: [
      "Declined, on the ground your own note states: \"The result is presented as a newly constructed mathematical theorem rather than as a solution to a previously established named open problem.\"",
      "",
      "That is the inclusion test. This site records precisely stated open questions, posed by somebody, whose answer is now a proved or disproved theorem. A newly constructed theorem can be excellent work and still be outside what this catalog tracks, because there is no question and no poser on the other side of it. The entry's own fields show the same thing: posedBy is \"Evgeny\" and the year posed is blank.",
      "",
      "There is a second reason, independent of the first. The evidence is numerical - refinement levels, held-out parameters, gauge-invariance and normalization checks - and your repository says the path-class argument \"is not presented as a formally certified exhaustive combinatorial proof\". Numerical agreement across many parameters is good evidence that a closed form is right, but this site records theorems, and a proof or a machine-checked derivation is what carries one.",
      "",
      "A practical note: the AI role field arrived holding \"GitHub repository with reproducible verification\", which is the source name rather than a description of what the models did. If you submit again, that field wants what each model contributed - that is the part a reader cannot reconstruct.",
      "",
      "If this identity later answers a question someone else posed in print, or a proof of the closed form is written down and checked, it is worth sending back.",
    ].join("\n"),
  },
];

/// Verification the public record settles, by account email.
const VERIFY: { email: string; who: string; note: string }[] = [
  {
    email: "abhishek7gg7@gmail.com",
    who: "theabbie / SilentBison701",
    note: "Abhishek Choudhary (theabbie). Checked 12 September 2026 through the GitHub API: github.com/theabbie publishes the email abhishek7gg7@gmail.com, which is this account's email, and a bio linking to vibemathed.com/user/theabbie. The account has since been renamed, so that profile URL no longer resolves.",
  },
];

/// The serverless cluster refuses the first connection after idling.
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
    console.log(`${d.action === "reject" ? "DECLINE" : "APPROVE"}  ${d.slug.slice(0, 60)}`);
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
    for (const l of d.links ?? []) {
      console.log(`  link (${l.kind}) ${l.label.length}/${LINK_LABEL_MAX}: ${l.label}`);
      if (l.label.length > LINK_LABEL_MAX) bad++;
    }
    const v = checkStoredEntry({ specs: SPECS, fields: d.edits ?? {} });
    for (const x of v) console.log(`  RULE: ${x.field}: ${x.problem}`);
    bad += v.length;
    console.log();
  }
  for (const v of VERIFY) console.log(`VERIFY  ${v.who}  <${v.email}>  note ${v.note.length} chars`);
  return bad;
}

async function main() {
  const localBad = lint();
  if (LINT) {
    console.log(localBad ? `\n${localBad} local violation(s)` : "\nlocal checks ok");
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

    let bad = 0;
    for (const d of DECISIONS) {
      const cur = await prisma.problem.findUnique({
        where: { slug: d.slug },
        select: {
          id: true,
          status: true,
          name: true,
          sourceUrl: true,
          submittedById: true,
          links: { select: { label: true, url: true } },
        },
      });
      if (!cur) throw new Error(`not found on ${db}: ${d.slug}`);
      if (cur.status !== "pending") throw new Error(`${d.slug} is ${cur.status}, not pending`);
      const merged = [...cur.links, ...(d.links ?? [])];
      const v = checkStoredEntry({
        specs: SPECS,
        fields: d.edits ?? {},
        links: merged,
        sourceUrl: ((d.edits?.sourceUrl as string | undefined) ?? cur.sourceUrl) || null,
      });
      console.log(
        `${d.action.toUpperCase().padEnd(7)}  ${cur.name.slice(0, 56)}  -> merged check: ${v.length ? "FAILED" : "ok"}`,
      );
      for (const x of v) console.log(`    - ${x.field}: ${x.problem}`);
      bad += v.length;
      if (!cur.submittedById) console.log("  NOTE: no submitter, no message sent");
    }

    // Resolved before any write, so nothing later can invalidate the lookup.
    const toVerify: { id: string; who: string; note: string }[] = [];
    for (const v of VERIFY) {
      const users = await prisma.user.findMany({
        where: { email: v.email },
        select: { id: true, email: true, pseudonym: true, verified: true },
      });
      if (users.length !== 1) {
        console.log(`VERIFY ${v.email}: matched ${users.length} accounts, expected 1`);
        bad++;
        continue;
      }
      const u = users[0];
      console.log(
        `VERIFY   ${(u.pseudonym ?? v.who).padEnd(20)} verified ${u.verified} -> true   <${u.email}>`,
      );
      if (!u.verified) toVerify.push({ id: u.id, who: u.pseudonym ?? v.who, note: v.note });
      else console.log("         already verified - will be left alone");
    }
    if (bad) throw new Error(`${bad} violation(s) - nothing written`);

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

      await prisma.problem.update({
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
      });
      console.log(`updated: ${d.slug}`);

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
        data: {
          problemId: cur.id,
          userId: curator.id,
          userName: curator.pseudonym,
          type: d.action === "approve" ? "approved" : "rejected",
        },
      });
    }

    for (const v of toVerify) {
      await prisma.user.update({
        where: { id: v.id },
        data: { verified: true, verifiedNote: v.note },
      });
      console.log(`verified: ${v.who}`);
    }

    console.log("\nAPPLIED. New entries render on first request; the lists and");
    console.log("stats lag by up to an hour, or until a deploy.");
  } finally {
    await prisma.$disconnect();
  }
}

main();
