import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import SearchResults from "./SearchResults";
import { GENRES } from "@/lib/catalog-policy";
import { catalogOrder, catalogSelect, marketplaceWhere, serializeCatalogItem } from "@/lib/catalog";

export const dynamic = "force-dynamic";
type Filters = { q?: string; genre?: string; sort?: string; kind?: string; page?: string };
export default async function SearchPage({ searchParams }: { searchParams: Promise<Filters> }) {
  const filters = await searchParams;
  const page = Math.floor(Math.min(1000, Math.max(1, Number(filters.page) || 1)));
  const q = filters.q?.trim().slice(0, 80);
  const kind = filters.kind === "BEAT" || filters.kind === "SOUND_PACK" ? filters.kind : undefined;
  const where: Prisma.BeatWhereInput = {
    ...marketplaceWhere, ...(kind ? { kind } : {}),
    ...(filters.genre && filters.genre !== "All" ? { genre: filters.genre } : {}),
    ...(q ? { OR: ["title", "description", "genre", "region", "instruments"].map((field) => ({ [field]: { contains: q, mode: "insensitive" } })) } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.beat.findMany({ where, orderBy: catalogOrder(filters.sort), skip: (page - 1) * 24, take: 24, select: catalogSelect }),
    prisma.beat.count({ where }),
  ]);
  const href = (changes: Partial<Filters>) => {
    const params = new URLSearchParams();
    Object.entries({ ...filters, page: undefined, ...changes }).forEach(([key, value]) => { if (value && value !== "All") params.set(key, value); });
    return `/search?${params}`;
  };
  return <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
    <p className="text-xs uppercase tracking-widest text-amber-300">The Soundfuel collection</p><h1 className="mt-2 text-3xl font-bold">{q ? `Results for “${q}”` : kind === "SOUND_PACK" ? "Original Indian sounds" : kind === "BEAT" ? "Find your next beat" : "Explore beats & sounds"}</h1>
    <p className="mt-2 text-sm text-zinc-500">{total} selected {total === 1 ? "sound" : "sounds"} · Catalog preview</p>
    <form action="/search" className="mt-6 flex gap-2"><input name="q" aria-label="Search sounds" defaultValue={q} placeholder="Search instruments, region, genre or title" className="soundfuel-input flex-1" />{kind && <input type="hidden" name="kind" value={kind} />}<button className="soundfuel-button">Search</button></form>
    <div className="mt-6 flex flex-wrap gap-2">{[["All sounds", ""], ["Beats", "BEAT"], ["Sound packs", "SOUND_PACK"]].map(([label, value]) => <Link key={label} href={href({ kind: value })} className={`rounded-full px-4 py-2 text-sm ${kind === value || (!kind && !value) ? "bg-amber-300 text-black" : "bg-white/5 text-zinc-400"}`}>{label}</Link>)}</div>
    <div className="mt-4 flex flex-wrap gap-2">{["All", ...GENRES].map((genre) => <Link key={genre} href={href({ genre })} className={`rounded-full border px-3 py-1.5 text-xs ${filters.genre === genre || (!filters.genre && genre === "All") ? "border-amber-300/50 text-amber-300" : "border-white/10 text-zinc-400"}`}>{genre}</Link>)}</div>
    <div className="my-6 flex flex-wrap items-center gap-3 text-xs text-zinc-500"><span>Sort:</span>{[["Recommended", "recommended"], ["Newest", "newest"], ["Price: low to high", "price_low"]].map(([label, sort]) => <Link key={sort} href={href({ sort })} className={(filters.sort || "recommended") === sort ? "text-amber-300" : "hover:text-white"}>{label}</Link>)}</div>
    <SearchResults beats={items.map(serializeCatalogItem)} />
    {total > 24 && <nav aria-label="Catalog pages" className="mt-8 flex items-center justify-center gap-5 text-sm">{page > 1 && <Link href={href({ page: String(page - 1) })}>← Previous</Link>}<span className="text-zinc-500">Page {page} of {Math.ceil(total / 24)}</span>{page * 24 < total && <Link href={href({ page: String(page + 1) })}>Next →</Link>}</nav>}
  </div>;
}
