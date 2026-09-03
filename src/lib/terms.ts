// The Terms of Service, as data.
//
// One source: the /terms page renders these sections, and the version below is
// what a future acceptance record would store against a member. Keeping the
// text here rather than in a markdown file avoids the usual failure where the
// rendered terms and the archived terms drift apart; git history is the
// archive, and TERMS_VERSION is the pointer into it.
//
// STATUS: DRAFT. The page is noindexed and linked from nowhere until the
// operator signs it off. Three placeholders below are marked TODO and must be
// filled before it is linked. This is an engineering draft informed by a legal
// review, not legal advice, and the two clauses flagged in the comments are
// the ones worth putting in front of a Swedish lawyer.
//
// Drafting principles, because they explain why this is shorter than the
// review's draft:
//
//   1. Every factual claim about the site has been checked against the site.
//      A term describing behaviour the product does not have is worse than no
//      term at all.
//   2. Disclaimers do the work they can actually do - ordinary error and
//      reliance - and process does the rest. Copyright, personal data and
//      statements about people are handled by /data-license, the privacy
//      work and the rights-notice route, not by a sentence saying we are not
//      responsible.
//   3. No arbitrary liability cap. The review proposed EUR 100 and flagged it
//      as doubtful; a standard-form cap against a consumer in the EU is
//      unreliable, and naming a number invites the argument. The service is
//      free, which is the honest limitation.

export const TERMS_VERSION = "2026-09-03";
export const TERMS_EFFECTIVE = "3 September 2026";

/// TODO before publishing: the operator's legal contact address. The site
/// deliberately publishes no personal address and routes everything through
/// /contact; whether Swedish e-commerce law requires a postal address for an
/// uncompensated project of this size is the open question, and if it does,
/// use a service address rather than a home one.
export const OPERATOR_NAME = "Rasmus Lindahl";
export const OPERATOR_COUNTRY = "Sweden";

export interface TermsSection {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  /// Rendered after the bullets, for the sentence that qualifies a list.
  after?: string[];
}

export const TERMS: TermsSection[] = [
  {
    heading: "1. Who runs this and what it is",
    paragraphs: [
      `VibeMathed is operated by ${OPERATOR_NAME}, in ${OPERATOR_COUNTRY}, as a non-commercial personal project. Other people contribute as volunteers - moderating, reviewing, writing code - and contributing does not make someone an operator of the service or answerable for it.`,
      "VibeMathed is a record of mathematical problems reported as solved, disproved or advanced with an AI model substantively in the loop. It is not a journal, not a peer-review service, not a certifying body, and not a substitute for reading the paper.",
      "Inclusion is not endorsement. An entry existing here does not mean a claim is correct, novel, first, or correctly attributed. Every entry links its primary source; that source is the thing to rely on.",
    ],
  },
  {
    heading: "2. What the labels mean",
    paragraphs: [
      "Entries carry a result, a resolution status, a verification tier, an AI-contribution classification and a significance score. What each one means is set out in the methodology, and the definitions there are part of these terms.",
      "They describe what was known and checked at a point in time. They are not warranties, and they change as claims are reviewed, challenged or corrected.",
    ],
    bullets: [
      "Unreviewed means nobody independent has checked the mathematics. Most entries sit there.",
      "A machine-checked proof establishes that a formal statement follows from stated assumptions. It does not establish that the formal statement is the informal problem.",
      "Peer review does not guarantee correctness, and its absence does not establish error.",
      "Significance scores are editorial estimates, assigned with AI assistance against a published prompt. They measure attention, not mathematical worth.",
      "Dates, attribution and priority depend on incomplete historical records.",
    ],
  },
  {
    heading: "3. AI, and what human review does not guarantee",
    paragraphs: [
      "This site uses AI models to help read sources, draft curator notes, score significance and find candidates. Where and how is set out on the AI disclosure page.",
      "Models make mistakes, including confident ones: fabricated citations, wrong dates, misread proofs, mistaken attribution, invented priority. A curator reads and signs what is published, and that reduces the rate of such errors without eliminating them.",
      "So: the fact that a human approved an entry is not a guarantee that every AI-originated error in it was caught. Anyone relying on an entry for anything consequential should read the primary source.",
    ],
  },
  {
    heading: "4. Accounts and what is public",
    paragraphs: [
      "Some features need an account. You are responsible for what is done through yours.",
      "Your pseudonym is your public identity here. Your real name and email are never shown unless you turn them on yourself in your profile. Submissions, edits, comments and votes are public under your pseudonym, and edits are recorded in a public changelog.",
      "Deleting a comment removes it and its changelog line, from the entry and from your profile.",
    ],
    bullets: [
      "Do not impersonate anyone or claim credentials you do not have.",
      "Do not manipulate voting, submissions or moderation by deception.",
      "Do not use automated means to flood or disrupt the site.",
    ],
  },
  {
    heading: "5. What you contribute",
    paragraphs: [
      "Submissions, edits, comments, reports and corrections are your contributions and stay your responsibility.",
      "By making one you confirm, to the best of your knowledge: it is made in good faith; you are not knowingly stating anything false; the sources you cite are real and not misrepresented; you have the right to submit anything you wrote; and you are not knowingly infringing anyone's rights.",
      "You are not promising to be right. Being wrong about mathematics is expected in a collaborative record and is what the correction machinery exists for. Knowingly fabricated, deceptive or unlawful contributions are a different matter and are not permitted.",
      "Where you state or imply that an identifiable person did something seriously wrong - fraud, plagiarism, fabrication, misconduct - you need a factual basis and a source. Saying that a lemma was withdrawn is a sourced fact. Saying that its authors meant to deceive is an allegation about a person, and it needs more than an inference.",
    ],
  },
  {
    heading: "6. Licences, yours and ours",
    paragraphs: [
      "You grant the operator a non-exclusive, worldwide, royalty-free licence to host, display, reproduce, adapt, distribute and archive your contributions as part of the record - and only over rights you actually hold. Submitting a passage from a paper does not transfer the paper.",
      "Because the record is a shared history that other people have replied to and built on, that licence continues for material already incorporated into the public dataset after an account closes. Comments you can delete, you can delete.",
      "What VibeMathed itself wrote - the classifications, scores, notes and structure - is available under CC BY 4.0. Material quoted from the papers belongs to its authors and is not relicensed by appearing here. The licensing page draws that line, and it governs over any shorter phrasing elsewhere on the site.",
    ],
  },
  {
    heading: "7. Moderation, and what it is not",
    paragraphs: [
      "Curators may accept, decline, edit, reclassify, annotate, merge, restrict, unpublish or remove material, and may suspend accounts. Landmark claims are held rather than listed until an expert or a formal proof exists; that rule is in the methodology.",
      "Accepting a contribution is not agreement with it. Removing or restricting one is not an admission that it was unlawful, false or infringing - sometimes it is just how a dispute is handled while it is looked at.",
      "There is no promise to check everything. Submissions are reviewed, and entries are corrected when someone points out a problem, but nothing here undertakes to detect every error, infringement or unlawful item before it appears. That does not affect what the law requires once a specific notice arrives.",
    ],
  },
  {
    heading: "8. Two ways to raise a problem",
    paragraphs: [
      "If the mathematics is wrong, or a date, an attribution or a classification is wrong, fix it in the open: every entry is editable, every entry has a discussion thread, and every entry can be reported to the curators. Ordinary scholarly disagreement is usually answered by correcting or annotating an entry rather than removing it, and the history stays visible.",
      "If something here reproduces your work beyond quotation, says something untrue or unlawful about you, carries personal information, or impersonates you, that is a rights notice and it goes through contact. Pick the matching topic. No account is needed - someone whose work or reputation is affected must not have to join the site to say so.",
      "A useful notice says which page, which passage, and what is wrong with it. You do not need to name a statute. We will correct, annotate, restrict or remove as the case requires, and if you leave a reply address you will be told what was done.",
    ],
  },
  {
    heading: "9. No warranties",
    paragraphs: [
      "The service and everything in it is provided as is. To the fullest extent the law allows, there is no warranty that an entry is accurate, complete, novel, correctly attributed, correctly classified, first, or fit for any purpose; that a formal statement matches the informal problem; that a source is trustworthy; or that errors will be found within any particular time.",
      "The site may change, break or go away. Keep your own copy of anything you depend on.",
    ],
  },
  {
    heading: "10. Liability",
    paragraphs: [
      // The review proposed an explicit EUR 100 cap. Dropped deliberately:
      // against a consumer in the EU such a cap is unreliable, and naming a
      // figure invites an argument the operator would rather not have. That
      // the service is free is the real and defensible point.
      "To the fullest extent the law allows, the operator and the volunteers are not liable for loss arising from errors in the record, from reliance on an entry or a classification, from AI-generated mistakes, from other people's contributions, from third-party links, from moderation decisions, or from the service being unavailable.",
      "This is a free, non-commercial project. Nothing here excludes liability that cannot lawfully be excluded, including for intentional wrongdoing.",
      "Volunteering as a moderator, reviewer or developer is not a personal warranty of anything on the site.",
    ],
  },
  {
    heading: "11. Your own unlawful acts",
    paragraphs: [
      "If you knowingly or negligently submit unlawful material and that directly causes the operator a legally enforceable third-party claim, you may be responsible for the reasonable direct cost of it, so far as the law allows.",
      "Nothing in this section touches a good-faith contributor whose mathematical or factual judgement turns out to be wrong.",
    ],
  },
  {
    heading: "12. Privacy",
    paragraphs: [
      "How personal information is handled is covered separately by the privacy policy. These terms do not waive anything under data-protection law.",
    ],
  },
  {
    heading: "13. Law, and changes to these terms",
    paragraphs: [
      `These terms are governed by the law of ${OPERATOR_COUNTRY} together with directly applicable EU law, without prejudice to mandatory rules that apply regardless. Disputes go to the competent Swedish courts, except where a rule of jurisdiction that cannot be waived says otherwise.`,
      "Please write to us before starting anything formal. Most of what reaches the curators turns out to be fixable.",
      `These terms may change as the site does. The current version and its date are at the top of this page; this is version ${TERMS_VERSION}, effective ${TERMS_EFFECTIVE}. If a change materially affects members, we will say so rather than quietly reissue it.`,
      "If any part of this is unenforceable, the rest still stands.",
    ],
  },
];
