import { prisma } from "@/lib/prisma";
import { catalogOrder, catalogSelect, marketplaceWhere, serializeCatalogItem } from "@/lib/catalog";
import LandingPage from "@/components/home/LandingPage";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [trending, featured, beats, packs] = await Promise.all([
    prisma.beat.findMany({ where: { ...marketplaceWhere, assets: { some: { type: "PREVIEW" } } }, select: catalogSelect, orderBy: [{ plays: "desc" }, { createdAt: "desc" }, { id: "desc" }], take: 4 }),
    prisma.beat.findMany({ where: { ...marketplaceWhere, discoveryTier: "FEATURED" }, select: catalogSelect, orderBy: catalogOrder(), take: 4 }),
    prisma.beat.findMany({ where: { ...marketplaceWhere, kind: "BEAT" }, select: catalogSelect, orderBy: catalogOrder("newest"), take: 4 }),
    prisma.beat.findMany({ where: { ...marketplaceWhere, kind: "SOUND_PACK" }, select: catalogSelect, orderBy: catalogOrder(), take: 4 }),
  ]);
  return <LandingPage heroSounds={trending.map(serializeCatalogItem)} sections={[
    { title: "Selected for Soundfuel", subtitle: "Beats and recordings from independent Indian creators.", items: featured.map(serializeCatalogItem), href: "/search" },
    { title: "Beats for your next track", subtitle: "Browse the newest additions to the collection.", items: beats.map(serializeCatalogItem), href: "/search?kind=BEAT" },
    { title: "Original sound packs", subtitle: "Indian instruments, textures and original recordings.", items: packs.map(serializeCatalogItem), href: "/search?kind=SOUND_PACK" },
  ]} />;
}
