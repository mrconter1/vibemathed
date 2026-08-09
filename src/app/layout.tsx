import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "katex/dist/katex.min.css";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ScrollGuard } from "@/components/ScrollGuard";
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
      // The script below writes `data-viewer` and two custom properties onto
      // this element before React ever runs, so the client's attributes
      // necessarily differ from the server's. That is the entire point, but
      // React sees it as a mismatch and says so. Scoped to this element only:
      // a mismatch anywhere else is still worth hearing about.
      suppressHydrationWarning
    >
      <head>
        {/* Feed autodiscovery as a plain tag rather than metadata.alternates.
            Page-level metadata REPLACES `alternates` wholesale rather than
            merging into it, so the home page setting its own canonical was
            silently dropping the feed link on the one page most likely to be
            handed to a reader. A tag here cannot be overridden. */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="VibeMathed"
          href="/feed.xml"
        />
        {/* Blocking, tiny, and deliberately before anything else paints.
            React cannot help here: the header's two variants both ship in the
            HTML, and until something says which visitor this is, neither can
            be shown. Waiting for hydration to decide is what left the account
            and notification buttons missing for the first few hundred
            milliseconds of every load.

            It only reads the snapshot the last fetch wrote. No attribute
            means "unknown", which the CSS treats as signed out - correct for
            a first visit and for anyone without JavaScript. A stale snapshot
            costs one wrong header until the fetch corrects it, which is the
            same trade the seeded state already makes. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var v=JSON.parse(localStorage.getItem("vibemathed:viewer")||"null");if(v&&v.signedIn){var d=document.documentElement,p=(v.pseudonym||"").trim();d.dataset.viewer="in";d.style.setProperty("--viewer-initial",JSON.stringify(p.charAt(0).toUpperCase()||"?"));}}catch(e){}`,
          }}
        />
        {/* Theme, before first paint. Every page here is statically generated,
            so the HTML cannot know the reader's choice: without this the page
            paints cream and snaps to dark once React hydrates, which is worse
            than having no dark mode at all.

            Runs synchronously in <head>, so the attribute is set before the
            body renders. A stored choice always wins; only its absence falls
            back to the system preference, so picking light on a dark-set OS
            sticks instead of being overridden on every load. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("vibemathed:theme");if(!t)t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t;}catch(e){}`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        {/* One provider for the whole app: it fetches who the viewer is and how
            they have voted once, and the header plus every vote control reads
            from it. */}
        <ViewerProvider>
          {/* Sets html[data-scrolling] while the page moves; see ScrollGuard. */}
          <ScrollGuard />
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
