"use client";

import { useEffect, useRef } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Volume1,
} from "lucide-react";
import Link from "next/link";
import { useAudioPlayer } from "@/store/audio-player";
import { formatPrice } from "@/lib/utils";

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    toggle,
    setProgress,
    setDuration,
    setVolume,
    next,
    previous,
  } = useAudioPlayer();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentTrack?.previewUrl) {
      audio.src = currentTrack.previewUrl;
      audio.load();
      if (isPlaying) {
        audio.play().catch(() => {});
      }
    }
  }, [currentTrack?.id]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (!currentTrack) return null;

  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <>
      <audio
        ref={audioRef}
        onTimeUpdate={() =>
          setProgress(audioRef.current?.currentTime || 0)
        }
        onLoadedMetadata={() =>
          setDuration(audioRef.current?.duration || 0)
        }
        onEnded={next}
      />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950 border-t border-white/[0.06]">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex items-center h-[72px] gap-4">
            <div className="flex items-center gap-3 w-[240px] shrink-0">
              <div className="w-14 h-14 rounded-md bg-zinc-800 overflow-hidden shrink-0">
                {currentTrack.coverArt && (
                  <img
                    src={currentTrack.coverArt}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-medium truncate text-white">
                  {currentTrack.title}
                </p>
                <Link
                  href={`/${currentTrack.producerUsername}`}
                  className="text-[11px] text-zinc-400 hover:text-white hover:underline truncate block"
                >
                  {currentTrack.producer}
                </Link>
              </div>
            </div>

            <div className="flex-1 flex flex-col items-center gap-1.5 max-w-[600px] mx-auto">
              <div className="flex items-center gap-5">
                <button
                  onClick={previous}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={toggle}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-105"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 text-black" />
                  ) : (
                    <Play className="w-4 h-4 text-black ml-0.5" />
                  )}
                </button>
                <button
                  onClick={next}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 w-full">
                <span className="text-[11px] text-zinc-500 w-10 text-right tabular-nums select-none">
                  {formatTime(progress)}
                </span>
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={progress}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setProgress(val);
                    if (audioRef.current) audioRef.current.currentTime = val;
                  }}
                  className="flex-1 h-1 cursor-pointer"
                />
                <span className="text-[11px] text-zinc-500 w-10 tabular-nums select-none">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3 w-[240px] justify-end">
              <Link
                href={`/checkout/${currentTrack.beatId}`}
                className="px-4 py-1.5 bg-white text-black rounded-full text-[11px] font-semibold hover:scale-[1.02] whitespace-nowrap"
              >
                License {formatPrice(currentTrack.price)}
              </Link>
              <div className="flex items-center gap-1.5 group">
                <button
                  onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <VolumeIcon className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-[80px] h-1 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
