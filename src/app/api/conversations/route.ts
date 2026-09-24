import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { participantId } = await req.json();
  const currentUserId = (session.user as any).id;

  if (currentUserId === participantId) {
    return NextResponse.json({ error: "Cannot message yourself" }, { status: 400 });
  }

  const existing = await prisma.conversation.findFirst({
    where: {
      OR: [
        { participant1Id: currentUserId, participant2Id: participantId },
        { participant1Id: participantId, participant2Id: currentUserId },
      ],
    },
  });

  if (existing) {
    return NextResponse.json(existing);
  }

  const conversation = await prisma.conversation.create({
    data: {
      participant1Id: currentUserId,
      participant2Id: participantId,
    },
  });

  return NextResponse.json(conversation, { status: 201 });
}
