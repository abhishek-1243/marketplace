"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { ArrowRight, Loader2 } from "lucide-react";

export default function GoogleSignInButton({ callbackUrl = "/onboarding" }: { callbackUrl?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <div className="mt-7"><button type="button" disabled={busy} aria-busy={busy} className="soundfuel-button w-full" onClick={async () => {
    setBusy(true); setError("");
    try { await signIn("google", { callbackUrl }); }
    catch { setError("Could not connect to Google. Please try again."); setBusy(false); }
  }}>{busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}{busy ? "Connecting to Google…" : "Continue with Google"}{!busy && <ArrowRight className="h-4 w-4" aria-hidden="true" />}</button>{error && <p role="alert" className="mt-3 text-sm text-red-300">{error}</p>}</div>;
}
