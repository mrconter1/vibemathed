import { describe, expect, it } from "vitest";
import { checkStoredEntry, parseField } from "@/lib/field-validation";
import { EDITABLE_FIELDS, CURATOR_FIELDS } from "@/lib/editable";

// These rules were unreachable from a test until the validator moved out of
// the server action. That was the whole problem: the only way to run them was
// to be a signed-in human clicking Save, so curator scripts wrote rows the
// form would refuse and nobody found out until an editor tried to fix a typo.

const spec = (key: string) =>
  [...EDITABLE_FIELDS, ...CURATOR_FIELDS].find((s) => s.key === key)!;

describe("parseField", () => {
  it("accepts a value inside its limit", () => {
    const r = parseField(spec("shortName"), "Köthe conjecture", "slug");
    expect(r.ok).toBe(true);
  });

  it("rejects a value over its limit, counting characters not code units", () => {
    // Blackboard bold is one character and two UTF-16 units; the limit is in
    // characters, because that is what the column measures.
    const s = spec("shortName");
    const under = "𝔽".repeat(s.maxLength!);
    const over = "𝔽".repeat(s.maxLength! + 1);
    expect(parseField(s, under, "slug").ok).toBe(true);
    expect(parseField(s, over, "slug").ok).toBe(false);
  });

  it("rejects a choice value that is not an option", () => {
    const r = parseField(spec("verification"), "vibes-verified", "slug");
    expect(r.ok).toBe(false);
  });

  it("rejects a source URL that is not http(s)", () => {
    expect(parseField(spec("sourceUrl"), "ftp://x.test/p", "slug").ok).toBe(
      false,
    );
    expect(parseField(spec("sourceUrl"), "https://x.test/p", "slug").ok).toBe(
      true,
    );
  });

  it("rejects a malformed solve date", () => {
    expect(parseField(spec("solveDate"), "Sept 2026", "slug").ok).toBe(false);
    expect(parseField(spec("solveDate"), "2026-09", "slug").ok).toBe(true);
  });

  it("treats an empty optional field as null rather than an error", () => {
    const r = parseField(spec("verificationNote"), "   ", "slug");
    expect(r).toEqual({ ok: true, value: null });
  });

  it("refuses to empty a required field", () => {
    const r = parseField(spec("shortName"), "   ", "slug");
    expect(r.ok).toBe(false);
  });
});

describe("checkStoredEntry", () => {
  const specs = [...EDITABLE_FIELDS, ...CURATOR_FIELDS];

  it("passes a clean entry", () => {
    expect(
      checkStoredEntry({
        specs,
        fields: { shortName: "Fine", verification: "unreviewed" },
        sourceUrl: "https://example.test/paper",
        links: [{ label: "Lean proof", url: "https://example.test/lean" }],
      }),
    ).toEqual([]);
  });

  it("catches a link that repeats the primary source", () => {
    // The failure that actually happened, eleven times over. sameDocument
    // normalises tracking parameters away, so a "?utm_source=chatgpt.com"
    // copy of the source looks different to a human and identical to the
    // validator.
    const v = checkStoredEntry({
      specs,
      sourceUrl: "https://claymath.org/wp-content/uploads/navierstokes.pdf",
      links: [
        {
          label: "Clay problem description",
          url: "https://claymath.org/wp-content/uploads/navierstokes.pdf?utm_source=chatgpt.com",
        },
      ],
    });
    expect(v).toHaveLength(1);
    expect(v[0].problem).toMatch(/primary source/);
  });

  it("catches two links pointing at the same document", () => {
    const v = checkStoredEntry({
      specs,
      links: [
        { label: "Paper", url: "https://arxiv.org/abs/2609.01234" },
        { label: "Paper again", url: "https://arxiv.org/abs/2609.01234#s2" },
      ],
    });
    expect(v.some((x) => /duplicate/.test(x.problem))).toBe(true);
  });

  it("catches an over-length field", () => {
    const v = checkStoredEntry({
      specs,
      fields: { shortName: "x".repeat(1000) },
    });
    expect(v).toHaveLength(1);
    expect(v[0].field).toBe("shortName");
  });

  it("catches a choice value no longer offered", () => {
    const v = checkStoredEntry({
      specs,
      fields: { resolution: "mostly-solved" },
    });
    expect(v.some((x) => x.field === "resolution")).toBe(true);
  });

  it("catches a link label over 120 characters", () => {
    const v = checkStoredEntry({
      specs,
      links: [{ label: "y".repeat(121), url: "https://example.test/a" }],
    });
    expect(v.some((x) => /120/.test(x.problem))).toBe(true);
  });

  it("ignores fields the caller did not supply", () => {
    // A script updating two fields should not be told off about the rest of
    // the entry, which it never touched and cannot see.
    expect(checkStoredEntry({ specs, fields: { shortName: "Fine" } })).toEqual(
      [],
    );
  });
});
