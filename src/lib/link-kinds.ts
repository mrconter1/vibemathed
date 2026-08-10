// What a link IS, as opposed to what it is called.
//
// Links used to carry only a free-text label, which made them unreadable at a
// glance and unfilterable in principle: "Lean 4 formalization", "Lean proof",
// "Lean certificate (ConnesRigidity.lean)" and "AxiomProver Lean development"
// are four spellings of one thing, and nothing could tell that a paper link
// and a transcript link were different in kind.
//
// The categories below are not invented. They are the clusters that were
// already in the 121 links the catalog had when this was added, which is why
// `independent` and `transcript` exist at all: both are large, real, and mean
// something quite different from "paper".

export type LinkKind =
  | "paper"
  | "lean-proof"
  | "lean-statement"
  | "code"
  | "transcript"
  | "announcement"
  | "problem-record"
  | "wikipedia"
  | "discussion"
  | "independent"
  | "other";

export interface LinkKindSpec {
  value: LinkKind;
  /// Shown in the picker and as the fallback label when a link has none.
  label: string;
  /// One line, for the icon's tooltip on a card.
  help: string;
  /// Key in src/components/Icons.tsx.
  icon: string;
  /// Card display order. Lower comes first, and only the first few show, so
  /// this is really "how much does a reader want this one". The paper leads
  /// because it is the thing most readers are looking for; `other` sinks.
  rank: number;
}

export const LINK_KINDS: LinkKindSpec[] = [
  {
    value: "paper",
    label: "Paper",
    help: "The write-up: preprint, manuscript or note",
    icon: "paper",
    rank: 1,
  },
  {
    value: "lean-proof",
    label: "Lean proof",
    help: "A machine-checked proof",
    icon: "leanProof",
    rank: 2,
  },
  {
    value: "lean-statement",
    label: "Lean statement",
    help: "The problem stated formally, without a proof",
    icon: "leanStatement",
    rank: 3,
  },
  {
    value: "code",
    label: "Code",
    help: "Verification scripts, certificates or a repository",
    icon: "code",
    rank: 4,
  },
  {
    value: "independent",
    label: "Independent work",
    help: "Someone else's proof of the same or a neighbouring result",
    icon: "branch",
    rank: 5,
  },
  {
    value: "transcript",
    label: "Transcript",
    help: "A model session, reasoning record or AI-use note",
    icon: "transcript",
    rank: 6,
  },
  {
    value: "announcement",
    label: "Announcement",
    help: "The lab's or author's public announcement of the result",
    icon: "megaphone",
    rank: 7,
  },
  {
    value: "problem-record",
    label: "Problem record",
    help: "The canonical entry for the problem itself",
    icon: "bookmark",
    rank: 8,
  },
  {
    value: "wikipedia",
    label: "Wikipedia",
    help: "The encyclopedia article for the problem",
    icon: "globe",
    rank: 9,
  },
  {
    value: "discussion",
    label: "Discussion",
    help: "A thread, question or forum post",
    icon: "bubble",
    rank: 10,
  },
  {
    value: "other",
    label: "Other",
    help: "Anything else",
    icon: "link",
    rank: 11,
  },
];

const BY_VALUE = new Map(LINK_KINDS.map((k) => [k.value, k]));

export function linkKindSpec(kind: string | null | undefined): LinkKindSpec {
  return BY_VALUE.get((kind ?? "other") as LinkKind) ?? BY_VALUE.get("other")!;
}

export function isLinkKind(value: unknown): value is LinkKind {
  return typeof value === "string" && BY_VALUE.has(value as LinkKind);
}

/// Best guess for an unclassified link.
///
/// Used to backfill the links that predate this, and to type an entry's
/// primary source, which has no `kind` of its own - a source is a required
/// single URL rather than a row in the links table, and adding a column to
/// carry a value that the URL almost always determines was not worth it.
///
/// The label is consulted before the host: "Lean certificate" on a github URL
/// is a Lean proof, not generic code, and only the label knows that. Where the
/// label says nothing the host decides, and where neither does it stays
/// `other` rather than guessing.
export function inferLinkKind(url: string, label = ""): LinkKind {
  const l = label.toLowerCase();
  const u = url.toLowerCase();
  const both = `${l} ${u}`;

  // Someone else's result is a claim about provenance that no URL can carry,
  // so it has to come from the label and it has to be checked first: an
  // "independent proof, arXiv:..." is not simply a paper.
  //
  // "Independent" has to be doing provenance work, not just appearing. It is
  // also an ordinary word in mathematics, and matching it bare filed a paper
  // called "Counterexample to a conjecture on the pairwise independent
  // correlation gap" as somebody else's proof of the same thing.
  if (
    /\bindependent(ly)?\s+(proof|proven|proved|work|result|solution|verification|confirmation|derivation)\b/.test(l) ||
    /\b(proof|solution|result)\b[^.]{0,40}\bindependent(ly)?\b/.test(l) ||
    /\bsecond proof\b|\bthird\b.*\bproof\b/.test(l)
  ) {
    return "independent";
  }

  const paperHost = /arxiv\.org|doi\.org|zenodo|overleaf|eprint\.iacr/.test(u);

  if (/\blean\b|\.lean\b|formal(ization|isation)|formal-conjectures/.test(both)) {
    // "Lean-verified" as an adjective on an arXiv link describes the paper,
    // it does not make the link a proof. Without this, a Lean-proof icon
    // promised a repository and delivered a PDF.
    const isArtifact = /formal(ization|isation)|certificate|repositor|\.lean\b|\bproof\b/.test(l);
    if (!paperHost || isArtifact) {
      // A statement-only formalization is the conjecture written down, not a
      // proof of it. The distinction is the whole reason both kinds exist.
      return /\bstatement\b|\bconjecture (statement|formalization)\b|^original conjecture/.test(l)
        ? "lean-statement"
        : "lean-proof";
    }
  }

  // A note ABOUT the model's involvement, before the word "note" below can
  // claim it as a write-up.
  if (/provenance|ai[- ]use|\bprompt\b/.test(l)) return "transcript";

  // The lab's or the author's public announcement of the result. Has to beat
  // both the paper rule and the discussion rule: a post on a research blog is
  // not the write-up, and an author posting their own theorem is not a thread
  // somebody started.
  //
  // Gated on the link being a web page first. An announcement is something you
  // read in a browser, and both halves of this guard were earned by the dry
  // run over the existing catalog: `ulam.ai/research/erdos856-final.pdf` is
  // the write-up itself and matched a research-blog path, and an arXiv paper
  // labelled "concurrent human proof ... crediting Ryu's announcement" matched
  // on a word that described something the paper is not.
  const isWebPage = !/\.pdf$/.test(u) && !paperHost;
  if (isWebPage) {
    // Label first, because a lab serves its announcements and its PDFs from
    // one domain and nothing in the URL separates them - "Anthropic's
    // announcement" and "Claude's paper (Anthropic)" are both anthropic.com.
    // "Blog" bare rather than "blog post": the label the catalog actually
    // carries is "Terence Tao's blog", and a mathematician's blog is where
    // they announce things.
    if (/\bannounc(e|es|ed|ement|ing)\b|\bblogs?\b|\bpress release\b/.test(l)) {
      return "announcement";
    }
    // The research-blog paths of the labs the catalog actually cites, for the
    // links whose label does not say what they are.
    if (/(deepmind\.google|anthropic\.com|openai\.com)\/(research|index|news|blog)\//.test(u)) {
      return "announcement";
    }
  }

  // What the label calls it beats where it is hosted. Eleven of the OpenAI
  // links are labelled "Manuscripts (ten-proofs paper)" and eleven more
  // "Reasoning walkthroughs" - same host, and only the label separates a
  // paper from a transcript.
  if (/\bpaper\b|\bpreprint\b|manuscript|write-?up|\bnote\b/.test(l)) return "paper";

  if (/transcript|walkthrough|chat\.openai|chatgpt\.com\/share|cdn\.openai\.com/.test(both)) {
    return "transcript";
  }
  if (/erdosproblems\.com\/\d|\bproblem (record|list|page)\b|conjecture list/.test(both)) {
    return "problem-record";
  }
  // Host is decisive here in a way it is not elsewhere: a wikipedia.org URL is
  // a Wikipedia article whatever the label calls it. It has to come before the
  // discussion rule so an article whose title contains "question" or "problem"
  // is not read as somebody asking one.
  if (/\bwikipedia\.org/.test(u)) return "wikipedia";
  // A preprint server is decisive before the discussion rule gets a look. Its
  // terms are ordinary English that math titles use constantly, and matching
  // them on an arXiv link filed "On a question of Mauri and Moraga" and "A
  // question on klt type varieties of Han and Jiang" as forum threads. By
  // here every rule that could legitimately beat a paper host - the explicit
  // Lean, transcript, problem-record and Wikipedia labels - has already run.
  if (paperHost) return "paper";
  // Plural included deliberately: "Copilot threads" fell through to `other`
  // without it.
  if (/mathoverflow|\bthreads?\b|\bforums?\b|\bdiscussions?\b|\bquestions?\b/.test(both)) {
    return "discussion";
  }
  if (/github\.com|gitlab|\bcode\b|\brepo(sitory)?\b|\bscripts?\b|\.py\b|verif(ier|ication suite)/.test(both)) {
    return "code";
  }
  return "other";
}

/// Links bucketed by kind, in card order, skipping kinds with nothing in them.
/// Used by the entry page; the cards use `topLinkKinds` instead.
export function groupLinksByKind<T extends { url: string; label: string; kind?: string }>(
  links: T[],
): { spec: LinkKindSpec; links: T[] }[] {
  const buckets = new Map<LinkKind, T[]>();
  for (const l of links) {
    const k = linkKindSpec(l.kind).value;
    if (!buckets.has(k)) buckets.set(k, []);
    buckets.get(k)!.push(l);
  }
  return LINK_KINDS.filter((s) => buckets.has(s.value)).map((spec) => ({
    spec,
    links: buckets.get(spec.value)!,
  }));
}

/// The handful of links a card should show as icons, best first.
///
/// A card is not the place for a full list: the point is to answer "is there a
/// paper / is there a Lean proof" without opening the entry. `other` never
/// earns a slot, since an icon that says nothing is worse than no icon.
export function topLinkKinds<T extends { url: string; label: string; kind?: string }>(
  links: T[],
  limit = 3,
): { spec: LinkKindSpec; link: T }[] {
  const seen = new Set<LinkKind>();
  const out: { spec: LinkKindSpec; link: T }[] = [];
  for (const spec of LINK_KINDS) {
    if (spec.value === "other") continue;
    const hit = links.find((l) => linkKindSpec(l.kind).value === spec.value);
    if (hit && !seen.has(spec.value)) {
      seen.add(spec.value);
      out.push({ spec, link: hit });
    }
    if (out.length >= limit) break;
  }
  return out;
}
