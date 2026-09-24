"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
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
          <h1 className="mt-8 text-3xl font-bold tracking-tight">Log in to Soundfuel</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 rounded-lg text-[13px] text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[13px] font-medium text-zinc-400 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.07] hover:bg-white/[0.1] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-white/30 border-0"
              placeholder="Password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-white text-black rounded-full text-sm font-semibold hover:scale-[1.01] hover:bg-zinc-100 disabled:opacity-50 flex items-center justify-center gap-2 mt-6"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Log in
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/[0.06] text-center">
          <p className="text-[13px] text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-white underline underline-offset-2 hover:no-underline">
              Sign up for Soundfuel
            </Link>
          </p>
        </div>

        <div className="mt-8 p-4 rounded-lg bg-zinc-900 text-[12px] text-zinc-500">
          <p className="font-medium text-zinc-400 mb-1.5">Demo accounts</p>
          <p>Producer: rahul@example.com / password123</p>
          <p>Artist: artist1@example.com / password123</p>
        </div>
      </div>
    </div>
  );
}
