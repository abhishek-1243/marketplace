import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import AudioPlayer from "@/components/layout/AudioPlayer";
import SessionProvider from "@/components/providers/SessionProvider";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: { default: "Soundfuel", template: "%s · Soundfuel" },
  description: "Discover original Indian beats, instruments and sound packs from independent producers. Explore the Soundfuel catalog preview.",
  openGraph: { title: "Soundfuel", description: "Indian roots. Original beats and sounds.", type: "website" },
  icons: {
    icon: [
      { url: "/icons/soundfuel-bars-v3.svg", type: "image/svg+xml" },
      { url: "/icons/soundfuel-bars-32-v3.png", type: "image/png", sizes: "32x32" },
    ],
    shortcut: "/icons/soundfuel-bars-v3.svg",
    apple: [{ url: "/icons/soundfuel-apple-180-v2.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head><link rel="preload" href="/fonts/Sora-Variable.ttf" as="font" type="font/ttf" crossOrigin="anonymous" /></head>
      <body className="min-h-screen bg-canvas">
        <SessionProvider>
          <Navbar />
          <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-xl focus:bg-accent-500 focus:px-5 focus:py-3 focus:text-white">Skip to content</a>
          <main id="main-content" tabIndex={-1} className="min-h-[70svh] pb-32 pt-20 outline-none">{children}</main>
          <Footer />
          <AudioPlayer />
        </SessionProvider>
      </body>
    </html>
  );
}
