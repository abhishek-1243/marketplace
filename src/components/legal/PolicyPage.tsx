export default function PolicyPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Soundfuel policy</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-zinc-500">Last updated {updated}</p>
      <div className="mt-10 space-y-7 text-sm leading-7 text-zinc-300 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-white [&_p]:mt-2 [&_ul]:ml-5 [&_ul]:list-disc">
        {children}
      </div>
    </article>
  );
}
