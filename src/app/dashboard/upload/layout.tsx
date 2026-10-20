import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function UploadLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "PRODUCER") redirect("/apply");
  const producer = await prisma.user.findUnique({ where: { id: session.user.id }, select: { producerStatus: true } });
  if (producer?.producerStatus !== "APPROVED") redirect("/dashboard");
  return children;
}
