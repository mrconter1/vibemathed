"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ageAtSolve, type MathProblem, type SolveType, type VerificationStatus } from "@/lib/problems";

const SOLVE_TYPE: Record<SolveType, { label: string; color: string }> = {
  proved: { label: "Proved", color: "var(--accent-blue)" },
  disproved: { label: "Disproved", color: "var(--accent-orange)" },
};

const VERIFICATION: Record<
  VerificationStatus,
  { label: string; color: string; icon: "check" | "clock" | "alert" | "info" }
> = {
  "lean-verified": { label: "Lean-verified", color: "var(--status-good)", icon: "check" },
  "expert-verified": { label: "Expert-verified", color: "var(--status-good)", icon: "check" },
  "site-confirmed": { label: "Site-confirmed", color: "var(--accent-blue)", icon: "check" },
  "pending-peer-review": { label: "Pending peer review", color: "var(--status-warning)", icon: "clock" },
  contested: { label: "Contested", color: "var(--status-critical)", icon: "alert" },
  "wiki-listed": { label: "Listed (Tao wiki)", color: "var(--ink-muted)", icon: "info" },
};

const DASH = "—";

type SortKey = "name" | "field" | "solveType" | "posedBy" | "model" | "solveDate" | "age" | "renown";
type SortDir = "asc" | "desc";

const COLUMNS: { key: SortKey; label: string; align?: "right"; help?: ReactNode }[] = [
  { key: "name", label: "Problem" },
  { key: "field", label: "Type" },
  { key: "solveType", label: "Result" },
  { key: "posedBy", label: "Posed by" },
  { key: "model", label: "Model" },
  { key: "solveDate", label: "Solved" },
  { key: "age", label: "Age", align: "right" },
  {
    key: "renown",
    label: "Notability",
    align: "right",
    help: (
      <>
        Wikipedia language editions with an article about this specific problem. Generic concept
        articles don&apos;t count, and{" "}
        <strong>an article that exists only because the problem was solved does not count either</strong>
        . 0 means no such article.
      </>
    ),
  },
];

function StatusIcon({ kind, color }: { kind: "check" | "clock" | "alert" | "info"; color: string }) {
  const common = { width: 12, height: 12, viewBox: "0 0 16 16", fill: "none", stroke: color, strokeWidth: 1.6 };
  if (kind === "check") {
    return (
      <svg {...common} aria-hidden>
        <circle cx="8" cy="8" r="6.5" />
        <path d="M5.2 8.2l1.8 1.8 3.6-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "clock") {
    return (
      <svg {...common} aria-hidden>
        <circle cx="8" cy="8" r="6.5" />
        <path d="M8 4.5V8l2.6 1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (kind === "info") {
    return (
      <svg {...common} aria-hidden>
        <circle cx="8" cy="8" r="6.5" />
        <path d="M8 7.2v3.4" strokeLinecap="round" />
        <circle cx="8" cy="5.2" r="0.2" fill={color} />
      </svg>
    );
  }
  return (
    <svg {...common} aria-hidden>
      <path d="M8 2.2l6.3 11.1H1.7L8 2.2z" strokeLinejoin="round" />
      <path d="M8 6.8v3" strokeLinecap="round" />
      <circle cx="8" cy="11.6" r="0.15" fill={color} />
    </svg>
  );
}

function SortArrow({ dir }: { dir: SortDir }) {
  return <span className="ml-1 inline-block text-[10px]">{dir === "asc" ? "▲" : "▼"}</span>;
}

function sortValue(p: MathProblem, key: SortKey): string | number {
  switch (key) {
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
    case "solveDate":
      return p.solveDate;
    case "age":
      return ageAtSolve(p) ?? -1;
    case "renown":
      return p.renownLangs;
  }
}

// Instant, styled tooltip for column-header help. Uses `fixed` positioning so
// it escapes the table's `overflow-x-auto` clip (the native `title` tooltip was
// both slow and clipped inside that scroll box).
function HeaderInfo({ content, label }: { content: ReactNode; label: string }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLButtonElement>(null);

  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) {
      const half = 132; // half of the w-64 bubble, clamped into the viewport
      const x = Math.min(Math.max(r.left + r.width / 2, half + 8), window.innerWidth - half - 8);
      setPos({ x, y: r.bottom + 8 });
    }
    setOpen(true);
  };

  return (
    <span className="inline-flex">
      <button
        ref={ref}
        type="button"
        aria-label={`What is ${label}?`}
        onMouseEnter={show}
        onMouseLeave={() => setOpen(false)}
        onFocus={show}
        onBlur={() => setOpen(false)}
        className="cursor-help text-[11px] leading-none text-[var(--ink-muted)] hover:text-[var(--ink-secondary)]"
      >
        ⓘ
      </button>
      {open && (
        <span
          role="tooltip"
          className="pointer-events-none fixed z-50 w-64 -translate-x-1/2 whitespace-normal break-words rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] p-2.5 text-left text-xs font-normal normal-case leading-snug tracking-normal text-[var(--ink-secondary)] shadow-md"
          style={{ left: pos.x, top: pos.y }}
        >
          {content}
        </span>
      )}
    </span>
  );
}

const PAGE_SIZES = [10, 25, 50, 100];
const ALL_PER_PAGE = 100000;

// Compact page list: first, last, current and neighbours, with gaps elsewhere.
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

// Render a string with **...** segments bolded.
function renderBold(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-[var(--ink)]">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

// A "*" next to a notability count that reveals a caveat on hover/focus.
// Same fixed-position tooltip as HeaderInfo so it escapes the table scroll clip.
function StarNote({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLButtonElement>(null);

  const show = () => {
    const r = ref.current?.getBoundingClientRect();
    if (r) {
      const half = 132;
      const x = Math.min(Math.max(r.left + r.width / 2, half + 8), window.innerWidth - half - 8);
      setPos({ x, y: r.bottom + 8 });
    }
    setOpen(true);
  };

  return (
    <span className="inline">
      <button
        ref={ref}
        type="button"
        aria-label="Notability note"
        onMouseEnter={show}
        onMouseLeave={() => setOpen(false)}
        onFocus={show}
        onBlur={() => setOpen(false)}
        className="cursor-help align-super text-[10px] font-bold text-[var(--accent-orange)]"
      >
        *
      </button>
      {open && (
        <span
          role="tooltip"
          className="pointer-events-none fixed z-50 w-64 -translate-x-1/2 whitespace-normal break-words rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] p-2.5 text-left text-xs font-normal normal-case leading-snug tracking-normal text-[var(--ink-secondary)] shadow-md"
          style={{ left: pos.x, top: pos.y }}
        >
          {renderBold(text)}
        </span>
      )}
    </span>
  );
}

export function ProblemsTable({ problems }: { problems: MathProblem[] }) {
  const [query, setQuery] = useState("");
  const [fieldFilter, setFieldFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("solveDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);

  const fields = useMemo(
    () => Array.from(new Set(problems.map((p) => p.field).filter((f): f is string => f !== null))).sort(),
    [problems],
  );

  // Numeric-ish columns default to descending on first click (highest/most
  // recent first, so unfilled "—" rows - stored as -1 - sink to the bottom
  // instead of leading); text columns default to A→Z.
  const NUMERIC_KEYS: SortKey[] = ["solveDate", "age", "renown"];

  function toggleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(NUMERIC_KEYS.includes(key) ? "desc" : "asc");
    }
  }

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
      const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  // Reset to the first page whenever the result set or page size changes.
  useEffect(() => {
    setPage(1);
  }, [query, fieldFilter, resultFilter, verificationFilter, perPage]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * perPage;
  const paged = sorted.slice(start, start + perPage);

  const selectClass =
    "min-w-0 max-w-[45vw] sm:max-w-[12rem] rounded border border-[var(--hairline)] bg-[var(--paper)] px-2 py-1.5 text-xs text-[var(--ink-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]";
  const pageBtn =
    "inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-[var(--hairline)] px-2.5 text-sm text-[var(--ink-secondary)] transition-colors hover:bg-[var(--paper-raised)] disabled:pointer-events-none disabled:opacity-40";

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, field, model, people…"
          className="min-w-[220px] flex-1 rounded border border-[var(--hairline)] bg-[var(--paper)] px-3 py-1.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-blue)]"
        />
        <select value={fieldFilter} onChange={(e) => setFieldFilter(e.target.value)} className={selectClass}>
          <option value="all">All types</option>
          {fields.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
        <select value={resultFilter} onChange={(e) => setResultFilter(e.target.value)} className={selectClass}>
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
          className={selectClass}
        >
          <option value="all">All verification</option>
          {(Object.keys(VERIFICATION) as VerificationStatus[]).map((v) => (
            <option key={v} value={v}>
              {VERIFICATION[v].label}
            </option>
          ))}
        </select>
        {(query || fieldFilter !== "all" || resultFilter !== "all" || verificationFilter !== "all") && (
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
        <span className="ml-auto text-xs text-[var(--ink-muted)]">
          {sorted.length} of {problems.length}
        </span>
      </div>

      <div className="overflow-x-auto rounded-md border border-[var(--hairline)]">
        <table className="w-full min-w-[980px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-[var(--hairline)] bg-[var(--paper-raised)] text-left text-xs uppercase tracking-wide text-[var(--ink-muted)]">
              {COLUMNS.map((col, i) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`px-3 py-2.5 font-medium ${col.align === "right" ? "text-right" : ""} ${
                    i === 0 ? "sticky left-0 z-10 bg-[var(--paper-raised)] px-4" : ""
                  }`}
                >
                  <span className="inline-flex items-center gap-1">
                    <button
                      onClick={() => toggleSort(col.key)}
                      className="inline-flex items-center hover:text-[var(--ink-secondary)]"
                    >
                      {col.label}
                      {sortKey === col.key && <SortArrow dir={sortDir} />}
                    </button>
                    {col.help && <HeaderInfo content={col.help} label={col.label} />}
                  </span>
                </th>
              ))}
              <th scope="col" className="px-3 py-2.5 font-medium">
                Verification
              </th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {paged.map((problem, i) => {
              const v = VERIFICATION[problem.verification];
              const st = SOLVE_TYPE[problem.solveType];
              const age = ageAtSolve(problem);
              const bg = i % 2 === 0 ? "var(--paper)" : "var(--paper-raised)";
              return (
                <tr key={problem.slug} className="border-b border-[var(--hairline)] last:border-0" style={{ backgroundColor: bg }}>
                  <th
                    scope="row"
                    className="sticky left-0 z-10 max-w-[240px] px-4 py-2.5 text-left font-sans font-normal text-[var(--ink)]"
                    style={{ backgroundColor: bg }}
                  >
                    <Link href={`/problem/${problem.slug}`} className="hover:underline">
                      {problem.name}
                    </Link>
                  </th>
                  <td className="w-[160px] min-w-[160px] px-3 py-2.5 font-sans text-[var(--ink-secondary)]">
                    {problem.field ?? <span className="text-[var(--ink-muted)]">{DASH}</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                      <span aria-hidden className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: st.color }} />
                      <span className="font-sans text-[var(--ink-secondary)]">{st.label}</span>
                    </span>
                  </td>
                  <td className="max-w-[220px] px-3 py-2.5 font-sans text-[var(--ink-secondary)]">
                    {problem.posedBy ?? <span className="text-[var(--ink-muted)]">{DASH}</span>}
                  </td>
                  <td className="max-w-[220px] px-3 py-2.5 font-sans text-[var(--ink-secondary)]">
                    {problem.model}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-[var(--ink-secondary)]">
                    {problem.solveDate}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-[var(--ink-secondary)]">
                    {age !== null ? `${age}y` : <span className="font-sans text-[var(--ink-muted)]">{DASH}</span>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right tabular-nums text-[var(--ink-secondary)]">
                    {problem.renownLangs > 0 ? (
                      <span
                        title={`Dedicated Wikipedia article exists in ${problem.renownLangs} language editions`}
                      >
                        {problem.renownLangs}
                      </span>
                    ) : (
                      <span className="text-[var(--ink-muted)]" title="No dedicated Wikipedia article">
                        0
                      </span>
                    )}
                    {problem.renownNote && <StarNote text={problem.renownNote} />}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <span
                      className="inline-flex items-center gap-1.5 font-sans text-[var(--ink-secondary)]"
                      title={problem.verificationNote ?? undefined}
                    >
                      <StatusIcon kind={v.icon} color={v.color} />
                      {v.label}
                    </span>
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="px-4 py-8 text-center font-sans text-[var(--ink-muted)]">
                  No entries match those filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {sorted.length > 0 && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 text-xs text-[var(--ink-muted)]">
            <label className="flex items-center gap-2">
              <span>Rows per page</span>
              <select
                value={String(perPage)}
                onChange={(e) => setPerPage(Number(e.target.value))}
                className={selectClass}
              >
                {PAGE_SIZES.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
                <option value={ALL_PER_PAGE}>All</option>
              </select>
            </label>
            <span className="hidden sm:inline tabular-nums">
              {start + 1}-{Math.min(start + perPage, sorted.length)} of {sorted.length}
            </span>
          </div>

          <nav
            className="flex flex-wrap items-center justify-center gap-1 sm:justify-end"
            aria-label="Pagination"
          >
            <button
              type="button"
              onClick={() => setPage(current - 1)}
              disabled={current === 1}
              aria-label="Previous page"
              className={pageBtn}
            >
              <Chevron dir="left" />
            </button>
            {pageWindow(current, totalPages).map((p, idx) =>
              p === "gap" ? (
                <span key={`gap-${idx}`} className="px-1 text-[var(--ink-muted)]">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  aria-current={p === current ? "page" : undefined}
                  className={
                    p === current
                      ? `${pageBtn} border-[var(--accent-blue)] bg-[var(--accent-blue)] font-medium text-white hover:bg-[var(--accent-blue)]`
                      : pageBtn
                  }
                >
                  {p}
                </button>
              ),
            )}
            <button
              type="button"
              onClick={() => setPage(current + 1)}
              disabled={current === totalPages}
              aria-label="Next page"
              className={pageBtn}
            >
              <Chevron dir="right" />
            </button>
          </nav>
        </div>
      )}
    </div>
  );
}
