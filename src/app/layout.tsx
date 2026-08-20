import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "katex/dist/katex.min.css";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import { SYSTEM_DARK, THEME_COLOR, THEME_KEY } from "@/lib/theme";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { ScrollGuard } from "@/components/ScrollGuard";
import { ThemeSync } from "@/components/ThemeSync";
import { ViewerProvider } from "@/components/ViewerProvider";

// What Google shows. Title: brand + the plain-language topic, under 60 chars
// so it never gets truncated or rewritten. Description: under 160 chars so
// the whole sentence survives in the snippet.
const TITLE = "VibeMathed - Math Problems Solved by AI";
const DESCRIPTION =
  "A community-curated record of math problems no human had solved before, proved or disproved with AI in the loop - with checkable sources and verification labels.";

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

// A prefers-color-scheme pair, because the OS setting is now the default and
// these tags are the only thing that can be right before any script runs. A
// single light value used to be correct, back when light was forced on a first
// visit; it would now flash a cream address bar above a dark page on every
// cold load for every dark-set phone.
//
// A pinned choice still wins: the boot script strips `media` from both tags
// and writes the resolved colour, so this pair only decides the cold-load case
// it is there for.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLOR.light },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLOR.dark },
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
            body renders.

            The OS preference is the default. This used to force light on a
            first visit, on the reasoning that a cream paper surface is what
            the site is meant to look like and a dark-set laptop should not
            decide otherwise. That reasoning loses: someone who has set their
            machine to dark has already made the choice once, for everything,
            and a site that ignores it is not showing them its design, it is
            showing them a bright rectangle at night.

            So: a stored choice wins, and without one the page follows the
            system. Anything other than the two known values reads as no
            choice, so a corrupted or hand-edited key falls back to the OS
            rather than leaving the page unstyled. ThemeSync keeps following
            the OS after load, for as long as nothing is pinned. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              `try{var s=localStorage.getItem(${JSON.stringify(THEME_KEY)});` +
              `var t=(s==="dark"||s==="light")?s:` +
              `(matchMedia(${JSON.stringify(SYSTEM_DARK)}).matches?"dark":"light");` +
              `document.documentElement.dataset.theme=t;` +
              // Chrome colour too, for whichever tags have been emitted by
              // now. Metadata order relative to this script is not
              // guaranteed, so ThemeSync repeats this on mount and the two
              // together cover both orders. `media` comes off because from
              // here on the resolved theme is the authority, not the OS.
              `var m=document.querySelectorAll('meta[name="theme-color"]');` +
              `for(var i=0;i<m.length;i++){m[i].removeAttribute("media");` +
              `m[i].setAttribute("content",t==="dark"?${JSON.stringify(THEME_COLOR.dark)}:${JSON.stringify(THEME_COLOR.light)});}` +
              `}catch(e){}`,
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
          {/* Follows the OS theme after load, while nothing is pinned. */}
          <ThemeSync />
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
