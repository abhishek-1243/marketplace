CREATE TYPE "ProducerStatus" AS ENUM ('APPLIED', 'APPROVED', 'SUSPENDED');
CREATE TYPE "CatalogKind" AS ENUM ('BEAT', 'SOUND_PACK');
CREATE TYPE "RightsStatus" AS ENUM ('DECLARED', 'REVIEW_REQUIRED', 'RESTRICTED');
CREATE TYPE "DiscoveryTier" AS ENUM ('STOREFRONT', 'MARKETPLACE', 'FEATURED');
CREATE TYPE "AiDisclosure" AS ENUM ('NONE', 'ASSISTED', 'GENERATED');
ALTER TYPE "AssetType" ADD VALUE 'PACK';
ALTER TYPE "LicenseType" ADD VALUE 'SOUND_PACK';

ALTER TABLE "User"
  ADD COLUMN "producerStatus" "ProducerStatus" NOT NULL DEFAULT 'APPLIED',
  ADD COLUMN "portfolioUrl" TEXT,
  ADD COLUMN "applicationNote" TEXT,
  ADD COLUMN "producerReviewedAt" TIMESTAMP(3);

ALTER TABLE "Beat"
  ADD COLUMN "kind" "CatalogKind" NOT NULL DEFAULT 'BEAT',
  ADD COLUMN "region" TEXT,
  ADD COLUMN "instruments" TEXT,
  ADD COLUMN "sampleCount" INTEGER,
  ADD COLUMN "startingPrice" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "aiDisclosure" "AiDisclosure" NOT NULL DEFAULT 'NONE',
  ADD COLUMN "rightsEvidence" TEXT,
  ADD COLUMN "rightsStatus" "RightsStatus" NOT NULL DEFAULT 'REVIEW_REQUIRED',
  ADD COLUMN "discoveryTier" "DiscoveryTier" NOT NULL DEFAULT 'STOREFRONT',
  ADD COLUMN "qualityScore" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "qualityVersion" TEXT NOT NULL DEFAULT 'readiness-v1',
  ADD COLUMN "reviewFeedback" TEXT,
  ADD COLUMN "reviewedAt" TIMESTAMP(3);

UPDATE "Beat" b SET "startingPrice" = COALESCE(
  (SELECT MIN(p."price") FROM "LicensePlan" p WHERE p."beatId" = b."id" AND p."active" = true), 0
);

CREATE INDEX "Beat_kind_status_discoveryTier_qualityScore_idx"
  ON "Beat"("kind", "status", "discoveryTier", "qualityScore");
ALTER TABLE "Beat" ADD CONSTRAINT "Beat_qualityScore_range" CHECK ("qualityScore" BETWEEN 0 AND 100);
ALTER TABLE "Beat" ADD CONSTRAINT "Beat_startingPrice_nonnegative" CHECK ("startingPrice" >= 0);
