"use client";

// How to cite the site and its dataset. This exists because attribution is a
// licence condition on the part of the catalog VibeMathed wrote: reuse of the
// classifications, scores and notes is free under CC BY 4.0 provided the
// source is named, so the attribution should be one copy away rather than
// something each reader invents. The `note` field points at /data-license,
// because quoted material from the papers is not covered by that licence.
//
// BibTeX only. This started with Harvard and APA alongside it, which was
// padding: the readership writes LaTeX, and anyone who needs another style
// can read author, title, year and URL straight off these fields.
//
// Client, not server, for one reason: `urldate`. It says which snapshot of a
// living catalogue the citation refers to, which matters when entries are
// added most days. A server-rendered date would freeze at build time and be
// quietly wrong for every visitor after it.

import { useEffect, useState, useSyncExternalStore } from "react";
import { SITE_URL } from "@/lib/site";
import { Icon } from "@/components/Icons";

// Read once per page load and then reused, so the snapshot below is
// referentially stable: returning a fresh Date on every render would spin
// useSyncExternalStore forever.
let firstSeen: Date | null = null;
const subscribe = () => () => {};
const clientSnapshot = () => (firstSeen ??= new Date());
// Server render has no access date, so the citation shows its placeholder and
// the markup matches what the client emits before hydration.
const serverSnapshot = () => null;

function bibtex(accessed: Date | null): string {
  return [
    "@misc{vibemathed,",
    "  author       = {{VibeMathed contributors}},",
    // A comma rather than a colon, so the About page's no-colon rule holds
    // for the one piece of text on it a reader copies out.
    "  title        = {{VibeMathed, a record of mathematical problems solved with AI}},",
    "  year         = {2026},",
    `  howpublished = {\\url{${SITE_URL}}},`,
    `  urldate      = {${accessed ? accessed.toISOString().slice(0, 10) : "YYYY-MM-DD"}},`,
    `  note         = {VibeMathed-authored content CC BY 4.0; see ${SITE_URL}/data-license}`,
    "}",
  ].join("\n");
}

export function CitationBox({
  divider = true,
  heading = true,
  compact = false,
}: {
  /// The hairline above the heading. On the original About page it separated
  /// the citation from the prose above it. Layouts that already draw their
  /// own edge around this block, or that put it in a tile of its own, want it
  /// off rather than doubled.
  divider?: boolean;
  /// The "How to cite" line. Off when the surrounding layout already says it,
  /// so a disclosure does not label the same block twice.
  heading?: boolean;
  /// Tighter leading and a shorter trailing note, for the case where this is
  /// revealed by a disclosure and every pixel it occupies is a pixel the page
  /// moves when it opens.
  compact?: boolean;
} = {}) {
  const [copied, setCopied] = useState(false);
  const accessed = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const text = bibtex(accessed);

  // Clear the confirmation on its own. Short, because the tick is only
  // telling you something already happened. Two seconds left it sitting there
  // long after the point had landed, which reads as a state rather than an
  // acknowledgement.
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 900);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Clipboard access can be refused (permissions, insecure origin). The
      // text is selectable, so failing quietly beats an alert.
    }
  }

  return (
    <section className={divider ? "border-t border-[var(--hairline)] pt-5" : ""}>
      {heading && (
        <h2 className="font-serif text-base text-[var(--ink)]">How to cite</h2>
      )}

      <div
        className={`relative rounded-md border border-[var(--hairline)] bg-[var(--paper)] ${
          compact ? "mt-0 p-2.5" : "mt-3 p-3"
        }`}
      >
        {/* Tucked into the corner of the block it acts on, which is where a
            reader looks for it on any code sample. Icon only: the label is
            carried by aria-label and title, and the confirmation is a tick
            rather than the word "Copied", so the button never changes width
            and the block never reflows under it. */}
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "BibTeX copied to clipboard" : "Copy BibTeX"}
          title={copied ? "Copied" : "Copy"}
          // focus-visible, not focus. A mouse click leaves a button focused,
          // so a plain focus ring stayed lit after copying and read as "this
          // button is still selected". focus-visible shows the ring for
          // keyboard navigation, which is who it is for, and stays quiet for
          // the pointer.
          className={`absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded border transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent-blue)] ${
            // Both states carry a background. The block below scrolls
            // sideways now, so a transparent button would have code sliding
            // visibly underneath it.
            copied
              ? "border-[var(--accent-blue)] bg-[var(--paper-raised)] text-[var(--accent-blue)]"
              : "border-[var(--hairline)] bg-[var(--paper-raised)] text-[var(--ink-muted)] hover:border-[var(--ink-muted)] hover:text-[var(--ink)]"
          }`}
        >
          <Icon name={copied ? "check" : "copy"} size={14} />
        </button>
        {/* Scrolls sideways rather than wrapping. BibTeX is code, and on a
            phone `whitespace-pre-wrap` broke every long field across two or
            three ragged lines, which is worse than unreadable: it looks like
            the citation itself is malformed. A reader copies this with the
            button anyway and never retypes it, so the line that runs off the
            edge costs nothing. Wide content scrolling inside its own
            container is what the rest of the site does too.

            pr-12 keeps the first lines clear of the copy button. */}
        <pre
          className={`dialog-scroll overflow-x-auto whitespace-pre pr-12 font-mono text-[11px] text-[var(--ink-secondary)] ${
            compact ? "leading-snug" : "leading-relaxed"
          }`}
        >
          {text}
        </pre>
      </div>

      {/* Two lines of advice that only matter to someone already reading
          the citation, so in the compact case they are trimmed to one. */}
      <p className="mt-2 text-xs leading-snug text-[var(--ink-muted)]">
        {compact ? (
          <>Citing one entry? Cite its own source alongside this record.</>
        ) : (
          <>
            Citing an individual entry? Cite its own source, listed on the entry
            page, and this record alongside it.
          </>
        )}
      </p>
    </section>
  );
}
