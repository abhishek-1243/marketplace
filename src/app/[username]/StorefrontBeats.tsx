"use client";

import BeatCard, { CatalogCardItem } from "@/components/beats/BeatCard";

export default function StorefrontBeats({ beats }: { beats: CatalogCardItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
      {beats.map((beat) => (
        <BeatCard key={beat.id} beat={beat} />
      ))}
      {beats.length === 0 && (
        <p className="empty-state col-span-full text-secondary">
          No sounds published yet.
        </p>
      )}
    </div>
  );
}
