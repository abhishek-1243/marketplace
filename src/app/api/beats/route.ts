import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const genre = searchParams.get("genre");
  const q = searchParams.get("q");
  const sort = searchParams.get("sort") || "trending";

  const where: any = { status: "PUBLISHED" };
  if (genre) where.genre = genre;
  if (q) {
    where.OR = [
      { title: { contains: q } },
      { genre: { contains: q } },
      { tags: { contains: q } },
      { description: { contains: q } },
    ];
  }

  const orderBy: any =
    sort === "newest" ? { createdAt: "desc" } :
    sort === "price_low" ? {} :
    { plays: "desc" };

  const beats = await prisma.beat.findMany({
    where,
    orderBy,
    take: 50,
    include: {
      producer: { select: { displayName: true, username: true } },
      licensePlans: { where: { active: true }, select: { price: true, type: true } },
    },
  });

  return NextResponse.json(beats);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "PRODUCER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const userId = (session.user as any).id;

  const slug = slugify(body.title) + "-" + Date.now().toString(36);

  const beat = await prisma.beat.create({
    data: {
      title: body.title,
      slug,
      genre: body.genre,
      mood: body.mood,
      bpm: body.bpm,
      musicalKey: body.musicalKey,
      tags: body.tags ? JSON.stringify(body.tags.split(",").map((t: string) => t.trim())) : null,
      description: body.description,
      producerId: userId,
      status: "PUBLISHED",
      coverArt: "/images/beat-cover.jpg",
      previewUrl: "/audio/preview-placeholder.mp3",
      licensePlans: {
        create: [
          {
            type: "BASIC",
            price: body.basicPrice || 999,
            includesMp3: true,
            streamingLimit: "500000",
            videoLimit: "1",
          },
          {
            type: "PREMIUM",
            price: body.premiumPrice || 2999,
            includesMp3: true,
            includesWav: true,
            streamingLimit: "UNLIMITED",
            videoLimit: "UNLIMITED",
          },
          {
            type: "EXCLUSIVE",
            price: body.exclusivePrice || 25000,
            includesMp3: true,
            includesWav: true,
            includesStems: true,
            isExclusive: true,
            streamingLimit: "UNLIMITED",
            videoLimit: "UNLIMITED",
          },
        ],
      },
    },
  });

  return NextResponse.json(beat, { status: 201 });
}
