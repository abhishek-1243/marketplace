import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sameOrigin } from "@/lib/request";
import { env } from "@/lib/env";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  if (!env.PAYMENTS_ENABLED) return NextResponse.json({ code: "PAYMENTS_DISABLED", error: "Payout configuration is disabled during catalog preview" }, { status: 503 });
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { userId } = await params;
  const body = await req.json();
  if (typeof body.payoutAccountId !== "string" || !/^acc_[A-Za-z0-9]+$/.test(body.payoutAccountId)) {
    return NextResponse.json({ error: "Invalid Razorpay linked account" }, { status: 400 });
  }
  const updated = await prisma.user.updateMany({ where: { id: userId, role: "PRODUCER" }, data: { payoutAccountId: body.payoutAccountId } });
  if (updated.count !== 1) return NextResponse.json({ error: "Producer not found" }, { status: 404 });
  await prisma.auditLog.create({ data: { action: "PAYOUT_ACCOUNT_CONNECTED", entityType: "User", entityId: userId, actorId: session.user.id } });
  return NextResponse.json({ ok: true });
}
