import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatPrice, formatNumber } from "@/lib/utils";
import Link from "next/link";
import { Music, DollarSign, BarChart3, Users, Plus, Eye, ShoppingCart, MessageSquare, Settings } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "PRODUCER") redirect("/login");

  const userId = (session.user as any).id;

  const [beats, orders, followerCount] = await Promise.all([
    prisma.beat.findMany({
      where: { producerId: userId },
      orderBy: { plays: "desc" },
      include: {
        _count: { select: { orders: true, favorites: true } },
        orders: { where: { status: "COMPLETED" }, select: { producerAmount: true } },
      },
    }),
    prisma.order.findMany({
      where: { producerId: userId, status: "COMPLETED" },
      include: {
        beat: { select: { title: true } },
        artist: { select: { displayName: true } },
        licensePlan: { select: { type: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.follow.count({ where: { followingId: userId } }),
  ]);

  const totalRevenue = orders.reduce((sum: number, o: any) => sum + o.producerAmount, 0);
  const totalPlays = beats.reduce((sum: number, b: any) => sum + b.plays, 0);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-zinc-500 text-[13px] mt-1">Welcome back, {session.user?.name}</p>
        </div>
        <Link
          href="/dashboard/upload"
          className="flex items-center gap-2 px-5 py-2.5 bg-white text-black rounded-full text-[13px] font-semibold hover:scale-[1.02] hover:bg-zinc-100"
        >
          <Plus className="w-4 h-4" />
          Upload Beat
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Revenue", value: formatPrice(totalRevenue), icon: DollarSign },
          { label: "Sales", value: orders.length.toString(), icon: ShoppingCart },
          { label: "Plays", value: formatNumber(totalPlays), icon: BarChart3 },
          { label: "Followers", value: formatNumber(followerCount), icon: Users },
        ].map((stat) => (
          <div key={stat.label} className="p-5 bg-zinc-900 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[13px] text-zinc-500">{stat.label}</span>
              <stat.icon className="w-4 h-4 text-zinc-600" />
            </div>
            <p className="text-2xl font-bold mt-2 tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="text-base font-semibold mb-3">Your Beats</h2>
          <div className="space-y-1">
            {beats.map((beat: any) => {
              const beatRevenue = beat.orders.reduce((s: number, o: any) => s + o.producerAmount, 0);
              return (
                <div key={beat.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.04] transition-colors">
                  <div className="w-10 h-10 rounded-md overflow-hidden shrink-0 bg-zinc-800">
                    {beat.coverArt && <img src={beat.coverArt} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium truncate">{beat.title}</p>
                    <div className="flex items-center gap-3 text-[11px] text-zinc-500 mt-0.5">
                      <span>{formatNumber(beat.plays)} plays</span>
                      <span>{beat._count.orders} sales</span>
                      <span>{formatPrice(beatRevenue)}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${
                    beat.status === "PUBLISHED" ? "bg-white/[0.06] text-zinc-400" : "bg-yellow-500/10 text-yellow-500"
                  }`}>
                    {beat.status}
                  </span>
                </div>
              );
            })}
            {beats.length === 0 && (
              <div className="text-center py-12 text-zinc-600">
                <Music className="w-6 h-6 mx-auto mb-2 opacity-40" />
                <p className="text-[13px]">No beats yet. Upload your first beat.</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-base font-semibold mb-3">Recent Orders</h2>
          <div className="space-y-1">
            {orders.map((order: any) => (
              <div key={order.id} className="p-3 rounded-lg hover:bg-white/[0.04] transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-medium truncate">{order.beat.title}</p>
                  <span className="text-[13px] text-white font-medium">{formatPrice(order.producerAmount)}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-zinc-500">{order.artist.displayName}</span>
                  <span className="text-[11px] text-zinc-500">{order.licensePlan.type}</span>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-center py-8 text-zinc-600 text-[13px]">No orders yet</p>
            )}
          </div>

          <div className="mt-6">
            <h2 className="text-base font-semibold mb-3">Quick Links</h2>
            <div className="space-y-1">
              <Link href={`/${(session.user as any).username}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.04] transition-colors text-[13px] text-zinc-300 hover:text-white">
                <Eye className="w-4 h-4 text-zinc-600" />
                View Storefront
              </Link>
              <Link href="/messages" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.04] transition-colors text-[13px] text-zinc-300 hover:text-white">
                <MessageSquare className="w-4 h-4 text-zinc-600" />
                Messages
              </Link>
              <Link href="/dashboard/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.04] transition-colors text-[13px] text-zinc-300 hover:text-white">
                <Settings className="w-4 h-4 text-zinc-600" />
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
