"use client";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function ApplyPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <div className="mx-auto max-w-xl px-4 py-14">
    <p className="text-xs uppercase tracking-widest text-amber-300">Founding creators</p>
    <h1 className="mt-3 text-3xl font-bold">Bring your Indian sound.</h1>
    <p className="mt-4 leading-7 text-zinc-400">We are building a focused collection of original beats, instruments and sound packs. Share your best work and tell us about the people, recordings and regional influences behind it.</p>
    <p className="mt-4 text-sm text-zinc-500">The catalog is in preview. No application fee, subscription or bank details are required. Purchases are not open yet.</p>
    {status === "loading" ? <p className="mt-8">Loading…</p> : !session ? <Link className="soundfuel-button mt-8" href="/register?role=producer">Apply with Google</Link> : !session.user.onboardingComplete ? <Link className="soundfuel-button mt-8" href="/onboarding?role=PRODUCER">Complete your application</Link> : session.user.role === "PRODUCER" || session.user.role === "ADMIN" ? <Link className="soundfuel-button mt-8" href={session.user.role === "ADMIN" ? "/admin" : "/dashboard"}>Open dashboard</Link> : <form className="mt-8 space-y-4" onSubmit={async (event) => {
      event.preventDefault(); setBusy(true); setError("");
      const data = new FormData(event.currentTarget);
      try {
        const response = await fetch("/api/producer-application", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(data)) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        await update(); router.push("/dashboard"); router.refresh();
      } catch (err) { setError(err instanceof Error ? err.message : "Could not submit application"); } finally { setBusy(false); }
    }}>
      <label className="block text-sm">Legal name<input className="soundfuel-input mt-2" name="legalName" required minLength={2} maxLength={120} /></label>
      <label className="block text-sm">Portfolio link<input className="soundfuel-input mt-2" name="portfolioUrl" type="url" required maxLength={500} placeholder="https://youtube.com/@yourchannel" /></label>
      <label className="block text-sm">Tell us about your sound<textarea className="soundfuel-input mt-2 min-h-28" name="applicationNote" required minLength={20} maxLength={1000} /></label>
      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      <button disabled={busy} className="soundfuel-button">{busy ? "Submitting…" : "Submit producer application"}</button>
    </form>}
  </div>;
}
