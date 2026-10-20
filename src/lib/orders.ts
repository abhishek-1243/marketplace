import { prisma } from "@/lib/prisma";
import { sendPurchaseEmail } from "@/lib/email";

export async function fulfillOrder(input: {
  providerOrderId: string;
  providerPaymentId: string;
  method?: string;
}) {
  const result = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { providerOrderId: input.providerOrderId },
      include: { beat: true, licensePlan: true, artist: true },
    });
    if (!order) throw new Error("Order not found");
    if (order.status === "PAID") return order;
    if (order.status !== "PENDING_PAYMENT") throw new Error("Order cannot be fulfilled");

    const paid = await tx.order.update({
      where: { id: order.id },
      data: {
        status: "PAID",
        payment: {
          update: {
            status: "CAPTURED",
            providerPaymentId: input.providerPaymentId,
            method: input.method,
            capturedAt: new Date(),
          },
        },
        entitlement: { create: { active: true } },
        payout: {
          upsert: {
            create: { amount: order.producerAmount, currency: order.currency, status: "PROCESSING" },
            update: { status: "PROCESSING" },
          },
        },
      },
      include: { artist: true, beat: true },
    });

    if (order.licensePlan.isExclusive) {
      const updated = await tx.beat.updateMany({
        where: { id: order.beatId, exclusiveOrderId: order.id, exclusiveState: "RESERVED" },
        data: { exclusiveState: "SOLD", status: "SOLD", exclusiveReservedUntil: null },
      });
      if (updated.count !== 1) throw new Error("Exclusive reservation was lost");
    }

    await tx.auditLog.create({
      data: {
        action: "ORDER_PAID",
        entityType: "Order",
        entityId: order.id,
        actorId: order.artistId,
        metadata: { providerPaymentId: input.providerPaymentId },
      },
    });
    return paid;
  });

  void sendPurchaseEmail({
    to: result.artist.email,
    buyerName: result.artist.displayName,
    beatTitle: result.beat.title,
    orderId: result.id,
  }).catch((error) => console.error("Purchase email failed", error));

  return result;
}

export async function releaseExclusiveReservation(orderId: string) {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { licensePlan: true } });
    if (!order || order.status === "PAID") return;
    await tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
    if (!order.licensePlan.isExclusive) return;
    await tx.beat.updateMany({
      where: { id: order.beatId, exclusiveOrderId: order.id, exclusiveState: "RESERVED" },
      data: {
        exclusiveState: "AVAILABLE",
        exclusiveOrderId: null,
        exclusiveReservedAt: null,
        exclusiveReservedUntil: null,
      },
    });
  });
}
