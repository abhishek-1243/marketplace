"use client";

import Link from "next/link";
import Brand from "@/components/layout/Brand";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function LoginPage() {
  return (
    <div className="auth-shell">
      <section className="auth-card">
        <Link href="/" className="flex items-center justify-center gap-2.5">
          <Brand />
        </Link>
        <h1 className="mt-8 text-center text-3xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-2 text-center text-sm text-muted">Sign in securely with your Google account.</p>
        <GoogleSignInButton />
        <p className="mt-5 text-center text-sm text-secondary">New here? <Link href="/register" className="text-accent-300">Create an account</Link></p>
        <p className="mt-6 text-center text-xs leading-5 text-muted">
          By continuing, you agree to our <Link href="/terms" className="text-secondary hover:text-accent-300">Terms</Link> and <Link href="/privacy" className="text-secondary hover:text-accent-300">Privacy Policy</Link>.
        </p>
      </section>
    </div>
  );
}
