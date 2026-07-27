import { ImageResponse } from "next/og";

// Generated at build time (statically optimized). Kept Satori-safe: flexbox
// only, colored text spans instead of an inline SVG glyph, default font.
export const alt = "VibeMathed - tracking math problems solved by AI models";
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
          <div
            style={{
              display: "flex",
              width: "64px",
              height: "64px",
              borderRadius: "14px",
              background: "#2a78d6",
            }}
          />
          <div style={{ display: "flex", fontSize: "34px", color: "#5c5648" }}>
            vibemathed.vercel.app
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: "132px", fontWeight: 700, letterSpacing: "-5px" }}>
            <span style={{ color: "#201d17" }}>Vibe</span>
            <span style={{ color: "#2a78d6" }}>Mathed</span>
          </div>
          <div style={{ display: "flex", fontSize: "46px", color: "#5c5648", marginTop: "14px" }}>
            Tracking math problems solved by AI models.
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
