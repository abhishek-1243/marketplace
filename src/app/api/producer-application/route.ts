import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sameOrigin } from "@/lib/request";
import { isHttpUrl } from "@/lib/web-url";

const schema = z.object({ portfolioUrl: z.string().url().max(500).refine(isHttpUrl), applicationNote: z.string().trim().min(20).max(1000), legalName: z.string().trim().min(2).max(120) }).strict();
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getServerSession(authOptions);
  if (!session?.user.onboardingComplete) return NextResponse.json({ error: "Complete your profile first" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Add a valid portfolio link, legal name and a short description of your sound" }, { status: 400 });
  const updated = await prisma.user.updateMany({
    where: { id: session.user.id, role: "ARTIST" },
    data: { ...parsed.data, role: "PRODUCER", producerStatus: "APPLIED" },
  });
  if (!updated.count) return NextResponse.json({ error: "Your producer application is already registered" }, { status: 409 });
  return NextResponse.json({ ok: true });
}
