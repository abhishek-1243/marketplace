import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { marketplaceWhere } from "@/lib/catalog";
import { env } from "@/lib/env";
import AdminBeatAction from "./AdminBeatAction";
import ProducerAccessAction from "./ProducerAccessAction";
import PayoutAccountForm from "./PayoutAccountForm";

export const dynamic = "force-dynamic";
export default async function AdminPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login"); if (session.user.role !== "ADMIN") redirect("/");
  const filters = await searchParams;
  const page = Math.floor(Math.max(1, Math.min(1000, Number(filters.page) || 1)));
  const [applications, listed, reviews, items, producers, total] = await Promise.all([
    prisma.user.count({ where: { role: "PRODUCER", producerStatus: "APPLIED" } }),
    prisma.beat.count({ where: marketplaceWhere }),
    prisma.beat.count({ where: { rightsStatus: "REVIEW_REQUIRED" } }),
    prisma.beat.findMany({ orderBy: [{ reviewedAt: { sort: "asc", nulls: "first" } }, { createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * 20, take: 20, include: { producer: { select: { username: true, producerStatus: true } }, assets: { select: { type: true, sizeBytes: true } } } }),
    prisma.user.findMany({ where: { role: "PRODUCER" }, orderBy: [{ producerReviewedAt: { sort: "asc", nulls: "first" } }, { createdAt: "desc" }, { id: "desc" }], skip: (page - 1) * 20, take: 20, select: { id: true, username: true, displayName: true, producerStatus: true, portfolioUrl: true, applicationNote: true, payoutAccountId: true } }),
    prisma.beat.count(),
  ]);
  return <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6"><p className="text-xs uppercase tracking-widest text-accent-300">Catalog operations</p><h1 className="mt-2 text-3xl font-semibold">Curate the founding collection</h1>
    <p className="mt-3 text-sm text-secondary">Payments {env.PAYMENTS_ENABLED ? "enabled" : "disabled"}. Review producers, resolve rights questions and select marketplace listings. Readiness scores measure completeness, not musical quality or legal clearance.</p>
    <div className="mt-7 grid gap-3 sm:grid-cols-3">{[["Producer applications", applications], ["Marketplace sounds", listed], ["Rights reviews", reviews]].map(([label, value]) => <div key={label} className="surface rounded-xl p-5"><p className="text-sm text-muted">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>)}</div>
    <section className="mt-10"><h2 className="text-xl font-semibold">Producer access</h2><p className="mt-1 text-xs text-muted">Approving access does not add producer listings to marketplace discovery.</p><div className="mt-4 space-y-3">{producers.map((producer) => <article key={producer.id} className="surface rounded-xl p-5"><div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold">{producer.displayName} <span className="text-muted">@{producer.username}</span></h3><span className="text-xs text-accent-300">{producer.producerStatus}</span></div>{producer.portfolioUrl && <a href={producer.portfolioUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-accent-300">Open portfolio ↗</a>}<p className="my-3 whitespace-pre-wrap text-sm text-secondary">{producer.applicationNote || "No application note. Check the producer profile before approving."}</p><ProducerAccessAction userId={producer.id} status={producer.producerStatus} />{env.PAYMENTS_ENABLED && <div className="mt-4"><PayoutAccountForm userId={producer.id} initialValue={producer.payoutAccountId || ""} /></div>}</article>)}</div></section>
    <section className="mt-10"><h2 className="text-xl font-semibold">Editorial & rights queue</h2><p className="mt-1 text-xs text-muted">Review original sound packs as a complete product. Check source permissions before accepting sampled beats. Scores remain private.</p><div className="mt-4 space-y-5">{items.map((item) => <article className="surface rounded-xl p-5" key={item.id}>
      <div className="flex flex-wrap justify-between gap-3"><div><p className="text-xs text-accent-300">{item.kind.replace("_", " ")} · @{item.producer.username}</p><h3 className="mt-1 text-lg font-semibold">{item.title}</h3></div><span className="text-sm text-secondary">Readiness {item.qualityScore}/100</span></div>
      <p className="mt-3 whitespace-pre-wrap text-sm text-secondary">{item.description}</p><p className="mt-3 text-xs text-muted">{item.region} · {item.instruments} · AI: {item.aiDisclosure} · Samples: {item.sampleDisclosure} · Producer: {item.producer.producerStatus}</p>
      <p className="mt-2 whitespace-pre-wrap rounded-lg bg-black/30 p-3 text-xs text-secondary">Private source / permission notes: {item.rightsEvidence || "No additional evidence supplied."}</p>
      <p className="mt-2 text-xs text-muted">Files: {item.assets.map((asset) => `${asset.type} (${Math.ceil(asset.sizeBytes / 1024)} KB)`).join(" · ")}</p>
      {item.assets.some((asset) => asset.type === "PREVIEW") && <audio aria-label={`Review ${item.title}`} className="mt-4 w-full" controls preload="none" src={`/api/beats/${item.id}/preview`} />}
      <AdminBeatAction beatId={item.id} status={item.status} rightsStatus={item.rightsStatus} discoveryTier={item.discoveryTier} reviewFeedback={item.reviewFeedback} />
    </article>)}</div></section>
    <nav className="mt-8 flex justify-center gap-5 text-sm" aria-label="Review pages">{page > 1 && <Link href={`/admin?page=${page - 1}`}>← Previous</Link>}<span className="text-muted">Page {page}</span>{items.length === 20 || producers.length === 20 || page * 20 < total ? <Link href={`/admin?page=${page + 1}`}>Next →</Link> : null}</nav>
  </div>;
}
