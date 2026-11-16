import { redirect } from "next/navigation";
import { catalogHref } from "@/lib/listing-kind";

// Preserve incoming searches, but never render a mixed catalog.
export default async function SearchPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filters = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (key !== "kind" && typeof value === "string") params.set(key, value);
  }
  const suffix = params.size ? `?${params}` : "";
  redirect(`${catalogHref(typeof filters.kind === "string" ? filters.kind : undefined)}${suffix}`);
}
