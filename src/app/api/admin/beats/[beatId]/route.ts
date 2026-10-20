import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sameOrigin } from "@/lib/request";
import { publicationIssue, QUALITY_VERSION, scoreReadiness } from "@/lib/catalog-policy";

const schema = z.object({ status: z.enum(["DRAFT", "PUBLISHED", "UNPUBLISHED"]), rightsStatus: z.enum(["DECLARED", "REVIEW_REQUIRED", "RESTRICTED"]), discoveryTier: z.enum(["STOREFRONT", "MARKETPLACE", "FEATURED"]), reviewFeedback: z.string().trim().min(10).max(1500) }).strict();
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ beatId: string }> }) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getServerSession(authOptions);
  if (session?.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Choose all review fields and give a decision reason of at least 10 characters" }, { status: 400 });
  const { beatId } = await params;
  const item = await prisma.beat.findUnique({ where: { id: beatId }, include: { producer: { select: { producerStatus: true } }, assets: { select: { type: true } } } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (item.status === "SOLD") return NextResponse.json({ error: "Sold listings cannot be republished" }, { status: 409 });
  const readiness = scoreReadiness({ ...item, tags: Array.isArray(item.tags) ? item.tags.filter((tag): tag is string => typeof tag === "string") : [], assetTypes: item.assets.map((asset) => asset.type) });
  const issue = publicationIssue({ ...item, ...body.data, producerStatus: item.producer.producerStatus, qualityScore: readiness.score, reviewed: true });
  if (issue) return NextResponse.json({ error: issue }, { status: 409 });
  if (body.data.status === "PUBLISHED" && (!item.rightsWarrantyAt || !item.assets.some((asset) => asset.type === "PREVIEW") || !item.assets.some((asset) => asset.type === (item.kind === "SOUND_PACK" ? "PACK" : "MP3")))) return NextResponse.json({ error: "Required files and rights declaration must exist before publication" }, { status: 409 });
  await prisma.$transaction([
    prisma.beat.update({ where: { id: beatId }, data: { ...body.data, qualityScore: readiness.score, qualityVersion: QUALITY_VERSION, reviewedAt: new Date() } }),
    prisma.auditLog.create({ data: { action: "CATALOG_REVIEWED", entityType: "Beat", entityId: beatId, actorId: session.user.id, metadata: { before: { status: item.status, rightsStatus: item.rightsStatus, discoveryTier: item.discoveryTier }, after: body.data } } }),
  ]);
  return NextResponse.json({ ok: true });
}
