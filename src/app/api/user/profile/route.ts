import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const body = await req.json();

  const allowedFields = [
    "displayName",
    "bio",
    "genres",
    "profileImage",
    "banner",
    "instagram",
    "youtube",
    "spotify",
    "otherLinks",
    "legalName",
    "phone",
  ];

  const data: Record<string, any> = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      displayName: true,
      username: true,
      bio: true,
      genres: true,
      profileImage: true,
      banner: true,
      instagram: true,
      youtube: true,
      spotify: true,
      otherLinks: true,
    },
  });

  return NextResponse.json(user);
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      displayName: true,
      username: true,
      email: true,
      role: true,
      bio: true,
      genres: true,
      profileImage: true,
      banner: true,
      instagram: true,
      youtube: true,
      spotify: true,
      otherLinks: true,
      legalName: true,
      phone: true,
      createdAt: true,
    },
  });

  return NextResponse.json(user);
}
