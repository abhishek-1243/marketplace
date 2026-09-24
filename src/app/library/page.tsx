import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Music } from "lucide-react";
import LibraryBeatRow from "./LibraryBeatRow";

export default async function LibraryPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = (session.user as any).id;

  const orders = await prisma.order.findMany({
    where: { artistId: userId, status: "COMPLETED", entitlement: { active: true } },
    include: {
      beat: {
        include: {
          producer: { select: { displayName: true, username: true } },
        },
      },
      licensePlan: { select: { type: true, price: true, includesMp3: true, includesWav: true, includesStems: true } },
      agreement: { select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const serializedOrders = orders.map((o: any) => ({
    ...o,
    createdAt: o.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-xl font-bold tracking-tight mb-6">Your Library</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <Music className="w-10 h-10 mx-auto mb-3 text-zinc-700" />
          <p className="text-[15px] font-medium text-zinc-400">No licensed beats yet</p>
          <p className="text-[13px] text-zinc-600 mt-1">Beats you purchase will appear here</p>
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
