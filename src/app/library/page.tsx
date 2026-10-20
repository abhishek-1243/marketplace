import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Music } from "lucide-react";
import LibraryBeatRow from "./LibraryBeatRow";
import HomeBeats from "@/components/home/HomeBeats";
import { catalogSelect, publicCatalogWhere, serializeCatalogItem } from "@/lib/catalog";

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = session.user.id;
  const favorites = await prisma.favorite.findMany({ where: { userId, beat: publicCatalogWhere }, orderBy: { createdAt: "desc" }, take: 100, select: { beat: { select: catalogSelect } } });

  const orders = await prisma.order.findMany({
    where: { artistId: userId, status: "PAID", entitlement: { active: true } },
    include: {
      beat: {
        include: {
          producer: { select: { displayName: true, username: true } },
          assets: { where: { type: "PREVIEW" }, select: { id: true } },
        },
      },
      licensePlan: { select: { type: true, price: true, includesMp3: true, includesWav: true, includesStems: true } },
      agreement: { select: { id: true, contentHash: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const serializedOrders = orders.map((o: any) => ({
    ...o,
    beat: {
      ...o.beat,
      previewUrl: o.beat.assets.length ? `/api/beats/${o.beat.id}/preview` : null,
      assets: undefined,
    },
    createdAt: o.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold tracking-tight mb-2">Saved sounds</h1>
      <p className="text-sm text-zinc-500 mb-6">Keep your next idea close. Save beats and packs from their detail pages.</p>
      <HomeBeats beats={favorites.map(({ beat }) => serializeCatalogItem(beat))} />
      <h2 className="mt-10 text-lg font-semibold">Licensed library</h2>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Music className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
          <p className="text-[15px] font-medium text-zinc-400">No licensed beats yet</p>
          <p className="text-[13px] text-zinc-600 mt-1">Purchases and production-file downloads open in a later release.</p>
        </div>
      ) : (
        <div className="space-y-1">
          {serializedOrders.map((order: any) => (
            <LibraryBeatRow key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
