"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Search,
  Home,
  Compass,
  Library,
  MessageSquare,
  LayoutDashboard,
  LogOut,
  User,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-black/80 backdrop-blur-2xl border-b border-white/[0.06]">
      <div className="h-full max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2 shrink-0 mr-2">
          <img
            src="/images/soundfuel-icon.png"
            alt=""
            className="h-6 w-auto invert"
          />
          <span className="text-[15px] font-bold tracking-tight hidden sm:block">soundfuel</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 rounded-full bg-white/[0.07] flex items-center justify-center hover:bg-white/[0.12] text-zinc-400 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => router.forward()}
            className="w-8 h-8 rounded-full bg-white/[0.07] flex items-center justify-center hover:bg-white/[0.12] text-zinc-400 hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="hidden md:flex items-center gap-6 text-[13px] font-medium">
          <Link
            href="/"
            className={`flex items-center gap-2 py-1 ${pathname === "/" ? "text-white" : "text-zinc-400 hover:text-white"}`}
          >
            <Home className="w-4 h-4" />
            Home
          </Link>
          <Link
            href="/search"
            className={`flex items-center gap-2 py-1 ${pathname === "/search" ? "text-white" : "text-zinc-400 hover:text-white"}`}
          >
            <Compass className="w-4 h-4" />
            Explore
          </Link>
          {session && (
            <Link
              href="/library"
              className={`flex items-center gap-2 py-1 ${pathname === "/library" ? "text-white" : "text-zinc-400 hover:text-white"}`}
            >
              <Library className="w-4 h-4" />
              Library
            </Link>
          )}
        </div>

        <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-sm mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="What do you want to find?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/[0.07] hover:bg-white/[0.1] rounded-full text-[13px] placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/20 focus:bg-white/[0.1] border-0"
            />
          </div>
        </form>

        <div className="hidden md:flex items-center gap-2 ml-auto">
          {session ? (
            <>
              {user?.role === "PRODUCER" && (
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium ${pathname.startsWith("/dashboard") ? "bg-white/[0.12] text-white" : "text-zinc-400 hover:text-white hover:bg-white/[0.07]"}`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Dashboard
                </Link>
              )}
              <Link
                href="/messages"
                className={`p-2 rounded-full ${pathname === "/messages" ? "text-white bg-white/[0.12]" : "text-zinc-400 hover:text-white hover:bg-white/[0.07]"}`}
              >
                <MessageSquare className="w-4 h-4" />
              </Link>
              <div className="w-px h-5 bg-white/10 mx-1" />
              <Link
                href={`/${user?.username || ""}`}
                className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-[13px] font-medium hover:scale-105 overflow-hidden"
              >
                {user?.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
              </Link>
              <button
                onClick={() => signOut()}
                className="p-2 rounded-full text-zinc-500 hover:text-white hover:bg-white/[0.07]"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/register"
                className="text-[13px] font-medium text-zinc-400 hover:text-white"
              >
                Sign up
              </Link>
              <Link
                href="/login"
                className="px-6 py-2 bg-white text-black rounded-full text-[13px] font-semibold hover:scale-[1.02] hover:bg-zinc-100"
              >
                Log in
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-full text-zinc-400 hover:text-white ml-auto"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-zinc-950 border-t border-white/[0.06]">
          <div className="px-4 py-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/[0.07] rounded-lg text-sm placeholder:text-zinc-500 focus:outline-none border-0"
                />
              </div>
            </form>
          </div>
          <div className="px-4 pb-4 space-y-0.5">
            <Link href="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:bg-white/[0.05]" onClick={() => setMenuOpen(false)}>
              <Home className="w-4 h-4" /> Home
            </Link>
            <Link href="/search" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:bg-white/[0.05]" onClick={() => setMenuOpen(false)}>
              <Compass className="w-4 h-4" /> Explore
            </Link>
            {session ? (
              <>
                {user?.role === "PRODUCER" && (
                  <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:bg-white/[0.05]" onClick={() => setMenuOpen(false)}>
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                )}
                <Link href="/library" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:bg-white/[0.05]" onClick={() => setMenuOpen(false)}>
                  <Library className="w-4 h-4" /> Library
                </Link>
                <Link href="/messages" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:bg-white/[0.05]" onClick={() => setMenuOpen(false)}>
                  <MessageSquare className="w-4 h-4" /> Messages
                </Link>
                <div className="border-t border-white/[0.06] my-2" />
                <button onClick={() => { signOut(); setMenuOpen(false); }} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-zinc-500 hover:bg-white/[0.05]">
                  <LogOut className="w-4 h-4" /> Sign out
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-white/[0.06] my-2" />
                <Link href="/login" className="flex items-center justify-center py-2.5 rounded-lg text-sm font-semibold bg-white text-black" onClick={() => setMenuOpen(false)}>
                  Log in
                </Link>
                <Link href="/register" className="flex items-center justify-center py-2.5 rounded-lg text-sm text-zinc-400 hover:text-white" onClick={() => setMenuOpen(false)}>
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
