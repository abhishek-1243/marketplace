export type ListingKind = "BEAT" | "SOUND_PACK";

export function catalogKind(value?: string | null): ListingKind {
  return value === "SOUND_PACK" ? "SOUND_PACK" : "BEAT";
}

export function catalogHref(kind?: string | null) {
  return kind === "SOUND_PACK" ? "/sound-packs" : "/beats";
}

export function listingHref(item: { id: string; kind?: string | null }) {
  return `${catalogHref(item.kind)}/${encodeURIComponent(item.id)}`;
}
