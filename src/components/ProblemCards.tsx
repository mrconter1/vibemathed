"use client";

// The entry list, as wide cards.
//
// Card height is deliberately variable and nothing reserves space for prose:
// only about one entry in five has a `statement` or an `aiRole`, so a fixed
// card would render four-fifths of the list as mostly-empty rectangles. A lean
// Erdős entry collapses to two compact lines; a marquee entry grows to carry its
// statement. The fields that ARE always present (type, who posed it, year, age,
// model, verification, notability) carry the visual weight instead.
//
// Cards have no column headers, so sorting moved into an explicit control.

import { useEffect, useMemo, useRef, useState } from "react";
import { useBeforePaint } from "@/lib/before-paint";
import { inferLinkKind, topLinkKinds } from "@/lib/link-kinds";
import {
  DEFAULT_SETTINGS,
  NUMERIC_KEYS,
  PAGE_SIZES,
  PERIODS,
  PERIOD_DAYS,
  SETTINGS_COOKIE,
  SETTINGS_COOKIE_MAX_AGE,
  SETTINGS_KEY,
  SORTS,
  TIME_SENSITIVE,
  normalizeListSettings,
  sortValue,
  type ListSettings,
  type SortDir,
  type SortKey,
} from "@/lib/list-settings";
import Link from "next/link";
import {
  ageAtSolve,
  AI_CONTRIBUTIONS,
  FIELD_GROUPS,
  PUBLICATION_STATUSES,
  RESOLUTION_METHODS,
  RESOLUTION_STATUSES,
  type CardEntry,
  type FieldGroup,
  type Period,
  type SolveType,
  type VerificationStatus,
} from "@/lib/problems";
import {
  AI_CONTRIBUTION,
  DASH,
  MODEL_FAMILIES,
  PUBLICATION,
  RESOLUTION,
  RESOLUTION_METHOD,
  SIGNIFICANCE_HELP,
  SOLVE_TYPE,
  VERIFICATION,
} from "@/lib/display";
import { FilterPanel, type FilterFacet } from "@/components/FilterPanel";
import { Icon, type IconName } from "@/components/Icons";
import { StatusIcon } from "@/components/StatusIcon";
import { InfoTip, StarNote } from "@/components/Tooltip";
import { VoteButtons } from "@/components/VoteButtons";
import { TeX, deTeX } from "@/components/TeX";


// The clock for period cutoffs, fixed at module load: render purity wants a
// stable now, and a cutoff drifting by the age of the tab is nothing against
// 7/30-day windows.
const LOADED_AT = Date.now();


/// Compact page list: first, last, current and neighbours, with gaps elsewhere.
function pageWindow(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const wanted = new Set([1, total, current, current - 1, current + 1]);
  const nums = [...wanted].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | "gap")[] = [];
  let prev = 0;
  for (const p of nums) {
    if (p - prev > 1) out.push("gap");
    out.push(p);
    prev = p;
  }
  return out;
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d={dir === "left" ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"} />
    </svg>
  );
}

/// One dot-separated fact in the card's fact line. Deliberately NOT
/// whitespace-nowrap: values like a six-model credit line are wider than a
/// phone-sized card, so a fact must be able to wrap internally rather than
/// overflow the card.
function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span>
      <span className="text-[var(--ink-muted)]">{label} </span>
      <span className="text-[var(--ink-secondary)]">{children}</span>
    </span>
  );
}

/// "8 Aug 2026" from an ISO timestamp. Deliberately not RelativeTime: this
/// sits in a dense metadata row where "3 days ago" would need re-reading
/// against the solve date next to it, and unlike the feed these dates are
/// mostly weeks old, where the absolute form is the more useful one.
function formatAddedDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCDate()} ${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

const MONTHS_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function ProblemCard({ p, statementHtml }: { p: CardEntry; statementHtml: string | null }) {
  const st = SOLVE_TYPE[p.solveType];
  // The primary source counts as a link. For 265 of the entries it IS the
  // paper, so leaving it out would have shown a paper icon only on the
  // minority that happen to carry a second copy as an extra link. It has no
  // stored kind of its own, so it is classified from its URL and name.
  const linkIcons = topLinkKinds([
    { url: p.sourceUrl, label: p.sourceName, kind: inferLinkKind(p.sourceUrl, p.sourceName) },
    ...p.links,
  ]);
  // The trust badge: verification when it says something; the publication
  // stage as the fallback when nobody independent has checked yet -
  // reproducing the old single-ladder look over honest two-axis data.
  const v =
    p.verification === "unreviewed" && p.publication
      ? PUBLICATION[p.publication]
      : VERIFICATION[p.verification];
  const res = RESOLUTION[p.resolution];
  const age = ageAtSolve(p);

  // Result dot + status pill + contribution pill. Rendered twice: beside the
  // title on desktop, but on a phone the header column stops ~90px short of
  // the card edge (the vote column reserves its width even below the
  // buttons), which wrapped the pills after two despite visible space - so
  // there they render below the header at the true full card width.
  const badges = (
    <>
      <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs">
        <span
          aria-hidden
          className="inline-block h-2 w-2 rounded-full"
          style={{ backgroundColor: st.color }}
        />
        <span className="text-[var(--ink-secondary)]">{st.label}</span>
      </span>
      {/* A non-default resolution qualifies the headline claim, so it sits
          right beside it as a small pill. "Resolved" renders nothing - the
          default state should add no noise. */}
      {res.pill && (
        <span
          className="inline-flex items-center whitespace-nowrap rounded-full border px-2 py-px text-[11px] font-medium"
          style={{
            color: res.color,
            borderColor: `color-mix(in srgb, ${res.color} 40%, transparent)`,
          }}
        >
          {res.pill}
        </span>
      )}
      {/* Same convention for the AI-contribution axis; unclassified entries
          show nothing. */}
      {p.aiContribution && AI_CONTRIBUTION[p.aiContribution]?.pill && (
        <span
          className="inline-flex items-center whitespace-nowrap rounded-full border px-2 py-px text-[11px] font-medium"
          style={{
            color: AI_CONTRIBUTION[p.aiContribution].color,
            borderColor: `color-mix(in srgb, ${AI_CONTRIBUTION[p.aiContribution].color} 40%, transparent)`,
          }}
        >
          {AI_CONTRIBUTION[p.aiContribution].pill}
        </span>
      )}
    </>
  );

  return (
    // The whole card is clickable: the title link's ::after stretches over the
    // card (so semantics and keyboard focus stay on a real link), and every
    // interactive child sits above the overlay with `relative z-10`.
    // Hover/focus feedback lives in globals.css (.entry-card), gated to real
    // mouse pointers and keyboard focus: on touch devices an emulated :hover
    // or tap-focus repaint is exactly the "card flashes when I press it"
    // report under Chrome's auto-dark mode, and a finger on the card needs no
    // hover affordance anyway.
    <article className="entry-card group relative rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3.5 transition-colors">
      {/* Only the HEADER shares a row with the votes. Everything below runs
          the full width of the card - when the votes sat in a full-height
          flex column they reserved their width all the way down, wrapping
          statements at ~60% width on a phone for no reason. */}
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          {/* Title + result */}
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <h3 className="font-serif text-base leading-snug text-[var(--ink)] sm:text-lg">
              <Link
                href={`/problem/${p.slug}`}
                className="after:absolute after:inset-0 after:content-['']"
              >
                <TeX>{p.name}</TeX>
              </Link>
            </h3>
            {/* Desktop placement: beside the title, as one group. */}
            <span className="hidden flex-wrap items-center gap-x-2.5 gap-y-1 sm:flex">
              {badges}
            </span>
          </div>
        </div>

        {/* Votes, kept out of the flowing text so they line up down the list */}
        <div className="relative z-10 shrink-0 pt-0.5">
          <VoteButtons slug={p.slug} upvotes={p.upvotes} downvotes={p.downvotes} />
        </div>
      </div>

      {/* Everything below the header spans the whole card. */}
      <div className="min-w-0">
        {/* Mobile placement of the badges: full card width, so all three fit
            one line on any normal phone. */}
        <span className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 sm:hidden">
          {badges}
        </span>
        {/* The result qualifier can be a whole sentence, so it lives below
            the header row where it wraps at the FULL card width instead of
            squeezing beside the vote buttons. */}
        {p.resultNote && (
          // Clamped: at the 200-character cap this is five lines on a phone,
          // which on a card buries the identity line under a caveat. The entry
          // page carries it in full.
          <p className="mt-0.5 line-clamp-2 text-xs text-[var(--ink-muted)]">({p.resultNote})</p>
        )}
        {/* Identity line */}
        <p className="mt-1 font-mono text-[11px] text-[var(--ink-muted)]">
          {p.problemNumber !== null && <>Erdős #{p.problemNumber} · </>}
          {p.field ?? DASH}
        </p>

        {/* Statement, rendered to HTML on the server so no KaTeX runs here.
            Beyond the first page it arrives via the lazy statements map. */}
        {statementHtml && (
          <p
            className="math-prose mt-2.5 text-sm leading-relaxed text-[var(--ink-secondary)]"
            dangerouslySetInnerHTML={{ __html: statementHtml }}
          />
        )}

        {/* Facts that every entry has */}
        {/* items-baseline: the ageNote's StarNote is an align-super button,
            which grows its fact's line box upward - without a shared baseline
            the flex default let that whole fact sit visibly lower than its
            neighbours ("Open 11y*" hung below "Posed by" and "Model"). */}
        <div className="mt-2.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-[11px]">
            <Fact label="Posed by">
              {p.posedBy ?? DASH}
              {p.yearPosed !== null && `, ${p.yearPosed}`}
            </Fact>
            <span aria-hidden className="text-[var(--hairline)]">·</span>
            <Fact label="Open">
              {age !== null ? `${age}y` : DASH}
              {p.ageNote && <StarNote text={p.ageNote} />}
            </Fact>
            <span aria-hidden className="text-[var(--hairline)]">·</span>
            <Fact label="Model">
              {p.model}
              {p.modelMaker && ` (${p.modelMaker})`}
            </Fact>
            <span aria-hidden className="text-[var(--hairline)]">·</span>
            <Fact label="Solved">{p.solveDate}</Fact>
          </div>

          {/* Verification + notability + discussion */}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]">
            {/* Reserved width so Significance starts at the same x down the
                list instead of stepping in and out with the badge text.
                Measured rather than guessed: the widest badge in common use is
                "Site-confirmed" at 93px, so 6rem reserves 3px of slack. The
                first attempt used 7.75rem, which aligned correctly but left
                ~30px of dead gap that read as broken padding.

                Applied at every width. An earlier version scoped this to `sm`
                on the theory that the row wraps on a phone; it does not -
                measured at 360px, nothing wraps to a second line, so the only
                thing the breakpoint achieved was leaving every screen under
                640px ragged. */}
            <span
              className="relative z-10 inline-flex items-center gap-1.5 min-w-[6rem]"
              style={{ color: v.color }}
              title={p.verificationNote ?? undefined}
            >
              <StatusIcon kind={v.icon} color={v.color} />
              {v.label}
            </span>

            {/* A documented problem with the claim itself - rare, loud. */}
            {p.claimIssueNote && (
              <span
                className="relative z-10 inline-flex items-center gap-1.5 text-[var(--status-critical)]"
                title={p.claimIssueNote}
              >
                <StatusIcon kind="alert" color="var(--status-critical)" />
                Claim issue
              </span>
            )}

            {/* AI-estimated problem weight; the Wikipedia count moved to the
                entry page as a supporting fact (it was almost always 0 here). */}
            {p.significance !== null && p.significance !== undefined && (
              // inline-flex, not a plain span. Its neighbours in this row -
              // the verification badge and the comment link - are inline-flex
              // boxes because they carry icons, and a plain inline span sits
              // 1.83px lower than they do under `items-center`, which centres
              // boxes rather than text. Measured: matching the box type takes
              // the skew to exactly 0. It is not a font-metric problem;
              // forcing both spans to the same font family changes nothing.
              <span className="relative z-10 inline-flex items-center font-mono text-[var(--ink-muted)]">
                {/* The metric explanation belongs to the label+value only; the
                    star carries the per-entry justification. Nesting the star
                    under the same title showed BOTH bubbles when hovering it. */}
                <span title={SIGNIFICANCE_HELP}>
                  Significance{" "}
                  <span className="text-[var(--ink-secondary)]">{p.significance}</span>
                </span>
                {p.significanceNote && <StarNote text={p.significanceNote} />}
              </span>
            )}

            {/* Straight to the artifact. The question a reader most often has
                about an entry on this page is "is there a paper" or "is there
                a Lean proof", and answering it used to mean opening the entry
                and reading a list of free-text labels. These are the entry's
                own links, typed, so the icon is a promise about what is on the
                other end. z-10 lifts them above the card's click overlay. */}
            {linkIcons.length > 0 && (
              <span className="relative z-10 inline-flex items-center gap-1.5">
                {linkIcons.map(({ spec, link }) => (
                  <a
                    key={spec.value}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`${spec.label}: ${spec.help}`}
                    aria-label={spec.label}
                    className="text-[var(--ink-muted)] transition-colors hover:text-[var(--accent-blue)]"
                  >
                    <Icon name={spec.icon as IconName} size={14} />
                  </a>
                ))}
              </span>
            )}

            {/* Credit where an entry came from a reader - contributors should
                see their name on the front page, not only on the entry page.
                Links to their profile; z-10 lifts it above the card overlay. */}
            {p.submittedBy && (
              // The space is a non-breaking one inside the text, not a `{" "}`
              // between the label and the link. Flexbox drops a whitespace-only
              // text node sitting between two flex items, so the words ran
              // together the moment this span became inline-flex; a trailing
              // ordinary space would be trimmed at the end of its own flex item
              // too. `gap-1` would work but at 4px reads tighter than the
              // natural space in `Fact` label/value pairs on the row above.
              // The Significance span is unaffected only because its space
              // lives inside a nested inline span.
              <span className="relative z-10 inline-flex items-center font-mono text-[var(--ink-muted)]">
                Submitted by&nbsp;
                <Link
                  href={`/user/${encodeURIComponent(p.submittedBy)}`}
                  className="text-[var(--ink-secondary)] hover:text-[var(--accent-blue)] hover:underline"
                >
                  {p.submittedBy}
                </Link>
                {/* Only alongside a submitter, never on its own. `addedAt` is
                    row creation, and the curated baseline was seeded within
                    the same few seconds, so on those entries it records when
                    the database was filled rather than anything about the
                    entry. Beside a pseudonym it means what it looks like. */}
                &nbsp;on&nbsp;{formatAddedDate(p.addedAt)}
              </span>
            )}

          {p.commentCount > 0 && (
            <Link
              href={`/problem/${p.slug}#discussion`}
              className="relative z-10 inline-flex items-center gap-1 font-mono text-[var(--accent-blue)] hover:underline"
            >
              <Icon name="bubble" size={12} />
              {p.commentCount}
              <span className="sr-only">
                {p.commentCount === 1 ? "comment" : "comments"}
              </span>
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export function ProblemCards({
  problems,
  initial = DEFAULT_SETTINGS,
}: {
  problems: CardEntry[];
  /// The view the SERVER already rendered, read from the settings cookie.
  /// Seeding state from it is the whole point of the cookie: the markup and
  /// the first client render agree, so there is no reshuffle to watch.
  initial?: ListSettings;
}) {
  const [query, setQuery] = useState("");
  const [fieldFilter, setFieldFilter] = useState(initial.fieldFilter);
  const [resultFilter, setResultFilter] = useState(initial.resultFilter);
  const [statusFilter, setStatusFilter] = useState(initial.statusFilter);
  const [contributionFilter, setContributionFilter] = useState(initial.contributionFilter);
  const [modelFilter, setModelFilter] = useState(initial.modelFilter);
  const [verificationFilter, setVerificationFilter] = useState(initial.verificationFilter);
  const [publicationFilter, setPublicationFilter] = useState(initial.publicationFilter);
  const [methodFilter, setMethodFilter] = useState(initial.methodFilter);
  const [sortKey, setSortKey] = useState<SortKey>(initial.sortKey);
  const [sortDir, setSortDir] = useState<SortDir>(initial.sortDir);
  const [period, setPeriod] = useState<Period>(initial.period);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(initial.perPage);

  // Field chips: every group that actually occurs, with its count, BIGGEST
  // FIRST. Fixed taxonomy order put one-entry groups ahead of hundred-entry
  // ones, so the chips a reader is most likely to want were the ones they had
  // to hunt for. Ties fall back to taxonomy order to keep the row stable
  // rather than reshuffling on every entry added.
  const groups = useMemo(() => {
    const counts = new Map<FieldGroup, number>();
    for (const p of problems) {
      if (p.fieldGroup) counts.set(p.fieldGroup, (counts.get(p.fieldGroup) ?? 0) + 1);
    }
    return FIELD_GROUPS.filter((g) => counts.has(g))
      .map((g) => ({ group: g, count: counts.get(g)! }))
      .sort((a, b) => b.count - a.count);
  }, [problems]);

  // Same present-values trick for resolution statuses. While every entry is
  // "resolved" (the state of the dataset today) the whole control stays
  // hidden; it appears by itself the day a candidate or retraction lands.
  const resolutions = useMemo(() => {
    const present = new Set(problems.map((p) => p.resolution));
    return RESOLUTION_STATUSES.filter((r) => present.has(r));
  }, [problems]);

  // AI-contribution tiers that occur. Unlike the status control, this one
  // appears as soon as a SINGLE classified entry exists: with most of the
  // catalog unclassified (null), filtering on one tier is not a no-op.
  const contributions = useMemo(() => {
    const present = new Set(problems.map((p) => p.aiContribution).filter(Boolean));
    return AI_CONTRIBUTIONS.filter((c) => present.has(c));
  }, [problems]);

  // Restore the persisted settings once, after hydration - localStorage is
  // client-only, so reading it during the first render would make server and
  // client HTML disagree (the setState-in-effect lint rule is disabled for
  // exactly that reason: this IS the sanctioned use, syncing state in from an
  // external system that only exists on the client). Every value is validated
  // against what the UI can actually offer today, so a stale or tampered
  // entry falls back silently.
  //
  // Before paint, not after. As an ordinary effect the list rendered in the
  // default order and then visibly reshuffled into the remembered one, which
  // on a 400-entry list is the most conspicuous flicker on the site.
  const [restored, setRestored] = useState(false);
  // URL mirroring happens only after an explicit interaction with a control.
  // A "first persist run" heuristic breaks under StrictMode's double effects
  // (the second run wrote remembered settings into a freshly loaded URL);
  // this flag is set in the handlers themselves, so it cannot misfire.
  const touched = useRef(false);
  const touch = () => {
    touched.current = true;
  };
  useBeforePaint(() => {
    // Two sources on top of what the server already used, in order of
    // authority: the cookie the page rendered from, then this browser's
    // localStorage, then the URL. A shared link beats a remembered view; a
    // remembered view beats a cookie that may lag behind another tab.
    //
    // With the cookie in place this usually resolves to exactly the state
    // already rendered, React bails out of the update, and nothing moves.
    let stored: unknown = {};
    try {
      stored = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "null") ?? {};
    } catch {
      // Malformed storage reads as "nothing stored".
    }

    const url = new URLSearchParams(window.location.search);
    const fromUrl: Record<string, unknown> = {};
    const PARAMS: [string, keyof ListSettings][] = [
      ["field", "fieldFilter"],
      ["result", "resultFilter"],
      ["status", "statusFilter"],
      ["contribution", "contributionFilter"],
      ["model", "modelFilter"],
      ["verification", "verificationFilter"],
      ["publication", "publicationFilter"],
      ["method", "methodFilter"],
      ["sort", "sortKey"],
      ["dir", "sortDir"],
      ["period", "period"],
    ];
    for (const [param, key] of PARAMS) {
      const v = url.get(param);
      if (v !== null) fromUrl[key] = v;
    }
    const per = url.get("per");
    if (per !== null) fromUrl.perPage = Number(per);

    const next = normalizeListSettings({
      ...initial,
      ...(typeof stored === "object" && stored !== null ? stored : {}),
      ...fromUrl,
    });

    setFieldFilter(next.fieldFilter);
    setResultFilter(next.resultFilter);
    setStatusFilter(next.statusFilter);
    setContributionFilter(next.contributionFilter);
    setModelFilter(next.modelFilter);
    setVerificationFilter(next.verificationFilter);
    setPublicationFilter(next.publicationFilter);
    setMethodFilter(next.methodFilter);
    setSortKey(next.sortKey);
    setSortDir(next.sortDir);
    setPeriod(next.period);
    setPerPage(next.perPage);

    setRestored(true);
    // Once per mount on purpose so it cannot undo choices made since.
  }, []);

  // Persist on every change - but only after restore has run, otherwise the
  // first render would overwrite the stored settings with the defaults.
  useEffect(() => {
    if (!restored) return;
    const s: ListSettings = {
      fieldFilter,
      resultFilter,
      statusFilter,
      contributionFilter,
      modelFilter,
      verificationFilter,
      publicationFilter,
      methodFilter,
      sortKey,
      sortDir,
      period,
      perPage,
    };
    const json = JSON.stringify(s);
    try {
      localStorage.setItem(SETTINGS_KEY, json);
    } catch {
      // Storage full or blocked - the list still works, it just won't persist.
    }
    // The same thing again where the SERVER can see it. This copy is what
    // lets the next page load render in this order rather than the default
    // one, and it is the only reason a cookie is involved at all. Lax so it
    // rides ordinary navigation without being sent on cross-site requests;
    // no sensitive content, so nothing here needs more than that.
    //
    // Only when it says something. A reader on the defaults gets no cookie at
    // all rather than one asserting the defaults, and going back to them
    // removes it again - so the common visitor keeps a bare request and the
    // server keeps serving them the same default order it always did.
    const isDefault = (Object.keys(DEFAULT_SETTINGS) as (keyof ListSettings)[]).every(
      (k) => s[k] === DEFAULT_SETTINGS[k],
    );
    try {
      document.cookie = isDefault
        ? `${SETTINGS_COOKIE}=; path=/; max-age=0; samesite=lax`
        : `${SETTINGS_COOKIE}=${encodeURIComponent(json)}; path=/; max-age=${SETTINGS_COOKIE_MAX_AGE}; samesite=lax`;
    } catch {
      // Cookies disabled: the list still works, the server just keeps
      // rendering the default order and the client corrects it as before.
    }
    // Mirror non-default settings into the URL so a filtered view is
    // shareable - but only once the VISITOR changes something. Loading or
    // navigating to the page must leave the address bare (and a shared
    // link's params untouched).
    if (!touched.current) return;
    const q = new URLSearchParams();
    if (fieldFilter !== "all") q.set("field", fieldFilter);
    if (resultFilter !== "all") q.set("result", resultFilter);
    if (statusFilter !== "all") q.set("status", statusFilter);
    if (contributionFilter !== "all") q.set("contribution", contributionFilter);
    if (modelFilter !== "all") q.set("model", modelFilter);
    if (verificationFilter !== "all") q.set("verification", verificationFilter);
    if (publicationFilter !== "all") q.set("publication", publicationFilter);
    if (methodFilter !== "all") q.set("method", methodFilter);
    if (sortKey !== "solveDate") q.set("sort", sortKey);
    if (sortDir !== "desc") q.set("dir", sortDir);
    if (period !== "all") q.set("period", period);
    if (perPage !== 25) q.set("per", String(perPage));
    const qs = q.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [restored, fieldFilter, resultFilter, statusFilter, contributionFilter, modelFilter, verificationFilter, publicationFilter, methodFilter, sortKey, sortDir, period, perPage]);

  // Statements beyond the first default-sort page ship without their rendered
  // HTML; one background fetch fills the map after hydration (see CardEntry).
  const [lateStatements, setLateStatements] = useState<Record<string, string> | null>(null);
  useEffect(() => {
    if (!problems.some((p) => p.hasStatement && p.statementHtml === null)) return;
    let alive = true;
    fetch("/api/statements")
      .then((r) => (r.ok ? (r.json() as Promise<Record<string, string>>) : null))
      .then((map) => {
        if (alive && map) setLateStatements(map);
      })
      .catch(() => {
        // First-page statements are inline regardless; deeper cards just
        // render without prose until a retry on next navigation.
      });
    return () => {
      alive = false;
    };
  }, [problems]);

  // Only offer verification statuses that actually occur, in ladder order, so
  // the panel never lists an empty category.
  const verifications = useMemo(() => {
    const present = new Set(problems.map((p) => p.verification));
    return (Object.keys(VERIFICATION) as VerificationStatus[]).filter((v) => present.has(v));
  }, [problems]);

  // The facet groups the Filters panel offers. Same visibility rules the old
  // dropdown row used: status hides while the dataset is uniform,
  // contribution appears with the first classified entry.
  const facets: FilterFacet[] = [
    {
      key: "result",
      label: "Result",
      options: (Object.keys(SOLVE_TYPE) as SolveType[]).map((t) => ({
        value: t,
        label: SOLVE_TYPE[t].label,
      })),
    },
    ...(resolutions.length > 1
      ? [
          {
            key: "status",
            label: "Status",
            options: resolutions.map((r) => ({ value: r, label: RESOLUTION[r].label })),
          },
        ]
      : []),
    ...(contributions.length > 0
      ? [
          {
            key: "contribution",
            label: "AI contribution",
            options: contributions.map((c) => ({
              value: c,
              label: AI_CONTRIBUTION[c].label,
            })),
          },
        ]
      : []),
    {
      // Same family buckets as the stats chart; a multi-system entry matches
      // every family named on it.
      key: "model",
      label: "AI system",
      options: MODEL_FAMILIES.filter((f) =>
        problems.some((p) => f.test.test(p.model)),
      ).map((f) => ({ value: f.key, label: f.label })),
    },
    {
      key: "verification",
      label: "Verification",
      options: verifications.map((v) => ({ value: v, label: VERIFICATION[v].label })),
    },
    {
      key: "publication",
      label: "Publication",
      options: PUBLICATION_STATUSES.filter((v) =>
        problems.some((p) => p.publication === v),
      ).map((v) => ({ value: v, label: PUBLICATION[v].label })),
    },
    ...(problems.some((p) => p.resolutionMethod)
      ? [
          {
            key: "method",
            label: "Method",
            options: RESOLUTION_METHODS.filter((v) =>
              problems.some((p) => p.resolutionMethod === v),
            ).map((v) => ({ value: v, label: RESOLUTION_METHOD[v].label })),
          },
        ]
      : []),
  ];

  const filterValues: Record<string, string> = {
    result: resultFilter,
    status: statusFilter,
    contribution: contributionFilter,
    model: modelFilter,
    verification: verificationFilter,
    publication: publicationFilter,
    method: methodFilter,
  };

  function setFilter(key: string, value: string) {
    touch();
    if (key === "result") setResultFilter(value);
    else if (key === "status") setStatusFilter(value);
    else if (key === "contribution") setContributionFilter(value);
    else if (key === "model") setModelFilter(value);
    else if (key === "verification") setVerificationFilter(value);
    else if (key === "publication") setPublicationFilter(value);
    else if (key === "method") setMethodFilter(value);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    // Rolling cutoff, matching the engagement metrics' windows. Only
    // non-engagement sorts date-filter; score/discussion window their metric
    // in sortValue instead, ranking the WHOLE list by that period's activity.
    const dateFiltering = period !== "all" && !TIME_SENSITIVE.includes(sortKey);
    const cutoff = dateFiltering
      ? new Date(LOADED_AT - PERIOD_DAYS[period as Exclude<Period, "all">] * 86400000)
          .toISOString()
          .slice(0, 10)
      : "";
    return problems.filter((p) => {
      if (dateFiltering) {
        // "Added" scopes by when the entry entered the catalog; every other
        // sort scopes by when the problem was solved. Imprecise solve dates
        // ("2026-07") compare lexically and sit out of week-sized windows,
        // which is the honest reading of a date that vague.
        const stamp = sortKey === "added" ? p.addedAt.slice(0, 10) : p.solveDate;
        if (stamp < cutoff) return false;
      }
      if (fieldFilter !== "all" && p.fieldGroup !== fieldFilter) return false;
      if (resultFilter !== "all" && p.solveType !== resultFilter) return false;
      if (statusFilter !== "all" && p.resolution !== statusFilter) return false;
      if (contributionFilter !== "all" && p.aiContribution !== contributionFilter) return false;
      if (modelFilter !== "all") {
        const fam = MODEL_FAMILIES.find((f) => f.key === modelFilter);
        if (fam && !fam.test.test(p.model)) return false;
      }
      if (verificationFilter !== "all" && p.verification !== verificationFilter) return false;
      if (publicationFilter !== "all" && p.publication !== publicationFilter) return false;
      if (methodFilter !== "all" && p.resolutionMethod !== methodFilter) return false;
      if (!q) return true;
      const haystack = [
        // Both forms: a name carrying math is displayed rendered, so someone
        // searching types what they see ("Lp(L1)"), not the source ("$L_p(L_1)$").
        p.name,
        deTeX(p.name),
        p.field,
        p.fieldGroup,
        p.posedBy,
        p.model,
        p.submittedBy,
        ...p.humanCollaborators,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [problems, query, period, sortKey, fieldFilter, resultFilter, statusFilter, contributionFilter, modelFilter, verificationFilter, publicationFilter, methodFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va = sortValue(a, sortKey, period);
      const vb = sortValue(b, sortKey, period);
      const cmp =
        typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb));
      // Ties on an engagement sort fall back to most recently solved, so an
      // all-zero week does not render in arbitrary order.
      if (cmp === 0 && TIME_SENSITIVE.includes(sortKey)) {
        return b.solveDate.localeCompare(a.solveDate);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir, period]);

  // Reset to the first page whenever the result set, ordering or page size
  // changes. Adjusted during render rather than in an effect (which would cause
  // a cascading render, and which the react-hooks lint rule rejects). Keeping it
  // centralised on a signature also means a new filter cannot forget to do it.
  const signature = [
    query,
    fieldFilter,
    resultFilter,
    statusFilter,
    contributionFilter,
    modelFilter,
    verificationFilter,
    publicationFilter,
    methodFilter,
    perPage,
    sortKey,
    sortDir,
    period,
  ].join("|");
  const [lastSignature, setLastSignature] = useState(signature);
  if (signature !== lastSignature) {
    setLastSignature(signature);
    setPage(1);
  }

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * perPage;
  const paged = sorted.slice(start, start + perPage);

  // Controls sit directly on the page surface, so they use the raised surface
  // to read as controls rather than melting into the paper. Every control in
  // both rows is h-9 so the search box, the filters and the sort controls line
  // up as one system - their differing font sizes used to give them differing
  // heights.
  // Rounding is NOT in the base, so the one select that bonds to a neighbour
  // can square that edge by choosing its own corners. Overriding `rounded`
  // with `rounded-r-none` would work only as long as Tailwind keeps emitting
  // the corner utilities after the shorthand, which is not a guarantee worth
  // depending on for a visible seam.
  const selectBase =
    "h-9 min-w-0 max-w-[45vw] sm:max-w-[12rem] border border-[var(--hairline)] bg-[var(--paper-raised)] px-2 text-xs text-[var(--ink-secondary)] transition-colors hover:border-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]";
  const selectClass = `${selectBase} rounded`;
  const pageBtn =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-2.5 text-sm text-[var(--ink-secondary)] transition-colors hover:border-[var(--ink-muted)] hover:text-[var(--ink)] disabled:pointer-events-none disabled:opacity-40";

  const filtersActive =
    query ||
    fieldFilter !== "all" ||
    resultFilter !== "all" ||
    statusFilter !== "all" ||
    contributionFilter !== "all" ||
    modelFilter !== "all" ||
    verificationFilter !== "all" ||
    publicationFilter !== "all" ||
    methodFilter !== "all";

  // `grow justify-center sm:grow-0`: on a phone the wrapped chip rows
  // stretch to fill the full width instead of leaving a ragged right edge;
  // on wider screens they keep their natural size.
  const chip = (active: boolean) =>
    `inline-flex grow items-center justify-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-xs transition-colors sm:grow-0 ${
      active
        ? "border-[var(--accent-blue)] bg-[color-mix(in_srgb,var(--accent-blue)_10%,transparent)] font-medium text-[var(--accent-blue)]"
        : "border-[var(--hairline)] bg-[var(--paper-raised)] text-[var(--ink-secondary)] hover:border-[var(--ink-muted)] hover:text-[var(--ink)]"
    }`;

  return (
    <div>
      {/* Field taxonomy chips, with counts. One row that wraps; groups with no
          entries never render. */}
      <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
        <button type="button" onClick={() => { touch(); setFieldFilter("all"); }} className={chip(fieldFilter === "all")}>
          All fields
          <span className="font-mono text-[11px] text-[var(--ink-muted)]">{problems.length}</span>
        </button>
        {groups.map(({ group, count }) => (
          <button
            key={group}
            type="button"
            onClick={() => { touch(); setFieldFilter(group); }}
            className={chip(fieldFilter === group)}
          >
            {group}
            <span className="font-mono text-[11px] text-[var(--ink-muted)]">{count}</span>
          </button>
        ))}
      </div>

      {/* Search + filters */}
      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <span className="relative min-w-[220px] flex-1">
          <Icon
            name="search"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--ink-muted)]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, field, model, people…"
            className="h-9 w-full rounded border border-[var(--hairline)] bg-[var(--paper-raised)] pl-8 pr-3 text-sm text-[var(--ink)] transition-colors placeholder:text-[var(--ink-muted)] hover:border-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
          />
        </span>
        <FilterPanel facets={facets} values={filterValues} onChange={setFilter} />
      </div>

      {/* Active facets stay visible as removable chips while the panel is
          closed, on their own row under the search box, with Clear at the
          end. The row only exists while something is filtered. */}
      {filtersActive && (
        <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
          {facets.map((f) => {
            const v = filterValues[f.key];
            if (v === "all") return null;
            const label = f.options.find((o) => o.value === v)?.label ?? v;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key, "all")}
                aria-label={`Remove filter: ${label}`}
                className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-[var(--accent-blue)] bg-[color-mix(in_srgb,var(--accent-blue)_10%,transparent)] px-2.5 py-1 text-xs font-medium text-[var(--accent-blue)]"
              >
                {label}
                <span aria-hidden>×</span>
              </button>
            );
          })}
          {/* A pill, like the chips it sits beside, but deliberately not a
              blue one: the chips are blue because each is an active filter,
              and a blue "Clear all" would read as one more of them rather
              than the thing that removes them. Neutral until hovered, then
              orange, which is the site's colour for an undoing action. */}
          <button
            onClick={() => {
              touch();
              setQuery("");
              setFieldFilter("all");
              setResultFilter("all");
              setStatusFilter("all");
              setContributionFilter("all");
              setModelFilter("all");
              setVerificationFilter("all");
              setPublicationFilter("all");
              setMethodFilter("all");
            }}
            aria-label="Clear all filters"
            className="ml-0.5 inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-[var(--hairline)] bg-[var(--paper-raised)] px-2.5 py-1 text-xs font-medium text-[var(--ink-secondary)] transition-colors hover:border-[var(--accent-orange)] hover:text-[var(--accent-orange)]"
          >
            <Icon name="close" size={11} />
            Clear all
          </button>
        </div>
      )}

      {/* Sort - explicit, because cards have no column headers to click.

          Each label plus its control is ONE flex item, so a wrap can never
          land between them. The flat row this replaced put six siblings in a
          wrapping flex, which on a phone broke after "Period" and left that
          label stranded at the end of the line above its own dropdown. */}
      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[var(--hairline)] pt-2.5">
        {/* Sort key and direction are one decision, so they are one bonded
            control: the select and the toggle share an edge (-ml-px collapses
            the doubled border) and read as a unit rather than as two
            unrelated dropdowns. */}
        <div className="inline-flex shrink-0 items-center gap-2">
          <label htmlFor="sort" className="shrink-0 text-xs text-[var(--ink-muted)]">
            Sort by
          </label>
          <span className="inline-flex">
            <select
              id="sort"
              value={sortKey}
              onChange={(e) => {
                touch();
                const key = e.target.value as SortKey;
                setSortKey(key);
                setSortDir(NUMERIC_KEYS.includes(key) ? "desc" : "asc");
              }}
              className={`${selectBase} rounded-l focus:relative focus:z-10`}
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => { touch(); setSortDir((d) => (d === "asc" ? "desc" : "asc")); }}
              // Announces the state AND what pressing does; "Sort ascending"
              // alone was ambiguous about which of the two it meant.
              aria-label={`Sorted ${sortDir === "asc" ? "ascending" : "descending"}. Switch to ${
                sortDir === "asc" ? "descending" : "ascending"
              }.`}
              title={sortDir === "asc" ? "Ascending" : "Descending"}
              className="-ml-px inline-flex h-9 min-w-9 shrink-0 items-center justify-center gap-1.5 rounded-r border border-[var(--hairline)] bg-[var(--paper-raised)] px-2 text-xs text-[var(--ink-secondary)] transition-colors hover:border-[var(--ink-muted)] hover:text-[var(--ink)] focus:relative focus:z-10 focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
            >
              <Icon name="arrowDown" className={sortDir === "asc" ? "rotate-180" : ""} />
              {/* The word is the icon's gloss, not its replacement: it costs
                  ~90px, which a phone cannot spare and a desktop never
                  notices. The title and aria-label carry it on mobile. */}
              <span className="hidden text-[var(--ink-muted)] sm:inline">
                {sortDir === "asc" ? "Ascending" : "Descending"}
              </span>
            </button>
          </span>
          {/* Belongs to the SORT control, not to Period: it explains what the
              significance scale means. It used to render after the period
              dropdown, where it looked like Period's footnote. */}
          {sortKey === "significance" && (
            <InfoTip content={SIGNIFICANCE_HELP} label="Significance" />
          )}
        </div>

        {/* Period applies to every sort: it windows the metric on the
            engagement sorts and date-filters the list on the rest (see
            TIME_SENSITIVE). All time is the default.

            A select rather than a segmented control: five rolling windows in
            pills would wrap onto its own row on phones, and the dropdown
            leaves room to add windows later without spending width. */}
        <div className="inline-flex shrink-0 items-center gap-2">
          <label htmlFor="period" className="shrink-0 text-xs text-[var(--ink-muted)]">
            Period
          </label>
          <select
            id="period"
            value={period}
            onChange={(e) => { touch(); setPeriod(e.target.value as Period); }}
            className={selectClass}
          >
            {PERIODS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* The live result count: reads "all N entries" untouched, and
            "showing X of N entries" the moment a filter or search bites.

            Full width on phones so it takes its own line instead of competing
            with the controls. Left to wrap on its own rather than forced to a
            full-width line: on a phone it fits beside Period, and forcing the
            break would spend a whole row to say one short sentence. */}
        <span className="ml-auto text-xs text-[var(--ink-muted)]">
          {sorted.length === problems.length ? (
            <>all {problems.length} entries</>
          ) : (
            <>
              showing{" "}
              <span className="font-medium text-[var(--ink-secondary)]">{sorted.length}</span> of{" "}
              {problems.length} entries
            </>
          )}
        </span>
      </div>

      {/* Cards */}
      {paged.length === 0 ? (
        <p className="rounded-md border border-[var(--hairline)] px-4 py-8 text-center text-sm text-[var(--ink-muted)]">
          No entries match those filters.
        </p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {paged.map((p) => (
            <ProblemCard
              key={p.slug}
              p={p}
              statementHtml={p.statementHtml ?? lateStatements?.[p.slug] ?? null}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          onClick={() => setPage(current - 1)}
          disabled={current <= 1}
          aria-label="Previous page"
          className={pageBtn}
        >
          <Chevron dir="left" />
        </button>
        {pageWindow(current, totalPages).map((p, i) =>
          p === "gap" ? (
            <span key={`gap-${i}`} className="px-1 text-sm text-[var(--ink-muted)]">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => setPage(p)}
              aria-current={p === current ? "page" : undefined}
              className={`${pageBtn} ${
                p === current
                  ? "border-[var(--accent-blue)] font-medium text-[var(--accent-blue)] hover:border-[var(--accent-blue)] hover:text-[var(--accent-blue)]"
                  : ""
              }`}
            >
              {p}
            </button>
          ),
        )}
        <button
          onClick={() => setPage(current + 1)}
          disabled={current >= totalPages}
          aria-label="Next page"
          className={pageBtn}
        >
          <Chevron dir="right" />
        </button>

        <select
          value={perPage}
          onChange={(e) => { touch(); setPerPage(Number(e.target.value)); }}
          aria-label="Entries per page"
          className={`${selectClass} ml-auto`}
        >
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>
              {n} per page
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
