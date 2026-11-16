import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateCommission } from "@/lib/utils";
import { licenseSnapshot, renderAgreement } from "@/lib/contracts";
import { createRazorpayOrder } from "@/lib/razorpay";
import { releaseExclusiveReservation } from "@/lib/orders";
import { requestMetadata, sameOrigin } from "@/lib/request";
import { env } from "@/lib/env";
import { publicCatalogWhere } from "@/lib/catalog";

const schema = z.object({
  listingId: z.string().cuid(),
  licensePlanId: z.string().cuid(),
  acceptedAgreement: z.literal(true),
});

export async function POST(req: NextRequest) {
  if (!env.PAYMENTS_ENABLED) return NextResponse.json({ error: "Payments coming soon", code: "PAYMENTS_DISABLED" }, { status: 503 });
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getServerSession(authOptions);
  if (!session?.user.onboardingComplete) return NextResponse.json({ error: "Complete your account first" }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid checkout request" }, { status: 400 });
  const meta = requestMetadata(req);

  let order: { id: string; totalAmount: number; producerAmount: number; listingId: string; payoutAccountId: string };
  try {
    order = await prisma.$transaction(async (tx) => {
    const plan = await tx.beatLicensePlan.findFirst({
      where: {
        id: parsed.data.licensePlanId,
        listingId: parsed.data.listingId,
        active: true,
        beat: { listing: { ...publicCatalogWhere, kind: "BEAT" } },
      },
      include: {
        beat: { include: { listing: { include: { producer: true } } } },
      },
    });
    if (!plan) throw new Error("Licence is unavailable");
    const listing = plan.beat.listing;
    if (listing.producerId === session.user.id) throw new Error("You cannot buy your own beat");
    if (!listing.producer.payoutAccountId) throw new Error("This producer is not ready to receive payments");
    const artist = await tx.user.findUniqueOrThrow({ where: { id: session.user.id } });
    if (!artist.legalName || !listing.producer.legalName) throw new Error("Legal names are required before checkout");
    const snapshot = licenseSnapshot(plan);
    const agreement = renderAgreement({
      beatTitle: listing.title,
      artistName: artist.legalName,
      producerName: listing.producer.legalName,
      snapshot,
    });
    const amounts = calculateCommission(plan.price);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    const created = await tx.order.create({
      data: {
        artistId: artist.id,
        producerId: listing.producerId,
        totalAmount: plan.price,
        commission: amounts.commission,
        producerAmount: amounts.producerAmount,
        item: { create: { listingId: listing.id, beatLicensePlanId: plan.id, price: plan.price, currency: plan.currency, licenseSnapshot: snapshot } },
        expiresAt,
        agreement: {
          create: {
            templateVersion: plan.templateVersion,
            content: agreement.content,
            contentHash: agreement.hash,
            artistLegalName: artist.legalName,
            producerLegalName: listing.producer.legalName,
            acceptedAt: new Date(),
            acceptedIp: meta.ip,
            acceptedUserAgent: meta.userAgent,
          },
        },
        payment: { create: { amount: plan.price } },
      },
    });

    if (plan.isExclusive) {
      const reserved = await tx.beat.updateMany({
        where: {
          listingId: listing.id,
          OR: [
            { exclusiveState: "AVAILABLE" },
            { exclusiveState: "RESERVED", exclusiveReservedUntil: { lt: new Date() } },
          ],
        },
        data: {
          exclusiveState: "RESERVED",
          exclusiveOrderId: created.id,
          exclusiveReservedAt: new Date(),
          exclusiveReservedUntil: expiresAt,
        },
      });
      if (reserved.count !== 1) throw new Error("The exclusive licence is currently reserved or sold");
    }
    return { ...created, listingId: listing.id, payoutAccountId: listing.producer.payoutAccountId };
    });
  } catch (error) {
    console.error("Checkout validation error", error);
    const message = error instanceof Error ? error.message : "Checkout is unavailable";
    return NextResponse.json({ error: message }, { status: 409 });
  }

  try {
    const providerOrder = await createRazorpayOrder({
      amountInr: order.totalAmount,
      receipt: order.id,
      notes: { soundfuelOrderId: order.id, listingId: order.listingId },
      transfer: { accountId: order.payoutAccountId, amountInr: order.producerAmount },
    });
    await prisma.order.update({ where: { id: order.id }, data: { providerOrderId: providerOrder.id } });
    return NextResponse.json({
      orderId: order.id,
      providerOrderId: providerOrder.id,
      amountPaise: providerOrder.amount,
      currency: providerOrder.currency,
      keyId: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      customer: { name: session.user.name, email: session.user.email },
    });
  } catch (error) {
    await releaseExclusiveReservation(order.id);
    console.error("Checkout provider error", error);
    return NextResponse.json({ error: "Payment checkout is temporarily unavailable" }, { status: 502 });
  }
}
