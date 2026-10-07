import { describe, expect, it } from "vitest";
import { buildDoc, fold, matches, parseQuery, search } from "@/lib/search-query";

const hadwiger = buildDoc({
  slug: "hadwiger-conjecture",
  name: "Hadwiger's conjecture",
  field: "Graph colouring",
  fieldGroup: "Combinatorics",
  posedBy: "Hugo Hadwiger",
  yearPosed: 1943,
  model: "Unreleased internal OpenAI model",
  modelMaker: "OpenAI",
  resolution: "candidate",
  resolutionLabel: "Candidate (review pending)",
  verification: "unreviewed",
  solveType: "disproved",
  solveDate: "2026-09-23",
  significance: 70,
  yearsOpen: 83,
  collectionLabel: "OpenAI math release (October 2026)",
  prose: ["Every graph with no $K_t$ minor is $(t-1)$-colourable?"],
});
const erdos = buildDoc({
  slug: "erdos-3",
  name: "Erdős Problem #3: reciprocal sums and arithmetic progressions",
  problemNumber: 3,
  fieldGroup: "Combinatorics",
  posedBy: "Paul Erdős and Paul Turán",
  yearPosed: 1974,
  model: "Unreleased internal OpenAI model",
  verification: "lean-checked",
  solveType: "proved",
  solveDate: "2026-09-23",
  significance: 65,
  prose: ["If $\\sum 1/a$ diverges, does $A$ contain arbitrarily long progressions?"],
});
const old = buildDoc({
  slug: "kusner",
  name: "Kusner's conjecture",
  fieldGroup: "Geometry & topology",
  posedBy: "Robert Kusner",
  yearPosed: 1983,
  model: "GPT-6 Astra",
  verification: "unreviewed",
  solveType: "disproved",
  solveDate: "2026-09-13",
  significance: 35,
});
const docs = [hadwiger, erdos, old];
const slugs = (q: string) => search(docs, q).map((r) => r.slug);

describe("fold", () => {
  it("drops case, accents and math markup", () => {
    expect(fold("Erdős–Turán $L_p$ \\mathbb{R}")).toBe("erdos-turan l_p r");
  });
});

describe("parseQuery and matching", () => {
  it("ANDs bare words across all fields", () => {
    expect(slugs("graph minor")).toEqual(["hadwiger-conjecture"]);
    expect(slugs("combinatorics openai")).toEqual(["hadwiger-conjecture", "erdos-3"]);
  });
  it("finds accented names without the accent", () => {
    expect(slugs("erdos")).toEqual(["erdos-3"]);
  });
  it("supports quoted phrases", () => {
    expect(slugs('"arithmetic progressions"')).toEqual(["erdos-3"]);
    expect(slugs('"progressions arithmetic"')).toEqual([]);
  });
  it("supports negation", () => {
    expect(slugs("combinatorics -erdos")).toEqual(["hadwiger-conjecture"]);
  });
  it("supports OR", () => {
    expect(slugs("hadwiger OR kusner").sort()).toEqual(["hadwiger-conjecture", "kusner"]);
  });
  it("restricts to a field", () => {
    expect(slugs("posed:turan")).toEqual(["erdos-3"]);
    expect(slugs("name:openai")).toEqual([]);
    expect(slugs('field:"geometry & topology"')).toEqual(["kusner"]);
  });
  it("compares numbers and ranges", () => {
    expect(slugs("sig:>60").sort()).toEqual(["erdos-3", "hadwiger-conjecture"]);
    expect(slugs("year:<1950")).toEqual(["hadwiger-conjecture"]);
    expect(slugs("sig:30..40")).toEqual(["kusner"]);
    expect(slugs("open:>=80")).toEqual(["hadwiger-conjecture"]);
  });
  it("matches date prefixes", () => {
    expect(slugs("solved:2026-09-23").sort()).toEqual(["erdos-3", "hadwiger-conjecture"]);
    expect(slugs("-solved:2026-09-23")).toEqual(["kusner"]);
  });
  it("matches tiers, statuses, results and collections", () => {
    expect(slugs("tier:lean")).toEqual(["erdos-3"]);
    expect(slugs("status:candidate")).toEqual(["hadwiger-conjecture"]);
    expect(slugs("result:disproved").sort()).toEqual(["hadwiger-conjecture", "kusner"]);
    expect(slugs("release:openai")).toEqual(["hadwiger-conjecture"]);
  });
  it("finds a problem number", () => {
    expect(slugs("number:3")).toEqual(["erdos-3"]);
    expect(slugs("#3")).toEqual(["erdos-3"]);
  });
  it("ignores unknown prefixes as plain text and empty values", () => {
    expect(parseQuery("foo:").groups).toHaveLength(1);
    expect(parseQuery("name:").groups).toHaveLength(0);
    expect(matches(hadwiger, parseQuery(""))).toBe(true);
  });
  it("ranks name hits above prose hits", () => {
    const docs2 = [
      buildDoc({ slug: "a", name: "Something else", prose: ["mentions kakeya once"] }),
      buildDoc({ slug: "b", name: "The Kakeya conjecture" }),
    ];
    expect(search(docs2, "kakeya").map((r) => r.slug)).toEqual(["b", "a"]);
  });
});
