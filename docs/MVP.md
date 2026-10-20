# Final MVP: Soundfuel catalog preview

## Positioning and boundaries

Premium discovery for original Indian beats and sounds: regional instruments, contemporary production and credible creators. Begin with a curated founding cohort rather than open, unlimited uploads. The MVP validates catalog supply, listening and saving intent; it cannot validate paid conversion or profitability while commerce is disabled.

No fees are collected. Indicative prices start at ₹499. Existing commission configuration is dormant; it is not a promise about the eventual commercial model. Direct-versus-marketplace attribution, paid plans, sponsored inventory and Cashfree are not implemented in this release. Decide commercial terms and disclose them before a later payments launch.

## MVP structure

| Area | Included now |
| --- | --- |
| Discovery | Home/editor's picks, separate beat and original-pack views, search, genre filtering, recommended/newest/price sorting and pagination |
| Listening | MP3 previews, persistent player, public listing details and producer storefronts |
| Artist | Google account, profile, saved sounds and producer follows |
| Producer | Portfolio application, approval once, profile, 100-listing limit, private file upload, metadata edits and feedback |
| Trust | Rights warranty timestamp, sample/AI declarations, private clearance notes, restriction and appeal via support |
| Operations | Admin approval/suspension, editorial/rights review, internal readiness score and audit records |
| Payments | Disabled checkout/order creation, verification, webhooks and payout configuration; no Razorpay script in preview pages |
| Policies | Contact, terms, privacy, copyright, delivery and refund pages; preview status disclosed |

Not in MVP: messaging, paid ads, shadowbanning, subscriptions, affiliate/referral payouts, automated rights clearance, AI/stolen-beat detection, music distribution, collaboration projects, custom domains, recommendations based on user tracking, and commercial sound-pack licensing.

## Producer and publication workflow

1. Google sign-in → onboarding with legal name, portfolio URL and terms acceptance. An existing artist can apply at `/apply`.
2. Admin examines portfolio and credibility; sets `APPLIED`, `APPROVED` or `SUSPENDED`. Only approved producers upload. Suspension immediately excludes that producer's listings from public catalog/preview queries.
3. Producer uploads an MP3 preview plus MP3 beat master or original-recordings ZIP. Optional WAV/stems unlock indicative beat tiers. Region, instruments, description, tags and rights declarations describe the product. Files are private, owner-prefixed and validated for declared size/type/encryption. Uploads are not antivirus scanned or acoustically analyzed.
4. Original, declared non-generated work publishes to the producer's storefront after validation. Third-party sampled beats remain private for rights review. Sound packs cannot redistribute third-party samples, even if a song-use licence exists. AI assistance is disclosed; substantially AI-generated work is rejected by declaration, not detected automatically.
5. Marketplace discovery is a separate editorial choice. A reviewer can select `MARKETPLACE` or `FEATURED` only after recording a reason, resolving rights status and meeting at least 60/100 completeness. Declared ownership is not legal clearance or an authenticity guarantee.
6. Producer sees storefront/discovery status, specific improvement suggestions and review feedback—not a hidden numerical score. Support handles appeals. Edits reset editorial selection without lifting rights restrictions. File replacement, pricing and declaration corrections require support in this MVP.

Editorial listening is an MVP operating process, not an every-upload permanent queue. Review candidate marketplace inventory and reported/sampled material. Monitor review time and discovery coverage before expanding beyond the founding cohort. Restricted content cannot pay to regain visibility; paid promotion does not exist in this release.

## Internal readiness score

| Check | Points |
| --- | ---: |
| Listening preview | 25 |
| WAV beat master or pack ZIP | 25 |
| Artwork | 10 |
| Description at least 80 characters | 10 |
| At least three tags | 10 |
| Region and instruments | 10 |
| Beat BPM/key or pack sample count | 10 |

Version: `readiness-v1`. This score measures listing completeness only. It cannot determine sound quality, sample clearance, theft or AI generation. Editors make the artistic decision. Recommended ordering uses editorial tier, readiness, recency and stable ID—not paid boosts or play counts. Storefront-only inventory is accessible by direct listing/storefront URL but not marketplace search.

## Technical structure

- Next.js App Router + React + Tailwind; dark neutral surfaces, amber accents, restrained cards and mobile-first controls.
- PostgreSQL/Prisma: `User` producer status, `Beat` catalog kind/rights/discovery/readiness, `BeatAsset`, indicative `LicensePlan`, saves/follows and audit records. Existing commerce models remain dormant.
- Server-only auth, environment, AWS, email and payment modules. Public catalog queries use explicit field allowlists; scores, clearance notes, emails, payout IDs and master object keys do not go to catalog clients.
- Private S3 files and expiring preview URLs; conditional signed PUTs prevent overwriting existing objects. Profile/cover CDN is a separate public prefix.
- Payment activation requires both `PAYMENTS_ENABLED` and `COMMERCE_LAUNCH_APPROVED`; both default false. Payment POST endpoints return `503 / PAYMENTS_DISABLED` before mutations. Existing paid entitlements retain access; no new pack download entitlement is exposed.

Key routes: `/`, `/search`, `/sounds/[soundId]`, `/[username]`, `/apply`, `/onboarding`, `/library`, `/dashboard`, `/dashboard/upload`, `/dashboard/settings`, `/admin`. Relevant APIs: `/api/beats`, `/api/beats/[beatId]` (owner metadata), `/api/beats/[beatId]/preview`, `/api/assets/upload-url`, `/api/producer-application`, `/api/admin/users/[userId]/producer-status`, `/api/admin/beats/[beatId]`, `/api/health`, `/api/ready`.

## Migration and launch checklist

- Back up data and apply both committed migrations in order using `prisma migrate deploy`; never `db push` a production database. If an existing database predates migration tracking, baseline it deliberately before deployment—do not reset it.
- Existing producers become `APPLIED`; existing listings become `REVIEW_REQUIRED`/storefront-only. This is a deliberate visibility change, not data deletion. Admin must approve and review valid existing inventory; migrate missing region/instrument metadata through the producer editor.
- Bootstrap admin with a real Google email. Test new artist onboarding and producer application with separate accounts.
- Check that pending/suspended creators cannot upload and their restricted catalog is not public.
- Upload a beat and a pack using configured S3 CORS, verify preview playback and ensure no master/ZIP is reachable publicly. Test wrong types, oversized uploads and reused PUT URLs. Listen to real previews; check pack manifests and permissions operationally.
- Confirm original listings appear on the storefront only; admin selection makes them appear in search/home. Confirm sampled work stays private, metadata edits reset discovery and suspended producers disappear from discovery.
- Confirm numeric scores, evidence and private asset keys are absent from public HTML/API responses. Test saved sounds, follows, filters, pagination and mobile player.
- Confirm checkout POST, payment verification, webhook POST and payout configuration all return 503 while disabled; adding keys alone must not change this. Verify no Razorpay network/script requests occur when browsing preview pages.
- Verify HTTPS callback, support inbox, policies, S3 restrictions, host secrets, managed rate limits, backups and logs. No real service connections are provisioned by the code changes.
- Review rights handling and policies with counsel. This catalog does not provide automatic legal certification.

## Before enabling revenue

Separate release gates: counsel-approved beat and pack contracts, producer commercial acceptance, tax/invoice and refund design, payment-provider onboarding, verified capture/amount/currency checks, entitlement tests, exclusive-sale races, webhook retries, refunds/reversals, provider transfer reconciliation and actual bank-settlement reporting. Reassess the revenue model using observed demand; no promised take rate or advertised paid plan should launch before those checks.
