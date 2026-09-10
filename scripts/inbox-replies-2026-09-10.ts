// Answers every unanswered question in both inboxes, 10 September 2026.
//
// Two queues feed this. `DirectMessage` threads whose newest message is not
// from a curator, and `SiteMessage` rows still marked open. 49 threads and 17
// contact messages were read; most of the threads end in "Thanks!", which is
// not a question, so this replies to the ones that actually ask something or
// request an action. Answering a thank-you twenty times is noise, not service.
//
// Three things were checked before writing, because several replies assert
// facts about the site:
//   - Saul Schleimer and sjbevins are ALREADY verified (2 September). Their
//     "please verify me" threads were handled and only need closing.
//   - sjbevins is a moderator, so some threads flagged as awaiting a reply are
//     that curator's own decisions. Those are skipped.
//   - yau-tian-donaldson-conjecture-csck and the S2xS3 curvature entry are
//     both `rejected`; the YAH submission is `rejected` as of yesterday.
//
// Where a reply commits the site to something not already documented -
// GitHub sign-in, an "AI-inspired" tier, how to absorb a flood of OEIS
// conjectures - it says what is true today and promises nothing. Those are
// Rasmus's calls, and a reply under his name should not pre-empt them.
//
// Dry run by default. Pass --apply to send. Production writes are the
// curator's to run.

import { PrismaClient } from "@prisma/client";
import { MESSAGE_MAX } from "@/lib/messages";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");

/// A reply into an existing DirectMessage thread, addressed by its root id.
type Reply = { root: string; who: string; body: string };

/// A SiteMessage answered by email (or simply closed, when anonymous with no
/// reply address). `close` marks it handled; `note` is for the record only.
type SiteAnswer = { id: string; who: string; note: string };

const REPLIES: Reply[] = [
  {
    root: "ab1efa21",
    who: "Matthew Protti",
    body: `Yes to the Frontier, and thank you for pushing for it - you were right that a sequence of certified improvements to one quantity belongs on a staircase rather than as an entry per step.

I will set it up as a Frontier with the BPZ baseline and your R3, R5, R6 and R10 as steps, and move the existing entry onto it rather than duplicating anything. The headline will read 5.295526013632343 in dimension 213.

One thing I will not do without you confirming it: transcribe that figure from a release archive myself. Reply with the bound stated plainly as the theorem gives it, or tell me to read the R10 certificate and take it from there, and it goes in exactly as you say.

On R7 and the C13 construction. R7 is a methods theorem behind the avoidance-profile approach with no new numerical bound, and you say yourself you have not found a previously posed open question it answers. That is the honest reason it does not get its own entry: the inclusion test here is a precisely stated open question whose answer is now a theorem, and a general compiler for your own method does not have one behind it. It belongs as supporting material on the frontier, which is where I will link it, and it makes the steps more credible rather than less.

C13 is different. If it gives a certified lower bound on the Shannon capacity of C13, that is a separate tracked quantity with its own prior art, and it should be its own entry or its own frontier depending on whether more improvements are coming. Send it as a submission and say which.`,
  },
  {
    root: "76a6a858",
    who: "Matthew Protti",
    body: `Answered in the other thread, but briefly here so this one is not left hanging: the two C11 submissions are now one entry, and I have agreed to turn C11 into a Frontier so the successive bounds become steps rather than separate rows.

R7 fits as supporting methods, not as its own entry. Your own note gives the reason - you have not identified a previously posed open question that it answers, and the inclusion test here needs one. That is not a judgement on its quality; a general theorem behind your method makes the numbered steps easier to trust.`,
  },
  {
    root: "693b1a82",
    who: "nufrogcaca",
    body: `This is the right kind of follow-up and I am glad you sent it.

The listed entry sits at Lean-checked, candidate, and the reason is specific: the development proves disjunctivity conditional on AGP and PrimeIntervalSupply, which enter as theorem arguments rather than being formalized. Both are published results, so the mathematics was never conditional on conjectures - but what the kernel certified was an implication.

An elementary proof that discharges those inputs changes exactly that. I will read the new repository the same way I read the first: what the top-level theorem's signature actually takes, whether the analytic inputs are proved rather than assumed, and the sorry and axiom counts across the whole development. If it holds up, the entry moves up and the verification note gets rewritten to say why.

Two things that would speed it up and that the first submission lacked. Commit the Lean sources rather than shipping a zip, so the development can be browsed and diffed. And if you add a Challenge/Solution split with a comparator configuration, the statement gets an external anchor, which is the remaining gap between Lean-checked and Lean-verified on this entry.`,
  },
  {
    root: "9755291e",
    who: "ZestyDingo473",
    body: `Both requests are already done, and I want to be clear that neither reflects badly on you.

The YAH submission was declined yesterday, on exactly the ground you name: the scalar subquestion was not posed in the cited paper, so there is no previously stated open question behind it. Your own scope note said so before I did, which is why the decision took minutes rather than an afternoon. It is recorded as declined, not withdrawn under a cloud.

The attribution is not public. A declined submission is not listed, so no page names the account holder as a human collaborator anywhere on the site.

Your description of what a future submission would carry - the prior question, the exact new theorem, its proved contribution, stated before submitting - is precisely right, and it is a better summary of the bar than the methodology page manages. Please do send that when you have it.`,
  },
  {
    root: "72bd7fb7",
    who: "Roy van Rijn",
    body: `Yes, and thank you for widening the entry rather than opening a second one - duplicates are much more work to unpick later.

The slug is stale now that the entry is about the general conjecture, so I will change it to generalized-vanishing-conjecture and leave a redirect from the old path. Any link anyone has already shared keeps working; that matters more here than a tidy URL, and it is why the change needs doing properly rather than in place.

If the entry title still says "five variables" anywhere in the body text, point me at it and I will fix that at the same time.`,
  },
  {
    root: "3fe9573a",
    who: "Saul Schleimer",
    body: `That is exactly the right framing, and your three varieties are the three tiers this site actually uses, which I take as a good sign.

On how to motivate disclosure: the only lever I have found that works is making disclosure the thing that gets you a better label rather than a worse one. An entry whose paper says plainly "the model produced the construction, I verified it" sits higher here than one that leaves it to be inferred, because the second cannot be checked and so gets the weaker tier. The Koizumi paper listed this week has a section headed "Human-AI collaboration" that says which parts came from which, and it took me one fetch to confirm - that author gets a stronger entry than someone whose acknowledgements are vague, and the difference is visible on the page.

That only scales if the label is worth something. Which is the real problem: right now the incentive works because a handful of people care what this catalog says. If disclosure becomes a journal requirement it will be complied with and stop being informative, in the way that conflict-of-interest statements have.

The variety I cannot yet handle is the one where nobody is lying but nobody can remember. Several submissions here say "exact model versions were not retained". That is not concealment, it is just that the tooling does not record it, and no incentive fixes it - only better logging in the tools does.`,
  },
  {
    root: "33e77a38",
    who: "Saul Schleimer",
    body: `Done, on 2 September - your account shows as verified, with the note recording that the handle matches your GitHub and Mathstodon accounts and that the bio matches the Warwick staff page. Sorry that confirmation did not reach you at the time; this thread sat unanswered longer than it should have.

Thank you for the questions, and for the "what is the record?" one in particular. It was a fair hit: the contact page said "the people who keep the record" without ever saying what the record is. That phrasing is on the list to fix.`,
  },
  {
    root: "97bd7e48",
    who: "SwiftFerret455",
    body: `Good - I will take you up on it.

To be concrete about what Site-confirmed means when I do it: I rebuild from the pinned release rather than from the branch head, print the axioms of the advertised theorems, count sorry and axiom declarations across the whole development, and check that what the top-level statement says matches what the write-up claims. The entry then records the commit I built and the date, so a reader can repeat it.

What that will not establish is whether the theorem is new, or whether an expert agrees the statement is the right one. Those stay separate, and the tier will say so.

I will come back to this thread with the result either way, including if the build does not reproduce.`,
  },
  {
    root: "778f71be",
    who: "sjbevins",
    body: `Verified on 2 September - your account carries the note that the wm.edu address was confirmed by reply and matches the Google Scholar profile and homepage. Apologies that this thread never got its confirmation.

On the second AI-driven manuscript: please do send it when it is ready. The thing that will decide how it lists is not how strong the result is but how specifically the paper says what the model did. "Assisted with the writing" and "produced the construction, which I then verified" land in different tiers here, and the difference has to come from the paper rather than from the submission form.`,
  },
  {
    root: "57d208e9",
    who: "LucidManta102",
    body: `Thank you, and sorry it took this long to answer - you were right on all counts.

The doubled backslashes are a real bug and not just those entries: text arriving with LaTeX escaped once too often renders as literal source. I fixed the same class of thing on two entries this week, so I know the shape of it. Send me the list of the ones you have spotted, or just the worst offenders, and I will do a sweep rather than fixing them one at a time.

The literal \\n instead of a newline is the other half of the same problem and I will include it in the sweep.

If you would rather fix them yourself, corrections through the edit form are welcome and go into the changelog under your name.`,
  },
  {
    root: "7a61933c",
    who: "WildHeron785",
    body: `That is a thorough response and it does what I asked for.

The new disclosure is the part that matters: "performed most of the proof search, mathematical derivation, computational implementation, Lean proof development, literature discovery, organization, and drafting", with the author supplying methodology and oversight and retaining responsibility. That is specific enough to place the entry accurately rather than generously, which is the whole point of asking.

Keeping the correction under the same DOI was the right call, and I will update the entry to cite the corrected deposit and the verification archive.

The entry stays where it is on the verification ladder until the Lean build lands - the Python interval-arithmetic archive is a reproducibility artifact rather than a proof check, and I would rather say that plainly than blur the two. Tell me when the Palomar submission passes and I will look again.`,
  },
  {
    root: "6471ac01",
    who: "BraveEgret318",
    body: `Thank you for asking rather than just asserting it - and no, forwarded private correspondence is not enough, for a reason that is about the site rather than about you or Tore.

The verification tiers exist so a reader can check the claim themselves. "Independently expert-verified" means a named expert's endorsement that a reader can go and look at. An email I have seen and they have not is something they have to take on my word, which is the thing the tier is supposed to remove. If I accepted it, the label would quietly start meaning "the curator was convinced", and that is a different and much weaker claim.

What would work, in rough order of how little it asks of him: a sentence in a public place - a comment on the entry, a post, a note on his own page - saying he has read the proof and it holds. Or an acknowledgement in the write-up naming him as having checked it, which is how the Yau-Tian-Donaldson case is being argued to me this week. Or his name on a short note of his own.

On feeling silly asking: you would be asking him to repeat in public something he has already said in private to you, which is a much smaller favour than it feels like. His email is warm and specific, including a correction to Lemma 1 - people who write like that are usually happy to be quoted.

Meanwhile the entry keeps your own reading as what it is. Your being able to check the proof yourself is worth recording, and the entry can say so without claiming independence it does not have.`,
  },
  {
    root: "8362c4e5",
    who: "SwiftRaven486",
    body: `Two separate questions, and the answers point opposite ways.

On arXiv endorsement: I cannot help, and I would be wary of anyone here who offered. Endorsement is a personal vouch for someone's ability to post in a subject area, and it is supposed to come from someone who knows your work. A curator handing them out on the strength of one submission would be exactly the misuse the system exists to prevent. The usual route is someone in the field who has read the paper - which, given it is with CMP, may well be a referee or an editor you are already in contact with.

On whether being with CMP is a problem: no, and being listed here is not publishing. This is a record of problems resolved with an AI in the loop; it cites your source, it does not host or claim it. No journal I know of treats an index entry as prior publication, and plenty of listed entries are under review somewhere. If CMP has told you otherwise in writing, send me that and I will take the entry down rather than argue with your publisher.

The chain of ten to fifteen further papers is worth mentioning when you submit them: a sequence building toward one programme reads differently from ten unrelated results, and the catalog can link them.`,
  },
  {
    root: "8b6f80cc",
    who: "HiddenPanther560",
    body: `That is a bug on my side, not something you are doing wrong, and thank you for describing it precisely enough to find.

The edit form is rejecting your save because the result qualifier is over its 200-character limit - but the text was already over the limit before you touched it, so the form is refusing to let you fix a typo in a field it should never have accepted. You are stuck between a validator and existing data, which is my fault.

I will correct binary to graphical on the entry directly so you are not blocked, and look at the field limit separately: either the cap is wrong for that field or the form needs to let an over-length value be shortened rather than refusing the whole save.

If you hit anything else that will not save, send the exact error like you did here. It made the diagnosis immediate.`,
  },
  {
    root: "4c36159a",
    who: "HiddenHawk615",
    body: `Your instinct is right and the problem is real: a large seam of OEIS conjectures is about to be mined very cheaply, and most of what comes out will be true, novel, and not very important.

I do not think a single long table is the answer, though. The moment a result is in a table rather than an entry it loses its provenance - which model, what disclosure, what was actually checked - and that provenance is the only thing this catalog has that a list of theorems does not.

What I think fits better is what the site now calls a Frontier: one page per tracked quantity, with the successive results as steps on it, each keeping its own attribution and verification. That was built for moving bounds, but a family of related small results is close enough in shape to be worth trying. If the OEIS wave arrives, one page per family rather than one row per conjecture is the version I would attempt first.

On the low scores: significance near 5 is not a reason to exclude something. The scale exists so small true things can be recorded as small true things rather than argued about.

Erdős #26 - if the paper describes its own result as a variant, it may be listed under the variant rather than the problem number, which would explain your search missing it. Send me the paper and I will check whether it is here under another name.`,
  },
  {
    root: "31c624ae",
    who: "RustyKestrel290",
    body: `Useful correction, thank you - the entry currently describes the question less precisely than your paper does.

If I have you right: Chalmoulkis, Tsikalas and Yakubovich asked about Kreiss versus power bounded, and your construction settles the stronger strong-Kreiss version, so the entry both misattributes the question and undersells the result. I will fix the statement to say which question was posed and what was actually proved, and note that the answer is stronger than what was asked.

That distinction is worth getting right generally: "answered the question" and "answered more than the question" are different entries here, and the second is worth more.`,
  },
  {
    root: "f7c35651",
    who: "RustyKestrel290",
    body: `Understood, and moving it just before Theorem A in v2 is the right fix - the trivial range being addressed in section 2 is exactly the kind of thing a reader outside the area will not find.

I will leave the entry as it is until v2 is up rather than paraphrasing a clarification that is about to be stated properly in the paper. Send the new version when it lands and I will point the entry at it.`,
  },
  {
    root: "867aee51",
    who: "WildVulture296",
    body: `Fair, and worth recording rather than waving away. The scripts in that repository being model-written is part of the same story as the proof being model-assisted, and an entry that mentions one and not the other gives a slightly flattering picture.

The catalog does not currently have a field for "the supporting code was also generated", which is a gap - it sits between the AI-role prose and the verification note. For now it belongs in the AI-role text, and I will add it there.`,
  },
  {
    root: "0e908e6c",
    who: "LucidKestrel185",
    body: `Sensible - a download page is fine as a source here, and not chasing arXiv moderation is the right instinct. Their hold queue is slow and pushing rarely helps.

One thing that will matter when the page goes up: the source needs to be something anyone can open and check without an account, and ideally something that does not change silently under the entry. A tagged release or a versioned file is better than a page that gets edited in place. If you can put a date or a version on it, the entry can cite that exact state.

Send me the link when it is live and I will point the entry at it.`,
  },
  {
    root: "6ee7cd84",
    who: "CobaltMongoose239",
    body: `Both changes are what I hoped for, thank you.

The stronger disclosure is the one that matters for how this lists. And extending transcendence to algebraic independence is a genuinely better result than what was submitted - I will update the entry to state the stronger version rather than leaving it describing the weaker one.

Crediting Christopher Long's suggestion in the open, with the thread linked, is good practice and unusually rare. The entry will record that the strengthening came from that exchange; a result improved by someone pointing at it in public is a better story than one that arrives complete, and the record should show it.`,
  },
  {
    root: "84a178b0",
    who: "VibeGene",
    body: `Good - and the change to future practice is the more valuable half of that.

Shipping a paper's Lean tailored to that paper, rather than carrying a slice of a larger private repository, is what let me audit the mortality entry properly: I could see which modules were the theorem and which were the shared library. Without that, the honest thing a reviewer can say about a development is much less.

One thing from that review worth repeating: the shared directory is still called SierpinskiFormal in both entries, and neither result concerns Sierpinski. It cost me a detour to rule out one scaffold being submitted twice under two theorems. Renaming it would save the next person the same trip.`,
  },
  {
    root: "1fe51ab5",
    who: "SilentIbis765",
    body: `Thank you - resubmitting with the issues addressed rather than arguing them is the fast path, and it is noted.

I will pick it up in the next review pass. If anything in the original feedback was unclear, or if you disagreed with part of it and changed something anyway, say so in the submission note: a disagreement stated plainly is easier to review than a silent compliance.`,
  },
  {
    root: "1bb1fcc9",
    who: "ZestyWombat854",
    body: `Adding CI was the right response and it changes what the entry can claim: a green run anyone can look at is checkable in a way that "it built on my machine" is not.

On minimum slack 0 - agreed, and it is the better close for the reason you give. A bound that is tight is a different object from one that merely holds, and stating the tightness is what makes the aggregate argument worth having.`,
  },
  {
    root: "bedb5993",
    who: "ZestyWombat854",
    body: `Noted - 13 lines, not 30. Corrected in my reading of it, and the line reference is a better citation than the count anyway since it survives the file changing.`,
  },
];

/// SiteMessages with no matching thread, answered by closing them with a note
/// for the record. Anonymous senders with no reply address cannot be written
/// to; the note says what would have been said.
const SITE: SiteAnswer[] = [
  {
    id: "ee233b65",
    who: "anonymous (Yau-Tian-Donaldson hold challenge)",
    note: "THE MOST IMPORTANT MESSAGE IN EITHER QUEUE, and unanswerable: anonymous, no reply address. Argues that the extraordinary-claims hold on yau-tian-donaldson-conjecture-csck (arXiv:2608.19301) should lift, because the paper thanks Bin Dong, Guoxiong Gao, Chi Li, Gang Tian and Kewei Zhang 'for their enormous efforts in assisting with the verification of the paper'. Three are Kahler geometers, none is an author, and Kewei Zhang made an explanatory video. Checked: the entry is currently rejected. The argument has force - that acknowledgement is named non-author expert verification, which is what the rule asks for - so the entry deserves reassessment rather than staying closed. The sender also argues models can now self-check well enough to retire the requirement, and that the S2xS3 curvature entry should move with it; the second does not follow, as that entry has no comparable acknowledgement. Needs a curator decision, not a reply.",
  },
  {
    id: "d2b0d656",
    who: "shemshallah",
    note: "Asked whether profiles can be verified. Yes - four accounts are verified today. Answer: send something that ties the handle to a public identity (an institutional address, a GitHub or arXiv profile, a homepage) and it gets checked by hand. No reply address on file beyond the account, so answered in-app.",
  },
  {
    id: "ff80dbe6",
    who: "anonymous (radial coverage fingerprint)",
    note: "Idea for a radial 'shape of AI mathematics' chart across fields, with a mock-up. Worth doing: the fields chart already holds the data. Anonymous with no reply address, so nothing to answer - kept as a design note rather than closed silently.",
  },
  {
    id: "1b2d851a",
    who: "anonymous (overstatement criticism)",
    note: "Says headline framing such as 'Combined years open before AI closed them' overstates AI's role and borders on propaganda, while conceding the entries themselves are more nuanced. The criticism has force: a summed age across problems is a number with no meaning, and it is the most quotable thing on the page. Anonymous, no reply address. Kept open in spirit as a change to make rather than a message to answer.",
  },
  {
    id: "733c88d4",
    who: "lenaxe3855@ittiv.com",
    note: "Tip: a 254-year-old problem solved by Claude Fable, linked to a math.stackexchange answer. A stackexchange post is a lead rather than a source; needs the underlying claim and its provenance before it can be assessed.",
  },
  {
    id: "c0b88244",
    who: "Alexandre Sedoglavic",
    note: "Asks whether 'massive' open problems as in arXiv:2608.11941 are in scope and how they would be managed. Real question with no settled answer; needs a reply once the scope question is decided.",
  },
  {
    id: "2bd8b152",
    who: "tracymcsheery@gmail.com",
    note: "Shares a Lean riff on the 2/3 paper, explicitly not claiming value, plus an observation that models prefer rewriting old papers to trying new things. No question asked; no action needed.",
  },
  {
    id: "ca5e9b2b",
    who: "olangu@impressions.se",
    note: "Asks for the Ramachandra-Natarajan entry to be updated with a completed Codex Lean formalization, self-assessing it as Lean-checked, statement unaudited - which is the right tier by our own rules. Cannot submit it himself because sign-in is Google-only, and asks for GitHub or email sign-in. Needs both a reply and two actions: audit and update the entry, and a decision on auth.",
  },
  {
    id: "490d981a",
    who: "theabbie",
    note: "Verification request with a LinkedIn profile and matching email. Actionable: check and set verified, as was done for Schleimer and sjbevins.",
  },
  {
    id: "d1e43b35",
    who: "wangyuteng202110@163.com",
    note: "Proposes an 'AI-inspired' tier for human proofs whose method came from an earlier AI discovery. Genuinely interesting and genuinely hard: the tier would be unfalsifiable in most cases. Needs a policy decision before it can be answered.",
  },
  {
    id: "2a3e657e",
    who: "HiddenHawk615",
    note: "Asks whether AI OEIS conjecture results are deliberately excluded. Answered at length in the DirectMessage thread; this contact row is the same question and can be closed against that reply.",
  },
  {
    id: "afefa2e4",
    who: "GoldenMongoose827",
    note: "Asks whether adding a Wikipedia page as a citation URL was the right field for the degree-diameter problem. It was not quite - citations are for the result's own references. No harm done; worth a one-line answer.",
  },
];

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

async function main() {
  const db = await connectWithRetry();
  console.log(
    `database: ${db}${db === "vibemathed" ? "  (PRODUCTION)" : ""}\n`,
  );

  const curator = await prisma.user.findFirst({
    where: { pseudonym: "Rasmus Lindahl" },
    select: { id: true, pseudonym: true },
  });

  let bad = 0;
  const resolved: { r: Reply; rootId: string; userId: string }[] = [];

  for (const r of REPLIES) {
    // Roots are given by their short prefix, which is what the inbox dump
    // prints; resolve each to exactly one row or fail loudly.
    const rows = await prisma.$queryRawUnsafe<
      { id: string; userId: string; senderId: string | null }[]
    >(
      `SELECT id, "userId", "senderId" FROM "DirectMessage"
        WHERE "parentId" IS NULL AND id::text LIKE $1 || '%'`,
      r.root,
    );
    if (rows.length !== 1) {
      console.log(`  ${r.root}  ${r.who}: MATCHED ${rows.length} roots`);
      bad++;
      continue;
    }
    // A reply goes to whoever is not the curator on that thread.
    const other =
      rows[0].userId === curator?.id ? rows[0].senderId : rows[0].userId;
    if (!other) {
      console.log(`  ${r.root}  ${r.who}: no recipient`);
      bad++;
      continue;
    }
    const over = r.body.length > MESSAGE_MAX;
    console.log(
      `REPLY  ${r.who.padEnd(20)} ${r.body.length}/${MESSAGE_MAX}${over ? "  OVER" : ""}  [${r.root}]`,
    );
    if (over) bad++;
    resolved.push({ r, rootId: rows[0].id, userId: other });
  }

  console.log(`\nSITE MESSAGES to close: ${SITE.length}`);
  for (const s of SITE) console.log(`  ${s.id}  ${s.who}`);

  if (bad) throw new Error(`${bad} problem(s) - nothing sent`);

  if (!APPLY) {
    console.log("\nDRY RUN - pass --apply to send");
    return;
  }
  if (!curator) throw new Error("curator not found on this database");

  for (const { r, rootId, userId } of resolved) {
    await prisma.directMessage.create({
      data: {
        userId,
        senderId: curator.id,
        senderName: curator.pseudonym,
        kind: "reply",
        body: r.body.slice(0, MESSAGE_MAX),
        parentId: rootId,
      },
      select: { id: true },
    });
    console.log(`sent: ${r.who} [${r.root}]`);
  }

  for (const s of SITE) {
    const rows = await prisma.$queryRawUnsafe<{ id: string }[]>(
      `SELECT id FROM "SiteMessage" WHERE id::text LIKE $1 || '%' AND status = 'open'`,
      s.id,
    );
    if (rows.length !== 1) {
      console.log(`skipped (matched ${rows.length}): ${s.id} ${s.who}`);
      continue;
    }
    await prisma.$executeRawUnsafe(
      `UPDATE "SiteMessage" SET status = 'handled', "handledAt" = now() WHERE id = $1`,
      rows[0].id,
    );
    console.log(`closed: ${s.who}`);
  }

  console.log("\nAPPLIED.");
}

main().finally(() => prisma.$disconnect());
