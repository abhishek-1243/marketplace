import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { env } from "@/lib/env";
import CheckoutClient from "./CheckoutClient";
import { publicCatalogWhere } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ beatId: string }>;
}) {
  const { beatId } = await params;
  if (!env.PAYMENTS_ENABLED) redirect(`/sounds/${beatId}`);
  const beat = await prisma.beat.findUnique({
    where: { id: beatId, ...publicCatalogWhere, kind: "BEAT" },
    include: {
      producer: { select: { displayName: true, username: true } },
      licensePlans: { where: { active: true }, orderBy: { price: "asc" } },
    },
  });

  if (!beat) return notFound();

  return <CheckoutClient beat={beat} paymentsEnabled={env.PAYMENTS_ENABLED} />;
}
