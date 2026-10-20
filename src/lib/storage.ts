import "server-only";
import { randomUUID } from "crypto";
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";

const s3 = new S3Client({
  region: env.AWS_REGION,
  credentials: env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

export const MEDIA_BUCKET = env.AWS_S3_MEDIA_BUCKET;
export const storageConfigured = Boolean(MEDIA_BUCKET);

function safeName(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9._-]/g, "-").slice(-100);
}

export function createObjectKey(userId: string, category: string, fileName: string) {
  return `${category}/${userId}/${randomUUID()}-${safeName(fileName)}`;
}

export async function createPresignedUpload(objectKey: string, contentType: string) {
  return getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: MEDIA_BUCKET,
      Key: objectKey,
      ContentType: contentType,
      ServerSideEncryption: "AES256",
      IfNoneMatch: "*",
    }),
    { expiresIn: 10 * 60 },
  );
}

export async function uploadObject(objectKey: string, body: Buffer, contentType: string) {
  await s3.send(new PutObjectCommand({
    Bucket: MEDIA_BUCKET,
    Key: objectKey,
    Body: body,
    ContentType: contentType,
    ServerSideEncryption: "AES256",
  }));
}

export async function verifyObject(objectKey: string) {
  const result = await s3.send(new HeadObjectCommand({ Bucket: MEDIA_BUCKET, Key: objectKey }));
  return {
    contentType: result.ContentType ?? "application/octet-stream",
    sizeBytes: result.ContentLength ?? 0,
    encrypted: result.ServerSideEncryption === "AES256" || result.ServerSideEncryption === "aws:kms",
    checksum: result.ChecksumSHA256 ?? null,
  };
}

export async function createPresignedDownload(objectKey: string, fileName?: string) {
  return getSignedUrl(
    s3,
    new GetObjectCommand({
      Bucket: MEDIA_BUCKET,
      Key: objectKey,
      ResponseContentDisposition: fileName ? `attachment; filename="${safeName(fileName)}"` : undefined,
    }),
    { expiresIn: 5 * 60 },
  );
}

export function publicMediaUrl(objectKey: string) {
  return `${env.AWS_CLOUDFRONT_URL.replace(/\/$/, "")}/${objectKey}`;
}
