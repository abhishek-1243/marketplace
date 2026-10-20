"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  return (
    <main className="min-h-screen grid place-items-center px-4 py-16">
      <section className="w-full max-w-sm surface rounded-2xl p-7 sm:p-8">
        <Link href="/" className="flex items-center justify-center gap-2.5">
          <img src="/images/soundfuel-logo-new.png" alt="" className="h-8 w-auto" />
          <span className="text-xl font-bold tracking-tight">soundfuel</span>
        </Link>
        <h1 className="mt-8 text-center text-3xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-center text-sm text-zinc-500">Sign in securely with your Google account.</p>
        <button type="button" onClick={() => signIn("google", { callbackUrl: "/onboarding" })} className="soundfuel-button mt-8 w-full">
          <LogIn className="h-4 w-4" aria-hidden="true" />
          Continue with Google
        </button>
        <p className="mt-6 text-center text-xs leading-5 text-zinc-600">
          By continuing, you agree to our <Link href="/terms" className="text-zinc-300 hover:text-amber-300">Terms</Link> and <Link href="/privacy" className="text-zinc-300 hover:text-amber-300">Privacy Policy</Link>.
        </p>
      </section>
    </main>
  );
}
