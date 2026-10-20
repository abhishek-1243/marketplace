import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function calculateCommission(
  amount: number,
  rateBps = Number(process.env.PLATFORM_COMMISSION_BPS || 1000),
  maxCommission = Number(process.env.PLATFORM_COMMISSION_CAP_INR || 5000),
): {
  commission: number;
  producerAmount: number;
} {
  if (!Number.isInteger(amount) || amount < 0) {
    throw new Error("Amount must be a non-negative integer");
  }
  const commission = Math.min(Math.round((amount * rateBps) / 10_000), maxCommission);
  return { commission, producerAmount: amount - commission };
}
