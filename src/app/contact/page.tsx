import Link from "next/link";
import PolicyPage from "@/components/legal/PolicyPage";

export default function ContactPage() {
  const support = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  return <PolicyPage title="Contact Soundfuel" updated="20 October 2026">
    <section><h2>Customer support</h2><p>For questions about beats, licences, your account or an order, email <a href={`mailto:${support}`}>{support}</a>.</p><p>For an existing purchase, include your order reference and a description of the issue. Never send passwords, card details or authentication codes.</p></section>
    <section><h2>Refunds and copyright</h2><p>See our <Link href="/refund-policy">refund policy</Link> for purchase issues or our <Link href="/copyright">copyright policy</Link> to report infringement. Send requests to the email address above.</p></section>
  </PolicyPage>;
}
