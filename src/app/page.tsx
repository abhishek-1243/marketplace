import { prisma } from "@/lib/prisma";
import { catalogOrder, catalogSelect, marketplaceWhere, serializeCatalogItem } from "@/lib/catalog";
import LandingPage from "@/components/home/LandingPage";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [trending, featured, beats, packs] = await Promise.all([
    prisma.listing.findMany({ where: { ...marketplaceWhere, kind: "BEAT", assets: { some: { type: "PREVIEW" } } }, select: catalogSelect, orderBy: [{ plays: "desc" }, { createdAt: "desc" }, { id: "desc" }], take: 4 }),
    prisma.listing.findMany({ where: { ...marketplaceWhere, kind: "BEAT", discoveryTier: "FEATURED" }, select: catalogSelect, orderBy: catalogOrder(), take: 6 }),
    prisma.listing.findMany({ where: { ...marketplaceWhere, kind: "BEAT" }, select: catalogSelect, orderBy: catalogOrder("newest"), take: 6 }),
    prisma.listing.findMany({ where: { ...marketplaceWhere, kind: "SOUND_PACK" }, select: catalogSelect, orderBy: catalogOrder(), take: 6 }),
  ]);
  return <LandingPage heroSounds={trending.map(serializeCatalogItem)} sections={[
    { title: "Selected beats", subtitle: "Beats from independent Indian creators.", items: featured.map(serializeCatalogItem), href: "/beats" },
    { title: "Beats for your next track", subtitle: "Browse the newest beats.", items: beats.map(serializeCatalogItem), href: "/beats?sort=newest" },
    { title: "Original sound packs", subtitle: "Indian instruments, textures and original recordings.", items: packs.map(serializeCatalogItem), href: "/sound-packs" },
  ]} />;
}
