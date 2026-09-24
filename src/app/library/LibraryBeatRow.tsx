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
    agreement: { id: string } | null;
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
    <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/[0.04] transition-colors group">
      <div className="relative w-12 h-12 rounded-md overflow-hidden shrink-0 bg-zinc-800">
        {order.beat.coverArt && (
          <img src={order.beat.coverArt} alt="" className="w-full h-full object-cover" />
        )}
        <button
          onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
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

      <div className="flex-1 min-w-0">
        <h3 className="text-[13px] font-medium truncate">{order.beat.title}</h3>
        <p className="text-[12px] text-zinc-500">{order.beat.producer.displayName}</p>
        <div className="flex items-center gap-2.5 mt-1 text-[11px] text-zinc-600">
          <span className="px-2 py-0.5 bg-white/[0.06] rounded text-zinc-400">
            {order.licensePlan.type}
          </span>
          <span>{formatPrice(order.licensePlan.price)}</span>
          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex gap-1">
          {order.licensePlan.includesMp3 && (
            <button className="flex items-center gap-1 px-2.5 py-1 bg-white/[0.06] hover:bg-white/[0.12] rounded-full text-[11px] font-medium text-zinc-400 hover:text-white">
              <Download className="w-3 h-3" /> MP3
            </button>
          )}
          {order.licensePlan.includesWav && (
            <button className="flex items-center gap-1 px-2.5 py-1 bg-white/[0.06] hover:bg-white/[0.12] rounded-full text-[11px] font-medium text-zinc-400 hover:text-white">
              <Download className="w-3 h-3" /> WAV
            </button>
          )}
          {order.licensePlan.includesStems && (
            <button className="flex items-center gap-1 px-2.5 py-1 bg-white/[0.06] hover:bg-white/[0.12] rounded-full text-[11px] font-medium text-zinc-400 hover:text-white">
              <Download className="w-3 h-3" /> Stems
            </button>
          )}
        </div>
        {order.agreement && (
          <button className="p-1.5 hover:bg-white/[0.06] rounded-full text-zinc-500 hover:text-white" title="View Agreement">
            <FileText className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
