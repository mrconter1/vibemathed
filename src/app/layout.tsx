import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "katex/dist/katex.min.css";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ViewerProvider } from "@/components/ViewerProvider";

// What Google shows. Title: brand + the plain-language topic, under 60 chars
// so it never gets truncated or rewritten. Description: under 160 chars so
// the whole sentence survives in the snippet.
const TITLE = "VibeMathed - Math Problems Solved by AI";
const DESCRIPTION =
  "A community-curated record of math problems no human had solved before, proved or disproved by AI - with checkable sources and verification labels.";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s · VibeMathed",
  },
  description: DESCRIPTION,
  applicationName: "VibeMathed",
  keywords: [
    "VibeMathed",
    "AI mathematics",
    "Erdős problems",
    "math solved by AI",
    "AI-assisted proofs",
    "conjectures solved by AI",
    "automated theorem proving",
    "Lean-verified proofs",
    "open problems in mathematics",
    "vibe mathing",
    "GPT math",
    "AI math research",
  ],
  authors: [{ name: "VibeMathed" }],
  creator: "VibeMathed",
  publisher: "VibeMathed",
  category: "science",
  // No layout-level canonical: metadata here is inherited by EVERY page, so a
  // canonical of "/" would claim all pages without their own are copies of the
  // home page. Each indexable page sets its own (home in app/page.tsx).
  openGraph: {
    type: "website",
    siteName: "VibeMathed",
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3efe3" },
    { media: "(prefers-color-scheme: dark)", color: "#201d17" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* One provider for the whole app: it fetches who the viewer is and how
            they have voted once, and the header plus every vote control reads
            from it. */}
        <ViewerProvider>
          <SiteHeader />
          {/* A flex column so a page's <main> can flex-1 itself and center its
              content in the leftover viewport height (the About page does). */}
          <div className="flex flex-1 flex-col">{children}</div>
          <SiteFooter />
        </ViewerProvider>
        <Analytics />
      </body>
    </html>
  );
}
