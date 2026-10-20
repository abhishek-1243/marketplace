import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { AssetType } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createPresignedDownload } from "@/lib/storage";
import { requestMetadata } from "@/lib/request";

export async function GET(req: NextRequest, context: { params: Promise<{ orderId: string; assetType: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { orderId, assetType: rawType } = await context.params;
  const assetType = rawType.toUpperCase() as AssetType;
  if (!["MP3", "WAV", "STEMS"].includes(assetType)) {
    return NextResponse.json({ error: "Invalid asset type" }, { status: 400 });
  }
  const order = await prisma.order.findFirst({
    where: { id: orderId, artistId: session.user.id, status: "PAID", entitlement: { active: true } },
    include: { licensePlan: true, beat: { include: { assets: true } } },
  });
  if (!order) return NextResponse.json({ error: "Purchase not found" }, { status: 404 });
  const permitted = assetType === "MP3"
    ? order.licensePlan.includesMp3
    : assetType === "WAV"
      ? order.licensePlan.includesWav
      : order.licensePlan.includesStems;
  if (!permitted) return NextResponse.json({ error: "Asset not included in this licence" }, { status: 403 });
  const asset = order.beat.assets.find((item) => item.type === assetType);
  if (!asset) return NextResponse.json({ error: "Asset unavailable" }, { status: 404 });
  const meta = requestMetadata(req);
  await prisma.download.create({
    data: { fileType: assetType, orderId: order.id, userId: session.user.id, ip: meta.ip, userAgent: meta.userAgent },
  });
  const extension = assetType === "STEMS" ? "zip" : assetType.toLowerCase();
  return NextResponse.redirect(
    await createPresignedDownload(asset.objectKey, `${order.beat.slug}-${assetType.toLowerCase()}.${extension}`),
    307,
  );
}
