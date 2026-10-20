"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Script from "next/script";
import { Check, FileText, CreditCard, Download, Shield, Loader2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void; on: (event: string, cb: () => void) => void };
  }
}

type Step = "license" | "agreement" | "payment" | "success";

export default function CheckoutClient({ beat, paymentsEnabled }: { beat: any; paymentsEnabled: boolean }) {
  const { data: session } = useSession();
  const [step, setStep] = useState<Step>("license");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (paymentsEnabled && !session) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-bold tracking-tight mb-4">Sign in to license this beat</h1>
        <Link href="/login" className="soundfuel-button">Log in</Link>
      </div>
    );
  }
  if (paymentsEnabled && session && !session.user.onboardingComplete) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-bold tracking-tight mb-4">Complete your Soundfuel profile first</h1>
        <Link href="/onboarding" className="soundfuel-button">Continue setup</Link>
      </div>
    );
  }

  const beginPayment = async () => {
    if (!paymentsEnabled || !selectedPlan || !window.Razorpay) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beatId: beat.id, licensePlanId: selectedPlan.id, acceptedAgreement: true }),
      });
      const checkout = await response.json();
      if (!response.ok) throw new Error(checkout.error || "Checkout failed");

      const razorpay = new window.Razorpay({
        key: checkout.keyId,
        amount: checkout.amountPaise,
        currency: checkout.currency,
        name: "Soundfuel",
        description: `${beat.title} — ${selectedPlan.type} licence`,
        order_id: checkout.providerOrderId,
        prefill: checkout.customer,
        theme: { color: "#f59e0b" },
        handler: async (payment: Record<string, string>) => {
          const verification = await fetch("/api/payments/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payment),
          });
          if (!verification.ok) {
            setError("Payment was received but verification is still pending. Check your library shortly.");
            setLoading(false);
            return;
          }
          setStep("success");
          setLoading(false);
        },
      });
      razorpay.on("payment.failed", () => {
        setError("Payment was not completed. You can safely try again.");
        setLoading(false);
      });
      razorpay.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      {paymentsEnabled && <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />}
      {!paymentsEnabled && <div className="surface rounded-xl p-5 mb-6" role="status">
        <h1 className="text-xl font-semibold mb-2">Payments coming soon</h1>
        <p className="text-sm text-zinc-400">Browse beats, compare prices and review licence details. Purchases and downloads will open when payments are available.</p>
        <Link href="/contact" className="inline-block mt-3 text-sm text-amber-400 hover:text-amber-300">Contact Soundfuel</Link>
      </div>}
      {paymentsEnabled && <div className="flex items-center gap-3 mb-8">
        {(["license", "agreement", "payment", "success"] as Step[]).map((item, index) => (
          <div key={item} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold ${
              step === item || ["license", "agreement", "payment", "success"].indexOf(step) > index
                ? "bg-amber-400 text-black"
                : "bg-white/[0.07] text-zinc-500"
            }`}>
              {["license", "agreement", "payment", "success"].indexOf(step) > index ? <Check className="w-3.5 h-3.5" /> : index + 1}
            </div>
            {index < 3 && <div className="w-8 h-px bg-white/[0.08]" />}
          </div>
        ))}
      </div>}

      <div className="flex items-center gap-3 p-3 rounded-xl surface mb-6">
        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-zinc-800">
          {beat.coverArt && <img src={beat.coverArt} alt="" className="w-full h-full object-cover" />}
        </div>
        <div>
          <h2 className="text-[14px] font-semibold">{beat.title}</h2>
          <p className="text-[12px] text-zinc-500">{beat.producer.displayName}</p>
        </div>
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-red-500/10 text-red-300 text-sm">{error}</div>}

      {step === "license" && (
        <div>
          <h3 className="text-base font-semibold mb-3">Choose a licence</h3>
          <div className="space-y-2">
            {beat.licensePlans.map((plan: any) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`w-full p-4 rounded-xl text-left border transition-all ${
                  selectedPlan?.id === plan.id ? "bg-amber-400/[0.08] border-amber-400/40" : "surface hover:bg-white/[0.06]"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[13px] font-semibold">{plan.type} licence</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-zinc-500">
                      {plan.includesMp3 && <span>MP3</span>}
                      {plan.includesWav && <span>WAV</span>}
                      {plan.includesStems && <span>Stems</span>}
                      <span>{plan.termMonths ? `${plan.termMonths / 12} years` : "Perpetual"}</span>
                      <span>{plan.territory}</span>
                    </div>
                  </div>
                  <span className="text-[15px] font-bold">{formatPrice(plan.price)}</span>
                </div>
                {plan.isExclusive && (
                  <p className="mt-2 text-[11px] text-amber-400 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> No new licences after purchase; prior licences survive
                  </p>
                )}
              </button>
            ))}
          </div>
          <button onClick={() => selectedPlan && setStep("agreement")} disabled={!selectedPlan} className="soundfuel-button w-full mt-5 disabled:opacity-40">
            {paymentsEnabled ? "Review agreement" : "Review licence details"}
          </button>
        </div>
      )}

      {step === "agreement" && (
        <div>
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2"><FileText className="w-4 h-4 text-amber-400" /> Rights summary</h3>
          <div className="p-4 surface rounded-xl text-[13px] text-zinc-400 leading-relaxed space-y-2">
            <p><strong className="text-white">Files:</strong> {[selectedPlan.includesMp3 && "MP3", selectedPlan.includesWav && "WAV", selectedPlan.includesStems && "Stems"].filter(Boolean).join(", ")}</p>
            <p><strong className="text-white">Territory:</strong> {selectedPlan.territory}</p>
            <p><strong className="text-white">Term:</strong> {selectedPlan.termMonths ? `${selectedPlan.termMonths / 12} years` : "Perpetual"}</p>
            <p><strong className="text-white">Master recordings:</strong> {selectedPlan.masterRecordingLimit}</p>
            <p><strong className="text-white">YouTube monetization:</strong> {selectedPlan.youtubeMonetization ? "Allowed" : "Not allowed"}</p>
            <p><strong className="text-white">Content ID:</strong> {selectedPlan.contentIdAllowed ? "Allowed" : "Not allowed"}</p>
            <p><strong className="text-white">Producer publishing share:</strong> {selectedPlan.producerPublishingPct}%</p>
          </div>
          {paymentsEnabled && <label className="flex items-start gap-3 mt-4 cursor-pointer">
            <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} className="w-4 h-4 mt-0.5 accent-amber-400" />
            <span className="text-[13px] text-zinc-400">I have reviewed and accept this licence. My acceptance, IP address, agreement version and transaction record will be retained.</span>
          </label>}
          <button onClick={() => paymentsEnabled && agreed && setStep("payment")} disabled={!paymentsEnabled || !agreed} className="soundfuel-button w-full mt-5 disabled:opacity-40">
            {paymentsEnabled ? "Accept and continue" : "Payments coming soon"}
          </button>
          {!paymentsEnabled && <button onClick={() => setStep("license")} className="mt-4 w-full text-sm text-zinc-400 hover:text-white">Back to licences</button>}
        </div>
      )}

      {step === "payment" && (
        <div>
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2"><CreditCard className="w-4 h-4 text-amber-400" /> Secure payment</h3>
          <div className="p-4 surface rounded-xl mb-4">
            <div className="flex justify-between text-[13px]"><span className="text-zinc-500">{selectedPlan.type} licence</span><span className="font-bold">{formatPrice(selectedPlan.price)}</span></div>
          </div>
          <p className="text-xs text-zinc-500 mb-4">UPI, cards and net banking are handled securely by Razorpay. Soundfuel never stores your payment credentials.</p>
          <button onClick={beginPayment} disabled={loading} className="soundfuel-button w-full disabled:opacity-50">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Opening payment…</> : <>Pay {formatPrice(selectedPlan.price)}</>}
          </button>
        </div>
      )}

      {step === "success" && (
        <div className="text-center py-8">
          <div className="w-14 h-14 rounded-full bg-amber-400 flex items-center justify-center mx-auto mb-4"><Check className="w-7 h-7 text-black" /></div>
          <h3 className="text-xl font-bold tracking-tight mb-1">Purchase complete</h3>
          <p className="text-zinc-500 text-[13px] mb-6">Your files and agreement are ready.</p>
          <Link href="/library" className="soundfuel-button"><Download className="w-4 h-4" /> Open library</Link>
        </div>
      )}
    </div>
  );
}
