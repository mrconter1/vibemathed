import { ImageResponse } from "next/og";
import { getFrontiers } from "@/lib/data";
import { steps } from "@/lib/frontiers";
import { SITE_URL } from "@/lib/site";

// The frontiers index card. Same reason as the per-frontier one: the root
// card does not cascade, so without this file the section's own link shares as
// a grey placeholder - and the index is the link an announcement uses.
//
// It counts rather than lists. Naming three frontiers would date the card the
// moment a fourth interesting one lands, and the count plus the sentence is
// what a reader needs to decide whether to click.
//
// Satori-safe: flexbox only, default font, the mark as a data-URI <img>.

const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#2a78d6"/><path d="M4 16 C 7 9, 11 9, 16 16 C 21 23, 25 23, 28 16" fill="none" stroke="#f3efe3" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const MARK_URI = `data:image/svg+xml;base64,${Buffer.from(MARK).toString("base64")}`;
const DOMAIN = SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");

export const alt = "VibeMathed frontiers: quantities AI has moved";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  // Never throw: a 500 here is a grey placeholder that a scraper may cache for
  // days, which is the exact failure this file exists to remove. An empty list
  // just drops the count line.
  const frontiers = await getFrontiers().catch(() => []);
  const nAi = frontiers.reduce(
    (n, f) =>
      n +
      steps(f.rows, f.direction).filter((s) => s.isStep && s.row.entry).length,
    0,
  );

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
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
        <div
          style={{
            display: "flex",
            fontSize: "112px",
            fontWeight: 700,
            letterSpacing: "-4px",
          }}
        >
          Frontiers
        </div>
        <div
          style={{
            display: "flex",
            fontSize: "40px",
            color: "#5c5648",
            lineHeight: 1.25,
          }}
        >
          Quantities mathematicians have pushed for decades, and where AI has
          moved them.
        </div>
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
          {frontiers.length
            ? `${frontiers.length} tracked${nAi ? ` · ${nAi} steps by AI` : ""}`
            : "A community-curated catalog"}
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
