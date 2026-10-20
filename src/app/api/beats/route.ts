import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";
import { sameOrigin } from "@/lib/request";
import { storageConfigured, verifyObject } from "@/lib/storage";
import { catalogOrder, catalogSelect, marketplaceWhere, serializeCatalogItem } from "@/lib/catalog";
import { MAX_ASSET_BYTES, MAX_PREVIEW_BYTES, PRODUCER_CATALOG_LIMIT, QUALITY_VERSION, scoreReadiness } from "@/lib/catalog-policy";
import { contentTypes, listingSchema } from "@/lib/upload-schema";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const page = Math.floor(Math.min(1000, Math.max(1, Number(params.get("page")) || 1)));
  const q = params.get("q")?.trim().slice(0, 80);
  const where: Prisma.BeatWhereInput = {
    ...marketplaceWhere,
    ...(params.get("kind") === "BEAT" || params.get("kind") === "SOUND_PACK" ? { kind: params.get("kind") as "BEAT" | "SOUND_PACK" } : {}),
    ...(params.get("genre") && params.get("genre") !== "All" ? { genre: params.get("genre")! } : {}),
    ...(q ? { OR: ["title", "genre", "description", "instruments", "region"].map((field) => ({ [field]: { contains: q, mode: "insensitive" } })) } : {}),
  };
  const items = await prisma.beat.findMany({ where, orderBy: catalogOrder(params.get("sort") ?? undefined), skip: (page - 1) * 24, take: 24, select: catalogSelect });
  return NextResponse.json(items.map(serializeCatalogItem));
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "PRODUCER") return NextResponse.json({ error: "Producer account required" }, { status: 403 });
  const producer = await prisma.user.findUnique({ where: { id: session.user.id }, select: { legalName: true, producerStatus: true } });
  if (producer?.producerStatus !== "APPROVED") return NextResponse.json({ error: "Your producer application must be approved before uploading" }, { status: 403 });
  if (!producer.legalName) return NextResponse.json({ error: "Add your legal name in settings" }, { status: 409 });
  if (!storageConfigured) return NextResponse.json({ error: "Media uploads are not configured yet" }, { status: 503 });
  const parsed = listingSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid listing" }, { status: 400 });
  const input = parsed.data;
  if (input.assets.some((asset) => !asset.objectKey.startsWith(`beats/${asset.type.toLowerCase()}/${session.user.id}/`))) return NextResponse.json({ error: "Invalid uploaded asset" }, { status: 403 });
  let assets;
  try {
    assets = await Promise.all(input.assets.map(async (asset) => {
      const { encrypted, ...verified } = await verifyObject(asset.objectKey);
      const limit = asset.type === "PREVIEW" ? MAX_PREVIEW_BYTES : MAX_ASSET_BYTES;
      if (!encrypted || verified.sizeBytes < 1 || verified.sizeBytes > limit || !contentTypes[asset.type].includes(verified.contentType)) throw new Error("Invalid asset");
      return { ...asset, ...verified };
    }));
  } catch {
    return NextResponse.json({ error: "A file could not be verified. Check its type, size and encryption, then upload it again." }, { status: 400 });
  }
  const score = scoreReadiness({ ...input, assetTypes: assets.map((asset) => asset.type) });
  const rightsStatus = input.sampleDisclosure === "NO_SAMPLES" ? "DECLARED" : "REVIEW_REQUIRED";
  const hasWav = assets.some((asset) => asset.type === "WAV");
  const hasStems = assets.some((asset) => asset.type === "STEMS");
  try {
    const item = await prisma.$transaction(async (tx) => {
      // Lock the producer row so concurrent submissions cannot bypass the catalog limit.
      const approved = await tx.user.updateMany({ where: { id: session.user.id, producerStatus: "APPROVED" }, data: { updatedAt: new Date() } });
      if (approved.count !== 1) throw new Error("PRODUCER_UNAVAILABLE");
      if (await tx.beat.count({ where: { producerId: session.user.id } }) >= PRODUCER_CATALOG_LIMIT) throw new Error("CATALOG_LIMIT");
      return tx.beat.create({
        data: {
          title: input.title, slug: `${slugify(input.title)}-${crypto.randomUUID()}`,
          kind: input.kind, genre: input.genre, mood: input.mood, bpm: input.bpm,
          musicalKey: input.musicalKey, tags: input.tags, description: input.description,
          region: input.region, instruments: input.instruments, sampleCount: input.sampleCount,
          coverArt: input.coverArt, producerId: session.user.id,
          status: rightsStatus === "DECLARED" ? "PUBLISHED" : "DRAFT", rightsStatus,
          discoveryTier: "STOREFRONT", aiDisclosure: input.aiDisclosure,
          rightsEvidence: input.rightsEvidence || null, sampleDisclosure: input.sampleDisclosure,
          rightsWarrantyAt: new Date(), qualityScore: score.score, qualityVersion: QUALITY_VERSION,
          startingPrice: input.basicPrice, assets: { create: assets },
          licensePlans: { create: input.kind === "SOUND_PACK" ? [{
            type: "SOUND_PACK", price: input.basicPrice, includesMp3: false,
            producerPublishingPct: 0, termMonths: null,
          }] : [
            { type: "BASIC", price: input.basicPrice, termMonths: 120, streamingLimit: 500000, videoLimit: 1 },
            { type: "PREMIUM", price: input.premiumPrice!, includesWav: hasWav, active: hasWav, termMonths: 120 },
            { type: "EXCLUSIVE", price: input.exclusivePrice!, includesWav: hasWav, includesStems: hasStems, active: hasWav && hasStems, isExclusive: true },
          ] },
        },
        select: { id: true, status: true, rightsStatus: true, discoveryTier: true },
      });
    });
    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "CATALOG_LIMIT") return NextResponse.json({ error: `The founding catalog allows ${PRODUCER_CATALOG_LIMIT} listings per producer. Contact support for help.` }, { status: 409 });
    if (error instanceof Error && error.message === "PRODUCER_UNAVAILABLE") return NextResponse.json({ error: "Producer access is unavailable" }, { status: 403 });
    console.error("Catalog submission failed");
    return NextResponse.json({ error: "Could not save this listing. Please try again." }, { status: 500 });
  }
}
