"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Headphones, Mic2 } from "lucide-react";
import Brand from "@/components/layout/Brand";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function RegisterPage() {
  const [role, setRole] = useState("ARTIST");
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("role")?.toLowerCase() === "producer") setRole("PRODUCER");
  }, []);

  return (
    <div className="auth-shell">
      <section className="auth-card">
        <Link href="/" className="flex items-center justify-center gap-2.5">
          <Brand />
        </Link>
        <h1 className="mt-8 text-center text-3xl font-semibold tracking-tight">Create your account</h1>
        <p className="mt-2 text-center text-sm text-muted">Choose how you want to use Soundfuel.</p>
        <div className="mt-7 grid grid-cols-2 gap-3">
          {[
            { value: "ARTIST", label: "Artist", detail: "Discover and save sounds", Icon: Headphones },
            { value: "PRODUCER", label: "Producer", detail: "Apply to the founding catalog", Icon: Mic2 },
          ].map(({ value, label, detail, Icon }) => (
            <button key={value} type="button" aria-pressed={role === value} onClick={() => setRole(value)} className="role-choice">
              <Icon className={`h-5 w-5 ${role === value ? "text-accent-300" : "text-secondary"}`} />
              <span className="mt-3 block text-sm font-semibold">{label}</span>
              <span className="mt-0.5 block text-xs text-muted">{detail}</span>
            </button>
          ))}
        </div>
        <GoogleSignInButton callbackUrl={`/onboarding?role=${role}`} />
        <p className="mt-6 text-center text-xs leading-5 text-muted">
          By continuing, you agree to our <Link href="/terms" className="text-secondary hover:text-accent-300">Terms</Link> and <Link href="/privacy" className="text-secondary hover:text-accent-300">Privacy Policy</Link>.
        </p>
        <p className="mt-5 text-center text-sm text-muted">Already registered? <Link href="/login" className="text-white hover:text-accent-300">Log in</Link></p>
      </section>
    </div>
  );
}
