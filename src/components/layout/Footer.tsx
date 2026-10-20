import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.07] px-4 py-8 text-xs text-zinc-600">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p>© {new Date().getFullYear()} Soundfuel. Original music, licensed clearly.</p>
        <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Legal">
          <Link href="/contact" className="hover:text-amber-300">Contact</Link>
          <Link href="/delivery-policy" className="hover:text-amber-300">Delivery</Link>
          <Link href="/terms" className="hover:text-amber-300">Terms</Link>
          <Link href="/privacy" className="hover:text-amber-300">Privacy</Link>
          <Link href="/refund-policy" className="hover:text-amber-300">Refunds</Link>
          <Link href="/copyright" className="hover:text-amber-300">Copyright</Link>
        </nav>
      </div>
    </footer>
  );
}
