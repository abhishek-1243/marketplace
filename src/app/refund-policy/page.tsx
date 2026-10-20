import PolicyPage from "@/components/legal/PolicyPage";

export default function RefundPolicyPage() {
  return <PolicyPage title="Refund Policy" updated="20 October 2026">
    <section><h2>Preview release</h2><p>No new payments are collected in the current release. Checkout, subscriptions and paid promotions are disabled. The purchase provisions below apply when commerce becomes available and to any existing order.</p></section>
    <section><h2>Digital licences</h2><p>Beat licences and files are delivered digitally after payment. Because access is provided immediately, completed purchases are generally final except where required by law.</p></section>
    <section><h2>Eligible cases</h2><p>We will review duplicate charges, payment captured without delivery, a materially incorrect file, or a listing removed for verified infringement. A change of mind after download is not normally eligible.</p></section>
    <section><h2>How to request review</h2><p>Contact {process.env.NEXT_PUBLIC_SUPPORT_EMAIL} with the order ID and relevant evidence. Approved refunds are returned through the original payment method and may take the provider&apos;s normal processing time.</p></section>
  </PolicyPage>;
}
