export default function PolicyPage({ title, updated, children }: { title: string; updated: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-5 py-12 sm:py-16">
      <p className="eyebrow">Soundfuel policy</p>
      <h1 className="page-title mt-4">{title}</h1>
      <p className="mt-2 text-sm text-muted">Last updated {updated}</p>
      <div className="policy-content mt-10 border-t border-line pt-9">
        {children}
      </div>
    </article>
  );
}
