// Label placement for the significance scatter on /stats.
//
// The chart labels every point above a significance threshold. As the catalog
// filled up, the labelled band stopped being "a few outliers in the sparse
// corner" and became roughly two dozen names inside one crowded rectangle,
// and the old greedy stacker printed them on top of each other: it lifted a
// label by one row per collision but gave up after six lifts and drew the
// label anyway, so the densest region - exactly the region that needed help -
// got the worst pile.
//
// Three rules replace that:
//
//   - Search a ladder of candidate slots: above the point, below it, and
//     BESIDE it. Sideways matters more than it sounds. The crowded band runs
//     diagonally, so points there are stacked vertically at similar x, and
//     the free space is to their left and right rather than overhead.
//   - Treat the plotted dots as obstacles too, not just other labels. Text
//     written through the scatter is as unreadable as text written through
//     text.
//   - If nothing is free, DROP the label rather than overprint. A dropped
//     label costs one name; an overprinted one costs every name under it,
//     and the points stay hover- and click-discoverable either way.
//
// Kept out of the component and free of React so the packing can be tested
// directly, which is the only way to know a change here helps rather than
// rearranges the mess.

export type LabelAnchor = "start" | "middle" | "end";

export interface LabelInput {
  key: string;
  /// Point centre, in viewBox units.
  cx: number;
  cy: number;
  /// Estimated rendered text width.
  width: number;
  /// Anchor to use for the slots directly above and below the point. Edge
  /// points anchor inward so the text stays inside the viewBox.
  anchor: LabelAnchor;
}

export interface Placement {
  x: number;
  y: number;
  anchor: LabelAnchor;
}

export interface PlaceOptions {
  /// Labels may not climb above this line, nor fall below maxY.
  minY: number;
  maxY: number;
  /// Nor extend outside these, which are the plot's horizontal bounds.
  minX: number;
  maxX: number;
  /// Row height, and the vertical clearance two labels need.
  rowH?: number;
  /// Every plotted dot, as an obstacle.
  points?: { x: number; y: number }[];
  /// Dot radius to keep clear of.
  pointR?: number;
}

/// Candidate slots, in preference order, as offsets from the point. `side`
/// overrides the label's own anchor: a label placed to the right of its dot
/// must anchor at its left edge whatever the point's position implies.
///
/// Above first, because a label reads as belonging to the dot beneath it.
/// Then beside, then below, then further out.
const LADDER: { dx: number; dy: number; side?: LabelAnchor }[] = [
  { dx: 0, dy: -12 },
  { dx: 8, dy: 4, side: "start" },
  { dx: -8, dy: 4, side: "end" },
  { dx: 0, dy: -25 },
  { dx: 0, dy: 18 },
  { dx: 8, dy: -8, side: "start" },
  { dx: -8, dy: -8, side: "end" },
  { dx: 0, dy: -38 },
  { dx: 0, dy: 31 },
  { dx: 8, dy: 16, side: "start" },
  { dx: -8, dy: 16, side: "end" },
  { dx: 0, dy: -51 },
];

/// Horizontal extent of a label drawn at `x` with the given anchor. The
/// collision test has to agree with what the renderer actually draws: an
/// edge-anchored label occupies one side of its point, not both, and testing
/// it as centred was letting edge labels overlap their neighbours.
export function extent(
  x: number,
  width: number,
  anchor: LabelAnchor,
): [number, number] {
  if (anchor === "start") return [x, x + width];
  if (anchor === "end") return [x - width, x];
  return [x - width / 2, x + width / 2];
}

/**
 * Choose a position for each label, or leave it out when there is no room.
 *
 * Points are packed in the caller's order, so pass them most-important first:
 * whoever comes first gets the slot, and the ones dropped are the ones the
 * caller cared least about.
 */
export function placeLabels(
  items: LabelInput[],
  {
    minY,
    maxY,
    minX,
    maxX,
    rowH = 13,
    points = [],
    pointR = 5,
  }: PlaceOptions,
): Map<string, Placement> {
  const out = new Map<string, Placement>();
  const placed: { x0: number; x1: number; y: number }[] = [];

  for (const item of items) {
    for (const slot of LADDER) {
      const anchor = slot.side ?? item.anchor;
      const x = item.cx + slot.dx;
      const y = item.cy + slot.dy;
      if (y < minY || y > maxY) continue;

      const [x0, x1] = extent(x, item.width, anchor);
      if (x0 < minX || x1 > maxX) continue;

      // A 2px horizontal breathing gap: touching labels read as one string.
      const clash = placed.some(
        (p) => Math.abs(p.y - y) < rowH && x0 < p.x1 + 2 && x1 > p.x0 - 2,
      );
      if (clash) continue;

      // The glyph box for a 12px label sits roughly from y-9 to y+3 around
      // the baseline. A dot inside that box lands in the middle of a word.
      // The label's own point is exempt: it is what the label names, and a
      // beside-slot deliberately sits next to it.
      const onPoint = points.some(
        (p) =>
          !(p.x === item.cx && p.y === item.cy) &&
          p.x + pointR > x0 &&
          p.x - pointR < x1 &&
          p.y + pointR > y - 9 &&
          p.y - pointR < y + 3,
      );
      if (onPoint) continue;

      placed.push({ x0, x1, y });
      out.set(item.key, { x, y, anchor });
      break;
    }
  }
  return out;
}

/// Rendered width of a label, estimated from character count. Deliberately a
/// little generous: under-estimating width is what lets two labels touch, and
/// a slightly wide box only costs an occasional extra drop.
export function labelWidth(text: string, fontSize = 12): number {
  return text.length * fontSize * 0.55 + 6;
}
