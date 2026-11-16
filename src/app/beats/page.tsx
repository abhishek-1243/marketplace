import CatalogPage, { type CatalogFilters } from "@/components/beats/CatalogPage";
export const dynamic = "force-dynamic";
export default async function BeatsPage({ searchParams }: { searchParams: Promise<CatalogFilters> }) {
  return <CatalogPage kind="BEAT" filters={await searchParams} />;
}
