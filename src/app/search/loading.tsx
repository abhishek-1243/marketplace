export default function LoadingCatalogPage() {
  return <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8" role="status" aria-live="polite">
    <p className="eyebrow">Soundfuel</p><h1 className="page-title mt-4">Loading your next idea.</h1><p className="mt-3 text-secondary">Getting the collection ready…</p>
    <div aria-hidden="true" className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">{Array.from({ length: 5 }, (_, index) => <div key={index} className="rounded-2xl bg-panel p-3"><div className="aspect-square rounded-xl bg-raised" /><div className="mt-4 h-4 w-3/4 rounded bg-raised" /><div className="mt-3 h-3 w-1/2 rounded bg-raised" /></div>)}</div>
  </div>;
}
