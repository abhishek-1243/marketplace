"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PayoutAccountForm({ userId, initialValue }: { userId: string; initialValue: string }) {
  const router = useRouter();
  const [value, setValue] = useState(initialValue);
  const [busy, setBusy] = useState(false);
  return <form className="flex min-w-[270px] gap-2" onSubmit={async (event) => {
    event.preventDefault();
    setBusy(true);
    const response = await fetch(`/api/admin/users/${userId}/payout-account`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ payoutAccountId: value }) });
    setBusy(false);
    if (response.ok) router.refresh();
  }}>
    <input value={value} onChange={(event) => setValue(event.target.value)} placeholder="acc_…" pattern="acc_[A-Za-z0-9]+" required className="soundfuel-input py-1.5" aria-label="Razorpay linked account ID" />
    <button disabled={busy} className="rounded-full bg-amber-300 px-3 text-xs font-bold text-black disabled:opacity-50">{busy ? "…" : "Save"}</button>
  </form>;
}
