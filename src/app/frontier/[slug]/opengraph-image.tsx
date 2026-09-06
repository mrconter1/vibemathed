import { ImageResponse } from "next/og";
import { getFrontierBySlug } from "@/lib/data";
import { bestRow, competes, steps } from "@/lib/frontiers";
import { deTeX } from "@/components/TeX";
import { cardText, clip } from "@/lib/card-text";
import { SITE_URL } from "@/lib/site";

// Per-frontier share card.
//
// Same reason the entry card exists: without a file here the route has NO
// image, the root card does not cascade in practice, and X renders a
// summary_large_image with a grey placeholder - which is what every shared
// frontier link looked like from the day the feature launched until this
// landed.
//
// What a frontier link IS differs from an entry: not "which problem and was it
// proved" but "which quantity, where does it stand, and who moved it last".
// So the middle band carries the current best VALUE at display size, with the
// frontier's name above it and the attribution below. A reader who sees the
// card in a timeline should learn the number without opening the page.
//
// Satori-safe, the same three rules the entry card records: flexbox only,
// default font, the mark as a data-URI <img> rather than an inline <svg>.

const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#2a78d6"/><path d="M4 16 C 7 9, 11 9, 16 16 C 21 23, 25 23, 28 16" fill="none" stroke="#f3efe3" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const MARK_URI = `data:image/svg+xml;base64,${Buffer.from(MARK).toString("base64")}`;
const DOMAIN = SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");

export const alt = "VibeMathed frontier card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // A missing frontier, or a database that blinks, still has to produce an
  // image. A throw here is a 500, and a scraper caches that 500 for as long as
  // it likes - the grey placeholder this file exists to remove, made permanent
  // by a blip. The generic card is a much better failure.
  const f = await getFrontierBySlug(slug).catch(() => null);

  const name = f ? cardText(deTeX(f.shortName || f.name)) : "Frontiers";
  const title = name.length > 70 ? `${name.slice(0, 69)}…` : name;

  const best = f ? bestRow(f.rows, f.direction) : null;
  // The compact form when a curator wrote one: these are the same values the
  // landing strip shows, and the long form of a bound is a paragraph.
  const value = best
    ? cardText(deTeX(best.valueShortTex ?? best.valueTex))
    : "";
  // A bound like "≫ log X log_2 X / log_4 X" needs to step down or it runs off
  // the canvas; a bare number gets the full display size.
  const valueSize =
    value.length > 26 ? "68px" : value.length > 14 ? "96px" : "132px";

  // A nine-author list plus the model's name runs past the canvas. Cut on a
  // word boundary, not mid-name: slicing at a fixed length produced
  // "... Thorner and Xie (Axio," on the first render of this card.
  const attribution = best ? clip(cardText(deTeX(best.attribution)), 58) : "";

  const stepped = f ? steps(f.rows, f.direction) : [];
  const nSteps = stepped.filter((s) => s.isStep).length;
  const nAi = stepped.filter((s) => s.isStep && s.row.entry).length;
  const first = f
    ? f.rows
        .filter((r) => competes(r.status))
        .map((r) => r.date)
        .sort()[0]
    : undefined;

  const footer = [
    f?.fieldGroup,
    nSteps ? `${nSteps} steps, ${nAi} by AI` : null,
    first ? `since ${first.slice(0, 4)}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#f3efe3",
        color: "#201d17",
        padding: "72px 80px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- Satori
              renders a plain img; next/image does not exist in this runtime. */}
        <img src={MARK_URI} width={56} height={56} alt="" />
        <div style={{ display: "flex", fontSize: "32px", color: "#5c5648" }}>
          {DOMAIN}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "24px",
            color: "#a8622a",
            border: "2px solid #a8622a",
            borderRadius: "6px",
            padding: "3px 14px",
            letterSpacing: "2px",
          }}
        >
          FRONTIER
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
        <div
          style={{
            display: "flex",
            fontSize: "40px",
            color: "#5c5648",
            lineHeight: 1.15,
          }}
        >
          {title}
        </div>
        {value && (
          <div
            style={{
              display: "flex",
              fontSize: valueSize,
              fontWeight: 700,
              letterSpacing: "-2px",
              lineHeight: 1.05,
            }}
          >
            {value}
          </div>
        )}
        {best && (
          <div style={{ display: "flex", fontSize: "30px", color: "#5c5648" }}>
            {attribution} · {best.date}
          </div>
        )}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "28px",
          color: "#8a8271",
        }}
      >
        <div style={{ display: "flex" }}>
          {footer ||
            (!f
              ? "Quantities AI has moved"
              : f.direction === "min"
                ? "lower is better"
                : "higher is better")}
        </div>
        <div style={{ display: "flex" }}>
          <span style={{ color: "#201d17", fontWeight: 700 }}>Vibe</span>
          <span style={{ color: "#2a78d6", fontWeight: 700 }}>Mathed</span>
        </div>
      </div>
    </div>,
    { ...size },
  );
}
