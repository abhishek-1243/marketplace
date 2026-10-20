import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sameOrigin } from "@/lib/request";
import { isReservedUsername } from "@/lib/usernames";
import { isHttpUrl } from "@/lib/web-url";

const schema = z.object({
  role: z.enum(["ARTIST", "PRODUCER"]),
  username: z.string().trim().toLowerCase().regex(/^[a-z0-9_-]{3,30}$/),
  displayName: z.string().trim().min(2).max(80),
  legalName: z.string().trim().min(2).max(120),
  acceptedTerms: z.literal(true),
  portfolioUrl: z.string().url().max(500).refine(isHttpUrl).optional(),
  applicationNote: z.string().trim().max(1000).optional(),
}).superRefine((data, ctx) => {
  if (data.role === "PRODUCER" && !data.portfolioUrl) ctx.addIssue({ code: "custom", path: ["portfolioUrl"], message: "A portfolio link is required for producer applications" });
});

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid profile" }, { status: 400 });
  if (isReservedUsername(parsed.data.username)) return NextResponse.json({ error: "Please choose another username; that address is reserved" }, { status: 400 });
  const current = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!current || current.onboardingComplete) return NextResponse.json({ error: "Onboarding already completed" }, { status: 409 });
  const taken = await prisma.user.findFirst({
    where: { username: parsed.data.username, NOT: { id: current.id } },
    select: { id: true },
  });
  if (taken) return NextResponse.json({ error: "Username already taken" }, { status: 409 });
  await prisma.user.update({
    where: { id: current.id },
    data: {
      role: parsed.data.role,
      username: parsed.data.username,
      displayName: parsed.data.displayName,
      legalName: parsed.data.legalName,
      portfolioUrl: parsed.data.portfolioUrl,
      applicationNote: parsed.data.applicationNote,
      producerStatus: "APPLIED",
      termsAcceptedAt: new Date(),
      termsVersion: "2026-10-20",
      onboardingComplete: true,
    },
  });
  return NextResponse.json({ ok: true });
}
