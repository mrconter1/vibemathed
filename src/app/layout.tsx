import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { SITE_URL } from "@/lib/site";

const TITLE = "VibeMathed - tracking math problems solved by AI models";
const DESCRIPTION =
  "A website tracking mathematical problems solved by AI models - from famous conjectures to the Erdős problems at erdosproblems.com - each with a checkable source, a verification label, and a notability score.";

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
  alternates: { canonical: "/" },
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
        {children}
        <Analytics />
      </body>
    </html>
  );
}
