import { ImageResponse } from "next/og";
import { SITE_URL } from "@/lib/site";

// Generated at build time (statically optimized). Kept Satori-safe: flexbox
// only and the default font.
//
// The mark is the site icon, byte for byte the same art as src/app/icon.svg,
// passed as a base64 data URI in an <img>. That is the route Satori actually
// supports; an inline <svg> element is what previously failed, and the square
// was left behind as a placeholder, so every X and Slack preview of this site
// has been showing a featureless blue block where the logo should be.
//
// If the icon art changes, change it here too. Two copies is the wrong shape
// but the alternative is reading a file at render time inside an edge
// function, which is worse.
const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#2a78d6"/><path d="M4 16 C 7 9, 11 9, 16 16 C 21 23, 25 23, 28 16" fill="none" stroke="#f3efe3" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const MARK_URI = `data:image/svg+xml;base64,${Buffer.from(MARK).toString("base64")}`;

/// The domain as a reader should see it. Was hardcoded to the vercel.app
/// preview host, so the card advertised a domain that is not the site.
const DOMAIN = SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");

export const alt = "VibeMathed - tracking math problems solved with AI models";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f3efe3",
          color: "#201d17",
          padding: "80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "22px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- Satori
              renders a plain img; next/image does not exist in this runtime. */}
          <img src={MARK_URI} width={64} height={64} alt="" />
          <div style={{ display: "flex", fontSize: "34px", color: "#5c5648" }}>
            {DOMAIN}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: "132px", fontWeight: 700, letterSpacing: "-5px" }}>
            <span style={{ color: "#201d17" }}>Vibe</span>
            <span style={{ color: "#2a78d6" }}>Mathed</span>
          </div>
          <div style={{ display: "flex", fontSize: "46px", color: "#5c5648", marginTop: "14px" }}>
            Tracking math problems solved with AI models.
          </div>
        </div>

        <div style={{ display: "flex", fontSize: "28px", color: "#8a8271" }}>
          Famous conjectures + Erdős problems · sourced, verified, notability-scored
        </div>
      </div>
    ),
    { ...size },
  );
}
