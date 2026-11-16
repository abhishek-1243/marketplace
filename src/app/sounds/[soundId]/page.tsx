import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { publicCatalogWhere } from "@/lib/catalog";
import { listingHref } from "@/lib/listing-kind";

export const dynamic = "force-dynamic";
export default async function LegacySoundPage({ params }: { params: Promise<{ soundId: string }> }) {
  const { soundId } = await params;
  const listing = await prisma.listing.findFirst({ where: { id: soundId, ...publicCatalogWhere }, select: { id: true, kind: true } });
  if (!listing) notFound();
  redirect(listingHref(listing));
}
