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

### "I could not find it" is not "it does not exist"

Write what you looked for and where you looked. Never write that something
does not exist, and never let its supposed absence be the reason a submission
is held.

This rule is here because the same mistake was made twice in one day, on
4 September 2026, and both times it went out to a submitter in writing.

- A percolation claim was held partly on the sentence "the work has been
  withdrawn from the repository it was published in". It had never been in
  that repository: the commit came from a pull request titled "wip: scaffold"
  that was closed unmerged, and the default branch had never carried it. The
  true version of that sentence was a better reason, and it was available.
- A prime-gaps claim was held partly on "the paper it formalises exists
  nowhere I can find - not on arXiv, not on the OpenAI CDN, not in the repo".
  It was on that CDN, at the sibling URL of a PDF the site had verified and
  published a few hours earlier the same morning. Two errors compounded: the
  search used the title the repository's metadata gives rather than the
  paper's own, and nobody listed the directory already being downloaded from.

The practical form of the rule:

- Before asserting absence, try the obvious neighbours: the sibling filenames
  in a directory you already have, the paper's own title as well as the one
  the metadata gives, the author's homepage, the repository's other branches
  and closed pull requests.
- If a submission stands or falls on absence, do not decide it. Ask the
  submitter for the link. They usually have it.
- Prefer a reason you can state positively. "The Lean development is
  conditional on three axioms" needs no search to stand up; "the paper does
  not exist" needs an exhaustive one.
- When a hold turns out to rest on a wrong premise, reverse it and say which
  sentence was wrong. The correction is cheap and it is the whole of the
  site's credibility with the people who submit.

## 1a. Literature and prior art before the verdict

Before assigning significance or finalizing the contribution summary, novelty
language, attribution, resolution scope or recommendation, the reviewing AI must
complete the literature comparison in [the v3 scoring prompt](../public/significance-prompt.md).
Supply that prompt in the AI's actual review input and provide external search
and source-reading tools. A paper's bibliography, model recall, earlier AI rating
or successful Lean build does not satisfy the check.

Pin the claim/version; search beyond the submitted references using alternate
terminology, mechanisms and matched assumptions/parameters; inspect the closest
primary theorem and construction passages. For each main claim record the old
result, known ingredients and residual new contribution, with source URLs and
exact anchors. Test whether standard results already imply the claim, and state
that reduction when it matters. Explain what a synthesis newly enables instead
of rewarding an unfamiliar combination or dismissing all combinations as trivial.
Record actual searches, inspection depth and remaining gaps in curator notes or
the review script's header. Search failure is not a priority certificate.

If a material comparison cannot be resolved, mark the novelty check incomplete,
withhold the score and leave a new submission pending with the concrete missing
check in curator notes. Do not approve with a guess, assign zero for uncertainty,
or reject on an unproved assertion of absence. A bounded search with the
load-bearing comparisons resolved can support a scoped judgment; it need not
prove global priority. Verification can proceed separately. For an existing
entry, preserve the historical assessment while recording an incomplete v3
reassessment; do not silently overwrite it or call it newly reviewed.

The following scope and label checks use this comparison. Revisit it before
approval if a later verification check changes what was actually proved.

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

**Volume is a signal.** When one author's AI-written output is large and
spans unrelated fields in a short window, weigh what one person can actually
have checked in that time. The author's own statement of having verified the
work already carries no weight on the ladder; in this situation, check
statement fidelity harder, prefer a finite certificate you can re-run over a
long argument you cannot, and hold anything landmark-tier without exception.
This is not a judgement of the person. It is arithmetic about days and pages,
and the same arithmetic would apply to anyone. The first entry withdrawn
under this reading was a disproof of the Yau-Tian-Donaldson conjecture,
listed as a candidate for two weeks before the rule existed.

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

**Significance and its note are required for approval**, after step 1a's
literature gate. The form cannot set them; the curator records the AI assessment.
Use [the v3 prompt](../public/significance-prompt.md): score the actual incremental
contribution over the closest known literature, on the site's 0-100 scale. A
partial result earns credit for its advance, not the fame of the full problem.
Correctness and formalization value remain separate. Routine recombination with
little new insight merits modest significance even when the whole theorem sounds
profound; a nontrivial synthesis can earn more when the missing bridge and its
consequences are demonstrated.

Compare against relevant v3-assessed entries when available; historical v2
problem-standing scores are not automatic contribution anchors. Do not assign a
blanket 5 to machine-generated conjectures without a comparison. Keep confidence
and search limitations separate from the score.

The public note is plain text, no math, at most 600 characters. Begin it with
`v3:` and name the closest prior work and the specific addition, with a compact
comparative reason. Keep the fuller claim/source crosswalk in the review record.
Existing scores are unchanged until explicitly reassessed; this policy update
is not a catalog rescore. Preserve previous scores/reasons in the changelog and
update all affected contribution, attribution and recommendation text together.

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
and historically each scored 5. Under v3, assess the actual contribution after
the literature check; do not use the historical default as a substitute. The
inclusion policy, decided 2 September 2026 and written into the methodology:

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

For v3 reviews also retain the prompt version, manuscript/repository revision,
review date, model actually used, literature queries and inspected source
anchors, old/new comparison, residual contribution, limitations and confidence.
The short public significance note summarizes the baseline and addition; it
must not leave the number supported only by private notes. Do not edit old
review scripts to imply that checks absent from their records were performed.
