import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import MessagesClient from "./MessagesClient";

export default async function MessagesPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const userId = (session.user as any).id;

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [{ participant1Id: userId }, { participant2Id: userId }],
    },
    include: {
      participant1: { select: { id: true, displayName: true, profileImage: true, username: true } },
      participant2: { select: { id: true, displayName: true, profileImage: true, username: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { content: true, createdAt: true, senderId: true },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const serialized = conversations.map((c: any) => ({
    ...c,
    messages: c.messages.map((m: any) => ({
      ...m,
      createdAt: m.createdAt.toISOString(),
    })),
  }));

  return <MessagesClient conversations={serialized} currentUserId={userId} />;
}
