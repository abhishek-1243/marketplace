"use client";

import Link from "next/link";
import { Flame, Music2, Pause, Play } from "lucide-react";
import type { CatalogCardItem } from "@/components/beats/BeatCard";
import { useAudioPlayer, type Track } from "@/store/audio-player";

function toTrack(beat: CatalogCardItem): Track {
  return { id: beat.id, beatId: beat.id, title: beat.title, producer: beat.producer.displayName, producerUsername: beat.producer.username, coverArt: beat.coverArt || "", previewUrl: beat.previewUrl || "", price: beat.licensePlans.length ? Math.min(...beat.licensePlans.map((plan) => plan.price)) : 0 };
}

export default function TrendingSounds({ sounds }: { sounds: CatalogCardItem[] }) {
  const { currentTrack, isPlaying, setQueue, toggle } = useAudioPlayer();
  const playable = sounds.filter((sound) => sound.previewUrl);
  function listen(sound: CatalogCardItem) {
    if (!sound.previewUrl) return;
    if (currentTrack?.beatId === sound.id) { toggle(); return; }
    setQueue(playable.map(toTrack), playable.findIndex((item) => item.id === sound.id));
  }

  return <section className="landing-trending" aria-labelledby="trending-title">
    <div className="landing-trending-heading">
      <h2 id="trending-title"><Flame aria-hidden="true" className="h-5 w-5" />Trending</h2>
      <p>Popular previews from the marketplace. Ranked by total plays.</p>
    </div>
    {sounds.length ? <ol className="landing-trending-list">
      {sounds.map((sound) => {
        const playing = currentTrack?.beatId === sound.id && isPlaying;
        return <li key={sound.id} className="landing-trending-row" data-playing={playing}>
          <div className="landing-trending-cover">
            {sound.coverArt ? <img src={sound.coverArt} alt="" width={64} height={64} /> : <Music2 aria-hidden="true" className="h-6 w-6" />}
          </div>
          <div className="min-w-0">
            <Link href={`/sounds/${sound.id}`} className="landing-trending-title">{sound.title}</Link>
            <Link href={`/${sound.producer.username}`} className="landing-listen-producer">{sound.producer.displayName}</Link>
            <p className="landing-trending-meta">{sound.previewUrl ? `${sound.genre}${sound.bpm ? ` · ${sound.bpm} BPM` : ""}` : "Preview unavailable"}</p>
          </div>
          <button type="button" className="landing-listen-button" onClick={() => listen(sound)} aria-label={`${playing ? "Pause" : "Play"} ${sound.title}`} aria-pressed={playing} disabled={!sound.previewUrl}>
            {playing ? <Pause aria-hidden="true" className="h-4 w-4" fill="currentColor" /> : <Play aria-hidden="true" className="ml-0.5 h-4 w-4" fill="currentColor" />}
          </button>
        </li>;
      })}
    </ol> : <p className="landing-trending-empty" role="status">Featured previews are coming soon. Explore the collection as new sounds arrive.</p>}
    <Link href="/search" className="landing-text-link landing-trending-more">Explore all sounds <span aria-hidden="true">↗</span></Link>
  </section>;
}
