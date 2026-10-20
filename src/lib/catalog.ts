import "server-only";
import { Prisma } from "@prisma/client";

export const publicCatalogWhere = {
  status: "PUBLISHED", rightsStatus: "DECLARED", aiDisclosure: { not: "GENERATED" },
  producer: { producerStatus: "APPROVED", role: "PRODUCER" },
} satisfies Prisma.BeatWhereInput;

export const marketplaceWhere = {
  ...publicCatalogWhere,
  discoveryTier: { in: ["MARKETPLACE", "FEATURED"] },
  reviewedAt: { not: null },
  qualityScore: { gte: 60 },
} satisfies Prisma.BeatWhereInput;

// Deliberate allowlist: scores, evidence, legal names and object keys stay private.
export const catalogSelect = {
  id: true, title: true, slug: true, kind: true, coverArt: true, genre: true, mood: true,
  bpm: true, musicalKey: true, plays: true, description: true, region: true,
  instruments: true, sampleCount: true, aiDisclosure: true, startingPrice: true,
  producer: { select: { displayName: true, username: true } },
  assets: { where: { type: "PREVIEW" }, select: { id: true } },
  licensePlans: { where: { active: true }, select: { price: true, type: true } },
} satisfies Prisma.BeatSelect;

export type CatalogItem = Prisma.BeatGetPayload<{ select: typeof catalogSelect }>;
export function serializeCatalogItem({ assets, ...item }: CatalogItem) {
  return { ...item, previewUrl: assets.length ? `/api/beats/${item.id}/preview` : null };
}

export function catalogOrder(sort?: string): Prisma.BeatOrderByWithRelationInput[] {
  if (sort === "newest") return [{ createdAt: "desc" }, { id: "desc" }];
  if (sort === "price_low") return [{ startingPrice: "asc" }, { id: "asc" }];
  return [{ discoveryTier: "desc" }, { qualityScore: "desc" }, { createdAt: "desc" }, { id: "desc" }];
}
