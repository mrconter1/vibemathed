"use client";

// The hover layer for the frontier chart.
//
// Deliberately NOT part of the SVG. The chart itself stays a server component -
// crawlers, print and no-JS readers get the same picture they got before, with
// the <title> tooltips still working. This file adds a transparent overlay on
// top of it.
//
// That split is possible because the chart's viewBox is a fixed 640x300 drawn
// at `w-full h-auto`, so a point at (cx, cy) in chart units sits at exactly
// (cx/640, cy/300) of the rendered box, whatever width it ends up at. The
// overlay positions its hit targets in percentages and the two stay registered
// at every breakpoint, with no measuring and no resize observer.
//
// Math in the card is pre-rendered to HTML on the server (texToHtml) and passed
// in as a string, so KaTeX never reaches the browser bundle.

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface ChartPoint {
  id: string;
  /// Position within the chart box, 0-100.
  xPct: number;
  yPct: number;
  /// A catalog entry, as opposed to a row of human history.
  ai: boolean;
  label: string;
  date: string;
  valueHtml: string;
  attribution: string;
  model: string | null;
  verificationLabel: string | null;
  verificationColor: string | null;
  statusLabel: string | null;
  note: string | null;
  href: string | null;
  sourceUrl: string | null;
}

export function FrontierChartPoints({
  points,
  compact = false,
}: {
  points: ChartPoint[];
  /// Thumbnail mode, for the 160x40 sparklines on the frontiers landing page.
  /// Smaller hit targets, and the card is anchored to the thumbnail's top-right
  /// rather than to the point: the thumbnail is only 160px wide and sits at the
  /// right end of its row, so a card centred on a point would hang off the side
  /// of the page. Growing up and to the left from a fixed corner cannot.
  compact?: boolean;
}) {
  const [active, setActive] = useState<string | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const hit = compact ? 18 : 26;

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    // Any tap outside dismisses, which is the only way out on a touch screen.
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "touch") return;
      if (wrap.current && !wrap.current.contains(e.target as Node))
        setActive(null);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [active]);

  const shown = points.find((p) => p.id === active) ?? null;

  return (
    <div ref={wrap} className="pointer-events-none absolute inset-0">
      {points.map((p) => (
        <button
          key={p.id}
          type="button"
          aria-label={p.label}
          aria-expanded={active === p.id}
          className="pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-blue)]"
          style={{
            left: `${p.xPct}%`,
            top: `${p.yPct}%`,
            width: hit,
            height: hit,
          }}
          onPointerEnter={(e) => {
            // A tap fires pointerenter and then click. Letting the enter open
            // the card would make the click immediately close it again, so on
            // touch only the click counts.
            if (e.pointerType !== "touch") setActive(p.id);
          }}
          onPointerLeave={(e) => {
            if (e.pointerType !== "touch")
              setActive((cur) => (cur === p.id ? null : cur));
          }}
          onFocus={() => setActive(p.id)}
          onBlur={() => setActive((cur) => (cur === p.id ? null : cur))}
          onClick={() => setActive((cur) => (cur === p.id ? null : p.id))}
        >
          {/* The halo around the active point. The dot itself is drawn by the
              SVG underneath. */}
          <span
            aria-hidden
            className="absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full border transition-opacity duration-100"
            style={{
              width: compact ? 11 : p.ai ? 20 : 15,
              height: compact ? 11 : p.ai ? 20 : 15,
              borderColor: p.ai ? "var(--accent-orange)" : "var(--ink-muted)",
              opacity: active === p.id ? 0.55 : 0,
            }}
          />
        </button>
      ))}

      {shown && <Card p={shown} compact={compact} />}
    </div>
  );
}

function Card({ p, compact }: { p: ChartPoint; compact: boolean }) {
  // Anchor the card so it cannot leave the chart box: pinned left near the left
  // edge, pinned right near the right edge, centred in between. Vertically it
  // sits above the point unless the point is high up, which is where the newest
  // rows sit on a "max" frontier.
  const anchorX = p.xPct < 28 ? "left" : p.xPct > 72 ? "right" : "center";
  const below = p.yPct < 48;
  const tx =
    anchorX === "center"
      ? "-50%"
      : anchorX === "left"
        ? "-14px"
        : "calc(-100% + 14px)";
  const ty = below ? "14px" : "calc(-100% - 14px)";

  return (
    <div
      role="tooltip"
      className={`pointer-events-none absolute z-10 rounded-md border border-[var(--hairline)] bg-[var(--paper-raised)] p-3 text-xs leading-snug shadow-lg ${
        compact
          ? "bottom-full right-0 mb-2 w-72 max-w-[calc(100vw-2.5rem)]"
          : "w-[min(19rem,90%)]"
      }`}
      style={
        compact
          ? undefined
          : {
              left: `${p.xPct}%`,
              top: `${p.yPct}%`,
              transform: `translate(${tx}, ${ty})`,
            }
      }
    >
      <div className="flex items-baseline justify-between gap-3">
        <span className="tabular-nums text-[var(--ink-muted)]">{p.date}</span>
        {p.statusLabel && (
          <span className="shrink-0 text-[10px] uppercase tracking-wide text-[var(--ink-muted)]">
            {p.statusLabel}
          </span>
        )}
      </div>

      <div
        className="mt-1 overflow-x-auto text-sm text-[var(--ink)]"
        dangerouslySetInnerHTML={{ __html: p.valueHtml }}
      />

      <div className="mt-1.5 text-[var(--ink-secondary)]">{p.attribution}</div>

      {p.model && (
        <div className="mt-0.5 text-[var(--ink-secondary)]">{p.model}</div>
      )}

      {p.verificationLabel && (
        <div className="mt-1 flex items-center gap-1.5">
          <span
            aria-hidden
            className="inline-block size-1.5 shrink-0 rounded-full"
            style={{ background: p.verificationColor ?? "var(--ink-muted)" }}
          />
          <span className="text-[var(--ink-secondary)]">
            {p.verificationLabel}
          </span>
        </div>
      )}

      {p.note && <p className="mt-1.5 text-[var(--ink-muted)]">{p.note}</p>}

      {/* The card keeps pointer-events off so it can never intercept the hover
          that is holding it open. The one control opts back in. */}
      {p.href ? (
        <Link
          href={p.href}
          className="pointer-events-auto mt-2 inline-block text-[var(--accent-blue)] hover:underline"
        >
          Open entry
        </Link>
      ) : p.sourceUrl ? (
        <a
          href={p.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="pointer-events-auto mt-2 inline-block text-[var(--accent-blue)] hover:underline"
        >
          Source
        </a>
      ) : null}
    </div>
  );
}
