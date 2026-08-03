"use client";

// How to cite the site and its dataset. This exists because the dataset is
// CC BY 4.0: reuse is free but attribution is a licence condition, so the
// attribution should be one copy away rather than something each reader
// invents.
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
    "  title        = {{VibeMathed: a record of mathematical problems solved with AI}},",
    "  year         = {2026},",
    `  howpublished = {\\url{${SITE_URL}}},`,
    `  urldate      = {${accessed ? accessed.toISOString().slice(0, 10) : "YYYY-MM-DD"}},`,
    "  note         = {Dataset available under CC BY 4.0}",
    "}",
  ].join("\n");
}

export function CitationBox() {
  const [copied, setCopied] = useState(false);
  const accessed = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  const text = bibtex(accessed);

  // Clear the confirmation on its own.
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
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
    <section className="border-t border-[var(--hairline)] pt-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-serif text-base text-[var(--ink)]">How to cite</h2>
        <button
          type="button"
          onClick={copy}
          className="rounded-md border border-[var(--hairline)] bg-[var(--paper)] px-3 py-1.5 text-xs text-[var(--ink)] transition-colors hover:border-[var(--ink-muted)]"
        >
          {copied ? "Copied" : "Copy BibTeX"}
        </button>
      </div>

      <div className="mt-3 rounded-md border border-[var(--hairline)] bg-[var(--paper)] p-3">
        <pre className="dialog-scroll overflow-x-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-[var(--ink-secondary)]">
          {text}
        </pre>
      </div>

      <p className="mt-2 text-xs text-[var(--ink-muted)]">
        Citing an individual entry? Cite its own source, listed on the entry
        page, and this record alongside it.
      </p>
    </section>
  );
}
