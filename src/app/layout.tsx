import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CommandPalette from "@/components/CommandPalette";
import "./globals.css";

export const metadata: Metadata = {
  title: "AFFL Savant — Permanent Statistical Home of the AFFL",
  description: "Explore 2014–2025 AFFL league custody, rosters, matchups, and drafts joined with NFL play-by-play and advanced opportunity modeling.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-canvas text-ink antialiased flex flex-col min-h-screen">
        <CommandPalette />
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
