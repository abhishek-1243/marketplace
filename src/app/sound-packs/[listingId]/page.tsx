import ListingDetail from "@/components/beats/ListingDetail";
export const dynamic = "force-dynamic";
export default async function ProductPage({ params }: { params: Promise<{ listingId: string }> }) {
  const { listingId } = await params;
  return <ListingDetail listingId={listingId} kind="SOUND_PACK" />;
}
