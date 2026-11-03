"use client";

import BeatCard, { CatalogCardItem } from "@/components/beats/BeatCard";
import Link from "next/link";
import { Search } from "lucide-react";

export default function SearchResults({ beats }: { beats: CatalogCardItem[] }) {
  if (beats.length === 0) {
    return (
      <div className="empty-state">
        <Search aria-hidden="true" className="mb-4 h-7 w-7 text-muted" />
        <p className="text-[15px] font-medium text-secondary">No sounds found</p>
        <p className="text-[13px] text-muted mt-1">Try adjusting your filters</p>
        <Link href="/search" className="soundfuel-button-secondary mt-5">Clear filters</Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
      {beats.map((beat) => (
        <BeatCard key={beat.id} beat={beat} />
      ))}
    </div>
  );
}
