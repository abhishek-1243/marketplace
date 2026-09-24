"use client";

import BeatCard from "@/components/beats/BeatCard";

export default function StorefrontBeats({ beats }: { beats: any[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {beats.map((beat) => (
        <BeatCard key={beat.id} beat={beat} />
      ))}
      {beats.length === 0 && (
        <p className="col-span-full text-center text-gray-500 py-12">
          No beats published yet.
        </p>
      )}
    </div>
  );
}
