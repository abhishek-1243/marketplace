import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPresignedDownload, storageConfigured } from "@/lib/storage";
import { publicCatalogWhere } from "@/lib/catalog";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(_req: NextRequest, context: { params: Promise<{ beatId: string }> }) {
  const { beatId } = await context.params;
  const session = await getServerSession(authOptions);
  const beat = await prisma.beat.findFirst({
    where: { id: beatId, ...(session?.user.role === "ADMIN" ? {} : session ? { OR: [publicCatalogWhere, { producerId: session.user.id }] } : publicCatalogWhere) },
    select: { assets: { where: { type: "PREVIEW" }, take: 1, select: { objectKey: true } } },
  });
  const asset = beat?.assets[0];
  if (!asset) return NextResponse.json({ error: "Preview not found" }, { status: 404 });
  if (!storageConfigured) return NextResponse.json({ error: "Preview storage is not configured" }, { status: 503 });
  // A preview URL request is not a qualified listen. Do not inflate popularity here.
  const response = NextResponse.redirect(await createPresignedDownload(asset.objectKey), 307);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
