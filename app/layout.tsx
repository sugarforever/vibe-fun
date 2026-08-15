import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SITE } from "@/lib/site";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jbmono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Play Games in ChatGPT & Claude · MCP Apps`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    "MCP",
    "Model Context Protocol",
    "MCP Apps",
    "SEP-1865",
    "AI games",
    "games for AI",
    "play games in ChatGPT",
    "ChatGPT apps",
    "ChatGPT games",
    "Claude",
    "MCP games",
    "AI game portal",
    "2048",
    "Sudoku",
    "interactive apps",
  ],
  authors: [{ name: SITE.name }],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
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
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#fbfbf9",
  colorScheme: "light",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE.url}/#organization`,
      name: SITE.name,
      url: SITE.url,
      logo: `${SITE.url}/icon.svg`,
      description: SITE.description,
      sameAs: [SITE.githubUrl],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      name: SITE.name,
      url: SITE.url,
      description: SITE.description,
      publisher: { "@id": `${SITE.url}/#organization` },
    },
    {
      "@type": "SoftwareApplication",
      name: SITE.name,
      applicationCategory: "GameApplication",
      operatingSystem: "Any (MCP host)",
      description: SITE.description,
      publisher: { "@id": `${SITE.url}/#organization` },
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <head>
        <meta
          name="msvalidate.01"
          content="9F91E1EBEEA86E712FC9DCC3B7A7A053"
        />
        <script
          defer
          src="https://vibeloft.ai/telemetry/v1.js"
          data-vl-product-id="82e25098-2d86-4381-9aff-839f8abad370"
          data-vl-auth-key="vl_web.zlAqBwscSSXthxDIeyKLifSIiLehe1W6OltBEFu8bLY"
        />
      </head>
      <body>
        <Nav />
        {children}
        <Footer />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Analytics />
      </body>
    </html>
  );
}
