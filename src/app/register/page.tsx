"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Mic2, Headphones } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "producer" ? "PRODUCER" : "ARTIST";

  const [form, setForm] = useState({
    displayName: "",
    username: "",
    email: "",
    password: "",
    role: defaultRole,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      router.push(form.role === "PRODUCER" ? "/dashboard" : "/");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <img
              src="/images/soundfuel-icon.png"
              alt=""
              className="h-8 w-auto invert"
            />
            <span className="text-xl font-bold tracking-tight">soundfuel</span>
          </Link>
          <h1 className="mt-8 text-3xl font-bold tracking-tight">Sign up to start listening</h1>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setForm({ ...form, role: "ARTIST" })}
            className={`flex-1 py-3 px-4 rounded-lg text-center transition-all ${
              form.role === "ARTIST"
                ? "bg-white text-black"
                : "bg-white/[0.07] text-zinc-400 hover:bg-white/[0.1] hover:text-white"
            }`}
          >
            <Headphones className="w-5 h-5 mx-auto mb-1.5" />
            <p className="text-[13px] font-semibold">Artist</p>
            <p className="text-[11px] mt-0.5 opacity-60">License beats</p>
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, role: "PRODUCER" })}
            className={`flex-1 py-3 px-4 rounded-lg text-center transition-all ${
              form.role === "PRODUCER"
                ? "bg-white text-black"
                : "bg-white/[0.07] text-zinc-400 hover:bg-white/[0.1] hover:text-white"
            }`}
          >
            <Mic2 className="w-5 h-5 mx-auto mb-1.5" />
            <p className="text-[13px] font-semibold">Producer</p>
            <p className="text-[11px] mt-0.5 opacity-60">Sell beats</p>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="p-3 bg-red-500/10 rounded-lg text-[13px] text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[13px] font-medium text-zinc-400 mb-1.5">
              Display name
            </label>
            <input
              type="text"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              className="w-full px-4 py-3 bg-white/[0.07] hover:bg-white/[0.1] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-white/30 border-0"
              placeholder="Your display name"
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-zinc-400 mb-1.5">
              Username
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) =>
                setForm({
                  ...form,
                  username: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""),
                })
              }
              className="w-full px-4 py-3 bg-white/[0.07] hover:bg-white/[0.1] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-white/30 border-0"
              placeholder="username"
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-zinc-400 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 bg-white/[0.07] hover:bg-white/[0.1] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-white/30 border-0"
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-zinc-400 mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 bg-white/[0.07] hover:bg-white/[0.1] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-white/30 border-0"
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-black rounded-full text-sm font-semibold hover:scale-[1.01] hover:bg-zinc-100 disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Sign up
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
          <p className="text-[13px] text-zinc-500">
            Already have an account?{" "}
            <Link href="/login" className="text-white underline underline-offset-2 hover:no-underline">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
