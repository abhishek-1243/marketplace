import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreReadiness } from "@/lib/catalog-policy";
import EditListingForm from "./EditListingForm";

export const dynamic = "force-dynamic";
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  if (session.user.role !== "PRODUCER") redirect("/apply");
  const producer = await prisma.user.findUnique({ where: { id: session.user.id }, select: { producerStatus: true, username: true, displayName: true, portfolioUrl: true } });
  if (!producer) redirect("/login");
  const listings = await prisma.beat.findMany({ where: { producerId: session.user.id }, include: { assets: { select: { type: true } } }, orderBy: { createdAt: "desc" }, take: 100 });
  return <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
    <div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-widest text-amber-300">Creator studio</p><h1 className="mt-2 text-3xl font-bold">Welcome, {producer.displayName}</h1></div><Link className="soundfuel-button-secondary" href="/dashboard/settings">Profile settings</Link></div>
    <div className="surface mt-7 rounded-xl p-5"><p className="font-semibold">{producer.producerStatus === "APPROVED" ? "Producer access approved" : producer.producerStatus === "SUSPENDED" ? "Publishing access paused" : "Your producer application is with our team"}</p><p className="mt-2 text-sm leading-6 text-zinc-400">{producer.producerStatus === "APPROVED" ? "Publish original work to your storefront. Marketplace selection is a separate editorial step. Purchases and payouts are disabled during catalog preview." : producer.producerStatus === "SUSPENDED" ? "Your listings are not publicly accessible. Contact support to resolve your account review." : "We review your portfolio before enabling uploads. No payment or bank information is needed. You can complete your profile while we review it."}</p><Link className="mt-3 inline-block text-xs text-amber-300" href="/contact">Contact the team</Link></div>
    {producer.producerStatus === "APPROVED" && <div className="my-6 flex flex-wrap gap-3"><Link href="/dashboard/upload" className="soundfuel-button">Upload beat or sound pack</Link><Link href={`/${producer.username}`} className="soundfuel-button-secondary">View storefront</Link></div>}
    <h2 className="mt-8 text-xl font-semibold">Your catalog <span className="text-sm text-zinc-500">({listings.length}/100)</span></h2>
    {!listings.length && <p className="surface mt-4 rounded-xl p-8 text-sm text-zinc-500">Your uploads will appear here with publication status, discovery eligibility and feedback.</p>}
    <div className="mt-4 space-y-4">{listings.map((item) => {
      const suggestions = scoreReadiness({ ...item, tags: Array.isArray(item.tags) ? item.tags.filter((tag): tag is string => typeof tag === "string") : [], assetTypes: item.assets.map((asset) => asset.type) }).suggestions;
      return <article key={item.id} className="surface rounded-xl p-5"><div className="flex flex-wrap justify-between gap-3"><div><p className="text-xs text-amber-300">{item.kind === "SOUND_PACK" ? "Sound pack" : "Beat"}</p><h3 className="mt-1 font-semibold">{item.title}</h3></div><span className="text-xs text-zinc-500">{item.status.toLowerCase()} · {item.discoveryTier === "STOREFRONT" ? "Storefront only" : item.discoveryTier === "FEATURED" ? "Editor's selection" : "Marketplace"}</span></div>
        <p className="mt-3 text-sm text-zinc-400">{item.rightsStatus === "REVIEW_REQUIRED" ? "Rights review required: this listing is private until the review is resolved." : item.rightsStatus === "RESTRICTED" ? "Restricted: contact support about the rights concern." : "Rights declaration recorded. It does not certify ownership or clearance."}</p>
        <p className="mt-2 text-xs text-zinc-500">Discovery considers file completeness, accurate metadata, editorial selection and account standing. Numerical scores stay internal.</p>
        {item.reviewFeedback && <p className="mt-3 text-sm text-amber-200">Team feedback: {item.reviewFeedback}</p>}
        {suggestions.length > 0 && <ul className="mt-3 space-y-1 text-xs text-zinc-500">{suggestions.map((tip) => <li key={tip}>• {tip}</li>)}</ul>}
        {producer.producerStatus === "APPROVED" && item.status !== "SOLD" && <EditListingForm item={{ id: item.id, title: item.title, description: item.description, region: item.region, instruments: item.instruments, tags: Array.isArray(item.tags) ? item.tags.filter((tag): tag is string => typeof tag === "string") : [] }} />}
        {item.status === "PUBLISHED" && item.rightsStatus === "DECLARED" && producer.producerStatus === "APPROVED" && <Link className="mt-4 inline-block text-sm text-amber-300" href={`/sounds/${item.id}`}>View listing →</Link>}
      </article>;
    })}</div>
  </div>;
}
