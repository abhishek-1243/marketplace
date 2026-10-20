import "server-only";
import { z } from "zod";
import { paymentEnvSchema } from "./payment-config";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  AWS_REGION: z.string().min(1),
  AWS_ACCESS_KEY_ID: z.string().default(""),
  AWS_SECRET_ACCESS_KEY: z.string().default(""),
  AWS_S3_MEDIA_BUCKET: z.string().default(""),
  AWS_CLOUDFRONT_URL: z.union([z.string().url(), z.literal("")]).default(""),
  AWS_SES_FROM_EMAIL: z.union([z.string().email(), z.literal("")]).default(""),
  APP_URL: z.string().url(),
  NEXT_PUBLIC_SUPPORT_EMAIL: z.string().email(),
  PLATFORM_COMMISSION_BPS: z.coerce.number().int().min(0).max(10000).default(1000),
  PLATFORM_COMMISSION_CAP_INR: z.coerce.number().int().positive().default(5000),
  LEGAL_TEMPLATE_VERSION: z.string().default("2026-01"),
});

export const env = serverEnvSchema.and(paymentEnvSchema).parse(process.env);
