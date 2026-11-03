"use client";

import { Play, Pause, Download, FileText } from "lucide-react";
import { useAudioPlayer, Track } from "@/store/audio-player";
import { formatPrice } from "@/lib/utils";

interface LibraryBeatRowProps {
  order: {
    id: string;
    createdAt: string;
    beat: {
      id: string;
      title: string;
      coverArt: string | null;
      previewUrl: string | null;
      producer: { displayName: string; username: string };
    };
    licensePlan: {
      type: string;
      price: number;
      includesMp3: boolean;
      includesWav: boolean;
      includesStems: boolean;
    };
    agreement: { id: string; contentHash: string } | null;
  };
}

export default function LibraryBeatRow({ order }: LibraryBeatRowProps) {
  const { currentTrack, isPlaying, setTrack, toggle } = useAudioPlayer();
  const isCurrentTrack = currentTrack?.beatId === order.beat.id;

  const handlePlay = () => {
    if (isCurrentTrack) {
      toggle();
    } else {
      const track: Track = {
        id: order.beat.id,
        title: order.beat.title,
        producer: order.beat.producer.displayName,
        producerUsername: order.beat.producer.username,
        coverArt: order.beat.coverArt || "",
        previewUrl: order.beat.previewUrl || "",
        price: order.licensePlan.price,
        beatId: order.beat.id,
      };
      setTrack(track);
    }
  };

  return (
    <article className="surface flex flex-wrap items-center gap-4 rounded-2xl p-4">
      <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0 bg-raised">
        {order.beat.coverArt && (
          <img src={order.beat.coverArt} alt="" className="w-full h-full object-cover" />
        )}
        <button
          onClick={handlePlay}
          aria-label={`${isCurrentTrack && isPlaying ? "Pause" : "Play"} ${order.beat.title}`}
          aria-pressed={isCurrentTrack && isPlaying}
          disabled={!order.beat.previewUrl}
          className="absolute inset-0 flex items-center justify-center bg-canvas/60 text-white disabled:opacity-40"
        >
          {isCurrentTrack && isPlaying ? (
            <Pause className="w-4 h-4 text-white" />
          ) : (
            <Play className="w-4 h-4 text-white ml-0.5" />
          )}
        </button>
        {isCurrentTrack && isPlaying && (
          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex items-end gap-[2px] h-2">
            <div className="w-[2px] bg-white rounded-full animate-pulse" style={{ height: "60%" }} />
            <div className="w-[2px] bg-white rounded-full animate-pulse" style={{ height: "100%", animationDelay: "0.15s" }} />
            <div className="w-[2px] bg-white rounded-full animate-pulse" style={{ height: "40%", animationDelay: "0.3s" }} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 basis-40">
        <h3 className="text-[13px] font-medium truncate">{order.beat.title}</h3>
        <p className="text-[12px] text-muted">{order.beat.producer.displayName}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2.5 text-xs text-muted">
          <span className="px-2 py-0.5 bg-white/[0.06] rounded text-secondary">
            {order.licensePlan.type}
          </span>
          <span>{formatPrice(order.licensePlan.price)}</span>
          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
        <div className="flex flex-wrap gap-2">
          {order.licensePlan.includesMp3 && (
            <a href={`/api/orders/${order.id}/download/mp3`} className="soundfuel-button-secondary !px-3 !text-xs">
              <Download className="w-3 h-3" /> MP3
            </a>
          )}
          {order.licensePlan.includesWav && (
            <a href={`/api/orders/${order.id}/download/wav`} className="soundfuel-button-secondary !px-3 !text-xs">
              <Download className="w-3 h-3" /> WAV
            </a>
          )}
          {order.licensePlan.includesStems && (
            <a href={`/api/orders/${order.id}/download/stems`} className="soundfuel-button-secondary !px-3 !text-xs">
              <Download className="w-3 h-3" /> Stems
            </a>
          )}
        </div>
        {order.agreement && (
          <a href={`/api/orders/${order.id}/agreement`} className="icon-button" aria-label={`Download agreement for ${order.beat.title}`} title="Download agreement">
            <FileText className="w-4 h-4" />
          </a>
        )}
      </div>
    </article>
  );
}
