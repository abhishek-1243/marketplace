"use client";

import { useEffect, useRef, useState } from "react";
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

export default function AudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playbackError, setPlaybackError] = useState("");
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    toggle,
    pause,
    setProgress,
    setDuration,
    setVolume,
    next,
    previous,
  } = useAudioPlayer();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (currentTrack?.previewUrl) {
      const nextSource = new URL(currentTrack.previewUrl, window.location.href).href;
      if (audio.src !== nextSource) {
        setPlaybackError("");
        audio.src = nextSource;
        audio.load();
      }
    }
    if (isPlaying) audio.play().catch((error) => {
      if (error?.name !== "AbortError") {
        pause();
        setPlaybackError("Preview unavailable. Try playing again.");
      }
    });
    else audio.pause();
  }, [currentTrack?.previewUrl, isPlaying, pause]);

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
        preload="none"
        onTimeUpdate={() =>
          setProgress(audioRef.current?.currentTime || 0)
        }
        onLoadedMetadata={() =>
          setDuration(audioRef.current?.duration || 0)
        }
        onEnded={next}
        onError={() => { pause(); setPlaybackError("Preview unavailable. Please try again later."); }}
      />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950 border-t border-white/[0.06]">
        {playbackError && <p role="status" className="px-4 pt-2 text-center text-xs text-amber-200">{playbackError}</p>}
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex items-center h-[72px] gap-4">
            <div className="flex items-center gap-3 w-[110px] sm:w-[240px] shrink-0">
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

            <div className="min-w-0 flex-1 flex flex-col items-center gap-1.5 max-w-[600px] mx-auto">
              <div className="flex items-center gap-5">
                <button
                  onClick={previous}
                  aria-label="Previous sound"
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={toggle}
                  aria-label={isPlaying ? "Pause preview" : "Play preview"}
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
                  aria-label="Next sound"
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
                  aria-label="Playback position"
                  min={0}
                  max={duration || 100}
                  value={progress}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setProgress(val);
                    if (audioRef.current) audioRef.current.currentTime = val;
                  }}
                  className="min-w-0 flex-1 h-1 cursor-pointer"
                />
                <span className="text-[11px] text-zinc-500 w-10 tabular-nums select-none">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-3 w-[240px] justify-end">
              <Link
                href={`/sounds/${currentTrack.beatId}`}
                className="px-4 py-1.5 bg-amber-300 text-black rounded-full text-[11px] font-semibold hover:bg-amber-200 whitespace-nowrap"
              >
                View sound
              </Link>
              <div className="flex items-center gap-1.5 group">
                <button
                  onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
                  aria-label={volume === 0 ? "Unmute" : "Mute"}
                  className="p-1 text-zinc-400 hover:text-white"
                >
                  <VolumeIcon className="w-4 h-4" />
                </button>
                <input
                  type="range"
                  aria-label="Volume"
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
