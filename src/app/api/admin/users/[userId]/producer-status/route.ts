import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sameOrigin } from "@/lib/request";

const schema = z.object({ producerStatus: z.enum(["APPLIED", "APPROVED", "SUSPENDED"]) }).strict();
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid producer status" }, { status: 400 });
  const { userId } = await params;
  const producer = await prisma.user.findFirst({ where: { id: userId, role: "PRODUCER" }, select: { id: true } });
  if (!producer) return NextResponse.json({ error: "Producer not found" }, { status: 404 });
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { producerStatus: parsed.data.producerStatus, producerReviewedAt: new Date() } }),
    prisma.auditLog.create({ data: { actorId: session.user.id, action: `PRODUCER_${parsed.data.producerStatus}`, entityType: "User", entityId: userId } }),
  ]);
  return NextResponse.json({ ok: true });
}
