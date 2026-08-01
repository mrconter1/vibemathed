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

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ageAtSolve,
  AI_CONTRIBUTIONS,
  FIELD_GROUPS,
  RESOLUTION_STATUSES,
  type AiContribution,
  type FieldGroup,
  type Period,
  type ProblemCardData,
  type ResolutionStatus,
  type SolveType,
  type VerificationStatus,
} from "@/lib/problems";
import {
  AI_CONTRIBUTION,
  DASH,
  NOTABILITY_HELP,
  RESOLUTION,
  SOLVE_TYPE,
  VERIFICATION,
} from "@/lib/display";
import { Icon } from "@/components/Icons";
import { StatusIcon } from "@/components/StatusIcon";
import { InfoTip, StarNote } from "@/components/Tooltip";
import { VoteButtons } from "@/components/VoteButtons";

type SortKey =
  | "solveDate"
  | "added"
  | "score"
  | "discussion"
  | "name"
  | "field"
  | "solveType"
  | "posedBy"
  | "model"
  | "age"
  | "renown";
type SortDir = "asc" | "desc";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "solveDate", label: "Date solved" },
  { key: "added", label: "Date added" },
  { key: "score", label: "Top voted" },
  { key: "discussion", label: "Most discussed" },
  { key: "name", label: "Name" },
  { key: "field", label: "Type" },
  { key: "solveType", label: "Result" },
  { key: "posedBy", label: "Posed by" },
  { key: "model", label: "Model" },
  { key: "age", label: "Years open" },
  { key: "renown", label: "Notability" },
];

// Sorts that can be scoped to a time window. Everything else ignores the period.
const TIME_SENSITIVE: SortKey[] = ["score", "discussion"];

const PERIODS: { key: Period; label: string }[] = [
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "all", label: "All time" },
];

// These default to descending on first pick (highest / most recent first, so
// entries with no value - stored as -1 - sink instead of leading). "added" is
// an ISO string, but "most recent first" is equally the right default.
const NUMERIC_KEYS: SortKey[] = ["solveDate", "added", "age", "renown", "score", "discussion"];

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
  verificationFilter: string;
  sortKey: SortKey;
  sortDir: SortDir;
  period: Period;
  perPage: number;
}

function sortValue(p: ProblemCardData, key: SortKey, period: Period): string | number {
  switch (key) {
    case "solveDate":
      return p.solveDate;
    case "added":
      // ISO timestamps sort correctly as strings.
      return p.addedAt;
    case "score":
      // "Top voted" ranks on NET score, not raw upvotes - otherwise a
      // 50-up/49-down brawl outranks a clean 20-up/0-down entry.
      return period === "week" ? p.score7d : period === "month" ? p.score30d : p.score;
    case "discussion":
      return period === "week"
        ? p.comments7d
        : period === "month"
          ? p.comments30d
          : p.commentCount;
    case "name":
      return p.name.toLowerCase();
    case "field":
      return (p.field ?? "").toLowerCase();
    case "solveType":
      return p.solveType;
    case "posedBy":
      return (p.posedBy ?? "").toLowerCase();
    case "model":
      return p.model.toLowerCase();
    case "age":
      return ageAtSolve(p) ?? -1;
    case "renown":
      return p.renownLangs;
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

function ProblemCard({ p }: { p: ProblemCardData }) {
  const st = SOLVE_TYPE[p.solveType];
  const v = VERIFICATION[p.verification];
  const res = RESOLUTION[p.resolution];
  const age = ageAtSolve(p);

  return (
    // The whole card is clickable: the title link's ::after stretches over the
    // card (so semantics and keyboard focus stay on a real link), and every
    // interactive child sits above the overlay with `relative z-10`.
    <article className="group relative rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3.5 transition-colors hover:border-[var(--ink-muted)] hover:bg-[color-mix(in_srgb,var(--ink)_3%,var(--paper-raised))] focus-within:border-[var(--accent-blue)]">
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
                {p.name}
              </Link>
            </h3>
            {/* Result dot + status pill + contribution pill travel as ONE
                flex item: either they all fit beside the title, or the whole
                group drops below it with the full card width - so the badges
                share a line unless a full row genuinely cannot hold them
                (only then does the group's own flex-wrap split it). Placed
                individually they used to wrap one by one after the title. */}
            <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs">
                <span
                  aria-hidden
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: st.color }}
                />
                <span className="text-[var(--ink-secondary)]">{st.label}</span>
              </span>
              {/* A non-default resolution qualifies the headline claim, so it
                  sits right beside it as a small pill. "Resolved" renders
                  nothing - the default state should add no noise. */}
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
              {/* Same convention for the AI-contribution axis; unclassified
                  entries show nothing. */}
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
            </span>
            {/* The note sits OUTSIDE the badge group: it can be a whole
                sentence, which on a phone must wrap rather than drag the page
                wider than the viewport. */}
            {p.resultNote && (
              <span className="text-xs text-[var(--ink-muted)]">({p.resultNote})</span>
            )}
          </div>
        </div>

        {/* Votes, kept out of the flowing text so they line up down the list */}
        <div className="relative z-10 shrink-0 pt-0.5">
          <VoteButtons slug={p.slug} upvotes={p.upvotes} downvotes={p.downvotes} />
        </div>
      </div>

      {/* Everything below the header spans the whole card. */}
      <div className="min-w-0">
        {/* Identity line */}
        <p className="mt-1 font-mono text-[11px] text-[var(--ink-muted)]">
          {p.problemNumber !== null && <>Erdős #{p.problemNumber} · </>}
          {p.field ?? DASH}
        </p>

        {/* Statement - present on roughly one entry in five. Math was
            rendered to HTML on the server, so no KaTeX runs here. */}
        {p.statementHtml && (
          <p
            className="math-prose mt-2.5 text-sm leading-relaxed text-[var(--ink-secondary)]"
            dangerouslySetInnerHTML={{ __html: p.statementHtml }}
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
            <span
              className="relative z-10 inline-flex items-center gap-1.5"
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

            <span
              className="relative z-10 font-mono text-[var(--ink-muted)]"
              title={p.renownLangs > 0 ? NOTABILITY_HELP : "No dedicated Wikipedia article"}
            >
              Notability{" "}
              <span className={p.renownLangs > 0 ? "text-[var(--ink-secondary)]" : ""}>
                {p.renownLangs}
              </span>
              {p.renownNote && <StarNote text={p.renownNote} />}
            </span>

            {/* Credit where an entry came from a reader - contributors should
                see their name on the front page, not only on the entry page. */}
            {p.submittedBy && (
              <span className="font-mono text-[var(--ink-muted)]">
                Submitted by{" "}
                <span className="text-[var(--ink-secondary)]">{p.submittedBy}</span>
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

export function ProblemCards({ problems }: { problems: ProblemCardData[] }) {
  const [query, setQuery] = useState("");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [contributionFilter, setContributionFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("solveDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [period, setPeriod] = useState<Period>("all");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const timeSensitive = TIME_SENSITIVE.includes(sortKey);

  // Field chips: every group that actually occurs, with its count, in fixed
  // taxonomy order. Entries without a group (possible on community rows) are
  // only reachable via "All fields".
  const groups = useMemo(() => {
    const counts = new Map<FieldGroup, number>();
    for (const p of problems) {
      if (p.fieldGroup) counts.set(p.fieldGroup, (counts.get(p.fieldGroup) ?? 0) + 1);
    }
    return FIELD_GROUPS.filter((g) => counts.has(g)).map((g) => ({
      group: g,
      count: counts.get(g)!,
    }));
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
  useEffect(() => {
    try {
      const s = JSON.parse(
        localStorage.getItem(SETTINGS_KEY) ?? "null",
      ) as Partial<StoredSettings> | null;
      if (s) {
        if (
          s.fieldFilter === "all" ||
          FIELD_GROUPS.includes(s.fieldFilter as FieldGroup)
        ) {
          setFieldFilter(s.fieldFilter as string);
        }
        if (s.resultFilter === "all" || (s.resultFilter ?? "") in SOLVE_TYPE) {
          setResultFilter(s.resultFilter as string);
        }
        if (
          s.statusFilter === "all" ||
          RESOLUTION_STATUSES.includes(s.statusFilter as ResolutionStatus)
        ) {
          setStatusFilter(s.statusFilter as string);
        }
        if (
          s.contributionFilter === "all" ||
          AI_CONTRIBUTIONS.includes(s.contributionFilter as AiContribution)
        ) {
          setContributionFilter(s.contributionFilter as string);
        }
        if (
          s.verificationFilter === "all" ||
          (s.verificationFilter ?? "") in VERIFICATION
        ) {
          setVerificationFilter(s.verificationFilter as string);
        }
        if (SORTS.some((x) => x.key === s.sortKey)) setSortKey(s.sortKey as SortKey);
        if (s.sortDir === "asc" || s.sortDir === "desc") setSortDir(s.sortDir);
        if (PERIODS.some((x) => x.key === s.period)) setPeriod(s.period as Period);
        if (typeof s.perPage === "number" && PAGE_SIZES.includes(s.perPage)) {
          setPerPage(s.perPage);
        }
      }
    } catch {
      // Malformed storage reads as "nothing stored".
    }
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
        verificationFilter,
        sortKey,
        sortDir,
        period,
        perPage,
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
    } catch {
      // Storage full or blocked - the list still works, it just won't persist.
    }
  }, [restored, fieldFilter, resultFilter, statusFilter, contributionFilter, verificationFilter, sortKey, sortDir, period, perPage]);

  // Only offer verification statuses that actually occur, in ladder order, so
  // the dropdown never lists an empty category.
  const verifications = useMemo(() => {
    const present = new Set(problems.map((p) => p.verification));
    return (Object.keys(VERIFICATION) as VerificationStatus[]).filter((v) => present.has(v));
  }, [problems]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return problems.filter((p) => {
      if (fieldFilter !== "all" && p.fieldGroup !== fieldFilter) return false;
      if (resultFilter !== "all" && p.solveType !== resultFilter) return false;
      if (statusFilter !== "all" && p.resolution !== statusFilter) return false;
      if (contributionFilter !== "all" && p.aiContribution !== contributionFilter) return false;
      if (verificationFilter !== "all" && p.verification !== verificationFilter) return false;
      if (!q) return true;
      const haystack = [
        p.name,
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
  }, [problems, query, fieldFilter, resultFilter, statusFilter, contributionFilter, verificationFilter]);

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
    verificationFilter,
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
  const selectClass =
    "h-9 min-w-0 max-w-[45vw] sm:max-w-[12rem] rounded border border-[var(--hairline)] bg-[var(--paper-raised)] px-2 text-xs text-[var(--ink-secondary)] transition-colors hover:border-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]";
  const pageBtn =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-2.5 text-sm text-[var(--ink-secondary)] transition-colors hover:border-[var(--ink-muted)] hover:text-[var(--ink)] disabled:pointer-events-none disabled:opacity-40";

  const filtersActive =
    query ||
    fieldFilter !== "all" ||
    resultFilter !== "all" ||
    statusFilter !== "all" ||
    contributionFilter !== "all" ||
    verificationFilter !== "all";

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
        <button type="button" onClick={() => setFieldFilter("all")} className={chip(fieldFilter === "all")}>
          All fields
          <span className="font-mono text-[11px] text-[var(--ink-muted)]">{problems.length}</span>
        </button>
        {groups.map(({ group, count }) => (
          <button
            key={group}
            type="button"
            onClick={() => setFieldFilter(group)}
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
        <select
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value)}
          aria-label="Filter by result"
          className={selectClass}
        >
          <option value="all">All results</option>
          {(Object.keys(SOLVE_TYPE) as SolveType[]).map((t) => (
            <option key={t} value={t}>
              {SOLVE_TYPE[t].label}
            </option>
          ))}
        </select>
        {/* Hidden while the whole dataset shares one status - appears by
            itself once a candidate, partial or retracted entry exists. */}
        {resolutions.length > 1 && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            className={selectClass}
          >
            <option value="all">All statuses</option>
            {resolutions.map((r) => (
              <option key={r} value={r}>
                {RESOLUTION[r].label}
              </option>
            ))}
          </select>
        )}
        {/* Appears once a single classified entry exists - see `contributions`. */}
        {contributions.length > 0 && (
          <select
            value={contributionFilter}
            onChange={(e) => setContributionFilter(e.target.value)}
            aria-label="Filter by AI contribution"
            className={selectClass}
          >
            <option value="all">All AI contribution</option>
            {contributions.map((c) => (
              <option key={c} value={c}>
                {AI_CONTRIBUTION[c].label}
              </option>
            ))}
          </select>
        )}
        <select
          value={verificationFilter}
          onChange={(e) => setVerificationFilter(e.target.value)}
          aria-label="Filter by verification"
          className={selectClass}
        >
          <option value="all">All verification</option>
          {verifications.map((v) => (
            <option key={v} value={v}>
              {VERIFICATION[v].label}
            </option>
          ))}
        </select>
        {filtersActive && (
          <button
            onClick={() => {
              setQuery("");
              setFieldFilter("all");
              setResultFilter("all");
              setStatusFilter("all");
              setContributionFilter("all");
              setVerificationFilter("all");
            }}
            className="text-xs text-[var(--accent-blue)] hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      {/* Sort - explicit, because cards have no column headers to click */}
      <div className="mb-3 flex flex-wrap items-center gap-2 border-t border-[var(--hairline)] pt-2.5">
        <label htmlFor="sort" className="text-xs text-[var(--ink-muted)]">
          Sort by
        </label>
        <select
          id="sort"
          value={sortKey}
          onChange={(e) => {
            const key = e.target.value as SortKey;
            setSortKey(key);
            setSortDir(NUMERIC_KEYS.includes(key) ? "desc" : "asc");
          }}
          className={selectClass}
        >
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
          aria-label={sortDir === "asc" ? "Sort ascending" : "Sort descending"}
          className="inline-flex h-9 items-center gap-1 rounded border border-[var(--hairline)] bg-[var(--paper-raised)] px-2.5 text-xs text-[var(--ink-secondary)] transition-colors hover:border-[var(--ink-muted)] hover:text-[var(--ink)]"
        >
          {sortDir === "asc" ? "▲" : "▼"}
          <span className="text-[var(--ink-muted)]">
            {sortDir === "asc" ? "Ascending" : "Descending"}
          </span>
        </button>

        {/* Period only appears for sorts it can actually change - putting six
            sort/period permutations in the dropdown would bloat it to 15. */}
        {timeSensitive && (
          <div
            role="group"
            aria-label="Time period"
            className="inline-flex h-9 overflow-hidden rounded border border-[var(--hairline)] bg-[var(--paper-raised)]"
          >
            {PERIODS.map((p, i) => (
              <button
                key={p.key}
                type="button"
                onClick={() => setPeriod(p.key)}
                aria-pressed={period === p.key}
                className={`px-2.5 text-xs transition-colors ${
                  i > 0 ? "border-l border-[var(--hairline)]" : ""
                } ${
                  period === p.key
                    ? "bg-[color-mix(in_srgb,var(--accent-blue)_12%,transparent)] font-medium text-[var(--accent-blue)]"
                    : "text-[var(--ink-secondary)] hover:text-[var(--ink)]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        )}

        {sortKey === "renown" && <InfoTip content={NOTABILITY_HELP} label="Notability" />}

        <span className="ml-auto text-xs text-[var(--ink-muted)]">
          {sorted.length} of {problems.length}
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
            <ProblemCard key={p.slug} p={p} />
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
          onChange={(e) => setPerPage(Number(e.target.value))}
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
