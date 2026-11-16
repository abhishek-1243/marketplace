import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { env } from "@/lib/env";
import CheckoutClient from "./CheckoutClient";
import { publicCatalogWhere } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const { listingId } = await params;
  if (!env.PAYMENTS_ENABLED) redirect(`/sounds/${listingId}`);
  const beat = await prisma.listing.findUnique({
    where: { id: listingId, ...publicCatalogWhere, kind: "BEAT" },
    include: {
      producer: { select: { displayName: true, username: true } },
      beat: { include: { licensePlans: { where: { active: true }, orderBy: { price: "asc" } } } },
    },
  });

  if (!beat?.beat) return notFound();

  return <CheckoutClient beat={{ ...beat, licensePlans: beat.beat.licensePlans }} paymentsEnabled={env.PAYMENTS_ENABLED} />;
}
