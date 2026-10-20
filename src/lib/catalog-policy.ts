export const GENRES = ["Desi Hip-Hop", "Punjabi", "Hip-Hop", "Trap", "R&B", "Pop", "Indian Classical", "Folk", "Cinematic", "Lo-fi", "Experimental"];
export const MAX_ASSET_BYTES = 500 * 1024 * 1024;
export const MAX_PREVIEW_BYTES = 20 * 1024 * 1024;
export const PRODUCER_CATALOG_LIMIT = 100;
export const MIN_DISCOVERY_SCORE = 60;
export const QUALITY_VERSION = "readiness-v1";

export type ReadinessInput = {
  kind: "BEAT" | "SOUND_PACK";
  description?: string | null;
  coverArt?: string | null;
  bpm?: number | null;
  musicalKey?: string | null;
  region?: string | null;
  instruments?: string | null;
  sampleCount?: number | null;
  tags: string[];
  assetTypes: string[];
};

// Completeness only: this does not analyse sound, detect AI, or clear copyright.
export function scoreReadiness(input: ReadinessInput) {
  const checks = [
    { ok: input.assetTypes.includes("PREVIEW"), points: 25, tip: "Add an MP3 listening preview." },
    { ok: input.kind === "SOUND_PACK" ? input.assetTypes.includes("PACK") : input.assetTypes.includes("WAV"), points: 25, tip: input.kind === "SOUND_PACK" ? "Add the sound-pack ZIP." : "Add a WAV master." },
    { ok: Boolean(input.coverArt), points: 10, tip: "Add original cover artwork." },
    { ok: (input.description?.trim().length ?? 0) >= 80, points: 10, tip: "Describe the recording, contents and intended use in at least 80 characters." },
    { ok: input.tags.length >= 3, points: 10, tip: "Add at least three accurate tags." },
    { ok: Boolean(input.region?.trim() && input.instruments?.trim()), points: 10, tip: "Describe the regional influence and instruments." },
    { ok: input.kind === "SOUND_PACK" ? Boolean(input.sampleCount && input.sampleCount > 0) : Boolean(input.bpm && input.musicalKey), points: 10, tip: input.kind === "SOUND_PACK" ? "Specify the sample count." : "Specify BPM and key." },
  ];
  return {
    score: checks.reduce((sum, check) => sum + (check.ok ? check.points : 0), 0),
    suggestions: checks.filter((check) => !check.ok).map((check) => check.tip),
  };
}

export function publicationIssue(input: {
  status: string; producerStatus: string; rightsStatus: string; aiDisclosure: string;
  kind: string; discoveryTier: string; qualityScore: number; reviewed: boolean;
}) {
  if (input.status !== "PUBLISHED") return null;
  if (input.producerStatus !== "APPROVED") return "Approve the producer before publication.";
  if (input.rightsStatus !== "DECLARED") return "Resolve the rights review before publication.";
  if (input.aiDisclosure === "GENERATED") return "Substantially AI-generated audio is not eligible for this catalog.";
  if (input.discoveryTier !== "STOREFRONT") {
    if (input.qualityScore < MIN_DISCOVERY_SCORE) return `Marketplace listings need at least ${MIN_DISCOVERY_SCORE}/100 readiness.`;
    if (!input.reviewed) return "Complete the editorial review before enabling marketplace discovery.";
  }
  return null;
}
