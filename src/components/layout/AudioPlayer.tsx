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
    queue,
    queueIndex,
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
      <div className="glass-chrome player-chrome" role="region" aria-label="Sound preview player">
        {playbackError && <p role="status" className="px-4 pt-2 text-center text-xs text-accent-200">{playbackError}</p>}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex min-h-[88px] items-center gap-3 py-3 sm:gap-6">
            <div className="flex w-[112px] shrink-0 items-center gap-2 sm:w-[200px] sm:gap-3 lg:w-[240px]">
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-raised sm:h-14 sm:w-14">
                {currentTrack.coverArt && (
                  <img
                    src={currentTrack.coverArt}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="min-w-0">
                <Link href={`/sounds/${currentTrack.beatId}`} className="block truncate rounded-sm text-[13px] font-medium text-foreground hover:text-accent-300">
                  {currentTrack.title}
                </Link>
                <Link
                  href={`/${currentTrack.producerUsername}`}
                  className="text-[11px] text-secondary hover:text-white hover:underline truncate block"
                >
                  {currentTrack.producer}
                </Link>
              </div>
            </div>

            <div className="min-w-0 flex-1 flex flex-col items-center gap-1.5 max-w-[600px] mx-auto">
              <div className="flex items-center gap-0 sm:gap-3">
                <button
                  onClick={previous}
                  disabled={queueIndex <= 0}
                  aria-label="Previous sound"
                  className="icon-button"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={toggle}
                  aria-label={isPlaying ? "Pause preview" : "Play preview"}
                  aria-pressed={isPlaying}
                  className="player-play"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" fill="currentColor" />
                  ) : (
                    <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
                  )}
                </button>
                <button
                  onClick={next}
                  disabled={queueIndex >= queue.length - 1}
                  aria-label="Next sound"
                  className="icon-button"
                >
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center gap-2 w-full">
                <span className="text-[11px] text-muted w-10 text-right tabular-nums select-none">
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
                <span className="text-[11px] text-muted w-10 tabular-nums select-none">
                  {formatTime(duration)}
                </span>
              </div>
            </div>

            <div className="hidden w-[240px] shrink-0 items-center justify-end gap-3 lg:flex">
              <Link
                href={`/sounds/${currentTrack.beatId}`}
                className="soundfuel-button-secondary whitespace-nowrap !px-4 !text-xs"
              >
                View sound
              </Link>
              <div className="flex items-center gap-1.5 group">
                <button
                  onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
                  aria-label={volume === 0 ? "Unmute" : "Mute"}
                  className="icon-button"
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
