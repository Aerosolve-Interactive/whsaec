import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Instrument_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

// Three faces, each with a job.
//
// Bricolage Grotesque carries headlines: a variable grotesque with real
// character in its terminals, so the display type has personality without
// resorting to a novelty face. Instrument Sans sets body copy and stays
// deliberately quiet underneath it. IBM Plex Mono carries every number and
// timestamp, and brings genuine engineering provenance to a page about
// aerospace.
//
// Geist and Inter are both avoided on purpose. They are the two defaults
// every generated site ships with, which makes them a tell rather than a
// choice.
const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const sans = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-mono-data",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const SITE_URL = "https://www.aeroserveprogram.com";
const SITE_NAME = "AeroServe Youth Program";
const SITE_DESCRIPTION =
  "A student-led nonprofit that designs, builds, and donates aerospace engineering projects to kids, turning STEM skills into community impact.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Engineering Service, Building Impact`,
    template: `%s - ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "AeroServe",
    "youth program",
    "nonprofit",
    "STEM",
    "aerospace engineering",
    "volunteer hours",
    "student led",
    "Frisco TX",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Engineering Service, Building Impact`,
    description: SITE_DESCRIPTION,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Engineering Service, Building Impact`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: "#fbfbfd",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${sans.variable} ${mono.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  );
}
