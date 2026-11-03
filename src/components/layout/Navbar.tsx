"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, Menu, X, LogOut, LayoutDashboard, ShieldCheck, Bookmark, ArrowUpRight } from "lucide-react";
import Brand from "./Brand";

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");
  const headerRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const user = session?.user;
  const workspace = user?.role === "ADMIN" ? "/admin" : user?.role === "PRODUCER" ? "/dashboard" : "/library";
  const WorkspaceIcon = user?.role === "ADMIN" ? ShieldCheck : user?.role === "PRODUCER" ? LayoutDashboard : Bookmark;
  const workspaceLabel = user?.role === "ADMIN" ? "Admin" : user?.role === "PRODUCER" ? "Creator studio" : "Saved sounds";
  const links = [{ href: "/", label: "Discover" }, { href: "/search", label: "Explore sounds" }, { href: "/apply", label: "For creators" }];
  const isCurrent = (href: string) => pathname === href || (pathname === "/ui-preview" && href === "/");

  useEffect(() => { setMenuOpen(false); }, [pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const dismiss = (event: PointerEvent) => { if (!headerRef.current?.contains(event.target as Node)) setMenuOpen(false); };
    const escape = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenuOpen(false); toggleRef.current?.focus(); } };
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", dismiss); document.removeEventListener("keydown", escape); };
  }, [menuOpen]);

  function search(event: React.FormEvent) {
    event.preventDefault();
    router.push(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : "/search");
    setMenuOpen(false);
  }

  return <header ref={headerRef} data-authenticated={!!session} className="glass-chrome fixed inset-x-0 top-0 z-50">
    <div className="header-row mx-auto flex h-20 max-w-7xl items-center gap-5 px-4 sm:px-6 lg:px-8">
      <Link href="/" aria-label="Soundfuel home" className="header-brand flex h-11 shrink-0 items-center rounded-xl"><Brand /></Link>
      <nav aria-label="Main navigation" className="primary-navigation hidden items-center gap-1 xl:flex">
        {links.map((link) => <Link key={link.href} href={link.href} className="nav-link" aria-current={isCurrent(link.href) ? "page" : undefined}>{link.label}</Link>)}
        {session && workspace !== "/library" && <Link href="/library" className="nav-link" aria-current={pathname === "/library" ? "page" : undefined}>Saved sounds</Link>}
      </nav>
      <form onSubmit={search} role="search" className="header-search relative ml-auto hidden min-w-0 max-w-64 flex-1 xl:block">
        <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input aria-label="Search the catalog" placeholder="Search sounds" value={query} onChange={(event) => setQuery(event.target.value)} maxLength={80} className="soundfuel-input !rounded-full !py-2.5 !pl-10 !text-sm" />
      </form>
      <div className="header-account hidden shrink-0 items-center gap-2 xl:flex">
        {status === "loading" ? <span className="h-11 w-24 rounded-full bg-raised" aria-label="Loading account" /> : session ? <>
          <Link href={workspace} className="soundfuel-button-secondary !px-4"><WorkspaceIcon aria-hidden="true" className="h-4 w-4" />{workspaceLabel}</Link>
          <button onClick={() => signOut()} aria-label="Sign out" className="icon-button"><LogOut className="h-4 w-4" /></button>
        </> : <><Link href="/login" className="nav-link">Sign in</Link><Link href="/register" className="soundfuel-button !py-2.5">Get started<ArrowUpRight aria-hidden="true" className="h-4 w-4" /></Link></>}
      </div>
      <div className="header-compact ml-auto flex items-center gap-1 xl:hidden">
        <Link href="/search" className="icon-button" aria-label="Search sounds"><Search className="h-5 w-5" /></Link>
        <button ref={toggleRef} onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="mobile-navigation" className="icon-button">{menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
      </div>
    </div>
    {menuOpen && <nav id="mobile-navigation" aria-label="Mobile navigation" className="mobile-menu xl:hidden">
      <form onSubmit={search} role="search" className="mb-3"><input autoFocus aria-label="Search the catalog" className="soundfuel-input" placeholder="Search instruments, genres, sounds…" value={query} onChange={(event) => setQuery(event.target.value)} maxLength={80} /><button type="submit" className="soundfuel-button mt-2 w-full">Search sounds</button></form>
      {[...links, { href: "/search?kind=SOUND_PACK", label: "Original sound packs" }].map((link) => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} className="nav-link !flex !rounded-xl" aria-current={isCurrent(link.href) ? "page" : undefined}>{link.label}</Link>)}
      <div className="mt-3 border-t border-line pt-3">{session ? <>
        <Link href={workspace} onClick={() => setMenuOpen(false)} className="nav-link !flex"><WorkspaceIcon aria-hidden="true" className="h-4 w-4" />{workspaceLabel}</Link>
        {workspace !== "/library" && <Link href="/library" onClick={() => setMenuOpen(false)} className="nav-link !flex">Saved sounds</Link>}
        <button onClick={() => { setMenuOpen(false); signOut(); }} className="nav-link w-full"><LogOut aria-hidden="true" className="h-4 w-4" />Sign out</button>
      </> : <div className="grid grid-cols-2 gap-2"><Link onClick={() => setMenuOpen(false)} href="/login" className="soundfuel-button-secondary">Sign in</Link><Link onClick={() => setMenuOpen(false)} href="/register" className="soundfuel-button">Get started</Link></div>}</div>
    </nav>}
  </header>;
}
