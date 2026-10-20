import Link from "next/link";
import PolicyPage from "@/components/legal/PolicyPage";

export default function DeliveryPolicyPage() {
  return <PolicyPage title="Digital Delivery Policy" updated="20 October 2026">
    <section><h2>Digital products</h2><p>Soundfuel offers digital beat licences and audio files. No physical goods are shipped and no shipping charges apply. The files and rights included are shown in each licence option before purchase.</p></section>
    <section><h2>Access after payment</h2><p>When purchases are available, files and the licence agreement are made available in your Soundfuel library after payment has been confirmed. A confirmation email links to your library. An email delivery delay does not prevent you from accessing an eligible purchase through your account.</p></section>
    <section><h2>Delivery issues</h2><p>If a confirmed purchase is missing or a file cannot be downloaded, <Link href="/contact">contact support</Link> with your order reference. See our <Link href="/refund-policy">refund policy</Link> for cases involving payment without delivery.</p></section>
  </PolicyPage>;
}
