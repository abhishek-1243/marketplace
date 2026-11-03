"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Listing = { id: string; title: string; description: string | null; region: string | null; instruments: string | null; tags: string[] };
export default function EditListingForm({ item }: { item: Listing }) {
  const router = useRouter();
  const [form, setForm] = useState({ title: item.title, description: item.description || "", region: item.region || "", instruments: item.instruments || "", tags: item.tags.join(", ") });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const input = "soundfuel-input mt-2";
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/beats/${item.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean) }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Could not save changes");
      setMessage("Saved. Marketplace selection resets after edits; rights restrictions stay in place."); router.refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Could not save changes"); }
    finally { setBusy(false); }
  }
  return <details className="mt-4 text-sm text-secondary"><summary className="cursor-pointer text-accent-300">Edit listing details</summary><form onSubmit={save} className="mt-4 space-y-3">
    <p className="text-xs leading-5">Edits return a selected listing to storefront-only discovery. Contact support to change audio, rights declarations or pricing.</p>
    <label className="block">Title<input required minLength={2} maxLength={120} className={input} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} /></label>
    <label className="block">Description<textarea required minLength={40} maxLength={2000} className={input} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
    <div className="grid gap-3 sm:grid-cols-2"><label>Regional influence<input required minLength={2} maxLength={80} className={input} value={form.region} onChange={(event) => setForm({ ...form, region: event.target.value })} /></label><label>Instruments / textures<input required minLength={2} maxLength={160} className={input} value={form.instruments} onChange={(event) => setForm({ ...form, instruments: event.target.value })} /></label></div>
    <label className="block">Tags, separated by commas<input className={input} value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} /></label>
    <button disabled={busy} aria-busy={busy} className="soundfuel-button-secondary">{busy ? "Saving…" : "Save changes"}</button><p role="status" className="text-xs">{message}</p>
  </form></details>;
}
