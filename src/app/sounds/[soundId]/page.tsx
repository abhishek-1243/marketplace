import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { catalogSelect, publicCatalogWhere, serializeCatalogItem } from "@/lib/catalog";
import BeatCard from "@/components/beats/BeatCard";
import SaveSoundButton from "@/components/beats/SaveSoundButton";
import { formatPrice } from "@/lib/utils";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";
export default async function SoundPage({ params }: { params: Promise<{ soundId: string }> }) {
  const { soundId } = await params;
  const sound = await prisma.beat.findFirst({ where: { id: soundId, ...publicCatalogWhere }, select: catalogSelect });
  if (!sound) notFound();
  const session = await getServerSession(authOptions);
  const saved = session ? await prisma.favorite.findUnique({ where: { userId_beatId: { userId: session.user.id, beatId: sound.id } }, select: { id: true } }) : null;
  const pack = sound.kind === "SOUND_PACK";
  return <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
    <Link href={`/search?kind=${sound.kind}`} className="text-sm text-zinc-400 hover:text-white">← Explore {pack ? "sound packs" : "beats"}</Link>
    <div className="mt-7 grid gap-8 md:grid-cols-[280px_1fr]">
      <BeatCard beat={serializeCatalogItem(sound)} />
      <section><p className="text-xs uppercase tracking-widest text-amber-300">{pack ? "Original sound pack" : "Independent beat"}</p>
        <h1 className="mt-2 text-3xl font-bold sm:text-4xl">{sound.title}</h1>
        <Link href={`/${sound.producer.username}`} className="mt-2 inline-block text-zinc-400 hover:text-white">By {sound.producer.displayName}</Link>
        <p className="mt-5 whitespace-pre-wrap leading-7 text-zinc-400">{sound.description}</p>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          {[["Influence / region", sound.region], ["Instruments", sound.instruments], ["Genre", sound.genre], ["Contents", pack ? `${sound.sampleCount ?? "—"} sounds` : [sound.bpm && `${sound.bpm} BPM`, sound.musicalKey].filter(Boolean).join(" · ")]].map(([label, value]) => <div key={label}><dt className="text-xs text-zinc-500">{label}</dt><dd className="mt-1">{value || "Not specified"}</dd></div>)}
        </dl>
        {sound.aiDisclosure === "ASSISTED" && <p className="mt-4 text-xs text-zinc-500">Producer declares AI-assisted production tools. Substantially generated audio is not eligible for this catalog.</p>}
        <div className="mt-7 flex flex-wrap items-center gap-3"><SaveSoundButton beatId={sound.id} initialSaved={Boolean(saved)} />
          {env.PAYMENTS_ENABLED && !pack ? <Link className="soundfuel-button" href={`/checkout/${sound.id}`}>Review licence</Link> : <button disabled className="soundfuel-button disabled:cursor-not-allowed disabled:opacity-50">Purchases opening later</button>}
        </div>
        <p className="mt-3 text-xs text-zinc-500">Catalog preview. Listening does not grant a licence or access to production files.</p>
      </section>
    </div>
    <section className="surface mt-10 rounded-2xl p-6">
      <h2 className="text-lg font-semibold">{pack ? "Pack pricing preview" : "Licence pricing preview"}</h2>
      <p className="mt-2 text-sm text-zinc-400">Indicative producer prices. No payment, licence acceptance or download is available during preview. Final terms and applicable taxes will be shown before purchases open.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">{sound.licensePlans.map((plan) => <div key={plan.type} className="rounded-xl border border-white/10 p-4"><p className="text-sm text-zinc-400">{plan.type === "SOUND_PACK" ? "Sound pack" : `${plan.type.toLowerCase()} licence`}</p><p className="mt-2 text-xl font-semibold">{formatPrice(plan.price)}</p></div>)}</div>
      <p className="mt-5 text-xs text-zinc-500">Producers declare their rights and sources. Editorial selection is not a guarantee of copyright ownership. <Link className="text-amber-300" href="/copyright">Report a rights concern</Link>.</p>
    </section>
  </div>;
}
