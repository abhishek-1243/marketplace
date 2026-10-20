"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { LogIn, Headphones, Mic2 } from "lucide-react";

export default function RegisterPage() {
  const [role, setRole] = useState("ARTIST");
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("role")?.toLowerCase() === "producer") setRole("PRODUCER");
  }, []);

  return (
    <main className="min-h-screen grid place-items-center px-4 py-16">
      <section className="w-full max-w-md surface rounded-2xl p-7 sm:p-8">
        <Link href="/" className="flex items-center justify-center gap-2.5">
          <img src="/images/soundfuel-logo-new.png" alt="" className="h-8 w-auto" />
          <span className="text-xl font-bold tracking-tight">soundfuel</span>
        </Link>
        <h1 className="mt-8 text-center text-3xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-2 text-center text-sm text-zinc-500">Choose how you want to use Soundfuel.</p>
        <div className="mt-7 grid grid-cols-2 gap-3">
          {[
            { value: "ARTIST", label: "Artist", detail: "Discover and save sounds", Icon: Headphones },
            { value: "PRODUCER", label: "Producer", detail: "Apply to the founding catalog", Icon: Mic2 },
          ].map(({ value, label, detail, Icon }) => (
            <button key={value} type="button" onClick={() => setRole(value)} className={`rounded-xl border p-4 text-left ${role === value ? "border-amber-300 bg-amber-300/10" : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"}`}>
              <Icon className={`h-5 w-5 ${role === value ? "text-amber-300" : "text-zinc-400"}`} />
              <span className="mt-3 block text-sm font-semibold">{label}</span>
              <span className="mt-0.5 block text-xs text-zinc-500">{detail}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={() => signIn("google", { callbackUrl: `/onboarding?role=${role}` })} className="soundfuel-button mt-6 w-full">
          <LogIn className="h-4 w-4" aria-hidden="true" />
          Continue with Google
        </button>
        <p className="mt-6 text-center text-xs leading-5 text-zinc-600">
          By continuing, you agree to our <Link href="/terms" className="text-zinc-300 hover:text-amber-300">Terms</Link> and <Link href="/privacy" className="text-zinc-300 hover:text-amber-300">Privacy Policy</Link>.
        </p>
        <p className="mt-5 text-center text-sm text-zinc-500">Already registered? <Link href="/login" className="text-white hover:text-amber-300">Log in</Link></p>
      </section>
    </main>
  );
}
