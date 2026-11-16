import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { GENRES } from "@/lib/catalog-policy";
import { catalogOrder, catalogSelect, marketplaceWhere, serializeCatalogItem } from "@/lib/catalog";
import { catalogHref, type ListingKind } from "@/lib/listing-kind";
import SearchResults from "@/app/search/SearchResults";

export type CatalogFilters = { q?: string; genre?: string; sort?: string; page?: string };
export default async function CatalogPage({ kind, filters }: { kind: ListingKind; filters: CatalogFilters }) {
  const page = Math.floor(Math.min(1000, Math.max(1, Number(filters.page) || 1)));
  const q = filters.q?.trim().slice(0, 80);
  const pack = kind === "SOUND_PACK";
  const where: Prisma.ListingWhereInput = {
    ...marketplaceWhere, kind,
    ...(filters.genre && filters.genre !== "All" ? { genre: filters.genre } : {}),
    ...(q ? { OR: ["title", "description", "genre", "region", "instruments"].map((field) => ({ [field]: { contains: q, mode: "insensitive" } })) } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.listing.findMany({ where, orderBy: catalogOrder(filters.sort), skip: (page - 1) * 24, take: 24, select: catalogSelect }),
    prisma.listing.count({ where }),
  ]);
  const base = catalogHref(kind);
  const href = (changes: Partial<CatalogFilters>) => {
    const params = new URLSearchParams();
    Object.entries({ q, genre: filters.genre, sort: filters.sort, ...changes }).forEach(([key, value]) => { if (value && value !== "All") params.set(key, value); });
    return `${base}?${params}`;
  };
  return <div className="site-shell py-12">
    <p className="eyebrow">The Soundfuel collection</p>
    <h1 className="page-title mt-4">{pack ? "Sound packs" : "Beats"}</h1>
    <p className="mt-2 text-sm text-muted">{q ? `Results for “${q}” · ` : ""}{total} {pack ? "sound packs" : "beats"} · Catalog preview</p>
    <nav aria-label="Product type" className="my-6 flex gap-3"><Link href="/beats" className="filter-chip" aria-current={!pack ? "page" : undefined}>Beats</Link><Link href="/sound-packs" className="filter-chip" aria-current={pack ? "page" : undefined}>Sound packs</Link></nav>
    <div className="surface my-8 rounded-2xl p-4 sm:p-6">
      <form action={base} role="search" className="flex flex-col gap-3 sm:flex-row"><input name="q" aria-label={pack ? "Search sound packs" : "Search beats"} defaultValue={q} placeholder="Search instruments, region, genre or title" maxLength={80} className="soundfuel-input min-w-0 flex-1" />{filters.genre && <input type="hidden" name="genre" value={filters.genre} />}{filters.sort && <input type="hidden" name="sort" value={filters.sort} />}<button className="soundfuel-button">{pack ? "Search sound packs" : "Search beats"}</button></form>
      <nav aria-label="Genre" className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">{["All", ...GENRES].map((genre) => <Link key={genre} href={href({ genre })} className="filter-chip !text-xs" aria-current={filters.genre === genre || (!filters.genre && genre === "All") ? "page" : undefined}>{genre}</Link>)}</nav>
    </div>
    <nav aria-label="Sort" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted"><span>Sort by</span>{[["Recommended", "recommended"], ["Newest", "newest"], ["Price: low to high", "price_low"]].map(([label, sort]) => <Link key={sort} href={href({ sort })} aria-current={(filters.sort || "recommended") === sort ? "page" : undefined} className="filter-chip !text-xs">{label}</Link>)}</nav>
    <SearchResults beats={items.map(serializeCatalogItem)} kind={kind} />
    {total > 24 && <nav aria-label="Catalog pages" className="mt-10 flex items-center justify-center gap-5 text-sm">{page > 1 && <Link href={href({ page: String(page - 1) })}>Previous</Link>}<span>Page {page} of {Math.ceil(total / 24)}</span>{page * 24 < total && <Link href={href({ page: String(page + 1) })}>Next</Link>}</nav>}
  </div>;
}
