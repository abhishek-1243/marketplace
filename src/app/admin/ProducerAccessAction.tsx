"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProducerAccessAction({ userId, status }: { userId: string; status: string }) {
  const router = useRouter(); const [busy, setBusy] = useState(false); const [error, setError] = useState("");
  return <div className="flex flex-wrap gap-2">
    {(["APPROVED", "SUSPENDED", "APPLIED"] as const).filter((value) => value !== status).map((value) => <button key={value} disabled={busy} className="soundfuel-button-secondary !px-3 !py-1.5 !text-xs" onClick={async () => {
      setBusy(true); setError("");
      try {
        const response = await fetch(`/api/admin/users/${userId}/producer-status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ producerStatus: value }) });
        if (!response.ok) throw new Error((await response.json()).error);
        router.refresh();
      } catch (err) { setError(err instanceof Error ? err.message : "Could not save"); } finally { setBusy(false); }
    }}>{value === "APPROVED" ? "Approve producer" : value === "SUSPENDED" ? "Suspend" : "Return to application"}</button>)}
    {error && <p className="text-xs text-red-300" role="alert">{error}</p>}
  </div>;
}
