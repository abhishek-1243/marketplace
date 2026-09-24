import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SearchResults from "./SearchResults";

const GENRES = ["All", "Trap", "Hip-Hop", "R&B", "Pop", "Afrobeat", "Drill", "Lo-fi", "Bollywood"];

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; genre?: string; sort?: string };
}) {
  const where: any = { status: "PUBLISHED" };
  if (searchParams.genre && searchParams.genre !== "All") {
    where.genre = searchParams.genre;
  }
  if (searchParams.q) {
    where.OR = [
      { title: { contains: searchParams.q } },
      { genre: { contains: searchParams.q } },
      { tags: { contains: searchParams.q } },
    ];
  }

  const orderBy: any =
    searchParams.sort === "newest" ? { createdAt: "desc" } :
    searchParams.sort === "price_low" ? {} :
    { plays: "desc" };

  const beats = await prisma.beat.findMany({
    where,
    orderBy,
    take: 50,
    include: {
      producer: { select: { displayName: true, username: true } },
      licensePlans: { where: { active: true }, select: { price: true, type: true } },
    },
  });

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          {searchParams.q ? `Results for "${searchParams.q}"` : searchParams.genre || "Explore"}
        </h1>
        <p className="text-[13px] text-zinc-500 mt-1">{beats.length} beats found</p>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-5">
        {GENRES.map((genre) => (
          <Link
            key={genre}
            href={`/search?genre=${genre === "All" ? "" : genre}${searchParams.q ? `&q=${searchParams.q}` : ""}${searchParams.sort ? `&sort=${searchParams.sort}` : ""}`}
            className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
              (searchParams.genre === genre || (!searchParams.genre && genre === "All"))
                ? "bg-white text-black"
                : "bg-white/[0.06] text-zinc-400 hover:bg-white/[0.1] hover:text-white"
            }`}
          >
            {genre}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-1.5 mb-6">
        <span className="text-[12px] text-zinc-500 mr-1">Sort by</span>
        {[
          { label: "Trending", value: "trending" },
          { label: "Newest", value: "newest" },
          { label: "Price", value: "price_low" },
        ].map((s) => (
          <Link
            key={s.value}
            href={`/search?${searchParams.genre ? `genre=${searchParams.genre}&` : ""}${searchParams.q ? `q=${searchParams.q}&` : ""}sort=${s.value}`}
            className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors ${
              (searchParams.sort === s.value || (!searchParams.sort && s.value === "trending"))
                ? "bg-white/[0.12] text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>

      <SearchResults beats={beats} />
    </div>
  );
}
