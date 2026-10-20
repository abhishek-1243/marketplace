import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sameOrigin } from "@/lib/request";
import { z } from "zod";

const profileSchema = z.object({
  displayName: z.string().trim().min(2).max(80).optional(),
  bio: z.string().trim().max(300).optional(),
  genres: z.array(z.string().trim().min(1).max(40)).max(10).optional(),
  profileImage: z.string().url().or(z.literal("")).optional(),
  banner: z.string().url().or(z.literal("")).optional(),
  instagram: z.string().trim().max(100).optional(),
  youtube: z.string().trim().max(100).optional(),
  spotify: z.string().trim().max(100).optional(),
  otherLinks: z.string().url().or(z.literal("")).optional(),
  legalName: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(30).optional(),
}).strict();

export async function PATCH(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const parsed = profileSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid profile details" }, { status: 400 });
  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: parsed.data,
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

  const userId = session.user.id;

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
