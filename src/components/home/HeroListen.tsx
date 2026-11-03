"use client";

import Link from "next/link";
import { Pause, Play } from "lucide-react";
import type { CatalogCardItem } from "@/components/beats/BeatCard";
import { useAudioPlayer } from "@/store/audio-player";

export default function HeroListen({ beat }: { beat: CatalogCardItem }) {
  const { currentTrack, isPlaying, setTrack, toggle } = useAudioPlayer();
  const playing = currentTrack?.beatId === beat.id && isPlaying;
  function listen() {
    if (!beat.previewUrl) return;
    if (currentTrack?.beatId === beat.id) { toggle(); return; }
    setTrack({ id: beat.id, beatId: beat.id, title: beat.title, producer: beat.producer.displayName, producerUsername: beat.producer.username, coverArt: beat.coverArt || "", previewUrl: beat.previewUrl, price: beat.licensePlans.length ? Math.min(...beat.licensePlans.map((plan) => plan.price)) : 0 });
  }
  return <div className="landing-listen">
    <button type="button" className="landing-listen-button" onClick={listen} aria-label={`${playing ? "Pause" : "Play"} ${beat.title}`} aria-pressed={playing} disabled={!beat.previewUrl}>{playing ? <Pause aria-hidden="true" className="h-4 w-4" fill="currentColor" /> : <Play aria-hidden="true" className="ml-0.5 h-4 w-4" fill="currentColor" />}</button>
    <div className="min-w-0"><span className="landing-artwork-kicker">Featured preview</span><Link href={`/sounds/${beat.id}`} className="landing-artwork-label truncate">{beat.title}</Link><span className="landing-listen-producer">{beat.producer.displayName}</span></div>
  </div>;
}
