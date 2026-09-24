"use client";

import { Play, Pause } from "lucide-react";
import Link from "next/link";
import { useAudioPlayer, Track } from "@/store/audio-player";
import { formatPrice } from "@/lib/utils";

interface BeatCardProps {
  beat: {
    id: string;
    title: string;
    coverArt: string | null;
    previewUrl: string | null;
    genre: string;
    bpm: number | null;
    musicalKey: string | null;
    plays: number;
    producer: {
      displayName: string;
      username: string;
    };
    licensePlans: {
      price: number;
      type: string;
    }[];
  };
}

export default function BeatCard({ beat }: BeatCardProps) {
  const { currentTrack, isPlaying, setTrack, toggle } = useAudioPlayer();
  const isCurrentTrack = currentTrack?.beatId === beat.id;
  const lowestPrice = beat.licensePlans.length > 0
    ? Math.min(...beat.licensePlans.map((lp) => lp.price))
    : 0;

  const handlePlay = () => {
    if (isCurrentTrack) {
      toggle();
    } else {
      const track: Track = {
        id: beat.id,
        title: beat.title,
        producer: beat.producer.displayName,
        producerUsername: beat.producer.username,
        coverArt: beat.coverArt || "",
        previewUrl: beat.previewUrl || "",
        price: lowestPrice,
        beatId: beat.id,
      };
      setTrack(track);
    }
  };

  return (
    <div className="group p-3 rounded-xl hover:bg-white/[0.04] transition-colors duration-200 cursor-default">
      <div className="relative aspect-square rounded-lg overflow-hidden bg-zinc-900 mb-3">
        <img
          src={beat.coverArt || "https://picsum.photos/seed/default/400/400"}
          alt={beat.title}
          className="w-full h-full object-cover"
        />
        <button
          onClick={handlePlay}
          className="absolute right-2 bottom-2 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hover:scale-105"
        >
          {isCurrentTrack && isPlaying ? (
            <Pause className="w-4 h-4 text-black" />
          ) : (
            <Play className="w-4 h-4 text-black ml-0.5" />
          )}
        </button>
        {isCurrentTrack && isPlaying && (
          <div className="absolute top-2 left-2 flex items-end gap-[3px] h-3">
            <div className="w-[3px] bg-white rounded-full animate-pulse" style={{ height: '60%' }} />
            <div className="w-[3px] bg-white rounded-full animate-pulse" style={{ height: '100%', animationDelay: '0.15s' }} />
            <div className="w-[3px] bg-white rounded-full animate-pulse" style={{ height: '40%', animationDelay: '0.3s' }} />
          </div>
        )}
      </div>

      <div>
        <h3 className="text-[13px] font-medium text-white truncate leading-tight">
          {beat.title}
        </h3>
        <Link
          href={`/${beat.producer.username}`}
          className="text-[12px] text-zinc-400 hover:text-white hover:underline truncate block mt-0.5 leading-tight"
        >
          {beat.producer.displayName}
        </Link>

        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-zinc-500">
          <span className="px-1.5 py-0.5 bg-white/[0.06] rounded text-zinc-400">{beat.genre}</span>
          {beat.bpm && <span>{beat.bpm} BPM</span>}
          {beat.musicalKey && <span>{beat.musicalKey}</span>}
        </div>

        <div className="flex items-center justify-between mt-2.5">
          <span className="text-[13px] font-semibold text-white">
            {formatPrice(lowestPrice)}
          </span>
          <Link
            href={`/checkout/${beat.id}`}
            className="px-3 py-1 bg-white/[0.08] hover:bg-white/[0.14] rounded-full text-[11px] font-medium text-zinc-300 hover:text-white"
          >
            License
          </Link>
        </div>
      </div>
    </div>
  );
}
