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
import Link from "next/link";
import {
  ageAtSolve,
  AI_CONTRIBUTIONS,
  FIELD_GROUPS,
  PUBLICATION_STATUSES,
  RESOLUTION_METHODS,
  RESOLUTION_STATUSES,
  type AiContribution,
  type CardEntry,
  type FieldGroup,
  type Period,
  type PublicationStatus,
  type ResolutionMethod,
  type ResolutionStatus,
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
import { Icon } from "@/components/Icons";
import { StatusIcon } from "@/components/StatusIcon";
import { InfoTip, StarNote } from "@/components/Tooltip";
import { VoteButtons } from "@/components/VoteButtons";
import { TeX, deTeX } from "@/components/TeX";

// Only genuinely ordinal keys (plus alphabetical Name) belong here. Result,
// field and model are CATEGORIES - they live in the filters, where "sorting"
// by them was really just grouping. Labels name the key, never a direction:
// the direction toggle is its own control, so "Top voted" would lie when
// flipped ascending.
type SortKey =
  | "solveDate"
  | "added"
  | "score"
  | "discussion"
  | "name"
  | "age"
  | "significance"
  | "cost";
type SortDir = "asc" | "desc";

// Alphabetical by label, so a reader scanning the dropdown can find an option
// by name instead of learning an arbitrary order. "solveDate" stays the
// default sort regardless of where it lands in this list.
const SORTS: { key: SortKey; label: string }[] = [
  { key: "discussion", label: "Comments" },
  { key: "added", label: "Date added" },
  { key: "solveDate", label: "Date solved" },
  { key: "cost", label: "Disclosed cost" },
  { key: "name", label: "Name" },
  { key: "significance", label: "Significance" },
  { key: "score", label: "Votes" },
  { key: "age", label: "Years open" },
];

// The period means two things, by sort. On the engagement sorts it windows
// the METRIC (votes/comments gained that period, across all entries); on
// every other sort it FILTERS the list to entries from that period (by date
// added for the Added sort, by solve date otherwise).
const TIME_SENSITIVE: SortKey[] = ["score", "discussion"];

// Labels name the window explicitly ("Last 7 days", not "Week") because these
// are rolling windows measured back from now, and "Week" invites reading it as
// the calendar week.
const PERIODS: { key: Period; label: string }[] = [
  { key: "day", label: "Last 24 hours" },
  { key: "3day", label: "Last 3 days" },
  { key: "week", label: "Last 7 days" },
  { key: "month", label: "Last 30 days" },
  { key: "all", label: "All time" },
];

/// Days back for each window; `all` has no cutoff.
const PERIOD_DAYS: Record<Exclude<Period, "all">, number> = {
  day: 1,
  "3day": 3,
  week: 7,
  month: 30,
};

// The clock for period cutoffs, fixed at module load: render purity wants a
// stable now, and a cutoff drifting by the age of the tab is nothing against
// 7/30-day windows.
const LOADED_AT = Date.now();

// These default to descending on first pick (highest / most recent first, so
// entries with no value - stored as -1 - sink instead of leading). "added" is
// an ISO string, but "most recent first" is equally the right default.
const NUMERIC_KEYS: SortKey[] = ["solveDate", "added", "age", "significance", "score", "discussion", "cost"];

const PAGE_SIZES = [10, 25, 50, 100];

/// The list settings that survive a reload (kept in localStorage). The search
/// text and page number deliberately do not: a leftover query silently hides
/// entries, and a stored page can be out of range once filters differ.
const SETTINGS_KEY = "vibemathed:list-settings";

interface StoredSettings {
  fieldFilter: string;
  resultFilter: string;
  statusFilter: string;
  contributionFilter: string;
  modelFilter: string;
  verificationFilter: string;
  publicationFilter: string;
  methodFilter: string;
  sortKey: SortKey;
  sortDir: SortDir;
  period: Period;
  perPage: number;
}

function sortValue(p: CardEntry, key: SortKey, period: Period): string | number {
  switch (key) {
    case "solveDate":
      return p.solveDate;
    case "added":
      // ISO timestamps sort correctly as strings.
      return p.addedAt;
    case "score":
      // "Top voted" ranks on NET score, not raw upvotes - otherwise a
      // 50-up/49-down brawl outranks a clean 20-up/0-down entry.
      return period === "day"
        ? p.score24h
        : period === "3day"
          ? p.score3d
          : period === "week"
            ? p.score7d
            : period === "month"
              ? p.score30d
              : p.score;
    case "discussion":
      return period === "day"
        ? p.comments24h
        : period === "3day"
          ? p.comments3d
          : period === "week"
            ? p.comments7d
            : period === "month"
              ? p.comments30d
              : p.commentCount;
    case "name":
      return p.name.toLowerCase();
    case "age":
      return ageAtSolve(p) ?? -1;
    case "significance":
      // Unassessed entries sink rather than lead.
      return p.significance ?? -1;
    case "cost":
      // Almost nothing has a disclosed cost, so undisclosed sinks; the
      // handful that published a figure rise to the top.
      return p.solveCostUsd ?? -1;
  }
}

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

function ProblemCard({ p, statementHtml }: { p: CardEntry; statementHtml: string | null }) {
  const st = SOLVE_TYPE[p.solveType];
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
          <VoteButtons slug={p.slug} upvotes={p.upvotes} downvotes={p.downvotes} stacked />
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
        <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px]">
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

            {/* Credit where an entry came from a reader - contributors should
                see their name on the front page, not only on the entry page.
                Links to their profile; z-10 lifts it above the card overlay. */}
            {p.submittedBy && (
              <span className="relative z-10 inline-flex items-center font-mono text-[var(--ink-muted)]">
                Submitted by{" "}
                <Link
                  href={`/user/${encodeURIComponent(p.submittedBy)}`}
                  className="text-[var(--ink-secondary)] hover:text-[var(--accent-blue)] hover:underline"
                >
                  {p.submittedBy}
                </Link>
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

export function ProblemCards({ problems }: { problems: CardEntry[] }) {
  const [query, setQuery] = useState("");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [contributionFilter, setContributionFilter] = useState("all");
  const [modelFilter, setModelFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [publicationFilter, setPublicationFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("solveDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [period, setPeriod] = useState<Period>("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

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
  /* eslint-disable react-hooks/set-state-in-effect */
  const [restored, setRestored] = useState(false);
  // URL mirroring happens only after an explicit interaction with a control.
  // A "first persist run" heuristic breaks under StrictMode's double effects
  // (the second run wrote remembered settings into a freshly loaded URL);
  // this flag is set in the handlers themselves, so it cannot misfire.
  const touched = useRef(false);
  const touch = () => {
    touched.current = true;
  };
  useEffect(() => {
    // Two sources, URL first: a shared link's query params beat this
    // browser's remembered settings, key by key. Every value is validated
    // against what the UI can actually offer today, so a stale or tampered
    // entry falls back silently.
    let s: Partial<StoredSettings> = {};
    try {
      s =
        (JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "null") as
          | Partial<StoredSettings>
          | null) ?? {};
    } catch {
      // Malformed storage reads as "nothing stored".
    }
    const url = new URLSearchParams(window.location.search);
    const pick = (param: string, storedValue: string | undefined) =>
      url.get(param) ?? storedValue;

    const field = pick("field", s.fieldFilter);
    if (field === "all" || FIELD_GROUPS.includes(field as FieldGroup)) {
      setFieldFilter(field as string);
    }
    const result = pick("result", s.resultFilter);
    if (result === "all" || (result ?? "") in SOLVE_TYPE) {
      setResultFilter(result as string);
    }
    const status = pick("status", s.statusFilter);
    if (status === "all" || RESOLUTION_STATUSES.includes(status as ResolutionStatus)) {
      setStatusFilter(status as string);
    }
    const contribution = pick("contribution", s.contributionFilter);
    if (
      contribution === "all" ||
      AI_CONTRIBUTIONS.includes(contribution as AiContribution)
    ) {
      setContributionFilter(contribution as string);
    }
    const model = pick("model", s.modelFilter);
    if (model === "all" || MODEL_FAMILIES.some((f) => f.key === model)) {
      setModelFilter(model as string);
    }
    const verification = pick("verification", s.verificationFilter);
    if (verification === "all" || (verification ?? "") in VERIFICATION) {
      setVerificationFilter(verification as string);
    }
    const publication = pick("publication", s.publicationFilter);
    if (publication === "all" || PUBLICATION_STATUSES.includes(publication as PublicationStatus)) {
      setPublicationFilter(publication as string);
    }
    const method = pick("method", s.methodFilter);
    if (method === "all" || RESOLUTION_METHODS.includes(method as ResolutionMethod)) {
      setMethodFilter(method as string);
    }
    const sort = pick("sort", s.sortKey);
    if (SORTS.some((x) => x.key === sort)) setSortKey(sort as SortKey);
    const dir = pick("dir", s.sortDir);
    if (dir === "asc" || dir === "desc") setSortDir(dir);
    const period_ = pick("period", s.period);
    if (PERIODS.some((x) => x.key === period_)) setPeriod(period_ as Period);
    const per = url.get("per") ?? (s.perPage !== undefined ? String(s.perPage) : null);
    if (per !== null && PAGE_SIZES.includes(Number(per))) setPerPage(Number(per));

    setRestored(true);
    // Once per mount on purpose so it cannot undo choices made since.
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Persist on every change - but only after restore has run, otherwise the
  // first render would overwrite the stored settings with the defaults.
  useEffect(() => {
    if (!restored) return;
    try {
      const s: StoredSettings = {
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
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    } catch {
      // Storage full or blocked - the list still works, it just won't persist.
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
            className="ml-1 text-xs text-[var(--accent-blue)] hover:underline"
          >
            Clear
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
