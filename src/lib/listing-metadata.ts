import { z } from "zod";

export const listingMetadataSchema = z.object({
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(40).max(2000),
  region: z.string().trim().min(2).max(80),
  instruments: z.string().trim().min(2).max(160),
  tags: z.array(z.string().trim().min(1).max(30)).max(12),
}).strict();
