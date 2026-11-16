import CatalogPage, { type CatalogFilters } from "@/components/beats/CatalogPage";
export const dynamic = "force-dynamic";
export default async function SoundPacksPage({ searchParams }: { searchParams: Promise<CatalogFilters> }) {
  return <CatalogPage kind="SOUND_PACK" filters={await searchParams} />;
}
