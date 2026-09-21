import type { Metadata, Viewport } from "next";
import { Syne, Fraunces, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "block",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "block",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "block",
});

export const viewport: Viewport = {
  themeColor: "#0B0A09",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  /* Resolves relative OG and Twitter image paths. Vercel supplies the
     deployment host; the fallback keeps local builds warning-free. */
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "http://localhost:3000")
  ),
  title:
    "Murali Krishna Kolipaka · Senior Technical Writer · Information Architect · AI Builder",
  description:
    "Complexity has always existed. Clarity is a choice. Documentation for Google, Accenture, Cyient. 250+ countries. 99.64% quality. 5 tools built.",
  keywords: [
    "Technical Writer",
    "Information Architect",
    "API Documentation",
    "Docs-as-Code",
    "AI Automation",
    "Google Technical Writer",
    "Documentation Specialist",
    "Content Strategist",
    "DITA XML",
    "S1000D",
    "Hyderabad",
    "India",
  ],
  authors: [{ name: "Murali Krishna Kolipaka" }],
  creator: "Murali Krishna Kolipaka",
  openGraph: {
    type: "website",
    title: "Murali Krishna Kolipaka: Complexity into Clarity",
    description:
      "Senior Technical Writer. Information Architect. AI Builder. Filmmaker. Documentation at Google scale.",
    images: [
      {
        url: "/og/og-image.png",
        width: 1200,
        height: 630,
        alt: "Murali Krishna Kolipaka, Technical Writer and Information Architect",
      },
    ],
    siteName: "Murali Krishna Kolipaka Portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "Murali Krishna Kolipaka: Complexity into Clarity",
    description:
      "Senior Technical Writer. Information Architect. AI Builder. Filmmaker.",
    images: ["/og/og-image.png"],
    creator: "@murali_krishna",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} ${fraunces.variable} ${jetbrains.variable} font-fraunces`}
        style={{ background: "#0B0A09" }}
      >
        {children}
      </body>
    </html>
  );
}
