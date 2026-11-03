"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Headphones, Mic2, Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [role, setRole] = useState<"ARTIST" | "PRODUCER">("ARTIST");
  const [username, setUsername] = useState(session?.user.username || "");
  const [displayName, setDisplayName] = useState(session?.user.name || "");
  const [legalName, setLegalName] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [applicationNote, setApplicationNote] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("role") === "PRODUCER") setRole("PRODUCER");
    if (status === "unauthenticated") router.replace("/login");
    if (session?.user.onboardingComplete) router.replace(session.user.role === "PRODUCER" ? "/dashboard" : "/");
    if (session?.user.username) setUsername(session.user.username);
    if (session?.user.name) setDisplayName(session.user.name);
  }, [session, status, router]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const response = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, username, displayName, legalName, acceptedTerms, ...(role === "PRODUCER" ? { portfolioUrl, applicationNote } : {}) }),
    });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error || "Could not complete profile");
      setLoading(false);
      return;
    }
    await update();
    router.replace(role === "PRODUCER" ? "/dashboard" : "/");
    router.refresh();
  };

  if (status === "loading") return <div className="min-h-[60vh] grid place-items-center"><Loader2 className="animate-spin text-accent-400" /></div>;

  return (
    <div className="mx-auto my-10 max-w-lg px-4">
      <div className="auth-card">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-400">Welcome to Soundfuel</p>
      <h1 className="text-3xl font-semibold tracking-tight mt-2">Set up your profile</h1>
      <p className="text-sm text-muted mt-2">Choose how you want to use the marketplace. This role can be expanded later by support.</p>
      <form onSubmit={submit} className="mt-8 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          <button type="button" aria-pressed={role === "ARTIST"} onClick={() => setRole("ARTIST")} className="role-choice !text-center"><Headphones className="mx-auto mb-2 h-5 w-5" /><span className="text-sm font-semibold">Artist</span></button>
          <button type="button" aria-pressed={role === "PRODUCER"} onClick={() => setRole("PRODUCER")} className="role-choice !text-center"><Mic2 className="mx-auto mb-2 h-5 w-5" /><span className="text-sm font-semibold">Producer</span></button>
        </div>
        <label className="block text-sm text-secondary">Display name<input autoComplete="nickname" value={displayName} onChange={(e) => setDisplayName(e.target.value)} minLength={2} maxLength={80} required className="soundfuel-input mt-2" /></label>
        <label className="block text-sm text-secondary">Legal name<input autoComplete="name" value={legalName} onChange={(e) => setLegalName(e.target.value)} minLength={2} maxLength={120} required className="soundfuel-input mt-2" /></label>
        <label className="block text-sm text-secondary">Username<input autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))} minLength={3} maxLength={30} required className="soundfuel-input mt-2" /></label>
        {role === "PRODUCER" && <div className="space-y-3">
          <p className="text-sm text-secondary">Join our founding catalog of Indian beats and sounds. We review your portfolio once before enabling uploads. No bank details are needed during the preview.</p>
          <label className="block text-sm">Portfolio link<input aria-label="Portfolio link" type="url" value={portfolioUrl} onChange={(e) => setPortfolioUrl(e.target.value)} placeholder="https://youtube.com/@yourchannel" required maxLength={500} className="soundfuel-input mt-1" /></label>
          <label className="block text-sm">Your sound<textarea value={applicationNote} onChange={(e) => setApplicationNote(e.target.value)} placeholder="Instruments, genres and regional influences you work with" maxLength={1000} className="soundfuel-input mt-1" /></label>
        </div>}
        <label className="flex items-start gap-3 text-xs text-muted"><input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} required className="mt-0.5 accent-accent-400" /><span>I agree to the Terms, Privacy Policy and marketplace licence process.</span></label>
        {error && <p className="text-sm text-red-300 bg-red-500/10 p-3 rounded-lg">{error}</p>}
        <button disabled={loading} className="soundfuel-button w-full disabled:opacity-50">{loading && <Loader2 className="w-4 h-4 animate-spin" />} Continue</button>
      </form>
      </div>
    </div>
  );
}
