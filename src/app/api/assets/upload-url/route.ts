import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createObjectKey, createPresignedUpload, storageConfigured } from "@/lib/storage";
import { sameOrigin } from "@/lib/request";

import { prisma } from "@/lib/prisma";
import { uploadSchema } from "@/lib/upload-schema";
import { PRODUCER_CATALOG_LIMIT } from "@/lib/catalog-policy";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PRODUCER") {
    return NextResponse.json({ error: "Producer account required" }, { status: 403 });
  }
  const producer = await prisma.user.findUnique({ where: { id: session.user.id }, select: { producerStatus: true, _count: { select: { beats: true } } } });
  if (producer?.producerStatus !== "APPROVED") return NextResponse.json({ error: "Producer approval is required before uploading" }, { status: 403 });
  if (producer._count.beats >= PRODUCER_CATALOG_LIMIT) return NextResponse.json({ error: "Catalog limit reached" }, { status: 409 });
  if (!storageConfigured) return NextResponse.json({ error: "Media uploads are not configured yet" }, { status: 503 });
  const parsed = uploadSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Unsupported file" }, { status: 400 });
  const objectKey = createObjectKey(session.user.id, `beats/${parsed.data.assetType.toLowerCase()}`, parsed.data.fileName);
  const uploadUrl = await createPresignedUpload(objectKey, parsed.data.contentType);
  return NextResponse.json({ uploadUrl, objectKey });
}
