import Link from "next/link";
import { AudioLines } from "lucide-react";

export default function NotFound() {
  return <div className="mx-auto max-w-xl px-4 py-20 text-center"><AudioLines aria-hidden="true" className="mx-auto mb-6 h-10 w-10 text-accent-300" /><p className="eyebrow mb-4">Page not found</p><h1 className="page-title">A different direction.</h1><p className="page-description">This page may have moved, or the sound may no longer be available. There’s more to discover in the catalog.</p><Link href="/search" className="soundfuel-button mt-8">Explore sounds</Link></div>;
}
