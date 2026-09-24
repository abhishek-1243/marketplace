"use client";

import BeatCard from "@/components/beats/BeatCard";

export default function SearchResults({ beats }: { beats: any[] }) {
  if (beats.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-[15px] font-medium text-zinc-400">No beats found</p>
        <p className="text-[13px] text-zinc-600 mt-1">Try adjusting your filters</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1">
      {beats.map((beat) => (
        <BeatCard key={beat.id} beat={beat} />
      ))}
    </div>
  );
}
