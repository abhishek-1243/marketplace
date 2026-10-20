import assert from "node:assert/strict";
import test from "node:test";
import { publicationIssue, scoreReadiness } from "./catalog-policy";
import { listingSchema, uploadSchema } from "./upload-schema";

const listing = {
  kind: "BEAT", title: "Dhol at Dusk", genre: "Punjabi", region: "Punjab", instruments: "Dhol and synth",
  description: "Original dhol recordings and spacious synth textures, arranged for a vocal-led independent release.",
  bpm: 100, musicalKey: "Dm", tags: ["dhol", "punjabi", "warm"], basicPrice: 999, premiumPrice: 2999, exclusivePrice: 25000,
  aiDisclosure: "NONE", sampleDisclosure: "NO_SAMPLES", rightsWarranty: true,
  assets: [{ type: "PREVIEW", objectKey: "beats/preview/producer/demo.mp3" }, { type: "MP3", objectKey: "beats/mp3/producer/master.mp3" }],
};

test("publication never bypasses producer, rights or AI restrictions", () => {
  const valid = { status: "PUBLISHED", producerStatus: "APPROVED", rightsStatus: "DECLARED", aiDisclosure: "NONE", kind: "BEAT", discoveryTier: "MARKETPLACE", qualityScore: 80, reviewed: true };
  assert.equal(publicationIssue(valid), null);
  for (const change of [{ producerStatus: "SUSPENDED" }, { producerStatus: "APPLIED" }, { rightsStatus: "REVIEW_REQUIRED" }, { rightsStatus: "RESTRICTED" }, { aiDisclosure: "GENERATED" }, { qualityScore: 59 }, { reviewed: false }]) assert.ok(publicationIssue({ ...valid, ...change }));
  assert.equal(publicationIssue({ ...valid, discoveryTier: "STOREFRONT", qualityScore: 25, reviewed: false }), null);
});

test("readiness measures completeness without plays or sales bias", () => {
  const input = { kind: "BEAT" as const, tags: [], assetTypes: ["PREVIEW", "MP3"] };
  assert.equal(scoreReadiness(input).score, 25);
  assert.ok(scoreReadiness(input).suggestions.length > 0);
  assert.equal(scoreReadiness({ ...listing, kind: "BEAT", coverArt: "https://media.example.com/cover.webp", assetTypes: ["PREVIEW", "MP3", "WAV"] }).score, 100);
});

test("sound packs cannot reuse a beat package or redistribute licensed samples", () => {
  assert.equal(listingSchema.safeParse(listing).success, true);
  assert.equal(listingSchema.safeParse({ ...listing, kind: "SOUND_PACK", sampleCount: 50 }).success, false);
  const pack = { ...listing, kind: "SOUND_PACK", sampleCount: 50, assets: [{ type: "PREVIEW", objectKey: "beats/preview/producer/demo.mp3" }, { type: "PACK", objectKey: "beats/pack/producer/sounds.zip" }] };
  assert.equal(listingSchema.safeParse(pack).success, true);
  assert.equal(listingSchema.safeParse({ ...pack, sampleDisclosure: "ROYALTY_FREE_OR_LICENSED", rightsEvidence: "Sample library licence for song production" }).success, false);
});

test("uploads reject generated work, false declarations and duplicate slots", () => {
  for (const change of [{ aiDisclosure: "GENERATED" }, { rightsWarranty: false }, { sampleDisclosure: "INDIVIDUALLY_CLEARED" }, { assets: [listing.assets[0], listing.assets[0]] }, { basicPrice: 5000 }]) assert.equal(listingSchema.safeParse({ ...listing, ...change }).success, false);
});

test("file limits and upload slot types are enforced server-side", () => {
  const input = { fileName: "demo.mp3", assetType: "PREVIEW", contentType: "audio/mpeg", sizeBytes: 1024 };
  assert.equal(uploadSchema.safeParse(input).success, true);
  assert.equal(uploadSchema.safeParse({ ...input, contentType: "application/zip" }).success, false);
  assert.equal(uploadSchema.safeParse({ ...input, sizeBytes: 21 * 1024 * 1024 }).success, false);
  assert.equal(uploadSchema.safeParse({ ...input, assetType: "PACK", contentType: "application/zip", sizeBytes: 501 * 1024 * 1024 }).success, false);
});
