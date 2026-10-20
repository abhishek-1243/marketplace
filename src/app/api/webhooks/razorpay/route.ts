import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { fulfillOrder, releaseExclusiveReservation } from "@/lib/orders";
import { reverseTransfer, verifyWebhookSignature } from "@/lib/razorpay";
import { env } from "@/lib/env";

type RazorpayPayload = {
  event: string;
  payload?: {
    payment?: { entity?: { id?: string; order_id?: string; method?: string; notes?: { soundfuelOrderId?: string } } };
    order?: { entity?: { id?: string; notes?: { soundfuelOrderId?: string } } };
    refund?: { entity?: { id?: string; payment_id?: string } };
    transfer?: { entity?: { id?: string; status?: string; notes?: { soundfuelOrderId?: string } } };
  };
};

export async function POST(req: NextRequest) {
  if (!env.PAYMENTS_ENABLED) return NextResponse.json({ error: "Payments are disabled", code: "PAYMENTS_DISABLED" }, { status: 503 });
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature");
  const eventId = req.headers.get("x-razorpay-event-id");
  if (!signature || !eventId || !verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }
  if (await prisma.paymentEvent.findUnique({ where: { providerEventId: eventId } })) {
    return NextResponse.json({ ok: true });
  }
  const body = JSON.parse(rawBody) as RazorpayPayload;
  const payment = body.payload?.payment?.entity;
  const providerOrderId = payment?.order_id || body.payload?.order?.entity?.id;

  if (body.event === "payment.captured" && providerOrderId && payment?.id) {
    await fulfillOrder({ providerOrderId, providerPaymentId: payment.id, method: payment.method });
  } else if (body.event === "payment.failed") {
    const order = providerOrderId ? await prisma.order.findUnique({ where: { providerOrderId }, select: { id: true } }) : null;
    if (order) await releaseExclusiveReservation(order.id);
  } else if (body.event === "refund.processed") {
    const paymentId = body.payload?.refund?.entity?.payment_id;
    const order = paymentId ? await prisma.order.findFirst({ where: { payment: { providerPaymentId: paymentId } }, select: { id: true, producerAmount: true, payout: { select: { providerRef: true } } } }) : null;
    if (order) {
      if (!order.payout?.providerRef) throw new Error("Transfer reference is not available for refund reversal");
      await reverseTransfer(order.payout.providerRef, order.producerAmount);
      await prisma.order.update({
        where: { id: order.id },
        data: {
          status: "REFUNDED",
          payment: { update: { status: "REFUNDED" } },
          entitlement: { update: { active: false, revokedAt: new Date() } },
          payout: { update: { status: "REVERSED" } },
        },
      });
    }
  } else if (body.event.startsWith("transfer.")) {
    const transfer = body.payload?.transfer?.entity;
    const orderId = transfer?.notes?.soundfuelOrderId;
    if (orderId && transfer?.id) {
      const order = await prisma.order.findUnique({ where: { id: orderId }, select: { producerAmount: true, currency: true } });
      if (order) {
        const status = body.event === "transfer.processed" ? "PAID" : body.event === "transfer.failed" ? "FAILED" : body.event === "transfer.reversed" ? "REVERSED" : "PROCESSING";
        await prisma.payout.upsert({
          where: { orderId },
          create: { orderId, amount: order.producerAmount, currency: order.currency, providerRef: transfer.id, status },
          update: { providerRef: transfer.id, status },
        });
      }
    }
  }

  try {
    await prisma.paymentEvent.create({
      data: { providerEventId: eventId, eventType: body.event, payload: body as Prisma.InputJsonValue },
    });
  } catch (error) {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002")) throw error;
  }
  return NextResponse.json({ ok: true });
}
