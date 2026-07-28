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

import { useMemo, useState } from "react";
import Link from "next/link";
import { ageAtSolve, type ProblemCardData, type SolveType, type VerificationStatus } from "@/lib/problems";
import { DASH, NOTABILITY_HELP, SOLVE_TYPE, VERIFICATION } from "@/lib/display";
import { StatusIcon } from "@/components/StatusIcon";
import { InfoTip, StarNote } from "@/components/Tooltip";
import { VoteButtons } from "@/components/VoteButtons";

type SortKey =
  | "solveDate"
  | "score"
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
  { key: "score", label: "Votes" },
  { key: "name", label: "Name" },
  { key: "field", label: "Type" },
  { key: "solveType", label: "Result" },
  { key: "posedBy", label: "Posed by" },
  { key: "model", label: "Model" },
  { key: "age", label: "Years open" },
  { key: "renown", label: "Notability" },
];

// These default to descending on first pick (highest / most recent first, so
// entries with no value - stored as -1 - sink instead of leading).
const NUMERIC_KEYS: SortKey[] = ["solveDate", "age", "renown", "score"];

const PAGE_SIZES = [10, 25, 50, 100];

function sortValue(p: ProblemCardData, key: SortKey): string | number {
  switch (key) {
    case "solveDate":
      return p.solveDate;
    case "score":
      return p.score;
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

/// One dot-separated fact in the card's fact line.
function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="whitespace-nowrap">
      <span className="text-[var(--ink-muted)]">{label} </span>
      <span className="text-[var(--ink-secondary)]">{children}</span>
    </span>
  );
}

function ProblemCard({ p }: { p: ProblemCardData }) {
  const st = SOLVE_TYPE[p.solveType];
  const v = VERIFICATION[p.verification];
  const age = ageAtSolve(p);

  return (
    <article className="rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] px-4 py-3.5 transition-colors hover:border-[var(--ink-muted)]">
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          {/* Title + result */}
          <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <h3 className="font-serif text-base leading-snug text-[var(--ink)] sm:text-lg">
              <Link href={`/problem/${p.slug}`} className="hover:underline">
                {p.name}
              </Link>
            </h3>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-xs">
              <span
                aria-hidden
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: st.color }}
              />
              <span className="text-[var(--ink-secondary)]">{st.label}</span>
              {p.resultNote && (
                <span className="text-[var(--ink-muted)]">({p.resultNote})</span>
              )}
            </span>
          </div>

          {/* Identity line */}
          <p className="mt-1 font-mono text-[11px] text-[var(--ink-muted)]">
            {p.problemNumber !== null && <>Erdős #{p.problemNumber} · </>}
            {p.field ?? DASH}
          </p>

          {/* Statement - present on roughly one entry in five. Math was
              rendered to HTML on the server, so no KaTeX runs here. */}
          {p.statementHtml && (
            <p
              className="mt-2.5 text-sm leading-relaxed text-[var(--ink-secondary)]"
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
              className="inline-flex items-center gap-1.5"
              style={{ color: v.color }}
              title={p.verificationNote ?? undefined}
            >
              <StatusIcon kind={v.icon} color={v.color} />
              {v.label}
            </span>

            <span
              className="font-mono text-[var(--ink-muted)]"
              title={p.renownLangs > 0 ? NOTABILITY_HELP : "No dedicated Wikipedia article"}
            >
              Notability{" "}
              <span className={p.renownLangs > 0 ? "text-[var(--ink-secondary)]" : ""}>
                {p.renownLangs}
              </span>
              {p.renownNote && <StarNote text={p.renownNote} />}
            </span>

            {p.commentCount > 0 && (
              <Link
                href={`/problem/${p.slug}#discussion`}
                className="font-mono text-[var(--accent-blue)] hover:underline"
              >
                {p.commentCount} {p.commentCount === 1 ? "comment" : "comments"}
              </Link>
            )}
          </div>
        </div>

        {/* Votes, kept out of the flowing text so they line up down the list */}
        <div className="shrink-0 pt-0.5">
          <VoteButtons slug={p.slug} upvotes={p.upvotes} downvotes={p.downvotes} />
        </div>
      </div>
    </article>
  );
}

export function ProblemCards({ problems }: { problems: ProblemCardData[] }) {
  const [query, setQuery] = useState("");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("solveDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const fields = useMemo(
    () =>
      Array.from(
        new Set(problems.map((p) => p.field).filter((f): f is string => f !== null)),
      ).sort(),
    [problems],
  );

  // Only offer verification statuses that actually occur, in ladder order, so
  // the dropdown never lists an empty category.
  const verifications = useMemo(() => {
    const present = new Set(problems.map((p) => p.verification));
    return (Object.keys(VERIFICATION) as VerificationStatus[]).filter((v) => present.has(v));
  }, [problems]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return problems.filter((p) => {
      if (fieldFilter !== "all" && p.field !== fieldFilter) return false;
      if (resultFilter !== "all" && p.solveType !== resultFilter) return false;
      if (verificationFilter !== "all" && p.verification !== verificationFilter) return false;
      if (!q) return true;
      const haystack = [p.name, p.field, p.posedBy, p.model, ...p.humanCollaborators]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [problems, query, fieldFilter, resultFilter, verificationFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const va = sortValue(a, sortKey);
      const vb = sortValue(b, sortKey);
      const cmp =
        typeof va === "number" && typeof vb === "number"
          ? va - vb
          : String(va).localeCompare(String(vb));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  // Reset to the first page whenever the result set, ordering or page size
  // changes. Adjusted during render rather than in an effect (which would cause
  // a cascading render, and which the react-hooks lint rule rejects). Keeping it
  // centralised on a signature also means a new filter cannot forget to do it.
  const signature = [
    query,
    fieldFilter,
    resultFilter,
    verificationFilter,
    perPage,
    sortKey,
    sortDir,
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

  const selectClass =
    "min-w-0 max-w-[45vw] sm:max-w-[12rem] rounded border border-[var(--hairline)] bg-[var(--paper)] px-2 py-1.5 text-xs text-[var(--ink-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]";
  const pageBtn =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-[var(--hairline)] px-2.5 text-sm text-[var(--ink-secondary)] transition-colors hover:bg-[var(--paper-raised)] disabled:pointer-events-none disabled:opacity-40";

  const filtersActive =
    query || fieldFilter !== "all" || resultFilter !== "all" || verificationFilter !== "all";

  return (
    <div>
      {/* Search + filters */}
      <div className="mb-2.5 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, field, model, people…"
          className="min-w-[220px] flex-1 rounded border border-[var(--hairline)] bg-[var(--paper)] px-3 py-1.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
        />
        <select
          value={fieldFilter}
          onChange={(e) => setFieldFilter(e.target.value)}
          aria-label="Filter by type"
          className={selectClass}
        >
          <option value="all">All types</option>
          {fields.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
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
          className="inline-flex items-center gap-1 rounded border border-[var(--hairline)] px-2 py-1.5 text-xs text-[var(--ink-secondary)] transition-colors hover:bg-[var(--paper-raised)]"
        >
          {sortDir === "asc" ? "▲" : "▼"}
          <span className="text-[var(--ink-muted)]">
            {sortDir === "asc" ? "Ascending" : "Descending"}
          </span>
        </button>

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
              className={pageBtn}
              style={
                p === current
                  ? {
                      borderColor: "var(--accent-blue)",
                      color: "var(--accent-blue)",
                      backgroundColor: "var(--paper-raised)",
                    }
                  : undefined
              }
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
