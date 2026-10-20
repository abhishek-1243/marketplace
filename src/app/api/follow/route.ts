import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sameOrigin } from "@/lib/request";
import { z } from "zod";

const schema = z.object({ userId: z.string().cuid() }).strict();

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid producer" }, { status: 400 });
  const { userId: targetUserId } = parsed.data;
  const currentUserId = session.user.id;

  if (currentUserId === targetUserId) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  const producer = await prisma.user.findFirst({ where: { id: targetUserId, role: "PRODUCER", producerStatus: "APPROVED" }, select: { id: true } });
  if (!producer) return NextResponse.json({ error: "Producer not found" }, { status: 404 });

  const existing = await prisma.follow.findUnique({
    where: { followerId_followingId: { followerId: currentUserId, followingId: targetUserId } },
  });

  if (existing) {
    await prisma.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ following: false });
  }

  await prisma.follow.create({ data: { followerId: currentUserId, followingId: targetUserId } });
  return NextResponse.json({ following: true });
}
