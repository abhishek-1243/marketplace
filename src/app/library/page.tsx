import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import LibraryBeatRow from "./LibraryBeatRow";
import HomeBeats from "@/components/home/HomeBeats";
import { catalogSelect, publicCatalogWhere, serializeCatalogItem } from "@/lib/catalog";
import { catalogKind } from "@/lib/listing-kind";

export const dynamic = "force-dynamic";
export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ kind?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const kind = catalogKind((await searchParams).kind);
  const label = kind === "BEAT" ? "beats" : "sound packs";
  const favorites = await prisma.favorite.findMany({ where: { userId: session.user.id, listing: { ...publicCatalogWhere, kind } }, orderBy: { createdAt: "desc" }, take: 100, select: { listing: { select: catalogSelect } } });
  const orders = await prisma.order.findMany({
    where: { artistId: session.user.id, status: "PAID", entitlement: { active: true }, item: { listing: { kind } } },
    include: { item: { include: { listing: { include: { producer: { select: { displayName: true, username: true } }, assets: { where: { type: "PREVIEW" }, select: { id: true } } } }, beatLicensePlan: true, soundPackLicensePlan: true } }, agreement: { select: { id: true, contentHash: true } } },
    orderBy: { createdAt: "desc" },
  });
  return <div className="site-shell py-8">
    <nav className="mb-6 flex gap-3" aria-label="Library product type"><Link href="/library?kind=BEAT" className="filter-chip" aria-current={kind === "BEAT" ? "page" : undefined}>Beats</Link><Link href="/library?kind=SOUND_PACK" className="filter-chip" aria-current={kind === "SOUND_PACK" ? "page" : undefined}>Sound packs</Link></nav>
    <h1 className="mb-2 text-2xl font-semibold">Saved {label}</h1>
    <HomeBeats beats={favorites.map(({ listing }) => serializeCatalogItem(listing))} />
    <h2 className="mt-10 text-lg font-semibold">Licensed {label}</h2>
    {!orders.length && <p className="py-12 text-sm text-muted">No licensed {label} yet. Purchases open in a later release.</p>}
    {orders.map((order) => {
      if (!order.item) return null;
      const { listing, beatLicensePlan } = order.item;
      if (listing.kind === "SOUND_PACK") return <article key={order.id} className="surface mt-4 rounded-xl p-5"><p>{listing.title}</p><p className="mt-2 text-xs text-muted">Sound pack · Downloads open in a later release.</p></article>;
      if (!beatLicensePlan) return null;
      return <LibraryBeatRow key={order.id} order={{ id: order.id, createdAt: order.createdAt.toISOString(), beat: { ...listing, previewUrl: listing.assets.length ? `/api/listings/${listing.id}/preview` : null }, licensePlan: { ...beatLicensePlan, price: order.item.price }, agreement: order.agreement }} />;
    })}
  </div>;
}
