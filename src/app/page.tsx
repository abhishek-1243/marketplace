import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { catalogOrder, catalogSelect, marketplaceWhere, serializeCatalogItem } from "@/lib/catalog";
import { GENRES } from "@/lib/catalog-policy";
import HomeBeats from "@/components/home/HomeBeats";
import HeroHeadline from "@/components/home/HeroHeadline";

export const dynamic = "force-dynamic";
export default async function HomePage() {
  const [featured, beats, packs] = await Promise.all([
    prisma.beat.findMany({ where: { ...marketplaceWhere, discoveryTier: "FEATURED" }, select: catalogSelect, orderBy: catalogOrder(), take: 5 }),
    prisma.beat.findMany({ where: { ...marketplaceWhere, kind: "BEAT" }, select: catalogSelect, orderBy: catalogOrder("newest"), take: 5 }),
    prisma.beat.findMany({ where: { ...marketplaceWhere, kind: "SOUND_PACK" }, select: catalogSelect, orderBy: catalogOrder(), take: 5 }),
  ]);
  return <div>
    <section className="relative overflow-hidden bg-[radial-gradient(circle_at_20%_10%,rgba(252,211,77,0.16),transparent_40%),linear-gradient(to_bottom,#18181b,#000)]">
      <div className="mx-auto max-w-[1400px] px-4 pb-16 pt-20 sm:px-6 sm:pt-24">
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">Independent craft. Indian roots.</p>
        <HeroHeadline />
        <p className="mt-5 max-w-lg text-base leading-7 text-zinc-400">Discover distinctive beats and original sound packs from Indian producers and instrumentalists. A focused collection, selected for its craft.</p>
        <div className="mt-7 flex flex-wrap gap-3"><Link className="soundfuel-button" href="/search?kind=BEAT">Explore beats</Link><Link className="soundfuel-button-secondary" href="/search?kind=SOUND_PACK">Explore sounds</Link></div>
        <p className="mt-6 text-xs text-zinc-500">Catalog preview · Listen, save and follow · Purchases opening later</p>
      </div>
    </section>
    <div className="mx-auto max-w-[1400px] space-y-10 px-4 py-10 sm:px-6">
      {[["Editor's selection", featured, "/search"], ["Beats for your next release", beats, "/search?kind=BEAT"], ["Instruments, textures & sound packs", packs, "/search?kind=SOUND_PACK"]] .map(([title, items, href]) => <section key={title as string}>
        <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-xl font-bold tracking-tight">{title as string}</h2><Link href={href as string} className="text-sm text-zinc-400 hover:text-amber-300">Explore all →</Link></div>
        <HomeBeats beats={(items as typeof beats).map(serializeCatalogItem)} />
      </section>)}
      <section><h2 className="mb-4 text-xl font-bold">Find your direction</h2><div className="flex flex-wrap gap-2">{GENRES.slice(0, 9).map((genre) => <Link key={genre} href={`/search?genre=${encodeURIComponent(genre)}`} className="rounded-full border border-white/10 px-4 py-2 text-sm text-zinc-400 hover:border-amber-300/40 hover:text-white">{genre}</Link>)}</div></section>
      <section className="surface rounded-2xl p-7 sm:p-10"><p className="text-xs uppercase tracking-widest text-amber-300">Founding creators</p><h2 className="mt-3 text-2xl font-bold">Have a sound worth discovering?</h2><p className="mt-3 max-w-xl leading-7 text-zinc-400">Join a focused catalog of Indian beats, performances and original recordings. Share your portfolio to apply. No subscription or payment details are needed during preview.</p><Link href="/apply" className="soundfuel-button mt-6">Apply as a producer</Link></section>
    </div>
  </div>;
}
