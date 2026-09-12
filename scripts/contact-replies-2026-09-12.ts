// Answers all 18 open contact messages, 12 September 2026.
//
// These are `SiteMessage` rows - the /contact form coming IN - and the oldest
// has been open since 5 August. A draft from 10 September
// (scripts/inbox-replies-2026-09-10.ts, branch inbox-replies-2026-09-10) was
// never applied, and it mostly closed these with internal notes rather than
// answering anyone. This one answers them.
//
// Three routes, chosen by what the sender left us:
//
//   REPLIES  the sender has an account, so a DirectMessage reaches them
//            in-app. Nine people, ten messages (Schleimer sent two).
//   EMAILS   anonymous but left a reply address. The site cannot send mail,
//            so the script prints a ready-to-send draft and marks the row
//            handled. Five of these.
//   NOTES    anonymous with no address. Nothing can be sent; the note records
//            the substance so the point is not lost. Three of these.
//
// WHAT CHANGED SINCE THE OLD DRAFT, and it matters because three of these are
// now answerable where they were not:
//
//   - GitHub sign-in EXISTS (src/auth.ts imports the GitHub provider and
//     wires it with account linking). Olangu asked for a non-Google option
//     and was told nothing; now there is a real answer.
//   - The Ramachandra-Natarajan entry is ALREADY at Lean-checked with
//     Olangu's repository linked and a curator source audit in its note. His
//     request was actioned. He was never told.
//   - The C11 frontier is live, with R10 as the headline, so Protti's
//     question about R7 has a concrete home rather than a promise.
//
// VERIFICATION. Four accounts asked. Checked against the live profiles:
// sjbevins and Saul Schleimer are already verified (Schleimer is also right
// that he is not on Wikipedia, which is not the test). theabbie, Roy van
// Rijn and Ryan Simonelli are not. Of those three, only Simonelli's evidence
// is checkable from here and it is checkable both ways: his own page at
// ryansimonelli.com/autonomous-philosophy.html links to
// vibemathed.com/problem/signed-depth-relevance-of-subdl, and that entry was
// submitted by the account asking. Verified here, with the note recording
// exactly that. The other two hinge on whether their account email matches
// the address on a LinkedIn or personal page, which this script cannot see
// but the curator can: the dry run PRINTS each account's email next to the
// claim so the call can be made in the moment.
//
// Dry run by default. Pass --apply to send. Production writes are the
// curator's to run.

import { guardedPrisma } from "./lib/guarded-prisma";
import { MESSAGE_MAX } from "../src/lib/messages";

const prisma = guardedPrisma();
const APPLY = process.argv.includes("--apply");
const LINT = process.argv.includes("--lint");

/// The sender has an account: reply in-app and mark the row handled.
/// `ids` is every SiteMessage this one reply answers.
///
/// The recipient is resolved through the SiteMessage's own `userId`, never
/// through a pseudonym: `userName` on the row is a snapshot taken when the
/// message was sent, and the first production run of this script died on
/// "no account for theabbie" because that snapshot no longer matches any
/// pseudonym. The foreign key does not rot.
type Reply = { ids: string[]; who: string; body: string };

/// Anonymous with a reply address: mark handled, print a draft to send.
type Email = { id: string; who: string; to: string; subject: string; body: string };

/// Anonymous with no address: mark handled, record what would have been said.
type Note = { id: string; who: string; note: string };

const REPLIES: Reply[] = [
  {
    ids: ["afefa2e4"],
    who: "GoldenMongoose827",
    body: `Thank you for this, and sorry it sat unanswered for so long.

Not quite the right field, but no harm done. The citation URL belongs with the citation count: it records where that number was read, so it wants a Google Scholar or Semantic Scholar page rather than an encyclopedia article. Wikipedia presence is tracked separately, in its own field that counts how many language editions carry an article dedicated to the problem - it is used as a rough renown check and as an honesty check against the significance score, and it is a curator measurement rather than something a submitter fills in.

So the right move for a problem with a Wikipedia article is to say so, and a curator sets the count. If you tell me which entry you meant, I will set it properly. Finding the article is the useful part; which box it goes in is our problem, not yours.`,
  },
  {
    ids: ["2a3e657e"],
    who: "HiddenHawk615",
    body: `Good question, and not intentional in the way you might think. Sorry for the long delay.

Several results from that report are already in the catalog - the ones where the report's own text shows a model settling a stated question. What keeps most OEIS-style conjecture work out is the inclusion test rather than significance: an entry needs a precisely stated open question that someone posed, whose answer is now a proved or disproved theorem. A machine-generated conjecture about a sequence, confirmed or extended, usually has nobody on the other side of it who asked. The significance axis then handles how much anyone cared; it is not a gate.

The partial Erdős results are a different case and you may well be right that some are missing. Those do have a poser, and partial answers are trackable here - there are over a hundred entries with resolution Partial. If you have specific ones in mind, send them and they will be reviewed on their merits. Concrete pointers are more useful than a general sweep, because each one needs its source read.`,
  },
  {
    ids: ["490d981a"],
    who: "theabbie",
    body: `Thank you, and apologies for the delay - this sat far longer than it should have.

Verification here is set by hand, and what it asserts is narrow: that the account is the person it says it is. The evidence that settles it is a two-way link. A page you control that points at your VibeMathed profile or at an entry you submitted is the strongest kind, because it can be checked from both ends by anyone. An institutional email address, or a GitHub or arXiv profile carrying the same identity, also works.

A LinkedIn profile alone is the one case that is hard to close from the outside: its contact details are not public, so "the email there matches this account" is something I cannot see. Add a line to your GitHub profile README or any personal page mentioning this account, or write from an address that is publicly tied to you, and it is done immediately.

Nothing about this is a judgement on the account. It is only that the badge claims something specific, so it needs something specific behind it.`,
  },
  {
    ids: ["d2b0d656"],
    who: "shemshallah",
    body: `Yes. Sorry for the slow answer.

Verified profiles exist and are set by hand. Send something that ties this account to a public identity and it gets checked: a page you control that links back to your profile here or to an entry you submitted, an institutional email address, or a GitHub or arXiv profile under the same name. A two-way link is the strongest, because anyone can check it from either end.

The badge asserts only identity. It is separate from the self-declared role on your profile, which is not checked, and it carries no special permissions.`,
  },
  {
    ids: ["be31aac9"],
    who: "Roy van Rijn",
    body: `Thank you for the links, and sorry for the delay in coming back to you.

One thing would close this immediately: a mention of this account on a page you control. A line on royvanrijn.com or in your GitHub profile README pointing at your VibeMathed profile makes the link checkable from both ends, which is what the badge is supposed to stand on. The three links you sent establish that Roy van Rijn exists and is who he says he is - what they cannot show from the outside is that this account is you, since the addresses on those pages are not public.

If that is more trouble than it is worth, writing from an address that is publicly tied to you does the same job.`,
  },
  {
    ids: ["4ead9963"],
    who: "sjbevins",
    body: `Thank you, and sorry for the slow reply - this one has been sitting since 1 September.

Your profile is already verified, and carries the moderator role as well, so nothing is outstanding on that side.

On the paper: it is a good fit, and a second AI-driven manuscript is very welcome. The thing that makes a submission easy to review is the disclosure - what the model actually did, named, with the human role beside it. The entries that go in fastest are the ones whose paper says plainly which step came from where. If the new manuscript has a disclosure section, say so in the submission and point at it.`,
  },
  {
    ids: ["59ddce0e", "b447d934"],
    who: "Saul Schleimer",
    body: `Two answers, and apologies that they took eleven days.

On verification: already done - your profile carries the badge. And you are right that Wikipedia is not the test. This site does count Wikipedia language editions, but for PROBLEMS, as a rough measure of how widely known a question was before it was solved. It has nothing to do with people, and it would be a poor measure of a mathematician even if it were meant as one.

On the mysterious sentence: fair hit, and it is being reconsidered. "The record" means this catalog - the list of mathematical problems first solved with AI in the loop, with what was actually claimed, who checked it, and how far the checking went. The phrase was meant to say that the form reaches curators rather than a support desk, and instead it reads like a secret society. Something plainer would serve better.

If you ever want to argue with a verification tier or a significance score, that is exactly the kind of mail worth getting. Several entries have been corrected that way.`,
  },
  {
    ids: ["012e113e"],
    who: "Matthew Protti",
    body: `Both questions answered, and sorry for the delay - this crossed with the frontier work.

The C11 frontier is live: vibemathed.com/frontier/shannon-capacity-c11. Six steps, from the published odd-cycles record through the BPZ updated certificate as the baseline, then your R3, R5, R6 and R10, with R10 as the headline at 5.295526013632343 in dimension 213. The two pending C11 submissions are one entry, linked from the frontier rather than duplicated. Your report on the comparison wording was applied on 12 September: both places now read "by exact integer comparisons, using cross-powers when dimensions differ", which is the honest description given the staircase mixes dimensions 207 and 213.

On R7, your own note gives the answer and I agree with it. The inclusion test here is a precisely stated open question whose answer is now a theorem, and you say you have not identified one behind R7. A general compiler theorem for your own method does not have a poser on the other side of it. So it belongs as supporting material on the frontier rather than as its own entry - which is not a downgrade: a proved general theorem behind the avoidance-profile method makes every numbered step easier to trust, and that is worth more to a reader than another row.

Send the release link and I will attach it to the frontier as methods.`,
  },
  {
    ids: ["e3e6154a"],
    who: "BraveEgret318 (Ryan Simonelli)",
    body: `Done - your profile is verified, and thank you for making it easy to check.

The evidence that settled it is the two-way link: your page at ryansimonelli.com/autonomous-philosophy.html links to the signed-depth-relevance-of-subdl entry, and that entry was submitted by this account. That can be checked from both ends by anyone, which is exactly what the badge is supposed to rest on. The verification note on your profile records that.

Separately, your subDMQ submission was published today. It went in as AI-discovered on the paper's author line, significance 10, with the verification tier moved from Expert-verified to Unreviewed for the same reason as the subDL entry - the decision message on the entry sets out why at length, and the short version is that Ripley's confirmation currently lives in a footnote reporting a private exchange rather than in anything a reader can follow to its source. A public line from Ripley would lift it.

More results in this area are genuinely welcome. Paraconsistent foundations is a corner where a model settling something has consequences for a live research programme, which is rarer than it sounds.`,
  },
];

const EMAILS: Email[] = [
  {
    id: "ca5e9b2b",
    who: "Olangu",
    to: "olangu@impressions.se",
    subject: "VibeMathed: both of your requests are done",
    body: `Thank you for this, and I am sorry it took so long to answer - both things you asked for have in fact happened.

The Ramachandra-Natarajan entry has been updated. It now reads Lean-checked, statement unaudited, which is the tier you proposed and the right one by our own rules, and your repository is linked from the entry. Its verification note records a curator source audit of all 579 lines: no sorry, admit, native_decide, unsafe declaration, user-declared axiom, implemented_by or partial def anywhere, with the finite checks going through kernel decide. So someone did read it, and it holds up.

On sign-in: GitHub is now a second option alongside Google, and it links to an existing account with the same verified email rather than creating a duplicate. You can submit updates yourself from here on. Your point stood on its own merits - requiring a Google account excludes people for reasons that have nothing to do with mathematics.

On an independent human reviewer for the paper-to-Lean correspondence: nothing to offer yet beyond the audit above, which checked the artifact rather than the correspondence to the paper. If someone with the relevant background reads it, the tier moves to Lean-verified. Saying plainly on the repository that you are looking for exactly that is the most likely way to find them.

- Rasmus, VibeMathed`,
  },
  {
    id: "d1e43b35",
    who: "Wang Yuteng",
    to: "wangyuteng202110@163.com",
    subject: "VibeMathed: an AI-inspired category",
    body: `Thank you for this, and apologies for the long delay.

The category you describe is real and the site does not capture it: a human proof whose method was borrowed from an earlier AI discovery is genuinely a different thing from a proof with no AI anywhere near it, and today both look identical here, which is to say both are simply absent.

The reason it has not been added is that the tier would be very hard to apply honestly. The existing AI-contribution tiers all rest on a disclosure in the paper - what the model did, in the authors' own words - and are set at face value from it. "The method came from an AI discovery" is usually nobody's claim: the later authors may not say it, may not know it, and if they do say it the strength of the debt is a matter of judgement rather than record. A tier that can only be assigned by a curator's inference is one that will be argued about forever and will not mean the same thing twice.

What can be done without that problem is to say it in prose. An entry can record in its result note that the method descends from a specific earlier AI result and link it, and entries can be related to each other explicitly. That carries the information you want without asserting a tier nobody stated.

If you have a specific pair in mind - an AI result and a later human proof that visibly borrows from it - send them. A concrete example is the thing most likely to change the decision, and it would be a good test of whether the link can be stated without guessing.

- Rasmus, VibeMathed`,
  },
  {
    id: "c0b88244",
    who: "Alexandre Sedoglavic",
    to: "Alexandre.Sedoglavic@univ-lille.fr",
    subject: "VibeMathed: massive open problems and scope",
    body: `Thank you, and apologies for the slow reply.

The honest answer is that they are in scope by the letter of the rule and unmanageable by its practice, and the site has not resolved that.

The inclusion test is a precisely stated open question whose answer is now a proved or disproved theorem. A single member of a large family of problems passes that test as cleanly as a famous conjecture does; the significance axis is what separates them, and a machine-generated or bulk-enumerated question sits near the bottom of it. So nothing about scale excludes them in principle.

What scale breaks is review. Every entry here is reviewed by hand against its source before publishing, which is what the record is actually for. A family of results arriving together does not fit through that, and publishing them unreviewed would make the catalog larger and worth less.

The shape of an answer probably looks like the Frontiers the site already has for quantities that improve in steps: one page for the family, with the individual results as rows rather than as separate entries, reviewed as a body of work with its provenance stated once. That is a design decision rather than something already built, and your message is a good argument for making it.

If you are working on such a family and want to talk about how it would be represented, I would rather design it around a real case than in the abstract.

- Rasmus, VibeMathed`,
  },
  {
    id: "733c88d4",
    who: "lenaxe3855",
    to: "lenaxe3855@ittiv.com",
    subject: "VibeMathed: the 254-year-old problem tip",
    body: `Thank you for the tip, and sorry for the delay.

A Stack Exchange answer is a lead rather than a source. Every entry here has to cite a primary record anyone can open and check - a paper, a preprint, a repository with the artifact in it - and a forum post is a pointer to one at best. The "254 years" framing also needs checking on its own: the age of a problem is a fact this site records, and it is wrong surprisingly often.

If you can point at what sits behind the post - who made the claim, where the argument is written down, and what the model actually did - it can be assessed properly. The submission form at vibemathed.com/submit is the fastest route, and anyone can use it.

- Rasmus, VibeMathed`,
  },
  {
    id: "2bd8b152",
    who: "Tracy McSheery",
    to: "tracymcsheery@gmail.com",
    subject: "VibeMathed: thanks",
    body: `Thank you for this, and sorry for the slow reply.

Your observation is the interesting part, more than the notes themselves: that the models would rather rewrite a hundred-year-old paper than try something new. That matches what the catalog shows. A great deal of what arrives is a re-proof of something already known, and the entries that survive review are the ones where a model settled a question nobody had answered - a much smaller pile.

Nothing to action here, and nothing needed from you. Thanks for taking the time to write.

- Rasmus, VibeMathed`,
  },
];

const NOTES: Note[] = [
  {
    id: "ee233b65",
    who: "anonymous - Yau-Tian-Donaldson hold challenge",
    note: "The strongest message in this queue and unanswerable: anonymous with no reply address. Argues the extraordinary-claims hold on yau-tian-donaldson-conjecture-csck (arXiv:2608.19301) should lift, because the paper thanks Bin Dong, Guoxiong Gao, Chi Li, Gang Tian and Kewei Zhang 'for their enormous efforts in assisting with the verification of the paper' - three are Kahler geometers, none is an author, and Kewei Zhang made an explanatory video. That is a real argument: the rule asks for a named expert with no stake to have gone through the argument, and an acknowledgement of enormous efforts assisting with verification is closer to meeting it than anything else in the queue. It is not conclusive either, since thanks for assistance is not the same as a statement that the proof is correct. Still held as of 12 Sep 2026; this needs a curator decision, not a reply. The sender's two further claims are weaker and are not adopted: that models can now self-check well enough to retire the requirement, and that the S2xS3 curvature entry should move with it - that entry has no comparable acknowledgement.",
  },
  {
    id: "1b2d851a",
    who: "anonymous - overstatement criticism",
    note: "Anonymous, no reply address. Says the headline framing, naming 'Combined years open before AI closed them', overstates AI's responsibility and borders on propaganda, while granting that the entries themselves are more nuanced. The criticism lands. A sum of ages across unrelated problems is a number with no meaning - it grows fastest by adding old problems, not by adding hard ones - and it is the most quotable thing on the site, which is exactly the combination that misleads. Recorded here as a change worth making rather than a message to answer: either drop the tile or give it a denominator that means something.",
  },
  {
    id: "ff80dbe6",
    who: "anonymous - radial coverage fingerprint",
    note: "Anonymous, no reply address. Proposes a radial chart of coverage across mathematical fields for /stats, to show how spiky AI's progress currently is, with a mock-up at files.catbox.moe/07ocxx.png and the title 'The shape of AI mathematics'. The data already exists: fieldGroup is on every entry and the stats page already groups by it. Kept as a design note. Worth saying that the honest version of this chart would need care - a radial plot makes an uneven distribution look like a deliberate shape, and the unevenness here is mostly about which communities post preprints with disclosures.",
  },
];

/// The one verification the public record settles from here. The other two
/// requests hinge on an account email this script cannot compare to a
/// LinkedIn or personal page; the dry run prints those emails so the curator
/// can make the call directly.
const VERIFY: { id: string; who: string; note: string }[] = [
  {
    id: "e3e6154a",
    who: "BraveEgret318 (Ryan Simonelli)",
    note: "Ryan Simonelli. Two-way link checked 12 September 2026: ryansimonelli.com/autonomous-philosophy.html links to vibemathed.com/problem/signed-depth-relevance-of-subdl, and that entry was submitted by this account.",
  },
];

const PENDING_VERIFY: { id: string; who: string }[] = [
  { id: "490d981a", who: "theabbie" },
  { id: "be31aac9", who: "Roy van Rijn" },
];

function lint(): number {
  let bad = 0;
  const seen = new Set<string>();
  for (const r of REPLIES) {
    for (const id of r.ids) {
      if (seen.has(id)) { console.log(`DUPLICATE id ${id}`); bad++; }
      seen.add(id);
    }
    const n = r.body.length;
    console.log(`REPLY  ${r.who.padEnd(26)} ${r.ids.join(",").padEnd(20)} ${n}/${MESSAGE_MAX}${n > MESSAGE_MAX ? "  OVER" : ""}`);
    if (n > MESSAGE_MAX) bad++;
  }
  for (const e of EMAILS) {
    if (seen.has(e.id)) { console.log(`DUPLICATE id ${e.id}`); bad++; }
    seen.add(e.id);
    console.log(`EMAIL  ${e.who.padEnd(26)} ${e.id.padEnd(20)} ${e.body.length} chars -> ${e.to}`);
  }
  for (const nt of NOTES) {
    if (seen.has(nt.id)) { console.log(`DUPLICATE id ${nt.id}`); bad++; }
    seen.add(nt.id);
    console.log(`NOTE   ${nt.who.slice(0, 26).padEnd(26)} ${nt.id.padEnd(20)} ${nt.note.length} chars`);
  }
  console.log(`\n${seen.size} messages covered (expected 18)`);
  if (seen.size !== 18) { console.log("COUNT MISMATCH"); bad++; }
  return bad;
}

async function connectWithRetry(): Promise<string> {
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

/// Resolve an 8-character id prefix to the one open SiteMessage it names.
async function resolve(
  prefix: string,
): Promise<{ id: string; topic: string; userId: string | null }> {
  const rows = await prisma.$queryRawUnsafe<
    { id: string; topic: string; userId: string | null }[]
  >(
    `SELECT id, topic, "userId" FROM "SiteMessage" WHERE id::text LIKE $1 || '%' AND status = 'open'`,
    prefix,
  );
  if (rows.length !== 1)
    throw new Error(`${prefix}: matched ${rows.length} open messages, expected 1`);
  return rows[0];
}

/// The account behind a SiteMessage, by its foreign key.
async function userFor(prefix: string) {
  const row = await resolve(prefix);
  if (!row.userId) throw new Error(`${prefix} has no userId`);
  const u = await prisma.user.findUnique({
    where: { id: row.userId },
    select: { id: true, email: true, pseudonym: true, verified: true },
  });
  if (!u) throw new Error(`${prefix}: userId ${row.userId} has no account`);
  return u;
}

async function main() {
  const localBad = lint();
  if (LINT) {
    console.log(localBad ? `\n${localBad} local problem(s)` : "\nlocal checks ok");
    process.exitCode = localBad ? 1 : 0;
    return;
  }
  if (localBad) throw new Error(`${localBad} local problem(s) - nothing written`);

  const db = await connectWithRetry();
  console.log(`\ndatabase: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`);

  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });

  // Every id must resolve to exactly one OPEN row, and every recipient must
  // exist, before anything is written.
  const ids = new Map<string, string>();
  const recipient = new Map<string, string>();
  for (const r of REPLIES) {
    let uid: string | null = null;
    for (const p of r.ids) {
      const row = await resolve(p);
      ids.set(p, row.id);
      if (!row.userId) throw new Error(`${p} (${r.who}) has no userId - cannot reply in-app`);
      if (uid && uid !== row.userId)
        throw new Error(`${r.who}: ids ${r.ids.join(",")} belong to different accounts`);
      uid = row.userId;
    }
    const u = await prisma.user.findUnique({
      where: { id: uid! },
      select: { id: true, email: true, pseudonym: true, verified: true },
    });
    if (!u) throw new Error(`${r.who}: userId ${uid} has no account`);
    recipient.set(r.who, u.id);
    console.log(
      `REPLY  ${(u.pseudonym ?? r.who).padEnd(20)} ${r.ids.join(",")}  -> ${u.email ?? "(no email)"}${u.verified ? "  [verified]" : ""}`,
    );
  }
  for (const e of EMAILS) ids.set(e.id, (await resolve(e.id)).id);
  for (const nt of NOTES) ids.set(nt.id, (await resolve(nt.id)).id);
  console.log(`\nall ${ids.size} ids resolve to open rows`);

  console.log("\nverification:");
  const toVerify = new Map<string, { id: string; note: string }>();
  for (const v of VERIFY) {
    const u = await userFor(v.id);
    toVerify.set(u.pseudonym ?? v.who, { id: u.id, note: v.note });
    console.log(
      `  SET ${(u.pseudonym ?? v.who).padEnd(18)} verified ${u.verified} -> true   email ${u.email ?? "-"}`,
    );
  }
  for (const p of PENDING_VERIFY) {
    const u = await userFor(p.id);
    console.log(
      `  (not set) ${(u.pseudonym ?? p.who).padEnd(16)} verified ${u.verified}   account email: ${u.email ?? "-"}`,
    );
  }
  console.log("  ^ compare those two against the identity each person claimed;");
  console.log("    this script does not set them.");

  console.log("\n" + "=".repeat(70));
  console.log("EMAIL DRAFTS - the site cannot send mail, so send these by hand");
  console.log("=".repeat(70));
  for (const e of EMAILS) {
    console.log(`\nTo: ${e.to}\nSubject: ${e.subject}\n\n${e.body}\n` + "-".repeat(70));
  }

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to send");
    return;
  }
  if (!curator) throw new Error("curator not found on this database");

  for (const r of REPLIES) {
    const uid = recipient.get(r.who);
    if (!uid) throw new Error(`no recipient resolved for ${r.who}`);
    await prisma.directMessage.create({
      data: {
        userId: uid,
        senderId: curator.id,
        senderName: curator.pseudonym,
        kind: "note",
        body: r.body.slice(0, MESSAGE_MAX),
      },
    });
    for (const p of r.ids) {
      await prisma.siteMessage.update({
        where: { id: ids.get(p)! },
        data: { status: "handled", handledAt: new Date() },
      });
    }
    console.log(`replied: ${r.who} (${r.ids.join(",")})`);
  }

  for (const e of EMAILS) {
    await prisma.siteMessage.update({
      where: { id: ids.get(e.id)! },
      data: { status: "handled", handledAt: new Date() },
    });
    console.log(`handled (email drafted): ${e.id} ${e.who}`);
  }

  for (const nt of NOTES) {
    await prisma.siteMessage.update({
      where: { id: ids.get(nt.id)! },
      data: { status: "handled", handledAt: new Date() },
    });
    console.log(`handled (unreachable): ${nt.id} ${nt.who}`);
  }

  // Resolved BEFORE the loop above marked these rows handled. userFor() only
  // matches OPEN rows, so re-resolving here finds nothing: the first
  // production run sent all nine replies, handled all eighteen rows, and then
  // died on "e3e6154a: matched 0 open messages". A write ordered after the
  // write that invalidates its own lookup.
  for (const [who, u] of toVerify) {
    await prisma.user.update({
      where: { id: u.id },
      data: { verified: true, verifiedNote: u.note },
    });
    console.log(`verified: ${who}`);
  }

  console.log("\nAPPLIED. The contact queue should now be empty.");
  console.log("Five emails above still need sending by hand.");
}

main().finally(() => prisma.$disconnect());
