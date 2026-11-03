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
  return <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
    <p className="eyebrow">The Soundfuel collection</p><h1 className="page-title mt-4">{q ? `Results for “${q}”` : kind === "SOUND_PACK" ? "Original Indian sounds" : kind === "BEAT" ? "Find your next beat" : "Explore beats & sounds"}</h1>
    <p className="mt-2 text-sm text-muted">{total} selected {total === 1 ? "sound" : "sounds"} · Catalog preview</p>
    <div className="surface my-8 rounded-2xl p-4 sm:p-6">
      <form action="/search" role="search" className="flex flex-col gap-3 sm:flex-row"><input name="q" aria-label="Search sounds" defaultValue={q} placeholder="Search instruments, region, genre or title" maxLength={80} className="soundfuel-input min-w-0 flex-1" />{kind && <input type="hidden" name="kind" value={kind} />}{filters.genre && <input type="hidden" name="genre" value={filters.genre} />}{filters.sort && <input type="hidden" name="sort" value={filters.sort} />}<button className="soundfuel-button">Search sounds</button></form>
      <nav aria-label="Product type" className="mt-5 flex flex-wrap gap-2">{[["All sounds", ""], ["Beats", "BEAT"], ["Sound packs", "SOUND_PACK"]].map(([label, value]) => <Link key={label} href={href({ kind: value })} className="filter-chip" aria-current={kind === value || (!kind && !value) ? "page" : undefined}>{label}</Link>)}</nav>
      <nav aria-label="Genre" className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">{["All", ...GENRES].map((genre) => <Link key={genre} href={href({ genre })} className="filter-chip !text-xs" aria-current={filters.genre === genre || (!filters.genre && genre === "All") ? "page" : undefined}>{genre}</Link>)}</nav>
    </div>
    <nav aria-label="Sort sounds" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted"><span className="mr-2">Sort by</span>{[["Recommended", "recommended"], ["Newest", "newest"], ["Price: low to high", "price_low"]].map(([label, sort]) => <Link key={sort} href={href({ sort })} aria-current={(filters.sort || "recommended") === sort ? "page" : undefined} className="filter-chip !text-xs">{label}</Link>)}</nav>
    <SearchResults beats={items.map(serializeCatalogItem)} />
    {total > 24 && <nav aria-label="Catalog pages" className="mt-10 flex flex-wrap items-center justify-center gap-5 text-sm">{page > 1 && <Link className="soundfuel-button-secondary" href={href({ page: String(page - 1) })}>← Previous</Link>}<span className="text-muted">Page {page} of {Math.ceil(total / 24)}</span>{page * 24 < total && <Link className="soundfuel-button-secondary" href={href({ page: String(page + 1) })}>Next →</Link>}</nav>}
  </div>;
}
