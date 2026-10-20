import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sameOrigin } from "@/lib/request";
import { listingMetadataSchema } from "@/lib/listing-metadata";
import { QUALITY_VERSION, scoreReadiness } from "@/lib/catalog-policy";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ beatId: string }> }) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "PRODUCER") return NextResponse.json({ error: "Producer account required" }, { status: 403 });
  const parsed = listingMetadataSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid listing details" }, { status: 400 });
  const { beatId } = await params;
  const item = await prisma.beat.findFirst({ where: { id: beatId, producerId: session.user.id, producer: { producerStatus: "APPROVED" } }, include: { assets: { select: { type: true } } } });
  if (!item) return NextResponse.json({ error: "Listing unavailable" }, { status: 404 });
  if (item.status === "SOLD") return NextResponse.json({ error: "Sold listings cannot be edited" }, { status: 409 });
  const readiness = scoreReadiness({ ...item, ...parsed.data, assetTypes: item.assets.map((asset) => asset.type) });
  // Preserve restrictions and publication state. Editing cannot clear a rights review.
  const updated = await prisma.beat.updateMany({
    where: { id: item.id, producerId: session.user.id, updatedAt: item.updatedAt, producer: { producerStatus: "APPROVED" } },
    data: { ...parsed.data, discoveryTier: "STOREFRONT", reviewedAt: null, qualityScore: readiness.score, qualityVersion: QUALITY_VERSION },
  });
  if (updated.count !== 1) return NextResponse.json({ error: "This listing changed during editing. Refresh and try again." }, { status: 409 });
  return NextResponse.json({ ok: true });
}
