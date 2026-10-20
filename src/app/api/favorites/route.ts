import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sameOrigin } from "@/lib/request";
import { z } from "zod";
import { publicCatalogWhere } from "@/lib/catalog";

const schema = z.object({ beatId: z.string().cuid() }).strict();

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid beat" }, { status: 400 });
  const { beatId } = parsed.data;
  const userId = session.user.id;

  const beat = await prisma.beat.findFirst({ where: { id: beatId, ...publicCatalogWhere }, select: { id: true } });
  if (!beat) return NextResponse.json({ error: "Beat not found" }, { status: 404 });

  const existing = await prisma.favorite.findUnique({
    where: { userId_beatId: { userId, beatId } },
  });

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }

  await prisma.favorite.create({ data: { userId, beatId } });
  return NextResponse.json({ favorited: true });
}
