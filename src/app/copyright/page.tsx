import PolicyPage from "@/components/legal/PolicyPage";

export default function CopyrightPage() {
  return <PolicyPage title="Copyright & Takedowns" updated="7 October 2026">
    <section><h2>Reporting infringement</h2><p>Send a notice to {process.env.NEXT_PUBLIC_SUPPORT_EMAIL} identifying the copyrighted work, the exact Soundfuel listing, your authority to act, your contact details, and a good-faith statement that the disputed use is unauthorized.</p></section>
    <section><h2>Review process</h2><p>We may temporarily unpublish the listing, request further evidence, notify the producer and preserve transaction records. False or misleading notices may create liability.</p></section>
    <section><h2>Counter-notices</h2><p>A producer may respond with proof of ownership, licences or sample clearance. Restoration decisions consider the evidence and applicable law; disputes between parties may require independent legal resolution.</p></section>
  </PolicyPage>;
}
