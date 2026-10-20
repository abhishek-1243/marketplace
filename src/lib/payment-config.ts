import { z } from "zod";

const paymentInputSchema = z.object({
  PAYMENTS_ENABLED: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  COMMERCE_LAUNCH_APPROVED: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
  RAZORPAY_KEY_ID: z.string().default(""),
  RAZORPAY_KEY_SECRET: z.string().default(""),
  RAZORPAY_WEBHOOK_SECRET: z.string().default(""),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().default(""),
}).superRefine((config, ctx) => {
  if (!config.PAYMENTS_ENABLED || !config.COMMERCE_LAUNCH_APPROVED) return;
  for (const key of ["RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET", "RAZORPAY_WEBHOOK_SECRET", "NEXT_PUBLIC_RAZORPAY_KEY_ID"] as const) {
    if (!config[key].trim()) ctx.addIssue({ code: "custom", path: [key], message: "Required when payments are enabled" });
  }
  if (config.RAZORPAY_KEY_ID !== config.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
    ctx.addIssue({ code: "custom", path: ["NEXT_PUBLIC_RAZORPAY_KEY_ID"], message: "Must match RAZORPAY_KEY_ID" });
  }
});

// A stale PAYMENTS_ENABLED value cannot activate commerce in the catalog MVP.
export const paymentEnvSchema = paymentInputSchema.transform((config) => ({
  ...config,
  PAYMENTS_ENABLED: config.PAYMENTS_ENABLED && config.COMMERCE_LAUNCH_APPROVED,
}));
