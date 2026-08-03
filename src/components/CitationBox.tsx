"use client";

// How to cite the site and its dataset. This exists because the dataset is
// CC BY 4.0: reuse is free but attribution is a licence condition, so the
// attribution should be one copy away rather than something each reader
// invents.
//
// Client, not server, for one reason: the access date. Citation styles want
// the date the reader retrieved the data, and a server-rendered date would be
// frozen at build time and quietly wrong for every visitor afterwards. It is
// filled in after mount, so the first paint shows the format placeholder
// rather than a date that disagrees with the server's HTML.

import { useEffect, useState, useSyncExternalStore } from "react";
import { SITE_URL } from "@/lib/site";

const AUTHOR = "VibeMathed contributors";
const TITLE = "VibeMathed: a record of mathematical problems solved with AI";
const YEAR = 2026;

type Format = { id: string; label: string; build: (accessed: Date | null) => string };

/// "3 August 2026" - the long form Harvard and most house styles want.
function longDate(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

/// "2026-08-03" for BibTeX's urldate, which is ISO by convention.
function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

// Read once per page load and then reused, so the snapshot below is
// referentially stable: returning a fresh Date on every render would spin
// useSyncExternalStore forever.
let firstSeen: Date | null = null;
const subscribe = () => () => {};
const clientSnapshot = () => (firstSeen ??= new Date());
// Server render has no access date, so the citation shows its placeholder and
// the markup matches what the client emits before hydration.
const serverSnapshot = () => null;

const FORMATS: Format[] = [
  {
    id: "harvard",
    label: "Harvard",
    build: (a) =>
      `${AUTHOR} (${YEAR}) ${TITLE}. Available at: ${SITE_URL} (Accessed: ${
        a ? longDate(a) : "DD Month YYYY"
      }).`,
  },
  {
    id: "apa",
    label: "APA 7",
    build: (a) =>
      `${AUTHOR}. (${YEAR}). ${TITLE} [Data set]. Retrieved ${
        a ? longDate(a) : "DD Month YYYY"
      }, from ${SITE_URL}`,
  },
  {
    id: "bibtex",
    label: "BibTeX",
    build: (a) =>
      [
        "@misc{vibemathed,",
        `  author       = {{${AUTHOR}}},`,
        `  title        = {{${TITLE}}},`,
        `  year         = {${YEAR}},`,
        `  howpublished = {\\url{${SITE_URL}}},`,
        `  urldate      = {${a ? isoDate(a) : "YYYY-MM-DD"}},`,
        "  note         = {Dataset available under CC BY 4.0}",
        "}",
      ].join("\n"),
  },
];

export function CitationBox() {
  const [active, setActive] = useState(FORMATS[0]!.id);
  const [copied, setCopied] = useState(false);

  // The access date, client-side only: see the note at the top about
  // build-time dates. useSyncExternalStore rather than an effect because it
  // has a first-class server snapshot, so there is no hydration mismatch and
  // no setState-in-effect.
  const accessed = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);

  // Clear the "Copied" confirmation on its own, and cancel the timer if the
  // reader switches format first so the label cannot flip back mid-read.
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);

  const format = FORMATS.find((f) => f.id === active) ?? FORMATS[0]!;
  const text = format.build(accessed);

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
    <section className="border-t border-[var(--hairline)] pt-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-serif text-base text-[var(--ink)]">How to cite</h2>
        <div
          role="group"
          aria-label="Citation format"
          className="inline-flex overflow-hidden rounded border border-[var(--hairline)] bg-[var(--paper)]"
        >
          {FORMATS.map((f, i) => (
            <button
              key={f.id}
              type="button"
              onClick={() => { setActive(f.id); setCopied(false); }}
              aria-pressed={f.id === active}
              className={`px-2.5 py-1 text-xs transition-colors ${
                i > 0 ? "border-l border-[var(--hairline)]" : ""
              } ${
                f.id === active
                  ? "bg-[color-mix(in_srgb,var(--accent-blue)_12%,transparent)] font-medium text-[var(--accent-blue)]"
                  : "text-[var(--ink-secondary)] hover:text-[var(--ink)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 rounded-md border border-[var(--hairline)] bg-[var(--paper)] p-3">
        <pre className="dialog-scroll overflow-x-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-[var(--ink-secondary)]">
          {text}
        </pre>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={copy}
          className="rounded-md border border-[var(--hairline)] bg-[var(--paper)] px-3 py-1.5 text-xs text-[var(--ink)] transition-colors hover:border-[var(--ink-muted)]"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <p className="text-xs text-[var(--ink-muted)]">
          Citing an individual entry? Cite its own source, listed on the entry
          page, and this record alongside it.
        </p>
      </div>
    </section>
  );
}
