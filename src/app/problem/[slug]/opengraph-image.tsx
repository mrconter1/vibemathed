import { ImageResponse } from "next/og";
import { getProblemBySlug } from "@/lib/data";
import { RESOLUTION, SOLVE_TYPE } from "@/lib/display";
import { deTeX } from "@/components/TeX";
import { SITE_URL } from "@/lib/site";

// Per-entry share card. Without this file the entry pages had NO image at
// all: the root opengraph-image does not cascade here in practice (production
// HTML carried no og:image on any /problem/* page), and X renders a
// summary_large_image card with a grey placeholder where the missing image
// should be - which is exactly how the site looked every time somebody shared
// an entry, the one moment a share card matters.
//
// Same design language as the root card: cream paper, the wave mark, the
// domain up top. What changes is the middle, which now says what the link IS -
// the entry's name, its result, and how long the problem stood open.
//
// Satori-safe: flexbox only, default font, the mark as a data-URI <img>
// (an inline <svg> is what silently failed in the root card's first version).

const MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#2a78d6"/><path d="M4 16 C 7 9, 11 9, 16 16 C 21 23, 25 23, 28 16" fill="none" stroke="#f3efe3" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const MARK_URI = `data:image/svg+xml;base64,${Buffer.from(MARK).toString("base64")}`;
const DOMAIN = SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");

export const alt = "VibeMathed entry card";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// This route stays dynamic (`ƒ` in the build output) and two obvious ways to
// change that do not work, recorded so the next person does not spend the
// afternoon rediscovering it:
//
//   `use cache` on the component fails the build outright - the return value is
//   an ImageResponse, a class instance, and the cache boundary only carries
//   plain objects ("Only plain objects, and a few built-ins, can be passed...").
//
//   `generateStaticParams`, mirroring the one on the page route, changes
//   nothing: the route still reports `ƒ` and no images are prerendered, because
//   awaiting `params` is a request-time read under Cache Components.
//
// The data it renders from IS cached (getProblemBySlug is a `use cache` scope),
// so what repeats per request is the satori/resvg encode, not the query. That
// showed up as $3.78 of Fluid Active CPU on the August invoice - real, but two
// orders below the cache-churn lines, which is why this is left alone rather
// than worked around.

const RESULT_COLOR: Record<string, string> = {
  proved: "#2e7d32",
  disproved: "#c62828",
  independent: "#6a4fa3",
};

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = await getProblemBySlug(slug);

  // A missing entry still has to produce an image: the route exists whenever
  // the page does, and a thrown error here becomes the grey placeholder this
  // file exists to remove.
  const name = p ? deTeX(p.name) : "VibeMathed";
  // The title has the whole middle band; past ~120 characters Satori starts
  // pushing the footer off the canvas, and a clipped name with an ellipsis
  // reads better than a vanished byline.
  const title = name.length > 120 ? `${name.slice(0, 119)}…` : name;
  // Between 60 and 120 characters the font has to step down or long names
  // wrap to four lines and collide with the header.
  const titleSize = title.length > 60 ? "54px" : "72px";

  const result = p ? SOLVE_TYPE[p.solveType]?.label ?? "" : "";
  const resultColor = p ? RESULT_COLOR[p.solveType] ?? "#5c5648" : "#5c5648";
  const underReview = p?.resolution === "candidate";
  const partial = p?.resolution === "partial";
  const years =
    p?.yearPosed && p.solveDate ? Number(p.solveDate.slice(0, 4)) - p.yearPosed : 0;
  // Below two years the line is noise ("open 0 years" for a conjecture posed
  // and felled in the same year), so it only renders when it says something.
  const open = years >= 2 ? `open ${years} years` : null;
  const line = [p?.field ?? p?.fieldGroup, open].filter(Boolean).join(" · ");

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

        <div style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
          <div
            style={{
              display: "flex",
              fontSize: titleSize,
              fontWeight: 700,
              letterSpacing: "-1px",
              lineHeight: 1.15,
            }}
          >
            {title}
          </div>
          {result && (
            <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
              <div
                style={{
                  display: "flex",
                  fontSize: "36px",
                  fontWeight: 700,
                  color: resultColor,
                }}
              >
                {partial ? `${result} · partial` : result}
              </div>
              {underReview && (
                <div
                  style={{
                    display: "flex",
                    fontSize: "26px",
                    color: "#8a6d1a",
                    background: "#f0e3bd",
                    padding: "6px 18px",
                    borderRadius: "999px",
                  }}
                >
                  {RESOLUTION.candidate.pill}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "28px", color: "#8a8271" }}>
          <div style={{ display: "flex" }}>{line || "Math problems solved with AI"}</div>
          <div style={{ display: "flex" }}>
            <span style={{ color: "#201d17", fontWeight: 700 }}>Vibe</span>
            <span style={{ color: "#2a78d6", fontWeight: 700 }}>Mathed</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
