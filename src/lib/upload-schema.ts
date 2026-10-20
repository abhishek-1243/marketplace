import { z } from "zod";
import { MAX_ASSET_BYTES, MAX_PREVIEW_BYTES } from "./catalog-policy";
import { isHttpUrl } from "./web-url";

export const assetTypes = ["PREVIEW", "MP3", "WAV", "STEMS", "PACK"] as const;
export const contentTypes: Record<string, string[]> = {
  PREVIEW: ["audio/mpeg"], MP3: ["audio/mpeg"],
  WAV: ["audio/wav", "audio/x-wav"], STEMS: ["application/zip"], PACK: ["application/zip"],
};

export const uploadSchema = z.object({
  fileName: z.string().min(1).max(180), contentType: z.string(),
  assetType: z.enum(assetTypes), sizeBytes: z.number().int().positive().max(MAX_ASSET_BYTES),
}).strict().superRefine((input, ctx) => {
  if (!contentTypes[input.assetType].includes(input.contentType)) ctx.addIssue({ code: "custom", path: ["contentType"], message: "File type does not match the upload slot" });
  if (input.assetType === "PREVIEW" && input.sizeBytes > MAX_PREVIEW_BYTES) ctx.addIssue({ code: "custom", path: ["sizeBytes"], message: "Preview must be 20 MB or smaller" });
});

export const listingSchema = z.object({
  kind: z.enum(["BEAT", "SOUND_PACK"]).default("BEAT"),
  title: z.string().trim().min(2).max(120), genre: z.string().trim().min(2).max(40),
  mood: z.string().trim().max(40).optional(), bpm: z.number().int().min(40).max(300).optional(),
  musicalKey: z.string().trim().max(8).optional(),
  tags: z.array(z.string().trim().min(1).max(30)).max(12).default([]),
  description: z.string().trim().min(40).max(2000),
  region: z.string().trim().min(2).max(80), instruments: z.string().trim().min(2).max(160),
  sampleCount: z.number().int().min(1).max(100000).optional(), coverArt: z.string().url().max(1000).refine(isHttpUrl).optional(),
  aiDisclosure: z.enum(["NONE", "ASSISTED", "GENERATED"]),
  sampleDisclosure: z.enum(["NO_SAMPLES", "ROYALTY_FREE_OR_LICENSED", "INDIVIDUALLY_CLEARED"]),
  rightsEvidence: z.string().trim().max(3000).default(""), rightsWarranty: z.literal(true),
  basicPrice: z.number().int().min(499).max(1000000),
  premiumPrice: z.number().int().min(499).max(1000000).optional(),
  exclusivePrice: z.number().int().min(499).max(10000000).optional(),
  assets: z.array(z.object({ type: z.enum(assetTypes), objectKey: z.string().min(10).max(400) }).strict()).min(2).max(4),
}).strict().superRefine((input, ctx) => {
  const types = input.assets.map((asset) => asset.type);
  if (new Set(types).size !== types.length || !types.includes("PREVIEW")) ctx.addIssue({ code: "custom", path: ["assets"], message: "Include one preview and no duplicate file slots" });
  if (input.kind === "SOUND_PACK" && (!types.includes("PACK") || types.some((type) => !["PACK", "PREVIEW"].includes(type)) || !input.sampleCount)) ctx.addIssue({ code: "custom", path: ["assets"], message: "Sound packs require a preview, ZIP and sample count" });
  if (input.kind === "BEAT" && (!types.includes("MP3") || types.includes("PACK") || !input.premiumPrice || !input.exclusivePrice)) ctx.addIssue({ code: "custom", path: ["assets"], message: "Beats require an MP3 master and licence prices" });
  if (input.kind === "BEAT" && ((input.premiumPrice ?? 0) < input.basicPrice || (input.exclusivePrice ?? 0) < (input.premiumPrice ?? 0))) ctx.addIssue({ code: "custom", path: ["basicPrice"], message: "Licence prices must increase from Basic to Premium to Exclusive" });
  if (input.aiDisclosure === "GENERATED") ctx.addIssue({ code: "custom", path: ["aiDisclosure"], message: "Substantially generated audio is not accepted in this catalog" });
  if (input.sampleDisclosure !== "NO_SAMPLES" && input.rightsEvidence.length < 20) ctx.addIssue({ code: "custom", path: ["rightsEvidence"], message: "Describe sample sources, licence permissions and clearance evidence" });
  if (input.kind === "SOUND_PACK" && input.sampleDisclosure !== "NO_SAMPLES") ctx.addIssue({ code: "custom", path: ["sampleDisclosure"], message: "Only original recordings may be redistributed as a sound pack" });
});
