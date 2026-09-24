import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/utils";
import Link from "next/link";
import HomeBeats from "@/components/home/HomeBeats";

const GENRES = [
  { name: "Trap", color: "bg-red-500/10 hover:bg-red-500/20" },
  { name: "Hip-Hop", color: "bg-blue-500/10 hover:bg-blue-500/20" },
  { name: "R&B", color: "bg-purple-500/10 hover:bg-purple-500/20" },
  { name: "Pop", color: "bg-pink-500/10 hover:bg-pink-500/20" },
  { name: "Afrobeat", color: "bg-green-500/10 hover:bg-green-500/20" },
  { name: "Drill", color: "bg-slate-500/10 hover:bg-slate-500/20" },
  { name: "Lo-fi", color: "bg-indigo-500/10 hover:bg-indigo-500/20" },
  { name: "Bollywood", color: "bg-amber-500/10 hover:bg-amber-500/20" },
];

async function getBeats() {
  const trending = await prisma.beat.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { plays: "desc" },
    take: 8,
    include: {
      producer: { select: { displayName: true, username: true } },
      licensePlans: { select: { price: true, type: true }, where: { active: true } },
    },
  });

  const newReleases = await prisma.beat.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: {
      producer: { select: { displayName: true, username: true } },
      licensePlans: { select: { price: true, type: true }, where: { active: true } },
    },
  });

  const stats = {
    beats: await prisma.beat.count({ where: { status: "PUBLISHED" } }),
    producers: await prisma.user.count({ where: { role: "PRODUCER" } }),
  };

  return { trending, newReleases, stats };
}

export default async function HomePage() {
  const { trending, newReleases, stats } = await getBeats();

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-gradient-to-b from-zinc-900 to-black">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-24 pb-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
              Find your
              <br />
              next sound.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-zinc-400 max-w-md leading-relaxed">
              The marketplace for independent producers and artists.
              Discover, license, and download beats.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <Link
                href="/search"
                className="px-6 py-3 bg-white text-black rounded-full text-sm font-semibold hover:scale-[1.02] hover:bg-zinc-100"
              >
                Start exploring
              </Link>
              <Link
                href="/register?role=producer"
                className="px-6 py-3 bg-white/[0.07] hover:bg-white/[0.12] rounded-full text-sm font-medium text-zinc-300 hover:text-white"
              >
                Sell your beats
              </Link>
            </div>

            <div className="mt-8 flex items-center gap-5 text-[13px] text-zinc-500">
              <span>{formatNumber(stats.beats)} beats</span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span>{formatNumber(stats.producers)} producers</span>
              <span className="w-1 h-1 rounded-full bg-zinc-700" />
              <span>Free for artists</span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-10 pb-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight">Trending</h2>
          <Link href="/search?sort=trending" className="text-[13px] font-medium text-zinc-400 hover:text-white hover:underline">
            Show all
          </Link>
        </div>
        <HomeBeats beats={trending} />
      </section>

      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight">New releases</h2>
          <Link href="/search?sort=newest" className="text-[13px] font-medium text-zinc-400 hover:text-white hover:underline">
            Show all
          </Link>
        </div>
        <HomeBeats beats={newReleases} />
      </section>

      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <h2 className="text-xl font-bold tracking-tight mb-4">Browse by genre</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {GENRES.map((genre) => (
            <Link
              key={genre.name}
              href={`/search?genre=${genre.name}`}
              className={`rounded-lg px-5 py-4 ${genre.color} transition-colors`}
            >
              <span className="text-[14px] font-semibold">{genre.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-16">
        <div className="rounded-2xl bg-zinc-900 p-8 sm:p-12 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Start selling your beats</h2>
            <p className="mt-2 text-zinc-400 text-sm max-w-md leading-relaxed">
              Create your free storefront, upload beats, set your prices.
              10% commission, capped at 5,000 INR per sale.
            </p>
          </div>
          <Link
            href="/register?role=producer"
            className="px-6 py-3 bg-white text-black rounded-full text-sm font-semibold hover:scale-[1.02] hover:bg-zinc-100 shrink-0"
          >
            Get started free
          </Link>
        </div>
      </section>
    </div>
  );
}
