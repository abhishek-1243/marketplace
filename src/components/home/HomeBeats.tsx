"use client";

import BeatCard from "@/components/beats/BeatCard";

interface HomeBeatProps {
  beats: any[];
}

export default function HomeBeats({ beats }: HomeBeatProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1">
      {beats.map((beat) => (
        <BeatCard key={beat.id} beat={beat} />
      ))}
    </div>
  );
}
