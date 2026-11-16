-- Empty-catalog upgrade: product/order data must not be discarded.
-- User accounts, profiles and follows are preserved.
BEGIN;
LOCK TABLE "Beat", "BeatAsset", "LicensePlan", "Favorite", "Order" IN ACCESS EXCLUSIVE MODE;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Beat") OR EXISTS (SELECT 1 FROM "BeatAsset")
     OR EXISTS (SELECT 1 FROM "LicensePlan") OR EXISTS (SELECT 1 FROM "Favorite")
     OR EXISTS (SELECT 1 FROM "Order") THEN
    RAISE EXCEPTION 'Catalog split requires empty product/order tables. No changes applied. Use a data-preserving migration if records exist.';
  END IF;
END $$;

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'SOLD');

-- CreateEnum
CREATE TYPE "BeatLicenseType" AS ENUM ('BASIC', 'PREMIUM', 'EXCLUSIVE');

-- DropForeignKey
ALTER TABLE "Beat" DROP CONSTRAINT "Beat_producerId_fkey";

-- DropForeignKey
ALTER TABLE "BeatAsset" DROP CONSTRAINT "BeatAsset_beatId_fkey";

-- DropForeignKey
ALTER TABLE "LicensePlan" DROP CONSTRAINT "LicensePlan_beatId_fkey";

-- DropForeignKey
ALTER TABLE "Favorite" DROP CONSTRAINT "Favorite_beatId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_beatId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_licensePlanId_fkey";

-- DropIndex
DROP INDEX "Beat_status_genre_idx";

-- DropIndex
DROP INDEX "Beat_producerId_status_idx";

-- DropIndex
DROP INDEX "Beat_kind_status_discoveryTier_qualityScore_idx";

-- DropIndex
DROP INDEX "Beat_producerId_slug_key";

-- DropIndex
DROP INDEX "Favorite_userId_beatId_key";

-- AlterTable
ALTER TABLE "Beat" DROP CONSTRAINT "Beat_pkey",
DROP COLUMN "aiDisclosure",
DROP COLUMN "coverArt",
DROP COLUMN "createdAt",
DROP COLUMN "description",
DROP COLUMN "discoveryTier",
DROP COLUMN "genre",
DROP COLUMN "id",
DROP COLUMN "instruments",
DROP COLUMN "kind",
DROP COLUMN "mood",
DROP COLUMN "plays",
DROP COLUMN "producerId",
DROP COLUMN "qualityScore",
DROP COLUMN "qualityVersion",
DROP COLUMN "region",
DROP COLUMN "reviewFeedback",
DROP COLUMN "reviewedAt",
DROP COLUMN "rightsEvidence",
DROP COLUMN "rightsStatus",
DROP COLUMN "rightsWarrantyAt",
DROP COLUMN "sampleCount",
DROP COLUMN "sampleDisclosure",
DROP COLUMN "slug",
DROP COLUMN "startingPrice",
DROP COLUMN "status",
DROP COLUMN "tags",
DROP COLUMN "title",
DROP COLUMN "updatedAt",
ADD COLUMN     "listingId" TEXT NOT NULL,
ADD CONSTRAINT "Beat_pkey" PRIMARY KEY ("listingId");

-- AlterTable
ALTER TABLE "Favorite" DROP COLUMN "beatId",
ADD COLUMN     "listingId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "beatId",
DROP COLUMN "licensePlanId",
DROP COLUMN "licenseSnapshot";

-- DropTable
DROP TABLE "BeatAsset";

-- DropTable
DROP TABLE "LicensePlan";

-- DropEnum
DROP TYPE "BeatStatus";

-- DropEnum
DROP TYPE "LicenseType";

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" "CatalogKind" NOT NULL DEFAULT 'BEAT',
    "slug" TEXT NOT NULL,
    "coverArt" TEXT,
    "genre" TEXT NOT NULL,
    "mood" TEXT,
    "tags" JSONB,
    "description" TEXT,
    "region" TEXT,
    "instruments" TEXT,
    "startingPrice" INTEGER NOT NULL DEFAULT 0,
    "aiDisclosure" "AiDisclosure" NOT NULL DEFAULT 'NONE',
    "rightsEvidence" TEXT,
    "rightsStatus" "RightsStatus" NOT NULL DEFAULT 'REVIEW_REQUIRED',
    "discoveryTier" "DiscoveryTier" NOT NULL DEFAULT 'STOREFRONT',
    "qualityScore" INTEGER NOT NULL DEFAULT 0,
    "qualityVersion" TEXT NOT NULL DEFAULT 'readiness-v1',
    "reviewFeedback" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "status" "ListingStatus" NOT NULL DEFAULT 'DRAFT',
    "plays" INTEGER NOT NULL DEFAULT 0,
    "sampleDisclosure" "SampleDisclosure" NOT NULL DEFAULT 'NO_SAMPLES',
    "rightsWarrantyAt" TIMESTAMP(3),
    "producerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingAsset" (
    "id" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "objectKey" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "checksum" TEXT,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoundPack" (
    "listingId" TEXT NOT NULL,
    "sampleCount" INTEGER NOT NULL,

    CONSTRAINT "SoundPack_pkey" PRIMARY KEY ("listingId")
);

-- CreateTable
CREATE TABLE "SoundPackLicensePlan" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "territory" TEXT NOT NULL DEFAULT 'WORLDWIDE',
    "commercialUse" BOOLEAN NOT NULL DEFAULT true,
    "redistributionAllowed" BOOLEAN NOT NULL DEFAULT false,
    "contentIdAllowed" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "templateVersion" TEXT NOT NULL DEFAULT '2026-01',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoundPackLicensePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "beatLicensePlanId" TEXT,
    "soundPackLicensePlanId" TEXT,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "licenseSnapshot" JSONB NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeatLicensePlan" (
    "id" TEXT NOT NULL,
    "type" "BeatLicenseType" NOT NULL,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "includesMp3" BOOLEAN NOT NULL DEFAULT true,
    "includesWav" BOOLEAN NOT NULL DEFAULT false,
    "includesStems" BOOLEAN NOT NULL DEFAULT false,
    "termMonths" INTEGER,
    "territory" TEXT NOT NULL DEFAULT 'WORLDWIDE',
    "masterRecordingLimit" INTEGER NOT NULL DEFAULT 1,
    "streamingLimit" INTEGER,
    "videoLimit" INTEGER,
    "commercialUse" BOOLEAN NOT NULL DEFAULT true,
    "livePerformance" BOOLEAN NOT NULL DEFAULT true,
    "youtubeMonetization" BOOLEAN NOT NULL DEFAULT true,
    "contentIdAllowed" BOOLEAN NOT NULL DEFAULT false,
    "producerPublishingPct" INTEGER NOT NULL DEFAULT 50,
    "isExclusive" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "templateVersion" TEXT NOT NULL DEFAULT '2026-01',
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BeatLicensePlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Listing_status_genre_idx" ON "Listing"("status", "genre");

-- CreateIndex
CREATE INDEX "Listing_producerId_status_idx" ON "Listing"("producerId", "status");

-- CreateIndex
CREATE INDEX "Listing_kind_status_discoveryTier_qualityScore_idx" ON "Listing"("kind", "status", "discoveryTier", "qualityScore");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_producerId_slug_key" ON "Listing"("producerId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "ListingAsset_listingId_type_key" ON "ListingAsset"("listingId", "type");

-- CreateIndex
CREATE INDEX "SoundPackLicensePlan_listingId_active_idx" ON "SoundPackLicensePlan"("listingId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "SoundPackLicensePlan_id_listingId_key" ON "SoundPackLicensePlan"("id", "listingId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_orderId_key" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_listingId_idx" ON "OrderItem"("listingId");

-- CreateIndex
CREATE INDEX "BeatLicensePlan_listingId_active_idx" ON "BeatLicensePlan"("listingId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "BeatLicensePlan_listingId_type_key" ON "BeatLicensePlan"("listingId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "BeatLicensePlan_id_listingId_key" ON "BeatLicensePlan"("id", "listingId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_listingId_key" ON "Favorite"("userId", "listingId");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_producerId_fkey" FOREIGN KEY ("producerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingAsset" ADD CONSTRAINT "ListingAsset_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Beat" ADD CONSTRAINT "Beat_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoundPack" ADD CONSTRAINT "SoundPack_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoundPackLicensePlan" ADD CONSTRAINT "SoundPackLicensePlan_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "SoundPack"("listingId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_beatLicensePlanId_listingId_fkey" FOREIGN KEY ("beatLicensePlanId", "listingId") REFERENCES "BeatLicensePlan"("id", "listingId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_soundPackLicensePlanId_listingId_fkey" FOREIGN KEY ("soundPackLicensePlanId", "listingId") REFERENCES "SoundPackLicensePlan"("id", "listingId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeatLicensePlan" ADD CONSTRAINT "BeatLicensePlan_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Beat"("listingId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- One matching detail row per listing, checked at transaction commit so nested
-- Prisma creates/deletes can write the parent and child in either order.
CREATE FUNCTION assert_listing_subtype(target_id TEXT) RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE product_kind "CatalogKind"; has_beat BOOLEAN; has_pack BOOLEAN;
BEGIN
  SELECT kind INTO product_kind FROM "Listing" WHERE id = target_id FOR UPDATE;
  IF NOT FOUND THEN RETURN; END IF;
  SELECT EXISTS (SELECT 1 FROM "Beat" WHERE "listingId" = target_id),
         EXISTS (SELECT 1 FROM "SoundPack" WHERE "listingId" = target_id)
    INTO has_beat, has_pack;
  IF (product_kind = 'BEAT' AND (NOT has_beat OR has_pack))
     OR (product_kind = 'SOUND_PACK' AND (NOT has_pack OR has_beat)) THEN
    RAISE EXCEPTION 'Listing % must have exactly one matching product detail row', target_id USING ERRCODE = '23514';
  END IF;
END $$;

CREATE FUNCTION enforce_listing_subtype() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE old_id TEXT; new_id TEXT;
BEGIN
  IF TG_OP <> 'INSERT' THEN
    old_id := COALESCE(to_jsonb(OLD)->>'listingId', to_jsonb(OLD)->>'id');
    PERFORM assert_listing_subtype(old_id);
  END IF;
  IF TG_OP <> 'DELETE' THEN
    new_id := COALESCE(to_jsonb(NEW)->>'listingId', to_jsonb(NEW)->>'id');
    IF new_id IS DISTINCT FROM old_id THEN PERFORM assert_listing_subtype(new_id); END IF;
  END IF;
  RETURN NULL;
END $$;

CREATE CONSTRAINT TRIGGER listing_subtype_check AFTER INSERT OR UPDATE OR DELETE ON "Listing"
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION enforce_listing_subtype();
CREATE CONSTRAINT TRIGGER beat_subtype_check AFTER INSERT OR UPDATE OR DELETE ON "Beat"
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION enforce_listing_subtype();
CREATE CONSTRAINT TRIGGER sound_pack_subtype_check AFTER INSERT OR UPDATE OR DELETE ON "SoundPack"
  DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION enforce_listing_subtype();

ALTER TABLE "SoundPack" ADD CONSTRAINT "SoundPack_sampleCount_positive" CHECK ("sampleCount" > 0);
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_qualityScore_range" CHECK ("qualityScore" BETWEEN 0 AND 100);
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_startingPrice_nonnegative" CHECK ("startingPrice" >= 0);
ALTER TABLE "BeatLicensePlan" ADD CONSTRAINT "BeatLicensePlan_price_nonnegative" CHECK (price >= 0);
ALTER TABLE "SoundPackLicensePlan" ADD CONSTRAINT "SoundPackLicensePlan_price_nonnegative" CHECK (price >= 0);
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_one_license" CHECK (
  ("beatLicensePlanId" IS NOT NULL)::int + ("soundPackLicensePlanId" IS NOT NULL)::int = 1
);
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_price_nonnegative" CHECK (price >= 0);
COMMIT;
