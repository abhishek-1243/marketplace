"use client";
import { Heart } from "lucide-react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SaveSoundButton({ beatId, initialSaved = false }: { beatId: string; initialSaved?: boolean }) {
  const { data: session } = useSession(); const router = useRouter();
  const [saved, setSaved] = useState(initialSaved); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  return <div><button type="button" aria-pressed={saved} aria-busy={busy} disabled={busy} className="soundfuel-button-secondary" onClick={async () => {
    if (!session) { router.push("/login"); return; }
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/favorites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ beatId }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setSaved(result.favorited); router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save"); } finally { setBusy(false); }
  }}><Heart aria-hidden="true" className={`h-4 w-4 ${saved ? "fill-accent-300 text-accent-300" : ""}`} />{busy ? "Saving…" : saved ? "Saved" : "Save sound"}</button>{error && <p role="alert" className="mt-2 text-sm text-red-300">{error}</p>}</div>;
}
