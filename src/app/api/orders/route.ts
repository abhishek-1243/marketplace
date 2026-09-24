import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateCommission } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { beatId, licensePlanId } = body;
  const userId = (session.user as any).id;

  const licensePlan = await prisma.licensePlan.findUnique({
    where: { id: licensePlanId },
    include: { beat: true },
  });

  if (!licensePlan || licensePlan.beat.id !== beatId) {
    return NextResponse.json({ error: "Invalid license plan" }, { status: 400 });
  }

  const commission = calculateCommission(licensePlan.price);
  const producerAmount = licensePlan.price - commission;

  const order = await prisma.order.create({
    data: {
      beatId,
      artistId: userId,
      producerId: licensePlan.beat.producerId,
      licensePlanId,
      totalAmount: licensePlan.price,
      commission,
      producerAmount,
      status: "COMPLETED",
      agreement: {
        create: {
          templateVersion: "1.0",
          content: `License agreement for ${licensePlan.beat.title}`,
          contentHash: Date.now().toString(36) + Math.random().toString(36).slice(2),
          artistLegalName: "Licensee",
          producerLegalName: "Licensor",
          acceptedAt: new Date(),
        },
      },
      payment: {
        create: {
          amount: licensePlan.price,
          currency: "INR",
          status: "CAPTURED",
          method: "DEMO",
          providerRef: "demo_" + Date.now().toString(36),
        },
      },
      entitlement: {
        create: {
          active: true,
        },
      },
    },
  });

  return NextResponse.json(order, { status: 201 });
}
