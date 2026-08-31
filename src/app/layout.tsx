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

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/affl-annals";

export const metadata: Metadata = {
  title: "AFFL Annals — The Permanent Statistical Archive of the AFFL (2014–2025)",
  description: "The definitive chronicle of the AFFL. 12 competition eras of franchise custody, auction drafts, head-to-head lore, and empirical NFL analytics.",
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
