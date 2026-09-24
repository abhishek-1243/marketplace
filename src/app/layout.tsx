import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import AudioPlayer from "@/components/layout/AudioPlayer";
import SessionProvider from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "Soundfuel",
  description: "The marketplace connecting independent producers with artists. Discover, license, and download beats.",
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
          <AudioPlayer />
        </SessionProvider>
      </body>
    </html>
  );
}
