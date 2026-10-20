import { NextRequest } from "next/server";

export function requestMetadata(req: NextRequest) {
  return {
    ip: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: req.headers.get("user-agent"),
  };
}

export function sameOrigin(req: NextRequest) {
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(process.env.APP_URL || req.nextUrl.origin).origin;
  } catch {
    return false;
  }
}
