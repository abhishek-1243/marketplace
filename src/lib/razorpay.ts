import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { env } from "@/lib/env";

type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  status: string;
};

function secureEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function createRazorpayOrder(input: {
  amountInr: number;
  receipt: string;
  notes: Record<string, string>;
  transfer: { accountId: string; amountInr: number };
}) {
  if (!env.PAYMENTS_ENABLED) throw new Error("Payments are disabled");
  const auth = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: input.amountInr * 100,
      currency: "INR",
      receipt: input.receipt,
      notes: input.notes,
      transfers: [{
        account: input.transfer.accountId,
        amount: input.transfer.amountInr * 100,
        currency: "INR",
        notes: input.notes,
      }],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Razorpay order creation failed (${response.status})`);
  }
  return response.json() as Promise<RazorpayOrder>;
}

export function verifyCheckoutSignature(providerOrderId: string, paymentId: string, signature: string) {
  if (!env.PAYMENTS_ENABLED) return false;
  const expected = createHmac("sha256", env.RAZORPAY_KEY_SECRET)
    .update(`${providerOrderId}|${paymentId}`)
    .digest("hex");
  return secureEqual(expected, signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  if (!env.PAYMENTS_ENABLED) return false;
  const expected = createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  return secureEqual(expected, signature);
}

export async function reverseTransfer(transferId: string, amountInr: number) {
  if (!env.PAYMENTS_ENABLED) throw new Error("Payments are disabled");
  const auth = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString("base64");
  const response = await fetch(`https://api.razorpay.com/v1/transfers/${encodeURIComponent(transferId)}/reversals`, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: amountInr * 100 }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Razorpay transfer reversal failed (${response.status})`);
}
