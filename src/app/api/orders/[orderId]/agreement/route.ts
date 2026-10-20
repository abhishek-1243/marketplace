import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, context: { params: Promise<{ orderId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { orderId } = await context.params;
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      OR: [{ artistId: session.user.id }, { producerId: session.user.id }],
    },
    include: { agreement: true },
  });
  if (!order?.agreement) return NextResponse.json({ error: "Agreement not found" }, { status: 404 });
  return new NextResponse(order.agreement.content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="soundfuel-${order.id}-agreement.txt"`,
      "X-Content-SHA256": order.agreement.contentHash,
    },
  });
}
