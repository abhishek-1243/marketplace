import type { ReactNode } from "react";
import Link from "next/link";
import type { CatalogCardItem } from "@/components/beats/BeatCard";
import HomeBeats from "./HomeBeats";
import TrendingSounds from "./TrendingSounds";

export interface LandingSection {
  title: string;
  subtitle: string;
  items: CatalogCardItem[];
  href: string;
}

export default function LandingPage({ sections, heroSounds, beforeCatalog, afterCatalog, emptyCatalog }: { sections: LandingSection[]; heroSounds?: CatalogCardItem[]; beforeCatalog?: ReactNode; afterCatalog?: ReactNode; emptyCatalog?: ReactNode }) {
  const visibleSections = sections.filter((section) => section.items.length);
  const sounds = Array.from(new Map((heroSounds ?? sections.flatMap((section) => section.items)).map((item) => [item.id, item])).values()).slice(0, 4);
  return <div className="landing-page">
    <section className="landing-hero" aria-labelledby="landing-title">
      <div className="landing-container landing-hero-grid">
        <div className="landing-hero-copy">
          <h1 id="landing-title">Start with<br />a sound.</h1>
          <p className="landing-intro">Beats and original recordings from independent Indian producers. Find the starting point for your next track.</p>
          <div className="landing-actions">
            <Link href="/search" className="soundfuel-button">Explore sounds</Link>
            <Link href="/search?kind=SOUND_PACK" className="soundfuel-button-secondary">Sound packs</Link>
          </div>
          <p className="landing-preview-note">Listen and save favourites. Purchases are not open yet.</p>
        </div>
        <TrendingSounds sounds={sounds} />
      </div>
    </section>
    <div id="landing-catalog" className="landing-container landing-content scroll-mt-24">
      {beforeCatalog}
      {visibleSections.length ? visibleSections.map((section, index) => <section className="landing-collection" key={section.href} aria-labelledby={`collection-${index}`}>
        <div className="landing-section-heading"><div><h2 id={`collection-${index}`}>{section.title}</h2><p>{section.subtitle}</p></div><Link href={section.href} className="landing-text-link">Explore all sounds</Link></div>
        <HomeBeats beats={section.items} />
      </section>) : <section className="landing-collection" aria-labelledby="founding-title"><div className="landing-section-heading"><div><h2 id="founding-title">The collection</h2><p>Beats and original sound packs selected for Soundfuel.</p></div><Link href="/search" className="landing-text-link">Explore all sounds</Link></div>{emptyCatalog || <HomeBeats beats={[]} />}</section>}
      {afterCatalog}
      <section className="landing-creators" aria-labelledby="creators-title">
        <h2 id="creators-title">Make something<br />original?</h2>
        <div className="landing-creators-copy"><p>Bring your beats, instruments and recordings to Soundfuel. Apply with your portfolio to join the collection.</p><Link href="/apply" className="soundfuel-button">Apply as a creator</Link><p className="landing-creator-note">No subscription or bank details needed during preview.</p></div>
      </section>
    </div>
  </div>;
}
