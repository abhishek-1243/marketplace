import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createObjectKey, publicMediaUrl, uploadObject, storageConfigured } from "@/lib/storage";
import { env } from "@/lib/env";
import { sameOrigin } from "@/lib/request";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE = 5 * 1024 * 1024;

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!storageConfigured || !env.AWS_CLOUDFRONT_URL) return NextResponse.json({ error: "Artwork uploads are not configured yet" }, { status: 503 });

  const formData = await req.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file provided" }, { status: 400 });
  if (!ALLOWED_TYPES.has(file.type)) return NextResponse.json({ error: "Use JPG, PNG or WebP" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "Image must be 5MB or smaller" }, { status: 400 });

  const objectKey = createObjectKey(session.user.id, "profile", file.name);
  await uploadObject(objectKey, Buffer.from(await file.arrayBuffer()), file.type);
  return NextResponse.json({ url: publicMediaUrl(objectKey) }, { status: 201 });
}
