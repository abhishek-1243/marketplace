"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Check, FileText, CreditCard, Download, Shield, Music } from "lucide-react";

type Step = "license" | "agreement" | "payment" | "success";

export default function CheckoutClient({ beat }: { beat: any }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<Step>("license");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [agreed, setAgreed] = useState(false);

  if (!session) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-bold tracking-tight mb-4">Sign in to license this beat</h1>
        <Link href="/login" className="px-6 py-3 bg-white text-black rounded-full text-sm font-semibold hover:scale-[1.02] hover:bg-zinc-100 inline-block">
          Log in
        </Link>
      </div>
    );
  }

  const handlePayment = async () => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          beatId: beat.id,
          licensePlanId: selectedPlan.id,
        }),
      });
      if (res.ok) {
        setStep("success");
      }
    } catch {}
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        {(["license", "agreement", "payment", "success"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold ${
              step === s ? "bg-white text-black" :
              (["license", "agreement", "payment", "success"].indexOf(step) > i)
                ? "bg-white text-black" : "bg-white/[0.07] text-zinc-500"
            }`}>
              {["license", "agreement", "payment", "success"].indexOf(step) > i ? (
                <Check className="w-3.5 h-3.5" />
              ) : i + 1}
            </div>
            {i < 3 && <div className="w-8 h-px bg-white/[0.08]" />}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 mb-6">
        <div className="w-14 h-14 rounded-md overflow-hidden shrink-0 bg-zinc-800">
          {beat.coverArt && <img src={beat.coverArt} alt="" className="w-full h-full object-cover" />}
        </div>
        <div>
          <h2 className="text-[14px] font-semibold">{beat.title}</h2>
          <p className="text-[12px] text-zinc-500">{beat.producer.displayName}</p>
        </div>
      </div>

      {step === "license" && (
        <div>
          <h3 className="text-base font-semibold mb-3">Select License</h3>
          <div className="space-y-2">
            {beat.licensePlans.map((plan: any) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan)}
                className={`w-full p-4 rounded-lg text-left transition-all ${
                  selectedPlan?.id === plan.id
                    ? "bg-white/[0.1] ring-1 ring-white/20"
                    : "bg-white/[0.04] hover:bg-white/[0.07]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[13px] font-medium">{plan.type} License</p>
                    <div className="flex items-center gap-2.5 mt-1 text-[11px] text-zinc-500">
                      {plan.includesMp3 && <span>MP3</span>}
                      {plan.includesWav && <span>WAV</span>}
                      {plan.includesStems && <span>Stems</span>}
                      <span>Streaming: {plan.streamingLimit === "UNLIMITED" ? "Unlimited" : plan.streamingLimit}</span>
                    </div>
                  </div>
                  <span className="text-[15px] font-bold">{formatPrice(plan.price)}</span>
                </div>
                {plan.isExclusive && (
                  <p className="mt-2 text-[11px] text-yellow-500 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Exclusive rights
                  </p>
                )}
              </button>
            ))}
          </div>
          <button
            onClick={() => selectedPlan && setStep("agreement")}
            disabled={!selectedPlan}
            className="w-full mt-5 py-3 bg-white text-black rounded-full text-sm font-semibold hover:scale-[1.01] hover:bg-zinc-100 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:hover:scale-100"
          >
            Continue
          </button>
        </div>
      )}

      {step === "agreement" && (
        <div>
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-zinc-500" /> License Agreement
          </h3>
          <div className="p-4 bg-zinc-900 rounded-lg max-h-64 overflow-y-auto text-[13px] text-zinc-400 leading-relaxed">
            <p className="font-semibold mb-2">{selectedPlan?.type} License Agreement</p>
            <p className="mb-2">This {selectedPlan?.type} License Agreement (&quot;Agreement&quot;) is entered into between the Licensor (&quot;{beat.producer.displayName}&quot;) and the Licensee (&quot;{session.user?.name}&quot;).</p>
            <p className="mb-2"><strong>Beat:</strong> {beat.title}</p>
            <p className="mb-2"><strong>License Type:</strong> {selectedPlan?.type} — {selectedPlan?.isExclusive ? "Exclusive" : "Non-exclusive"}</p>
            <p className="mb-2"><strong>Price:</strong> {formatPrice(selectedPlan?.price || 0)}</p>
            <p className="mb-2"><strong>Included Files:</strong> {[selectedPlan?.includesMp3 && "MP3", selectedPlan?.includesWav && "WAV", selectedPlan?.includesStems && "Stems"].filter(Boolean).join(", ")}</p>
            <p className="mb-2"><strong>Streaming Limit:</strong> {selectedPlan?.streamingLimit === "UNLIMITED" ? "Unlimited" : selectedPlan?.streamingLimit}</p>
            <p className="mb-2"><strong>Music Video:</strong> {selectedPlan?.videoLimit === "UNLIMITED" ? "Unlimited" : selectedPlan?.videoLimit}</p>
            <p className="mt-4 text-[11px] text-zinc-600">This is a demo agreement template. In production, this would be a legally binding document.</p>
          </div>
          <label className="flex items-center gap-3 mt-4 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="w-4 h-4 rounded accent-white"
            />
            <span className="text-[13px] text-zinc-400">
              I have read and accept the license agreement
            </span>
          </label>
          <button
            onClick={() => agreed && setStep("payment")}
            disabled={!agreed}
            className="w-full mt-5 py-3 bg-white text-black rounded-full text-sm font-semibold hover:scale-[1.01] hover:bg-zinc-100 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:hover:scale-100"
          >
            Accept & Continue
          </button>
        </div>
      )}

      {step === "payment" && (
        <div>
          <h3 className="text-base font-semibold mb-3 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-zinc-500" /> Payment
          </h3>
          <div className="p-4 bg-zinc-900 rounded-lg mb-4">
            <div className="flex justify-between text-[13px] mb-2">
              <span className="text-zinc-500">{selectedPlan?.type} License</span>
              <span>{formatPrice(selectedPlan?.price || 0)}</span>
            </div>
            <div className="flex justify-between text-[13px] border-t border-white/[0.06] pt-2 mt-2">
              <span className="font-medium">Total</span>
              <span className="font-bold">{formatPrice(selectedPlan?.price || 0)}</span>
            </div>
          </div>
          <div className="space-y-1.5 mb-4">
            <p className="text-[13px] font-medium text-zinc-400 mb-2">Payment Method</p>
            {["UPI", "Card", "Net Banking"].map((method) => (
              <div key={method} className="p-3 bg-white/[0.04] hover:bg-white/[0.07] rounded-lg text-[13px] flex items-center gap-3 cursor-pointer">
                <div className="w-4 h-4 rounded-full border-2 border-white/30" />
                {method}
              </div>
            ))}
          </div>
          <p className="text-[11px] text-zinc-600 mb-4">
            Demo mode: simulates a successful payment.
          </p>
          <button
            onClick={handlePayment}
            className="w-full py-3 bg-white text-black rounded-full text-sm font-semibold hover:scale-[1.01] hover:bg-zinc-100"
          >
            Pay {formatPrice(selectedPlan?.price || 0)}
          </button>
        </div>
      )}

      {step === "success" && (
        <div className="text-center py-8">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center mx-auto mb-4">
            <Check className="w-7 h-7 text-black" />
          </div>
          <h3 className="text-xl font-bold tracking-tight mb-1">Purchase complete</h3>
          <p className="text-zinc-500 text-[13px] mb-6">Your license is now active</p>
          <div className="p-4 bg-zinc-900 rounded-lg text-left space-y-2 mb-6">
            <div className="flex items-center gap-2 text-[13px] text-zinc-300">
              <Check className="w-4 h-4 text-white" /> License active
            </div>
            <div className="flex items-center gap-2 text-[13px] text-zinc-300">
              <Check className="w-4 h-4 text-white" /> Payment complete
            </div>
            <div className="flex items-center gap-2 text-[13px] text-zinc-300">
              <Check className="w-4 h-4 text-white" /> Files available
            </div>
            <div className="flex items-center gap-2 text-[13px] text-zinc-300">
              <Check className="w-4 h-4 text-white" /> Agreement stored
            </div>
          </div>
          <div className="flex gap-2 justify-center">
            <Link href="/library" className="px-6 py-2.5 bg-white text-black rounded-full text-[13px] font-semibold hover:scale-[1.02] hover:bg-zinc-100 flex items-center gap-2">
              <Download className="w-4 h-4" /> Go to Library
            </Link>
            <Link href="/" className="px-6 py-2.5 bg-white/[0.07] hover:bg-white/[0.12] rounded-full text-[13px] font-medium text-zinc-300 hover:text-white">
              Browse More
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
