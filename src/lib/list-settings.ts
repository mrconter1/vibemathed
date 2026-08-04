// The entry list's remembered view: which sort, which direction, which time
// horizon, which filters, how many per page.
//
// This lives outside the component because the SERVER needs it now. The list
// used to render in the default order and reshuffle into the remembered one
// the moment React started, which is unavoidable when the preference exists
// only in localStorage: the markup is built before any browser is involved.
// So the same settings are mirrored into a cookie, the page reads it, and the
// HTML arrives already in the right order.
//
// localStorage stays the source of truth for the browser. The cookie is a
// copy that exists purely so the server can see it, and it is treated as
// untrusted input on the way back in: every value is checked against what the
// UI can actually offer today, so a stale or hand-edited cookie degrades to
// the default rather than rendering something impossible.

import {
  AI_CONTRIBUTIONS,
  FIELD_GROUPS,
  PUBLICATION_STATUSES,
  RESOLUTION_METHODS,
  RESOLUTION_STATUSES,
  type Period,
} from "@/lib/problems";
import { ageAtSolve, type CardEntry } from "@/lib/problems";
import { MODEL_FAMILIES, SOLVE_TYPE, VERIFICATION } from "@/lib/display";

export type SortKey =
  | "solveDate"
  | "added"
  | "score"
  | "discussion"
  | "name"
  | "age"
  | "significance"
  | "cost";

export type SortDir = "asc" | "desc";

// Alphabetical by label, so a reader scanning the dropdown can find an option
// by name instead of learning an arbitrary order. "solveDate" stays the
// default sort regardless of where it lands in this list.
export const SORTS: { key: SortKey; label: string }[] = [
  { key: "discussion", label: "Comments" },
  { key: "added", label: "Date added" },
  { key: "solveDate", label: "Date solved" },
  { key: "cost", label: "Disclosed cost" },
  { key: "name", label: "Name" },
  { key: "significance", label: "Significance" },
  { key: "score", label: "Votes" },
  { key: "age", label: "Years open" },
];

// Labels name the window explicitly ("Last 7 days", not "Week") because these
// are rolling windows measured back from now, and "Week" invites reading it as
// the calendar week.
export const PERIODS: { key: Period; label: string }[] = [
  { key: "day", label: "Last 24 hours" },
  { key: "3day", label: "Last 3 days" },
  { key: "week", label: "Last 7 days" },
  { key: "month", label: "Last 30 days" },
  { key: "all", label: "All time" },
];

/// Days back for each window; `all` has no cutoff.
export const PERIOD_DAYS: Record<Exclude<Period, "all">, number> = {
  day: 1,
  "3day": 3,
  week: 7,
  month: 30,
};

// The period means two things, by sort. On the engagement sorts it windows
// the METRIC (votes/comments gained that period, across all entries); on
// every other sort it FILTERS the list to entries from that period.
export const TIME_SENSITIVE: SortKey[] = ["score", "discussion"];

// These default to descending on first pick (highest / most recent first, so
// entries with no value - stored as -1 - sink instead of leading).
export const NUMERIC_KEYS: SortKey[] = [
  "solveDate",
  "added",
  "age",
  "significance",
  "score",
  "discussion",
  "cost",
];

export const PAGE_SIZES = [10, 25, 50, 100];

export interface ListSettings {
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

export const DEFAULT_SETTINGS: ListSettings = {
  fieldFilter: "all",
  resultFilter: "all",
  statusFilter: "all",
  contributionFilter: "all",
  modelFilter: "all",
  verificationFilter: "all",
  publicationFilter: "all",
  methodFilter: "all",
  sortKey: "solveDate",
  sortDir: "desc",
  period: "all",
  perPage: 25,
};

/// Where the browser keeps it, and where the server reads its copy.
export const SETTINGS_KEY = "vibemathed:list-settings";
export const SETTINGS_COOKIE = "vibemathed_list";

/// A year. The preference is a convenience, not a session: someone who sorts
/// by significance once should still land there next month.
export const SETTINGS_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const isOneOf = (value: unknown, allowed: readonly string[]) =>
  typeof value === "string" && (value === "all" || allowed.includes(value));

/// Validates whatever was stored into settings the UI can actually render.
/// Anything unrecognised falls back to its default, key by key, so one stale
/// filter cannot discard the rest of a remembered view.
export function normalizeListSettings(raw: unknown): ListSettings {
  const s = (typeof raw === "object" && raw !== null ? raw : {}) as Record<string, unknown>;
  const out = { ...DEFAULT_SETTINGS };

  if (isOneOf(s.fieldFilter, FIELD_GROUPS)) out.fieldFilter = s.fieldFilter as string;
  if (isOneOf(s.resultFilter, Object.keys(SOLVE_TYPE))) out.resultFilter = s.resultFilter as string;
  if (isOneOf(s.statusFilter, RESOLUTION_STATUSES)) out.statusFilter = s.statusFilter as string;
  if (isOneOf(s.contributionFilter, AI_CONTRIBUTIONS)) {
    out.contributionFilter = s.contributionFilter as string;
  }
  if (isOneOf(s.modelFilter, MODEL_FAMILIES.map((f) => f.key))) {
    out.modelFilter = s.modelFilter as string;
  }
  if (isOneOf(s.verificationFilter, Object.keys(VERIFICATION))) {
    out.verificationFilter = s.verificationFilter as string;
  }
  if (isOneOf(s.publicationFilter, PUBLICATION_STATUSES)) {
    out.publicationFilter = s.publicationFilter as string;
  }
  if (isOneOf(s.methodFilter, RESOLUTION_METHODS)) out.methodFilter = s.methodFilter as string;

  if (SORTS.some((x) => x.key === s.sortKey)) out.sortKey = s.sortKey as SortKey;
  if (s.sortDir === "asc" || s.sortDir === "desc") out.sortDir = s.sortDir;
  if (PERIODS.some((x) => x.key === s.period)) out.period = s.period as Period;
  if (typeof s.perPage === "number" && PAGE_SIZES.includes(s.perPage)) out.perPage = s.perPage;

  return out;
}

/// Reads the server's copy. A missing, malformed or oversized cookie is just
/// "no preference"; it must never be able to fail a page render.
export function readSettingsCookie(value: string | undefined): ListSettings {
  if (!value || value.length > 512) return DEFAULT_SETTINGS;
  try {
    return normalizeListSettings(JSON.parse(decodeURIComponent(value)));
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/// The value a card sorts on. Shared so the server can order the list the
/// same way the client will, which is what lets the page inline statement
/// math for the entries that will actually be on screen.
export function sortValue(p: CardEntry, key: SortKey, period: Period): string | number {
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
