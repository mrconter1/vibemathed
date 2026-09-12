// The Prisma client every curator script must use.
//
// Scripts used to construct a bare PrismaClient and write whatever they were
// given. Nothing between them and the database ran the rules the edit form
// enforces, so the catalog collected rows the form refuses - and an entry
// holding one of those could not be saved by anyone afterwards. Twelve
// published entries were in that state on 10 September 2026; one of them had
// been created by a review script the day before.
//
// This wrapper puts the form's validator in the write path. Creating or
// updating a Problem, or adding a ProblemLink, runs `checkStoredEntry` from
// src/lib/field-validation.ts - the same module the server actions import -
// against the MERGED result (stored data plus the change), and refuses to
// write if anything would violate a rule. The refusal names the field and the
// rule, which is more than the database's P2000 ever did.
//
// Raw SQL cannot be validated, so INSERT and UPDATE on the two guarded tables
// are refused outright through this client; use the model API. SELECT and
// DELETE stay open - a delete cannot create a violation, and scripts need to
// read.
//
// A test (src/lib/scripts-use-guard.test.ts) fails the build if a script
// under scripts/ constructs its own PrismaClient, so the guard is not a
// convention a future script can forget.

import { PrismaClient } from "@prisma/client";
import { checkStoredEntry } from "../../src/lib/field-validation";
import { CURATOR_FIELDS, EDITABLE_FIELDS } from "../../src/lib/editable";

const SPECS = [...EDITABLE_FIELDS, ...CURATOR_FIELDS];

export class WriteRefused extends Error {
  constructor(what: string, violations: { field: string; problem: string }[]) {
    super(
      `${what} refused - it would leave the entry uneditable through the form:\n` +
        violations.map((v) => `  - ${v.field}: ${v.problem}`).join("\n"),
    );
    this.name = "WriteRefused";
  }
}

type LinkIn = { label: string; url: string };

/// Nested link creates arrive in several shapes; normalise to a flat list.
function linksFrom(data: Record<string, unknown> | undefined): LinkIn[] {
  const nested = (data?.links as { create?: unknown } | undefined)?.create;
  if (!nested) return [];
  return (Array.isArray(nested) ? nested : [nested]) as LinkIn[];
}

/// Scalar fields only: the validator ignores keys it has no spec for, and
/// Prisma relation payloads (links, relationsFrom...) are not scalars.
function scalars(
  data: Record<string, unknown> | undefined,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data ?? {})) {
    if (v !== null && typeof v === "object" && !Array.isArray(v)) continue;
    out[k] = v;
  }
  return out;
}

const RAW_WRITE = /\b(INSERT\s+INTO|UPDATE)\s+"?(Problem|ProblemLink)"?\b/i;

export function guardedPrisma() {
  const base = new PrismaClient();

  const client = base.$extends({
    query: {
      problem: {
        async create({ args, query }) {
          const data = args.data as Record<string, unknown>;
          const v = checkStoredEntry({
            specs: SPECS,
            fields: scalars(data),
            links: linksFrom(data),
            sourceUrl: (data.sourceUrl as string | undefined) ?? null,
          });
          if (v.length) throw new WriteRefused("problem.create", v);
          return query(args);
        },
        async update({ args, query }) {
          const data = args.data as Record<string, unknown>;
          // Validate the merged result, not the fragment: a new link is only
          // a duplicate relative to the links already there, and a changed
          // sourceUrl is only a clash relative to the links it now sits over.
          const cur = await base.problem.findUnique({
            where: args.where,
            select: {
              sourceUrl: true,
              links: { select: { label: true, url: true } },
            },
          });
          const merged = [...(cur?.links ?? []), ...linksFrom(data)];
          const v = checkStoredEntry({
            specs: SPECS,
            fields: scalars(data),
            links: merged,
            sourceUrl:
              (data.sourceUrl as string | undefined) ?? cur?.sourceUrl ?? null,
          });
          if (v.length) throw new WriteRefused("problem.update", v);
          return query(args);
        },
        async upsert({ args, query }) {
          for (const [what, d] of [
            ["upsert.create", args.create],
            ["upsert.update", args.update],
          ] as const) {
            const data = d as Record<string, unknown>;
            const v = checkStoredEntry({
              specs: SPECS,
              fields: scalars(data),
              links: linksFrom(data),
              sourceUrl: (data.sourceUrl as string | undefined) ?? null,
            });
            if (v.length) throw new WriteRefused(`problem.${what}`, v);
          }
          return query(args);
        },
      },
      problemLink: {
        async create({ args, query }) {
          const d = args.data as {
            label: string;
            url: string;
            problemId?: string;
            problem?: { connect?: { id?: string } };
          };
          const problemId = d.problemId ?? d.problem?.connect?.id;
          const cur = problemId
            ? await base.problem.findUnique({
                where: { id: problemId },
                select: {
                  sourceUrl: true,
                  links: { select: { label: true, url: true } },
                },
              })
            : null;
          const v = checkStoredEntry({
            specs: SPECS,
            links: [...(cur?.links ?? []), { label: d.label, url: d.url }],
            sourceUrl: cur?.sourceUrl ?? null,
          });
          if (v.length) throw new WriteRefused("problemLink.create", v);
          return query(args);
        },
        async update({ args, query }) {
          const d = args.data as { label?: string; url?: string };
          const row = await base.problemLink.findUnique({
            where: args.where,
            select: {
              id: true,
              label: true,
              url: true,
              problem: {
                select: {
                  sourceUrl: true,
                  links: { select: { id: true, label: true, url: true } },
                },
              },
            },
          });
          if (row) {
            const links = row.problem.links.map((l) =>
              l.id === row.id
                ? { label: d.label ?? l.label, url: d.url ?? l.url }
                : { label: l.label, url: l.url },
            );
            const v = checkStoredEntry({
              specs: SPECS,
              links,
              sourceUrl: row.problem.sourceUrl,
            });
            if (v.length) throw new WriteRefused("problemLink.update", v);
          }
          return query(args);
        },
      },
    },
  });

  // Raw writes to the guarded tables cannot be checked, so they are refused.
  const rawExec = base.$executeRawUnsafe.bind(base);
  const guardedExec: typeof base.$executeRawUnsafe = (
    sql: string,
    ...params: unknown[]
  ) => {
    if (RAW_WRITE.test(sql)) {
      throw new WriteRefused("raw SQL write to Problem/ProblemLink", [
        {
          field: "sql",
          problem:
            "use prisma.problem / prisma.problemLink so the form's rules run",
        },
      ]);
    }
    return rawExec(sql, ...params);
  };
  (client as unknown as { $executeRawUnsafe: unknown }).$executeRawUnsafe =
    guardedExec;

  return client;
}

export type GuardedPrisma = ReturnType<typeof guardedPrisma>;
