# Reviewing submissions

For curators. Everything a submission needs before it is published, in the
order it is worth checking, and what to do when it fails a step.

The promise made in public is **two days**: the submit screen, the inbox and
the public queue at `/queue` all say most entries are reviewed within two
days. The header shows an orange **N to review** pill to admins while
anything is waiting, with the oldest wait in its tooltip. The review page is
`/admin/submissions`. Approving publishes immediately.

**Who reviews.** Members with the staff role *moderator* or *admin*, set by
an admin from the member's profile page (the "Curator controls" box, visible
to admins only), plus the founders listed in the `ADMIN_EMAILS` environment
variable. Moderators review; admins also verify members, record citation
counts and grant roles. *Developer* is a credit on the About page, not a
permission.

**Notes.** Every submission on the review page has a "Curator notes" box.
Use it: what you checked, what you are waiting on, why you think the tier is
wrong. The submitter never sees these and they never reach the entry. The
next reviewer does see them, which is the point.

A review is not a referee report. It answers four questions: is this in
scope, is it already here, does the evidence support the labels, and is the
entry written so a reader can check it. Most rejections are scope decisions.

## 1. Open the source

Every entry cites a primary source anyone can open. Open it. arXiv, a public
repository, a tracker page, a blog post all work; a private document, a paywall
or a dead link does not.

- Does not open, or is not public: reject, reason **Source not checkable**.
- Opens: keep it open. The rest of the checklist is read against it, not
  against the form.

## 2. The scope test

One sentence, from the methodology: *a precisely stated open question whose
answer is now a proved or disproved theorem, with an AI model substantively in
the loop.* Three parts, each fails separately.

**A stated open question.** Someone posed it before this work: a named
conjecture, a numbered problem, a question in a paper's open-problems section,
a tracked bound. A result that improves on prior work without any question
having been asked is out ("record-improving constructions that do not resolve
a stated question"). A new bound on a *stated* open constant is in, as
Partial.

**A theorem.** Proved or disproved. Heuristics, empirical results, and
conjectures are out. Formalizations of results humans already proved are out.

**AI substantively in the loop, disclosed in the primary source.** This is the
one to be strict about. Read the paper's acknowledgements, disclosure section
or methodology; read the repository's README. The disclosure must be *there*,
not only in the submission form. A paper that never mentions a model has
nothing for the record to say, however plausible the submitter's account.

- No disclosure in the source: reject, reason **AI role too thin**. Say the
  paper does not mention a model, and that a version which does would be
  worth resubmitting. (arXiv 2608.17267, September 2026, was rejected on
  exactly this and nothing else.)
- Disclosure present but only "general discussions with ChatGPT": also **AI
  role too thin**.

## 3. Duplicates

Search the catalog before anything else is edited. Search by distinctive
words in the title, by the problem's number, by the author's name, by the
arXiv identifier. Then think about neighbours:

- The same result under a different title (the prime-gaps paper and its
  erdosproblems.com claim were one result with two names).
- Numbered lists that share numbers. *Written on the Wall* (Fajtlowicz) and
  *Written on the Wall II* (DeLaViña) both have a conjecture 284, and they
  are different conjectures. Check which corpus.
- A concurrent independent proof of the same problem is **not** a duplicate;
  the methodology has a rule for it, and Crouzeix's conjecture is the worked
  example.

Duplicate: reject, reason **Already in the catalog**, and name the existing
entry.

## 4. Is the claim extraordinary?

Before checking the tier, ask what the result would mean if true. A famous
conjecture, a problem with decades of failed attempts, an object the field
expected not to exist. If a working mathematician in the area would call it a
landmark, it is held.

**Held means not published**, at any tier and at any resolution status,
Candidate included. It waits for a named expert with no stake in it or a
formal proof. The size of the claim decides, not who made it: the rule is the
same for a preprint by known authors and for an anonymous agent.

Mechanically there is no "hold" status, so: reject with reason **Something
else**, and write a message that says the claim is held under the
extraordinary-claims rule, what would lift the hold, and that resubmission is
welcome when it exists. Be warm about it. The submitter usually knows.

Two in two days in September 2026, both at Unreviewed, both from unidentified
agents, is what produced the rule.

## 5. The verification tier

Check the tier the submitter chose against the ladder on the methodology
page, and against the source. Submitters set this field and often set it one
rung too high in good faith.

| Tier | What has to be true | How to check |
|---|---|---|
| Unreviewed | Nobody independent has checked it. Default. | Authors checking their own work is still Unreviewed, however expert. |
| Lean-checked | A Lean artifact compiles with no `sorry` and no stray axioms. Statement not independently audited. | Open the repository. If a CI run or axiom audit is claimed, look at it (`gh api repos/<o>/<r>/actions/runs/<id>`). Confirm the commit matches. |
| Site-confirmed | The canonical tracker accepted it, **or this site re-ran the artifact itself.** | If you re-ran a certificate, rebuilt a formalization or audited axioms, say exactly what you ran and when in the verification note. If you did not, this tier is not available. |
| Expert-verified | Named domain experts with no stake, on the record. | Find the record: a public thread, a blog post, a tracker comment. Quote it. A submitter saying "an expert checked it" is not a record. |
| Lean-verified | Lean-checked **and** the formal statement independently anchored (tracker accepted, Formal Conjectures, or an independent audit of statement fidelity). | Both halves. A Palomar listing is a precondition for the second half, not the second half itself. |
| Contested | Disputed, walked back or withdrawn. | Stays listed with the dispute on record. |

Downgrading is normal. Approve with reason **Published at a lower tier** and
say why in one sentence.

## 6. Resolution status

- **Resolved**: the stated problem is fully proved or disproved. A disproof by
  an exact certificate is Resolved.
- **Partial**: a new bound, a resolved special case. Most bound improvements
  land here.
- **Candidate**: a full solution is claimed and publicly checkable, but
  authoritative review is pending. Not for extraordinary claims (step 4).
- **Variant**: a nearby or reinterpreted question was answered, not the one
  posed.

## 7. Fields worth a second look

Fix these before approving; approving as-is and editing later is worse,
because the changelog then shows a published entry being corrected.

- **Statement** is the problem as posed, not the abstract and not the result.
  Math in `$...$`. Two abstracts were pasted in one night in September 2026;
  the form's help text now says this.
- **Publication**: a PDF in a repository is *announcement*, not *preprint*.
  Preprint means arXiv or a similar server.
- **Source name**: the convention is `arXiv` for arXiv, otherwise a short
  name of the venue or repository. Not a sentence.
- **Model**: the site's family filter matches on keywords (`gpt`, `claude`,
  `opus`, `gemini`, ...). Check spelling. "Clade Opus 5" matches nothing.
- **Slug**: generated from the name and cut at 80 characters, sometimes
  mid-word. Shorten it. Convention is short and problem-shaped:
  `bugeaud-problem-10-61`, `graffiti-conjecture-806`.
- **Collaborators**: the human author(s), if any. Often left empty by a
  submitter who is the author.
- **Posed by / year**: only if the source or the literature actually says.
  Leave blank rather than guess, and use the age note for what is known.

## 8. Curator-only fields

**Significance and its note are required.** Every published entry has them;
the form cannot set them, so every approval needs them filled by hand.

Score the problem as it stood *before* it was solved, against the anchored
ladder on the methodology page (Riemann 100, Collatz ~80, Jacobian ~65, a
conjecture famous within one community ~30, a typical Erdős problem 10,
machine-generated conjectures 5). Then place it comparatively: find two or
three published entries of similar standing and say in the note whether this
one sits above or below them, and why. Ties are deliberate. A Graffiti or
Written-on-the-Wall conjecture is 5 with the standing note *"Machine-generated
(Graffiti); real but unfamous by construction."*

The note is plain text, no math, at most 600 characters.

## 9. Decide, and write the message

Every decision sends the submitter a message, which is the only explanation
they will ever see. The canned reasons are starting points; edit them.

- **Approve, as submitted**: rare; say thanks.
- **Approve, with edits**: list what changed and say the mathematics did not.
  Invite them to correct you.
- **Approve, at a lower tier**: say which tier and why in one sentence.
- **Reject**: the reason, in plain words, and the way back if there is one.
  A rejection is a scope decision, not a verdict on the work.

If you verified something independently (a CI run, a registry entry, a
certificate), say so in the message. It is the part they will remember.

## 10. After publishing

The entry is live within a minute. Open it. Check the math renders and the
links open. If you published by script rather than the review page, the
public cache may lag until the next deploy; the entry page itself is right
immediately.

## Sweeps

Automated conjecture programs (Graffiti, Written on the Wall, TxGraffiti) are
now refuted in bulk by agents; one repository claims 197. Each one qualifies
and each one scores 5. The policy, decided 2 September 2026 and written into
the methodology:

- **One entry per conjecture**, as the Erdős imports are. The dataset stays
  one row per problem, and a later submission of the same conjecture is
  caught by the duplicate scan. (A grouped "sweep" entry was considered and
  rejected: it breaks the one-problem model, hides per-conjecture duplicates,
  and has no honest significance score.)
- **Site-confirmed or better, every one.** Re-run the certificate here, or
  confirm a machine-checked proof. An unreviewed batch of 197 is not
  accepted one by one; it is not accepted at all.
- **Imported as a batch by a curator** from the repository's own manifest or
  README, with a script under `scripts/` that records what was re-run. Not
  filed one form at a time. When a submitter files one by hand, publish it
  if it passes, and ask them for the manifest.
- **The sweep is the source name** on every entry, so the sweep can be read
  as a whole through the list's search.

Volume is handled by the significance score, which is a sort and a filter.
If the home list's default view ever needs to hide the 5s, that is a product
decision to take separately, not a reason to leave qualifying results out.

## Where the reasoning goes

A review done by script, because it needed field edits, keeps its reasoning
in the script's header under `scripts/`. `scripts/review-2026-09-01.ts` is
the model: what was verified, how, and why each label is what it is. The
message to the submitter should say the same things more briefly.
