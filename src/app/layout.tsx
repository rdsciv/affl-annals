import type { Metadata } from "next";
import { Big_Shoulders, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CommandPalette from "@/components/CommandPalette";
import "./globals.css";

const displayFont = Big_Shoulders({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-display",
});

const sansFont = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
});

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/affl-savant";

export const metadata: Metadata = {
  title: "AFFL Savant — Permanent Statistical Home of the AFFL",
  description: "Explore 2014–2025 AFFL league custody, rosters, matchups, and drafts joined with NFL play-by-play and advanced opportunity modeling.",
  icons: {
    icon: [
      { url: `${basePath}/favicon-32.png`, sizes: "32x32", type: "image/png" },
      { url: `${basePath}/favicon.png`, sizes: "any", type: "image/png" },
      { url: `${basePath}/favicon.ico` }
    ],
    shortcut: `${basePath}/favicon-32.png`,
    apple: `${basePath}/apple-icon.png`,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${displayFont.variable} ${sansFont.variable} ${monoFont.variable}`}>
      <head>
        <link rel="icon" type="image/png" sizes="32x32" href={`${basePath}/favicon-32.png`} />
        <link rel="icon" type="image/png" sizes="192x192" href={`${basePath}/icon.png`} />
        <link rel="apple-touch-icon" sizes="180x180" href={`${basePath}/apple-icon.png`} />
        <link rel="shortcut icon" href={`${basePath}/favicon.ico`} />
      </head>
      <body className="bg-canvas text-ink antialiased flex flex-col min-h-screen font-sans">
        <CommandPalette />
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
