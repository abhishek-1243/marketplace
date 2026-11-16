"use client";

import BeatCard, { CatalogCardItem } from "@/components/beats/BeatCard";
import Link from "next/link";
import { Search } from "lucide-react";
import { catalogHref, type ListingKind } from "@/lib/listing-kind";

export default function SearchResults({ beats, kind = "BEAT" }: { beats: CatalogCardItem[]; kind?: ListingKind }) {
  if (beats.length === 0) {
    return (
      <div className="empty-state">
        <Search aria-hidden="true" className="mb-4 h-7 w-7 text-muted" />
        <p className="text-[15px] font-medium text-secondary">No {kind === "SOUND_PACK" ? "sound packs" : "beats"} found</p>
        <p className="text-[13px] text-muted mt-1">Try adjusting your filters</p>
        <Link href={catalogHref(kind)} className="soundfuel-button-secondary mt-5">Clear filters</Link>
      </div>
    );
  }

  return (
    <div className="catalog-grid">
      {beats.map((beat) => (
        <BeatCard key={beat.id} beat={beat} />
      ))}
    </div>
  );
}
