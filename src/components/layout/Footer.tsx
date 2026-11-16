import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line/60 bg-panel/30 py-10 text-sm text-secondary">
      <div className="site-shell flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} Soundfuel.<br /><span className="text-xs text-muted">Indian roots. Original beats and sounds.</span></p>
        <nav className="flex flex-wrap gap-x-5 gap-y-4 [&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center" aria-label="Legal">
          <Link href="/contact" className="hover:text-accent-300">Contact</Link>
          <Link href="/delivery-policy" className="hover:text-accent-300">Delivery</Link>
          <Link href="/terms" className="hover:text-accent-300">Terms</Link>
          <Link href="/privacy" className="hover:text-accent-300">Privacy</Link>
          <Link href="/refund-policy" className="hover:text-accent-300">Refunds</Link>
          <Link href="/copyright" className="hover:text-accent-300">Copyright</Link>
        </nav>
      </div>
    </footer>
  );
}
