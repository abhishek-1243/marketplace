import "server-only";
import { Prisma } from "@prisma/client";
import { listingHref } from "./listing-kind";

export const publicCatalogWhere = {
  status: "PUBLISHED", rightsStatus: "DECLARED", aiDisclosure: { not: "GENERATED" },
  producer: { producerStatus: "APPROVED", role: "PRODUCER" },
} satisfies Prisma.ListingWhereInput;

export const marketplaceWhere = {
  ...publicCatalogWhere, discoveryTier: { in: ["MARKETPLACE", "FEATURED"] },
  reviewedAt: { not: null }, qualityScore: { gte: 60 },
} satisfies Prisma.ListingWhereInput;

// Only public presentation fields. Ownership evidence, object keys and internal scores stay private.
export const catalogSelect = {
  id: true, title: true, slug: true, kind: true, coverArt: true, genre: true, mood: true,
  plays: true, description: true, region: true, instruments: true, aiDisclosure: true, startingPrice: true,
  producer: { select: { displayName: true, username: true } },
  assets: { where: { type: "PREVIEW" }, select: { id: true } },
  beat: { select: { bpm: true, musicalKey: true, licensePlans: { where: { active: true }, select: { price: true, type: true } } } },
  soundPack: { select: { sampleCount: true, licensePlans: { where: { active: true }, select: { price: true } } } },
} satisfies Prisma.ListingSelect;

export type CatalogItem = Prisma.ListingGetPayload<{ select: typeof catalogSelect }>;
export function serializeCatalogItem({ assets, beat, soundPack, ...item }: CatalogItem) {
  return {
    ...item, bpm: beat?.bpm ?? null, musicalKey: beat?.musicalKey ?? null,
    sampleCount: soundPack?.sampleCount ?? null,
    licensePlans: item.kind === "BEAT" ? beat?.licensePlans ?? [] : (soundPack?.licensePlans ?? []).map((plan) => ({ ...plan, type: "SOUND_PACK" })),
    href: listingHref(item), previewUrl: assets.length ? `/api/listings/${item.id}/preview` : null,
  };
}

export function catalogOrder(sort?: string): Prisma.ListingOrderByWithRelationInput[] {
  if (sort === "newest") return [{ createdAt: "desc" }, { id: "desc" }];
  if (sort === "price_low") return [{ startingPrice: "asc" }, { id: "asc" }];
  return [{ discoveryTier: "desc" }, { qualityScore: "desc" }, { createdAt: "desc" }, { id: "desc" }];
}
