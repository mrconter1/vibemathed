import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VibeMathed",
    short_name: "VibeMathed",
    description: "Tracking math problems solved by AI models.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3efe3",
    theme_color: "#2a78d6",
    icons: [
      { src: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
