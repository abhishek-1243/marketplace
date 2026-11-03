"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminBeatAction({ beatId, status, rightsStatus, discoveryTier, reviewFeedback }: { beatId: string; status: string; rightsStatus: string; discoveryTier: string; reviewFeedback: string | null }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  return <form className="mt-5 grid gap-3 sm:grid-cols-3" onSubmit={async (event) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const body = Object.fromEntries(new FormData(event.currentTarget));
      const response = await fetch(`/api/admin/beats/${beatId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error);
      router.refresh();
    } catch (err) { setError(err instanceof Error ? err.message : "Could not save review"); } finally { setBusy(false); }
  }}>
    <label className="text-xs text-secondary">Publication<select name="status" aria-label="Publication" defaultValue={status} className="soundfuel-input mt-2"><option value="DRAFT">Private draft</option><option value="PUBLISHED">Published</option><option value="UNPUBLISHED">Unpublished</option>{status === "SOLD" && <option value="SOLD">Sold</option>}</select></label>
    <label className="text-xs text-secondary">Rights disposition<select name="rightsStatus" aria-label="Rights disposition" defaultValue={rightsStatus} className="soundfuel-input mt-2"><option value="DECLARED">Declaration accepted</option><option value="REVIEW_REQUIRED">Needs evidence / review</option><option value="RESTRICTED">Restricted</option></select></label>
    <label className="text-xs text-secondary">Discovery<select name="discoveryTier" aria-label="Discovery" defaultValue={discoveryTier} className="soundfuel-input mt-2"><option value="STOREFRONT">Storefront only</option><option value="MARKETPLACE">Marketplace selected</option><option value="FEATURED">Editorial selection</option></select></label>
    <label className="text-xs text-secondary sm:col-span-3">Decision reason / producer feedback<textarea name="reviewFeedback" defaultValue={reviewFeedback || ""} required minLength={10} maxLength={1500} placeholder="Explain the editorial decision or the evidence needed." className="soundfuel-input mt-2" /></label>
    <button disabled={busy || status === "SOLD"} aria-busy={busy} className="soundfuel-button">{busy ? "Saving…" : "Save review"}</button>{error && <p role="alert" className="text-sm text-red-300 sm:col-span-2">{error}</p>}
  </form>;
}
