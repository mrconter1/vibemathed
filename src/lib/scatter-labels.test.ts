import { describe, expect, it } from "vitest";
import {
  extent,
  labelWidth,
  placeLabels,
  type LabelInput,
  type Placement,
} from "@/lib/scatter-labels";

const BOUNDS = { minY: 34, maxY: 316, minX: 56, maxX: 616 };

const at = (key: string, cx: number, cy: number, width = 60): LabelInput => ({
  key,
  cx,
  cy,
  width,
  anchor: "middle",
});

/// Do two placed labels overlap? The property every test below really cares
/// about, expressed once.
function overlaps(a: LabelInput, ap: Placement, b: LabelInput, bp: Placement) {
  const [a0, a1] = extent(ap.x, a.width, ap.anchor);
  const [b0, b1] = extent(bp.x, b.width, bp.anchor);
  return Math.abs(ap.y - bp.y) < 13 && a0 < b1 && a1 > b0;
}

describe("placeLabels", () => {
  it("places an isolated label just above its point", () => {
    const out = placeLabels([at("a", 200, 200)], BOUNDS);
    expect(out.get("a")?.y).toBe(188);
  });

  it("lifts the second of two colliding labels instead of overprinting", () => {
    const a = at("a", 200, 200);
    const b = at("b", 210, 200);
    const out = placeLabels([a, b], BOUNDS);
    expect(out.size).toBe(2);
    expect(overlaps(a, out.get("a")!, b, out.get("b")!)).toBe(false);
  });

  it("leaves labels alone when they are far apart horizontally", () => {
    const out = placeLabels([at("a", 100, 200), at("b", 400, 200)], BOUNDS);
    expect(out.get("a")?.y).toBe(188);
    expect(out.get("b")?.y).toBe(188);
  });

  it("DROPS a label rather than overprint when the ladder is exhausted", () => {
    // Twenty labels stacked on one point cannot all fit. The old stacker gave
    // up after six lifts and drew them anyway; this is the regression that
    // produced the unreadable pile at the top of the chart.
    const many = Array.from({ length: 20 }, (_, i) => at(`n${i}`, 200, 200));
    const out = placeLabels(many, BOUNDS);
    expect(out.size).toBeLessThan(20);
    expect(out.size).toBeGreaterThan(0);
    // Whatever survived must be mutually clear.
    const kept = many.filter((m) => out.has(m.key));
    for (let i = 0; i < kept.length; i++)
      for (let j = i + 1; j < kept.length; j++)
        expect(
          overlaps(
            kept[i],
            out.get(kept[i].key)!,
            kept[j],
            out.get(kept[j].key)!,
          ),
        ).toBe(false);
  });

  it("never places a label above the top margin", () => {
    // A point at the very top of the plot has almost no headroom, so most of
    // the ladder is out of bounds; anything placed must still be inside.
    const many = Array.from({ length: 8 }, (_, i) => at(`n${i}`, 200, 40));
    const out = placeLabels(many, BOUNDS);
    for (const p of out.values())
      expect(p.y).toBeGreaterThanOrEqual(BOUNDS.minY);
  });

  it("never places a label below the baseline", () => {
    const many = Array.from({ length: 8 }, (_, i) => at(`n${i}`, 200, 310));
    const out = placeLabels(many, BOUNDS);
    for (const p of out.values()) expect(p.y).toBeLessThanOrEqual(BOUNDS.maxY);
  });

  it("falls below the point when there is no room above", () => {
    // Pinned at the ceiling: the only free slots are the downward rungs.
    const out = placeLabels([at("a", 200, 36)], BOUNDS);
    expect(out.get("a")?.y).toBeGreaterThan(36);
  });

  it("packs in the caller's order, so earlier items win the slot", () => {
    const first = at("first", 200, 200);
    const second = at("second", 205, 200);
    const out = placeLabels([first, second], BOUNDS);
    // The first keeps the slot nearest its point.
    expect(out.get("first")?.y).toBe(188);
    expect(out.get("second")?.y).not.toBe(188);
  });

  it("avoids writing a label through a plotted point", () => {
    // A dot sitting exactly where the first rung would put the text. The
    // first version of this fix cleared label-vs-label but happily punched
    // points through the middle of words.
    const a = at("a", 200, 200);
    const out = placeLabels([a], { ...BOUNDS, points: [{ x: 200, y: 188 }] });
    expect(out.get("a")?.y).not.toBe(188);
  });

  it("does not treat a label's own point as an obstacle", () => {
    const a = at("a", 200, 200);
    const out = placeLabels([a], { ...BOUNDS, points: [{ x: 200, y: 200 }] });
    expect(out.get("a")?.y).toBe(188);
  });

  it("ignores points far from the label box", () => {
    const a = at("a", 200, 200);
    const out = placeLabels([a], { ...BOUNDS, points: [{ x: 400, y: 188 }] });
    expect(out.get("a")?.y).toBe(188);
  });

  it("respects the anchor when testing overlap", () => {
    // Two points 40 apart with 60-wide labels: centred they overlap, but
    // anchored away from each other they do not, and both should sit on the
    // first rung. Testing edge labels as if centred is what let them collide.
    const a: LabelInput = {
      key: "a",
      cx: 200,
      cy: 200,
      width: 60,
      anchor: "end",
    };
    const b: LabelInput = {
      key: "b",
      cx: 240,
      cy: 200,
      width: 60,
      anchor: "start",
    };
    const out = placeLabels([a, b], BOUNDS);
    expect(out.get("a")?.y).toBe(188);
    expect(out.get("b")?.y).toBe(188);
  });

  it("keeps every label inside the horizontal bounds", () => {
    // A wide label on a point near the right edge must not run off the plot,
    // whatever slot it lands in.
    const wide: LabelInput = {
      key: "w",
      cx: 600,
      cy: 200,
      width: 140,
      anchor: "end",
    };
    const out = placeLabels([wide], BOUNDS);
    const p = out.get("w");
    if (p) {
      const [x0, x1] = extent(p.x, wide.width, p.anchor);
      expect(x0).toBeGreaterThanOrEqual(BOUNDS.minX);
      expect(x1).toBeLessThanOrEqual(BOUNDS.maxX);
    }
  });

  it("puts a label beside its point when the space above is taken", () => {
    // The crowded band runs diagonally, so points there stack vertically and
    // the free space is sideways. Blocking every vertical slot with dots
    // should push the label to a side slot rather than drop it.
    const a = at("a", 300, 200, 50);
    const blockers = [-12, -25, 18, -38, 31, -51].map((dy) => ({
      x: 300,
      y: 200 + dy,
    }));
    const out = placeLabels([a], { ...BOUNDS, points: blockers });
    const p = out.get("a");
    expect(p).toBeDefined();
    expect(p!.anchor).not.toBe("middle");
    expect(p!.x).not.toBe(300);
  });

  it("recovers labels that a vertical-only ladder would have dropped", () => {
    // Five points stacked in a column, the shape the diagonal band makes.
    // With only up/down slots most of these collide and get dropped; with
    // side slots they fan out. This is the whole reason side slots exist.
    const column = [0, 1, 2, 3, 4].map((i) =>
      at(`c${i}`, 300, 150 + i * 14, 70),
    );
    const out = placeLabels(column, {
      ...BOUNDS,
      points: column.map((c) => ({ x: c.cx, y: c.cy })),
    });
    expect(out.size).toBeGreaterThanOrEqual(4);
  });
});

describe("labelWidth", () => {
  it("grows with the text", () => {
    expect(labelWidth("Köthe Conjecture")).toBeGreaterThan(labelWidth("KLS"));
  });

  it("is generous rather than tight", () => {
    // 16 characters at 12px should not be estimated under ~100px; an
    // under-estimate is what lets neighbours touch.
    expect(labelWidth("Köthe Conjecture")).toBeGreaterThan(100);
  });
});

describe("extent", () => {
  it("centres a middle-anchored label on its point", () => {
    expect(extent(100, 40, "middle")).toEqual([80, 120]);
  });

  it("puts a start-anchored label entirely to the right", () => {
    expect(extent(100, 40, "start")).toEqual([100, 140]);
  });

  it("puts an end-anchored label entirely to the left", () => {
    expect(extent(100, 40, "end")).toEqual([60, 100]);
  });
});
