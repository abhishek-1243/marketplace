import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { fulfillOrder } from "@/lib/orders";
import { verifyCheckoutSignature } from "@/lib/razorpay";
import { sameOrigin } from "@/lib/request";
import { env } from "@/lib/env";

const schema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(req: NextRequest) {
  if (!env.PAYMENTS_ENABLED) return NextResponse.json({ error: "Payments coming soon", code: "PAYMENTS_DISABLED" }, { status: 503 });
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid payment response" }, { status: 400 });
  const order = await prisma.order.findUnique({
    where: { providerOrderId: parsed.data.razorpay_order_id },
    select: { artistId: true },
  });
  if (!order || order.artistId !== session.user.id) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (!verifyCheckoutSignature(
    parsed.data.razorpay_order_id,
    parsed.data.razorpay_payment_id,
    parsed.data.razorpay_signature,
  )) {
    return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
  }
  const paid = await fulfillOrder({
    providerOrderId: parsed.data.razorpay_order_id,
    providerPaymentId: parsed.data.razorpay_payment_id,
  });
  return NextResponse.json({ orderId: paid.id, status: paid.status });
}
