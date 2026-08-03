// Minimal stroke icons, one style for the whole site: the 16-grid, 1.6 stroke
// and round caps of StatusIcon, drawn in currentColor so they take the tone of
// whatever text they sit beside. Used sparingly - tile labels, card headers and
// a couple of meta affordances - as visual anchors, not decoration.

export type IconName =
  | "layers" // tracked problems
  | "hash" // Erdős numbering
  | "shield" // Lean-verified
  | "users" // community
  | "spark" // just solved
  | "hourglass" // longest standing
  | "pulse" // latest activity
  | "search" // list search
  | "bubble" // comments
  | "globe" // Wikipedia notability
  | "votes" // votes cast
  | "alert" // contested results
  | "funnel" // list filters
  | "flag" // report an entry
  | "pencil" // edit an entry
  | "bell" // notifications
  | "info" // explanatory tooltips
  | "arrowDown" // sort direction (rotate 180 for ascending)
  | "copy" // copy to clipboard
  | "check"; // confirmation after a copy

const PATHS: Record<IconName, React.ReactNode> = {
  layers: (
    <>
      <path d="M8 2.5L14 5.5 8 8.5 2 5.5 8 2.5z" strokeLinejoin="round" />
      <path d="M2 8.5l6 3 6-3" strokeLinejoin="round" />
      <path d="M2 11.5l6 3 6-3" strokeLinejoin="round" />
    </>
  ),
  hash: (
    <>
      <path d="M6.2 2.5L4.8 13.5M11.2 2.5L9.8 13.5M2.8 6h10.7M2.5 10h10.7" strokeLinecap="round" />
    </>
  ),
  shield: (
    <>
      <path d="M8 2l5 1.8v3.9c0 3.2-2.1 5.3-5 6.3-2.9-1-5-3.1-5-6.3V3.8L8 2z" strokeLinejoin="round" />
      <path d="M5.8 8l1.6 1.6 2.8-3.2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  users: (
    <>
      <circle cx="6" cy="5.5" r="2.5" />
      <path d="M1.8 13.5c0-2.3 1.9-3.7 4.2-3.7s4.2 1.4 4.2 3.7" strokeLinecap="round" />
      <path d="M10.5 3.3a2.5 2.5 0 010 4.4M12 10.2c1.3.5 2.2 1.6 2.2 3.3" strokeLinecap="round" />
    </>
  ),
  spark: (
    <>
      <path d="M8.8 1.8L4 9h3.4l-.9 5.2L11.9 7H8.4l.4-5.2z" strokeLinejoin="round" />
    </>
  ),
  hourglass: (
    <>
      <path
        d="M4 2h8M4 14h8M5 2c0 3 2 4.4 3 6-1 1.6-3 3-3 6M11 2c0 3-2 4.4-3 6 1 1.6 3 3 3 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  pulse: (
    <>
      <path d="M1.8 8h2.7l1.8-4.5 3.4 9L11.5 8h2.7" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  search: (
    <>
      <circle cx="7" cy="7" r="4.5" />
      <path d="M10.4 10.4L14 14" strokeLinecap="round" />
    </>
  ),
  bubble: (
    <>
      <path
        d="M2.5 7.5a5 4.6 0 015-4.6h1a5 4.6 0 015 4.6 5 4.6 0 01-5 4.6H7l-3.2 2v-2.8a4.7 4.7 0 01-1.3-3.8z"
        strokeLinejoin="round"
      />
    </>
  ),
  globe: (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M2 8h12M8 2c1.8 1.7 2.6 3.7 2.6 6S9.8 12.3 8 14C6.2 12.3 5.4 10.3 5.4 8S6.2 3.7 8 2z" />
    </>
  ),
  votes: (
    <>
      <path d="M5 7V2.8L2 7h3zM5 7h1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 9v4.2L14 9h-3zM11 9H9.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  alert: (
    <>
      <path d="M8 2.2l6.3 11.1H1.7L8 2.2z" strokeLinejoin="round" />
      <path d="M8 6.8v3" strokeLinecap="round" />
      <circle cx="8" cy="11.6" r="0.15" fill="currentColor" />
    </>
  ),
  funnel: (
    <>
      <path
        d="M2 3h12L9.6 8.6v4.2l-3.2 1.4V8.6L2 3z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  flag: (
    <>
      <path d="M4 14V2.4" strokeLinecap="round" />
      <path d="M4 3h7.6L9.8 5.8l1.8 2.8H4" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  pencil: (
    <>
      <path
        d="M11.2 2.6a1.55 1.55 0 012.2 2.2L6 12.2l-3 .8.8-3 7.4-7.4z"
        strokeLinejoin="round"
      />
      <path d="M9.8 4l2.2 2.2" />
    </>
  ),
  bell: (
    <>
      <path
        d="M8 2.2a3.9 3.9 0 00-3.9 3.9c0 2.9-.9 4.1-1.5 4.8h10.8c-.6-.7-1.5-1.9-1.5-4.8A3.9 3.9 0 008 2.2z"
        strokeLinejoin="round"
      />
      <path d="M6.6 13.3a1.5 1.5 0 002.8 0" strokeLinecap="round" />
    </>
  ),
  // Replaces the "ⓘ" glyph, which the browser rasterised from a font at 11px
  // and rendered visibly chunky. Drawn on the same 16-grid as the rest so it
  // scales cleanly and takes the surrounding text colour. The stem is a
  // stroked line and the dot a filled circle, which stays legible at 12-13px
  // where a stroked ring around a glyph would not.
  info: (
    <>
      <circle cx="8" cy="8" r="6.2" />
      <path d="M8 7.2v4" strokeLinecap="round" />
      <circle cx="8" cy="4.9" r="0.75" fill="currentColor" stroke="none" />
    </>
  ),
  // A real arrow, not the "▼" glyph the direction toggle used to draw: that is
  // the shape browsers put inside a <select>, so the toggle read as a third
  // dropdown. One icon serves both directions, rotated 180 for ascending.
  arrowDown: (
    <>
      <path d="M8 2.8v10.4" strokeLinecap="round" />
      <path d="M4.2 9.4L8 13.2l3.8-3.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  // Two sheets: the front one whole, the back one drawn only where it shows.
  // Overlapping full rectangles would put a visible line through the front
  // sheet, since these are stroked outlines rather than filled shapes.
  copy: (
    <>
      <rect x="5.6" y="5.6" width="7.9" height="7.9" rx="1.5" />
      <path
        d="M10.4 5.6V4a1.5 1.5 0 00-1.5-1.5H4A1.5 1.5 0 002.5 4v4.9A1.5 1.5 0 004 10.4h1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
  check: (
    <>
      <path d="M3.2 8.4l3.2 3.2 6.4-7.2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

export function Icon({
  name,
  size = 13,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      className={className}
      aria-hidden
    >
      {PATHS[name]}
    </svg>
  );
}
