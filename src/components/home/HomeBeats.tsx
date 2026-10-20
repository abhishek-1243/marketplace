"use client";

import BeatCard from "@/components/beats/BeatCard";

interface HomeBeatProps {
  beats: any[];
}

export default function HomeBeats({ beats }: HomeBeatProps) {
  if (!beats.length) return <div className="surface rounded-xl px-6 py-10 text-center"><p className="text-sm text-zinc-400">Our founding collection is taking shape.</p><p className="mt-2 text-xs text-zinc-500">Selected sounds will appear here as creators join.</p></div>;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1">
      {beats.map((beat) => (
        <BeatCard key={beat.id} beat={beat} />
      ))}
    </div>
  );
}
