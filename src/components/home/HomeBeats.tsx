"use client";

import BeatCard, { CatalogCardItem } from "@/components/beats/BeatCard";
import { AudioLines } from "lucide-react";
import Link from "next/link";

interface HomeBeatProps {
  beats: CatalogCardItem[];
}

export default function HomeBeats({ beats }: HomeBeatProps) {
  if (!beats.length) return <div className="empty-state"><AudioLines className="mb-4 h-8 w-8 text-secondary" aria-hidden="true" /><p className="text-lg font-medium">No sounds are available yet.</p><p className="mt-2 max-w-md text-sm leading-6 text-secondary">The collection is being prepared. Producers can apply with their original work.</p><Link href="/apply" className="landing-text-link mt-4">Apply as a creator</Link></div>;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
      {beats.map((beat) => (
        <BeatCard key={beat.id} beat={beat} />
      ))}
    </div>
  );
}
