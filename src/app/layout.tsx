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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black">
        <SessionProvider>
          <Navbar />
          <main className="pt-16 pb-20">{children}</main>
          <Footer />
          <AudioPlayer />
        </SessionProvider>
      </body>
    </html>
  );
}
