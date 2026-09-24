import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import CheckoutClient from "./CheckoutClient";

export default async function CheckoutPage({
  params,
}: {
  params: { beatId: string };
}) {
  const beat = await prisma.beat.findUnique({
    where: { id: params.beatId },
    include: {
      producer: { select: { displayName: true, username: true } },
      licensePlans: { where: { active: true }, orderBy: { price: "asc" } },
    },
  });

  if (!beat) return notFound();

  return <CheckoutClient beat={beat} />;
}
