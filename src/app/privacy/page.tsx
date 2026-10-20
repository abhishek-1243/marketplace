import PolicyPage from "@/components/legal/PolicyPage";

export default function PrivacyPage() {
  const support = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  return <PolicyPage title="Privacy Policy" updated="20 October 2026">
    <section><h2>Information we process</h2><p>We process Google account identity, profile and storefront information, producer portfolio applications, uploaded media and metadata, rights declarations and evidence, internal completeness scores, editorial decisions, saved sounds, follows and support communications. Technical records may include IP address and user agent. Historical purchases, licence acceptances and download records may be retained.</p></section>
    <section><h2>Why we process it</h2><p>We use this information to provide accounts, fulfil licences, process and reconcile payments, secure downloads, prevent abuse, support users, comply with law, and improve marketplace reliability.</p></section>
    <section><h2>Service providers</h2><p>Data may be handled by Google for sign-in, AWS for storage and configured email, and hosting or database providers acting on our instructions. Payment processing and Razorpay checkout are disabled during catalog preview. Payment card details are not stored by Soundfuel.</p></section>
    <section><h2>Visibility and review</h2><p>Published profile and listing information is public. Application notes, source evidence and numeric completeness scores are restricted to operational review. Discovery selection considers listing completeness and editorial review; it is not an automated certification of authorship or quality. Contact support to request correction or reconsideration.</p></section>
    <section><h2>Retention and rights</h2><p>We retain transaction, licence and audit records as needed to perform contracts and meet legal obligations. You may request access, correction or deletion where applicable by contacting {support}.</p></section>
    <section><h2>Security</h2><p>We use access controls, signed storage links, encrypted transport, provider webhooks and audit records. No online system can guarantee absolute security.</p></section>
  </PolicyPage>;
}
