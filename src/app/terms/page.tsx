import PolicyPage from "@/components/legal/PolicyPage";

export default function TermsPage() {
  const support = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  return <PolicyPage title="Terms of Service" updated="20 October 2026">
    <section><h2>Catalog preview</h2><p>Soundfuel currently supports browsing, listening, saved sounds and creator applications. Checkout, paid subscriptions, advertising, payouts and new production-file downloads are disabled. Displayed prices are indicative; no purchase or licence acceptance takes place during preview.</p></section>
    <section><h2>Marketplace role</h2><p>Soundfuel provides a marketplace where producers publish beats and artists purchase licences. Producers, not Soundfuel, own or control the music they list. Each purchase is governed by the licence displayed and accepted at checkout.</p></section>
    <section><h2>Accounts</h2><p>You must provide accurate information, keep access to your Google account secure, and use the service only if you can enter a binding agreement. Producers must provide a legal name before selling.</p></section>
    <section><h2>Producer promises</h2><p>By publishing a beat, a producer confirms they control all required composition, master, performer and sample rights; that disclosed samples are properly licensed or cleared; and that the listing does not infringe another person&apos;s rights.</p></section>
    <section><h2>Sound packs and AI</h2><p>Sound packs must contain original recordings the producer is authorized to redistribute, including performer and collaborator permissions. A licence permitting a sample in a finished song does not necessarily permit resale of that sample in a pack. Substantially AI-generated audio and impersonation are not eligible. AI-assisted tools must be declared accurately.</p></section>
    <section><h2>Discovery and reviews</h2><p>Producer access, storefront publication and marketplace selection are separate decisions. Discovery considers completeness, accurate metadata, regional relevance, editorial selection and account standing. Internal readiness scores measure completeness and do not certify musical quality or copyright clearance. Rights declarations and editorial selection do not guarantee ownership. Producers receive discovery status and feedback in their dashboard and may contact support to request reconsideration.</p></section>
    <section><h2>Purchases and licences</h2><p>Prices are shown in INR unless stated otherwise. Payment must be captured before downloads are enabled. Non-exclusive licences may remain available to others. An exclusive purchase does not cancel licences issued earlier.</p></section>
    <section><h2>Acceptable use</h2><p>Do not upload unlawful or infringing content, manipulate plays or payments, bypass download controls, scrape the service, or interfere with marketplace security.</p></section>
    <section><h2>Enforcement</h2><p>We may unpublish content, suspend access, preserve evidence and cooperate with payment providers or lawful authorities when necessary to protect users and the service.</p></section>
    <section><h2>Contact</h2><p>Questions may be sent to {support}.</p></section>
  </PolicyPage>;
}
