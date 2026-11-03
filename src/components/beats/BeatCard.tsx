"use client";

import { Play, Pause, Music2, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useAudioPlayer, Track } from "@/store/audio-player";
import { formatPrice } from "@/lib/utils";

export interface CatalogCardItem {
  id: string; kind?: string; title: string; coverArt: string | null; previewUrl: string | null;
  genre: string; bpm: number | null; musicalKey: string | null; plays: number;
  producer: { displayName: string; username: string };
  licensePlans: { price: number; type: string }[];
}

export default function BeatCard({ beat }: { beat: CatalogCardItem }) {
  const { currentTrack, isPlaying, setTrack, toggle } = useAudioPlayer();
  const playing = currentTrack?.beatId === beat.id && isPlaying;
  const pack = beat.kind === "SOUND_PACK";
  const lowestPrice = beat.licensePlans.length ? Math.min(...beat.licensePlans.map((plan) => plan.price)) : 0;
  function play() {
    if (currentTrack?.beatId === beat.id) { toggle(); return; }
    const track: Track = { id: beat.id, title: beat.title, producer: beat.producer.displayName, producerUsername: beat.producer.username, coverArt: beat.coverArt || "", previewUrl: beat.previewUrl || "", price: lowestPrice, beatId: beat.id };
    setTrack(track);
  }
  return <article className="catalog-card group">
    <div className="catalog-art">
      {beat.coverArt ? <img src={beat.coverArt} alt={`${beat.title} artwork`} className="h-full w-full object-cover" loading="lazy" width={400} height={400} /> : <div className="hero-surface flex h-full flex-col items-center justify-center gap-3 p-4 text-secondary"><Music2 className="h-10 w-10" strokeWidth={1.25} aria-hidden="true" /><span className="text-xs">Artwork not provided</span></div>}
      <span className="catalog-kind">{pack ? "Sound pack" : "Beat"}</span>
      <button type="button" onClick={play} aria-label={`${playing ? "Pause" : "Play"} ${beat.title}`} aria-pressed={playing} disabled={!beat.previewUrl} className="preview-play">{playing ? <Pause className="h-4 w-4" fill="currentColor" /> : <Play className="ml-0.5 h-4 w-4" fill="currentColor" />}</button>
    </div>
    <h3 className="catalog-title"><Link href={`/sounds/${beat.id}`} className="rounded-sm hover:text-accent-300">{beat.title}</Link></h3>
    <Link href={`/${beat.producer.username}`} className="catalog-producer">{beat.producer.displayName}</Link>
    <div className="catalog-meta"><span>{beat.genre}</span>{!pack && beat.bpm && <span>{beat.bpm} BPM</span>}{!pack && beat.musicalKey && <span>{beat.musicalKey}</span>}</div>
    <div className="catalog-card-footer"><span className="text-xs font-medium">{lowestPrice ? `From ${formatPrice(lowestPrice)}` : "Catalog preview"}</span><Link href={`/sounds/${beat.id}`} className="inline-flex min-h-11 items-center gap-1 rounded-md px-1 text-xs text-secondary hover:text-accent-300" aria-label={`Details for ${beat.title}`}>Details<ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" /></Link></div>
  </article>;
}
