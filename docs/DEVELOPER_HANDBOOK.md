# Soundfuel Developer Handbook

Soundfuel is a curated discovery platform for Indian beats and original sound packs. The current release lets artists listen, save sounds and follow creators, while approved producers publish to storefronts and editors select marketplace inventory. It is a **catalog preview**: purchases, paid advertising, subscriptions and payouts are not open.

This handbook explains how to run, trace, change and deploy the application. Start with the architecture and publication rules before changing a route: a listing being published does not automatically mean it belongs in marketplace search. Preserve the payment gates and private media boundaries throughout development.

Repository: <https://github.com/abhishek-1243/marketplace>  
Companion documents: [setup and deployment](../README.md), [MVP scope and acceptance checklist](MVP.md).  
Updated: 2 November 2026.

## Contents

1. [Product scope](#1-product-scope)
2. [Architecture and request flow](#2-architecture-and-request-flow)
3. [Repository structure](#3-repository-structure)
4. [Pages and user interfaces](#4-pages-and-user-interfaces)
5. [Shared components and client state](#5-shared-components-and-client-state)
6. [Backend modules](#6-backend-modules)
7. [Data model](#7-data-model)
8. [Identity and producer onboarding](#8-identity-and-producer-onboarding)
9. [Uploading and publishing](#9-uploading-and-publishing)
10. [Discovery and readiness scoring](#10-discovery-and-readiness-scoring)
11. [Editing and administration](#11-editing-and-administration)
12. [API reference](#12-api-reference)
13. [Environment configuration](#13-environment-configuration)
14. [Local setup](#14-local-setup)
15. [Database migrations and administration](#15-database-migrations-and-administration)
16. [Railway deployment](#16-railway-deployment)
17. [Development and verification](#17-development-and-verification)
18. [Disabled commerce architecture](#18-disabled-commerce-architecture)
19. [Security and operating boundaries](#19-security-and-operating-boundaries)
20. [Troubleshooting](#20-troubleshooting)
21. [Where to make common changes](#21-where-to-make-common-changes)
22. [Developer handover checklist](#22-developer-handover-checklist)

## 1 Product scope

### Working preview features

- Public home page, curated search, beat and sound-pack filters, regional and instrument text search, genre filtering, sorting and pagination.
- Listing detail pages, approved producer storefronts and a persistent in-app preview player.
- Google sign-in, profile onboarding, saved sounds and producer follows.
- Producer applications, admin approval or suspension, private audio uploads, metadata editing and editorial feedback.
- Sample and AI declarations, private rights evidence, manual rights review and internal completeness scoring.
- Contact and policy pages, database migrations, CI, Docker packaging and health probes.

### Deliberately outside this release

Messaging, subscription billing, paid promotion, referral payouts, direct-versus-marketplace sales attribution, distribution, custom domains, automatic copyright clearance and acoustic AI or stolen-beat detection are not implemented. Cashfree is not integrated.

Razorpay and order-related modules remain in the repository, but that does not make commerce ready for activation. Existing paid entitlements remain readable; the preview creates no new paid entitlements. Prices are indicative whole-INR amounts, not charges or accepted licences.

## 2 Architecture and request flow

The application is a single Next.js project, not a separate frontend and backend deployment. Next.js serves React pages and API route handlers from the same service. PostgreSQL holds structured data; S3 holds media objects. There is no NestJS service, Redis instance, background worker or message queue in the repository.

| Layer | Technology and purpose |
| --- | --- |
| Runtime | Node.js 22 for development, CI and Docker |
| Web framework | Next.js 15 App Router and React 19 |
| Language | TypeScript with strict checking and the `@/*` alias for `src/*` |
| Styling | Tailwind CSS 3, global CSS and Lucide icons |
| Authentication | NextAuth 4, Google OAuth and JWT sessions |
| Database | PostgreSQL, Prisma 5 schema, generated client and migrations |
| Input validation | Zod schemas in shared modules and route handlers |
| Playback state | Zustand in the browser |
| Media | AWS SDK, private S3 objects and expiring signed links |
| Artwork | S3 `profile/` objects served through configured CloudFront |
| Dormant integrations | Razorpay orders and transfers; SES purchase email |

```text
Browser
  |-- page request --> Next.js server component --> Prisma --> PostgreSQL
  |<-- HTML and deliberately selected catalog fields ---------|
  |
  |-- authenticated mutation --> API handler --> validation and authorization
  |                                               |--> Prisma transaction
  |
  |-- request upload URL --> API --> signed S3 PUT URL
  |-- PUT audio directly to private S3
  |-- submit object keys --> API --> S3 HEAD checks --> database listing
  |
  |-- play preview --> preview API --> short-lived S3 GET redirect
```

Server pages often query Prisma directly. They do not all fetch `/api/beats`. When changing discovery behavior, use the shared catalog query helpers so home, search and APIs remain consistent.

Files without a `"use client"` directive in the App Router are normally server components. Interactive forms, navigation and playback use client components. Database access, AWS credentials and auth configuration must stay on the server. Sensitive integration modules use `import "server-only"` to prevent accidental client imports.

## 3 Repository structure

```text
marketplace/
  .github/workflows/ci.yml       Automated checks against disposable PostgreSQL
  .dockerignore                 Files excluded from Docker build context
  .env.example                  Variable names and safe setup placeholders
  .eslintrc.json                 Next.js lint configuration
  .gitignore                    Secrets, dependencies and generated output exclusions
  Dockerfile                    Multi-stage production image
  README.md                     Quick setup and deployment instructions
  package.json                  Dependencies and developer commands
  package-lock.json             Locked dependency graph and integrity hashes
  next.config.mjs               Standalone output and response headers
  tsconfig.json                 TypeScript compiler settings and source alias
  tailwind.config.ts            Tailwind source scanning and theme extension
  postcss.config.mjs            Tailwind and Autoprefixer integration
  docs/
    MVP.md                      Product boundaries and launch checklist
    DEVELOPER_HANDBOOK.md        This developer guide
  prisma/
    schema.prisma               Models, relationships, enums and indexes
    seed.ts                     Bootstrap an admin using an email address
    migrations/
      migration_lock.toml       Prisma migration provider declaration
      20261007000000_init/      Initial application schema
      20261020000000_curated_catalog/
                                Producer approval, packs, rights and discovery fields
  public/images/                Static public branding assets
  scripts/smoke-preview.mjs      HTTP checks against a built preview server
  src/
    app/                        Pages, layouts, global styles and API handlers
      layout.tsx                Shared application shell and metadata
      globals.css               Design tokens, controls and global styles
      page.tsx                  Home page
      icon.png                  Application icon
      [username]/               Producer storefront and its client components
      admin/                    Catalog operations and approval controls
      api/                      Backend routes grouped by domain
      apply/                    Producer application flow
      checkout/[beatId]/        Guarded legacy checkout flow
      contact/                  Support contact information
      copyright/                Rights complaint instructions
      dashboard/                Producer studio and metadata editor
        settings/               Profile and storefront settings
        upload/                 Approved-producer upload page and server guard
      delivery-policy/          Digital delivery policy
      library/                  Saved sounds and historical licensed library
      login/                    Google sign-in entry
      onboarding/               Role, identity, terms and portfolio setup
      privacy/                  Privacy policy
      refund-policy/            Preview and future purchase refund policy
      register/                 Artist or producer sign-up entry
      search/                   Server filtering and client result cards
      sounds/[soundId]/         Public listing details
      terms/                    Terms and catalog rules
    components/
      beats/                    Listing card and save control
      home/                     Catalog grid and rotating hero headline
      layout/                   Navigation, footer and global audio player
      legal/                    Reusable policy page layout
      providers/                Client session provider
    lib/                        Server integrations, business rules and tests
    store/audio-player.ts       Browser playback and queue state
    types/next-auth.d.ts         Additional session and JWT fields
```

Square brackets denote URL parameters. `[username]` is a root-level catch-all segment for a single username, not a folder to rename for each producer. `[soundId]` and `[beatId]` normally refer to the same `Beat.id`; the table name remains `Beat` even for sound packs. Identifiers are Prisma CUIDs. `slug` is a stored human-readable value, but public detail routes currently use the ID.

`page.tsx` renders a page, `layout.tsx` wraps a route subtree and `route.ts` handles HTTP requests. There is no central Express router or global authorization middleware: relevant pages and handlers perform their own checks. Dynamic route parameters use the asynchronous `params` convention in this codebase.

Generated directories such as `node_modules/` and `.next/`, generated `next-env.d.ts` and local `.env` files are not source documentation or code to copy between computers. Install dependencies and rebuild them on the new machine.

### Root configuration details

- `next.config.mjs` enables standalone deployment, compression and security-related response headers. Image optimization is currently disabled; many components use ordinary `<img>` elements. Configured image domains do not validate every ordinary image URL.
- `globals.css` defines the active graphite-and-rust appearance, locally served Sora typography, shared `soundfuel-*` controls, focus rings and accessibility preferences. Named RGB tokens in `tailwind.config.ts` keep public pages and private tools consistent. The current redesign follows [Anthropic's frontend-design skill](https://github.com/anthropics/skills/tree/main/skills/frontend-design): subject-specific art direction, a single clear visual focal point, deliberate typography, plain labels and restrained surfaces. Instant feedback, keyboard access and reduced-motion/transparency alternatives remain in place. Sora's font and required licence live in `public/fonts/`; there are no external font-provider requests. Older purple `brand` tokens remain unused.
- `components/home/LandingPage.tsx` is the shared split-hero home presentation. The server home supplies real catalog data; development-only `/ui-preview` supplies clearly labelled local samples and tools. Both inherit the same graphite-and-rust tokens. The contained vinyl/percussion hero uses `public/images/soundfuel-editorial-hero.webp`, a marketing image rather than an uploaded audio product. Header navigation and the minimal legal footer are shared across all routes. See `design-qa.md` for visual evidence and verification limits.
- `.dockerignore` excludes local environment files and build output from images. `.gitignore` excludes environment files while retaining `.env.example`.
- Dependency overrides pin compatible AWS and lint packages. Change related packages and the lockfile together, then run verification. Do not copy corporate registry credentials into this repository.

## 4 Pages and user interfaces

All page paths below are relative to `src/app/`.

| URL | Main source | Behavior and access |
| --- | --- | --- |
| `/` | `page.tsx` | Server queries for featured listings, beats and packs; genre links and application CTA |
| `/search` | `search/page.tsx` | Curated server-side search, filters, sorting, totals and 24-item pages |
| `/sounds/[soundId]` | `sounds/[soundId]/page.tsx` | Public listing, producer link, declarations, preview, saves and indicative pricing |
| `/[username]` | `[username]/page.tsx` | Approved producer only; publicly eligible listings, follows and social links |
| `/login` | `login/page.tsx` | Google sign-in; no password login |
| `/register` | `register/page.tsx` | Artist or producer intent passed into onboarding after Google sign-in |
| `/onboarding` | `onboarding/page.tsx` | Role, username, display name, legal name, terms and producer portfolio |
| `/apply` | `apply/page.tsx` | Producer explanation, sign-up entry or existing artist application form |
| `/dashboard` | `dashboard/page.tsx` | Producer access status, up to 100 owned listings, suggestions and review feedback |
| `/dashboard/upload` | `dashboard/upload/page.tsx` | File and listing form; `upload/layout.tsx` checks approved producer access |
| `/dashboard/settings` | `dashboard/settings/page.tsx` | Authenticated user's profile form; page is not limited to the producer role |
| `/library` | `library/page.tsx` | Authenticated user's latest 100 publicly eligible saved sounds and existing paid entitlements |
| `/admin` | `admin/page.tsx` | Admin-only producer and catalog review; queues use 20-item pages |
| `/checkout/[beatId]` | `checkout/[beatId]/page.tsx` | Redirects to listing details while payments are off |
| Policy routes | Their respective `page.tsx` files | Contact, copyright, delivery, privacy, refund and terms copy |

`search/SearchResults.tsx`, `[username]/StorefrontBeats.tsx` and `library/LibraryBeatRow.tsx` handle interactive rendering for their server parents. `StorefrontActions.tsx` handles follows. `dashboard/EditListingForm.tsx` edits allowed metadata. `SettingsForm.tsx` uploads images and saves the current user's profile.

Admin controls are split by responsibility: `ProducerAccessAction.tsx` changes account approval, `AdminBeatAction.tsx` submits rights/publication/discovery decisions, and `PayoutAccountForm.tsx` is only displayed when commerce is enabled. Hiding a control is not the security check; the API must enforce the same restriction.

## 5 Shared components and client state

| File under `src/components/` | Responsibility |
| --- | --- |
| `beats/BeatCard.tsx` | Artwork, play/pause, title, producer link, type or genre and starting price |
| `beats/SaveSoundButton.tsx` | Save toggle, authentication entry and request feedback |
| `home/HomeBeats.tsx` | Responsive card grid and honest empty-catalog state |
| `home/HeroHeadline.tsx` | Rotating homepage headline; not a catalog query |
| `layout/Navbar.tsx` | Navigation, search, role-specific links, session and mobile menu |
| `layout/Footer.tsx` | Support and policy links |
| `layout/AudioPlayer.tsx` | Browser audio element, seek, volume, queue controls and playback errors |
| `legal/PolicyPage.tsx` | Consistent policy typography and layout |
| `providers/SessionProvider.tsx` | Makes the NextAuth client session available through `useSession` |

`app/layout.tsx` wraps navigation, content, footer and player in the session provider. This keeps the audio component mounted across client navigation. `src/store/audio-player.ts` holds the current track, playing flag, duration, progress, volume and queue. It is in-memory state, not database storage or a persisted listening history; a full refresh resets it. `setTrack` selects a single-track queue, while `setQueue` can start a multi-track queue. Components using a card do not automatically create a playlist.

The player requests `/api/beats/[beatId]/preview`, not a master object. It uses `preload="none"`; playback failure pauses the UI and shows feedback. The preview endpoint does not increment `Beat.plays`, because requesting a URL is not a verified listen. Do not treat that legacy field as reliable analytics.

## 6 Backend modules

All paths in this table are under `src/lib/`.

| Module | What a developer should use it for |
| --- | --- |
| `prisma.ts` | Shared Prisma client; development global reuse avoids hot-reload client proliferation |
| `auth.ts` | Google provider, user creation, username allocation and database-backed JWT/session fields |
| `env.ts` | Server environment parsing with Zod; imports the transformed commerce configuration |
| `payment-config.ts` | Pure parsing and effective two-switch payment gate; testable without server imports |
| `catalog.ts` | Public/storefront and marketplace predicates, public field selection, serialization and sorting |
| `catalog-policy.ts` | Limits, genre choices, completeness scoring and publication eligibility rules |
| `upload-schema.ts` | Upload slot MIME and size validation, listing declaration and price validation |
| `listing-metadata.ts` | Strict allowlist for owner-editable metadata |
| `storage.ts` | AWS client, owner-prefixed keys, signed PUT/GET, object metadata verification and image upload |
| `request.ts` | Origin checks and request metadata for audit/download records |
| `usernames.ts` | Reserved route names that must not become storefront usernames |
| `web-url.ts` | HTTP/HTTPS protocol restriction for portfolio and listing artwork URLs |
| `utils.ts` | Class merging, INR formatting, display numbers, slugs and dormant commission calculation |
| `contracts.ts` | Existing beat licence snapshot and plain-text agreement with SHA-256 content hash |
| `razorpay.ts` | Guarded Razorpay REST calls, HMAC verification and transfer reversal |
| `orders.ts` | Transactional fulfilment and exclusive-reservation release for future commerce |
| `email.ts` | SES purchase email; no-op when payments or the sender are absent |

`*.test.ts` files are colocated with these rules. The server-only catalog module deliberately separates database queries and public response shape from pure scoring/validation modules that can be unit-tested without AWS or a running database.

## 7 Data model

`prisma/schema.prisma` is the main model reference. Structured records belong in PostgreSQL; audio and ZIP bytes do not.

| Model | Purpose and important constraints |
| --- | --- |
| `User` | Unique email and username; role, onboarding, producer approval, public profile and private legal/application data |
| `Beat` | Both beats and packs via `kind`; owner, metadata, status, rights, editorial tier, internal readiness and dormant exclusive-sale state |
| `BeatAsset` | S3 key, type, declared MIME, verified size and optional checksum; unique `(beatId, type)` |
| `LicensePlan` | Indicative price and stored beat rights/file flags; unique `(beatId, type)` |
| `Favorite` | User-to-listing save; unique `(userId, beatId)` |
| `Follow` | Follower-to-producer relationship; unique `(followerId, followingId)` |
| `Order` | Dormant purchase ledger linking artist, producer, listing and plan; price split and immutable snapshot |
| `Agreement` | One per order; acceptance metadata, content, content hash and template version |
| `Payment` | One per order; provider payment ID is unique, along with capture/refund state |
| `PaymentEvent` | Unique provider event ID and webhook payload; intended deduplication record |
| `Entitlement` | One per order; active access grant and optional revocation time |
| `Download` | User/order asset access log with timestamp and request metadata |
| `Payout` | One per order; producer amount, provider transfer reference and status |
| `AuditLog` | Actor, action, entity and optional before/after metadata |

```text
User --owns--> Beat --has--> BeatAsset
                  |--has--> LicensePlan
User --saves-----> Beat
User --follows--> User

Future commerce
Order --> artist User, producer User, Beat and LicensePlan
  |--> Agreement
  |--> Payment
  |--> Entitlement
  |--> Payout
  |--> Download records
PaymentEvent stores provider event IDs separately
AuditLog records selected administrative and order actions
```

`User.role` and `User.producerStatus` answer different questions. The legacy `User.verified` flag is not a replacement for `producerStatus = APPROVED`. Prices are whole INR integers; Razorpay conversion to paise happens at the provider boundary. A stored `LicensePlan` is not evidence that someone purchased or accepted it.

Some relationships have cascading deletes, while transaction relationships preserve references. There is no account-deletion workflow implementing retention or order preservation. Do not delete users/listings directly in production without reviewing dependent records and retention requirements.

## 8 Identity and producer onboarding

### Google sign-in

1. Login or registration calls the Google provider through NextAuth.
2. `auth.ts` normalizes the email and finds the application `User`.
3. New users get a generated, non-reserved username, default `ARTIST` role and `onboardingComplete = false`. The application manages its own users rather than using Prisma `Account` and `Session` adapter tables.
4. The JWT callback rereads the database user and adds ID, role, username and onboarding status. The session callback exposes those values to pages and client components.
5. The onboarding page collects the remaining information and posts `/api/onboarding`; it refreshes the client session afterward.

There is no local password registration or password-reset system. Never accept an admin role from the onboarding form. The API accepts only `ARTIST` and `PRODUCER`, rejects reserved usernames and prevents completed onboarding from being rerun as a role-change endpoint.

### Producer approval

New producers provide a legal name, portfolio link, terms acceptance and optional application notes. An existing onboarded artist can submit `/api/producer-application`, which changes the role to `PRODUCER` with status `APPLIED`. That upgrade form requires a note of at least 20 characters.

An admin examines the portfolio and changes access through `/api/admin/users/[userId]/producer-status`. The update and audit record run in a transaction. Approval enables uploads, not automatic marketplace placement. No bank/KYC collection is required in the preview.

| Producer state | Effect |
| --- | --- |
| `APPLIED` | Application pending; no upload access and no public producer storefront |
| `APPROVED` | Can upload and edit owned listings; eligible published listings can be public |
| `SUSPENDED` | Upload/edit access blocked; public catalog predicates exclude the producer |

Suspension changes public eligibility without deleting files or resetting all listing states. Reapproving a producer can make previously eligible listings public again; review their catalog before reinstatement. Admin and owner private-preview access is a separate authorization path.

## 9 Uploading and publishing

### Upload sequence

1. `dashboard/upload/layout.tsx` checks producer approval before showing the form. API checks remain mandatory even if the form is protected.
2. The browser asks `POST /api/assets/upload-url` for each file, including `assetType`, `fileName`, `contentType` and `sizeBytes`.
3. The handler checks session role, current database approval, catalog count, storage configuration and slot rules. It generates a random owner-prefixed key and a signed PUT URL valid for ten minutes.
4. The browser uploads directly to S3 with the declared content type, `x-amz-server-side-encryption: AES256` and `if-none-match: *`. Conditional PUT prevents overwriting an existing object through that URL.
5. Optional artwork goes through `POST /api/upload` as multipart form data. The server accepts JPEG, PNG or WebP up to 5 MiB and stores it under `profile/`. This route needs both S3 and the artwork CDN URL.
6. The form submits metadata, declarations, prices and the returned object keys to `POST /api/beats`.
7. The handler checks legal name and approval, validates the complete listing, verifies ownership prefixes and performs S3 HEAD requests for stored MIME, size and encryption.
8. A database transaction rechecks approval, locks the producer row through an update, checks the 100-listing limit and creates the listing, assets and plans together.
9. The response contains the new ID and status fields. The browser returns to the producer dashboard.

The S3 upload and database transaction are not one atomic operation. Failed or abandoned submissions can leave unused objects. Add an operational cleanup policy; the repository has no orphan-reconciliation worker. File limits are enforced on the submitted metadata and again after upload; a signed PUT is not itself a complete bandwidth/storage quota system.

### File rules

| Listing | Required | Optional | Limits |
| --- | --- | --- | --- |
| Beat | `PREVIEW` MP3 and `MP3` master | WAV master and stems ZIP | Preview 20 MiB; each other file 500 MiB |
| Sound pack | `PREVIEW` MP3 and `PACK` ZIP with sample count | Cover artwork | Same audio/ZIP limits |

The code expresses these limits as binary bytes even though the UI labels them MB. Duplicate slots are rejected. A pack cannot include the beat MP3/WAV/stems package; packs must contain original recordings rather than redistributable third-party sample libraries.

New beat submissions create three plan records. Basic is active; Premium requires WAV; Exclusive requires WAV and stems. Pack submissions create a `SOUND_PACK` plan with a single indicative price. Beat prices must be nondecreasing from Basic to Premium to Exclusive; the minimum submitted price is INR 499. Editing pricing is not exposed through the owner metadata endpoint.

### Publication decision

```text
Approved producer submits a valid listing
  |-- NO_SAMPLES declaration --> rights DECLARED --> PUBLISHED and STOREFRONT
  |-- third-party samples ----> REVIEW_REQUIRED ---> DRAFT and private

Admin resolves rights and publication
  |-- suitable storefront work --> PUBLISHED and STOREFRONT
  |-- editor-selected work ------> PUBLISHED and MARKETPLACE or FEATURED
  |-- unresolved/restricted -----> keep private or unpublish
```

`AiDisclosure` is `NONE`, `ASSISTED` or `GENERATED`. Generated submissions are rejected by the schema; assisted production is disclosed publicly. These are producer declarations, not audio-analysis results. Sampled beats require evidence notes of at least 20 characters and a rights review. All submissions require `rightsWarranty = true`, stored as a warranty timestamp. Metadata verification does not prove legal ownership or inspect ZIP/audio content.

### Preview access

`GET /api/beats/[beatId]/preview` permits public eligible listings, the listing owner or an admin. It selects only the `PREVIEW` key and issues a five-minute S3 GET redirect with a no-store response. It never substitutes a master when a preview is missing. Signed links are bearer links until expiry; suspension prevents new public links but does not revoke already-issued links immediately.

## 10 Discovery and readiness scoring

### Visibility rules

The two query predicates in `catalog.ts` are the central read-side policy:

```text
Public storefront or listing eligibility
  status = PUBLISHED
  rightsStatus = DECLARED
  aiDisclosure != GENERATED
  producer role = PRODUCER
  producerStatus = APPROVED

Marketplace eligibility
  all public eligibility rules
  discoveryTier = MARKETPLACE or FEATURED
  reviewedAt is present
  qualityScore >= 60
```

Use the first predicate for direct listing/storefront visibility and the second for marketplace home/search/API discovery. Storefront-only is not a secret restriction: producers see this distinction and feedback in the dashboard. Rights restrictions cannot be bypassed by promotion; no paid-promotion implementation exists.

`catalogSelect` explicitly selects public fields. `serializeCatalogItem` removes the preview asset selection and supplies an application preview route. Never replace it with unrestricted Prisma model spreading in a public response: evidence, legal identity, numeric scores and master keys belong on private paths.

### Internal readiness calculation

`qualityScore` is the database name, but the algorithm is completeness scoring, version `readiness-v1`.

| Check | Points |
| --- | ---: |
| Preview present | 25 |
| WAV master for beat or ZIP for pack | 25 |
| Cover artwork present | 10 |
| Description at least 80 characters | 10 |
| At least three tags | 10 |
| Both region and instruments supplied | 10 |
| Beat BPM and key or pack sample count | 10 |

Total: 100. An admin sees the number; producers see missing-check suggestions. A score of 60 does not automatically approve discovery. Musical quality, clearance and authenticity remain editorial/operational decisions. If the algorithm changes, update its version, tests and a deliberate backfill strategy; stored scores do not recalculate merely because the function changed.

### Search and ordering

`q` searches title, description, genre, region and instruments using case-insensitive database contains filters. It is not vector search or a recommendation model. `kind` is `BEAT` or `SOUND_PACK`; genre is a separate exact filter. Search text is trimmed and capped at 80 characters.

Recommended ordering is editorial tier descending, readiness descending, creation time descending and stable ID descending. `newest` uses creation time and ID; `price_low` uses stored `startingPrice` and ID. Sorting happens in the database before the 24-item page slice. The API returns an array; the search page separately counts matching records for its pagination UI.

## 11 Editing and administration

An approved owner can PATCH only title, description, region, instruments and tags. `listingMetadataSchema` rejects extra keys, including ownership, rights, status, prices, scores and assets. Sold listings cannot be edited.

Every successful metadata edit recalculates readiness, resets discovery to `STOREFRONT` and clears `reviewedAt`. It preserves rights restrictions and publication status. The database update includes the previous `updatedAt`; a concurrent change returns a conflict rather than overwriting another decision. Producers must contact support for file replacement, declaration corrections or pricing changes.

An admin review supplies publication status, rights status, discovery tier and feedback of at least 10 characters. The handler recalculates readiness and checks producer approval, rights, AI eligibility and required files/warranty before publication. It writes the review and an audit record transactionally. Sold listings cannot be republished through this route. Selecting a tier on a draft does not make it public; the read-side predicates still apply.

The admin page can listen to private previews and read evidence notes. It does not contain a comprehensive evidence-file uploader, master-file inspection portal, litigation process or full content editing UI. Some corrections remain controlled maintenance tasks. Audit records cover producer status decisions and catalog reviews; not every profile or owner metadata edit creates an audit entry.

## 12 API reference

Handlers live beneath `src/app/api/`. Bodies are JSON unless stated otherwise. NextAuth manages its own OAuth callbacks and session endpoints.

| Method and route | Access and behavior |
| --- | --- |
| GET/POST `/api/auth/[...nextauth]` | NextAuth provider callbacks, sign-in/out and session handling |
| POST `/api/onboarding` | Signed-in user with incomplete onboarding; identity, role and terms |
| POST `/api/producer-application` | Onboarded artist; applies to become a producer |
| GET `/api/beats` | Public curated discovery; `q`, `kind`, `genre`, `sort`, `page` |
| POST `/api/beats` | Approved producer with legal name; verifies files and creates listing |
| PATCH `/api/beats/[beatId]` | Approved owner; strict metadata update and discovery reset |
| GET `/api/beats/[beatId]/preview` | Public eligibility or private owner/admin permission; signed preview redirect |
| POST `/api/assets/upload-url` | Approved producer; returns private audio/ZIP PUT URL and key |
| POST `/api/upload` | Authenticated user; multipart field `file` for artwork/profile image |
| POST `/api/favorites` | Authenticated user; `{ beatId }` toggles a public eligible listing save |
| POST `/api/follow` | Authenticated user; `{ userId }` toggles following an approved producer; self-follow blocked |
| GET `/api/user/profile` | Authenticated user; own profile and private account fields |
| PATCH `/api/user/profile` | Authenticated user; profile allowlist, not role/approval changes |
| PATCH `/api/admin/users/[userId]/producer-status` | Admin; `{ producerStatus }` and audit record |
| PATCH `/api/admin/beats/[beatId]` | Admin; publication, rights, discovery and feedback |
| PATCH `/api/admin/users/[userId]/payout-account` | Disabled with `503 PAYMENTS_DISABLED`; future admin linked-account configuration |
| POST `/api/checkout` | Disabled with `503 PAYMENTS_DISABLED`; dormant order creation |
| POST `/api/payments/verify` | Disabled with `503 PAYMENTS_DISABLED`; dormant payment signature path |
| POST `/api/webhooks/razorpay` | Disabled with `503 PAYMENTS_DISABLED`; future signed provider events |
| GET `/api/orders/[orderId]/agreement` | Authenticated buyer or producer on that order; plain-text agreement and hash |
| GET `/api/orders/[orderId]/download/[assetType]` | Buyer with PAID order and active entitlement; allowed MP3/WAV/STEMS only |
| GET `/api/health` | Liveness response; no dependency check |
| GET `/api/ready` | Runs database `SELECT 1`; 503 on failure |

Common responses include 400 for validation, 401/403 for access checks, 404 for absent/ineligible resources, 409 for conflicts or limits and 503 for disabled/unconfigured capabilities. Exact handling is per route; there is no global error-normalization layer. Some older handlers parse JSON without catching malformed input, so callers must handle non-success responses robustly.

Mutating application routes use `sameOrigin`. If `Origin` is present, it must match `APP_URL` or the request origin fallback; malformed origins fail. Requests without an Origin header are accepted by that helper, so it is not a substitute for session and ownership checks. Provider webhooks use signatures rather than browser origin checks.

## 13 Environment configuration

Copy variable names from [`.env.example`](../.env.example). Values belong in an ignored local `.env` or Railway Variables. Do not put secrets in source code, screenshots, support messages or `NEXT_PUBLIC_*` keys.

| Variable | Purpose and preview requirement |
| --- | --- |
| `DATABASE_URL` | Required PostgreSQL URL; private service connection in Railway, public URL only when connecting from outside |
| `NEXTAUTH_SECRET` | Required random session secret, at least 32 characters; keep stable across restarts |
| `NEXTAUTH_URL` | Required full deployed URL or localhost URL for auth |
| `APP_URL` | Required application origin; used for origin validation and generated links |
| `GOOGLE_CLIENT_ID` | Required Google web OAuth client |
| `GOOGLE_CLIENT_SECRET` | Required server-side Google OAuth secret |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Required valid working address; intentionally public and embedded during build |
| `AWS_REGION` | Required; typically `ap-south-1` for the configured AWS resources |
| `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` | Optional explicit credentials; if omitted, SDK uses its default credential provider chain, requiring a configured role/environment |
| `AWS_S3_MEDIA_BUCKET` | Needed for media operations; blank means uploads/previews are unavailable |
| `AWS_CLOUDFRONT_URL` | Optional overall, required for the current artwork upload path; public `profile/` behavior only |
| `AWS_SES_FROM_EMAIL` | Not needed for preview; purchase email also requires payments enabled |
| `PAYMENTS_ENABLED` | Keep literal `false` |
| `COMMERCE_LAUNCH_APPROVED` | Keep literal `false`; independent safety gate |
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Leave empty for preview; both payment switches are required before credential checks enable commerce |
| `PLATFORM_COMMISSION_BPS` | Dormant commission setting; default 1000 basis points, or 10 percent |
| `PLATFORM_COMMISSION_CAP_INR` | Dormant cap; default INR 5000 |
| `LEGAL_TEMPLATE_VERSION` | Parsed legacy setting; new plans currently use schema defaults rather than automatically taking this variable |
| `ADMIN_EMAIL` | Optional seed input identifying the Google account to promote |
| `ADMIN_USERNAME`, `ADMIN_DISPLAY_NAME` | Optional seed inputs for a newly created admin |
| `PORT` and `HOSTNAME` | Deployment listener settings; Docker defaults to 3000 and `0.0.0.0` |

`env.ts` validates server settings when imported. A native build can fail before startup if mandatory variables are missing, even with payments disabled. The Docker builder supplies non-production placeholders for server settings and accepts the public support email as a build argument. Runtime Railway Variables must override these with actual service settings. Changing the public support address requires a rebuild.

The schema accepts a nonempty `DATABASE_URL`, but Prisma additionally requires the PostgreSQL protocol. An old `file:...` SQLite URL will not work. Never use `NEXT_PUBLIC_DATABASE_URL` or expose AWS/Google secrets through a client prop.

## 14 Local setup

Use a separate development database and bucket where possible. Install Git, Node.js 22 and PostgreSQL 16, or use an isolated development database on Railway.

```bash
git clone https://github.com/abhishek-1243/marketplace.git
cd marketplace
npm ci
```

For a fresh clone on PowerShell:

```powershell
Copy-Item .env.example .env
```

Populate mandatory variables. Generate a session secret locally:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then run:

```bash
npm run db:generate
npm run db:deploy
npm run dev
```

Open `http://localhost:3000`. Set both application URLs to that origin and register `http://localhost:3000/api/auth/callback/google` in the development Google web client. Google testing accounts/consent configuration must permit the developer account.

Without S3, database-backed browsing and accounts can run, but real upload/playback flows cannot be verified. The seed creates no fake producers or demo beats, so an empty home page is expected until creators are approved and editorial inventory is selected.

Never copy `node_modules`, `.next` or production `.env` files as the deployment method. Clone, configure, install and build. Keep the lockfile so another computer uses the same dependency graph.

## 15 Database migrations and administration

| Command | Intended use |
| --- | --- |
| `npm run db:generate` | Regenerate Prisma client after install or schema edits; does not migrate tables |
| `npm run db:deploy` | Apply committed migrations to a configured database |
| `npm run db:migrate -- --name descriptive_name` | Create/apply a new migration in a development database |
| `npm run db:seed` | Bootstrap/promote one admin when `ADMIN_EMAIL` is provided |
| `npm run db:studio` | Inspect data locally; treat it as privileged database access |
| `npm run setup` | Generate, run development migration and seed; not a production deployment command |

There is no `db:setup` script. Do not use migration reset or `db push` as a shortcut against production.

The initial migration creates the base catalog and dormant transaction records. The curated-catalog migration adds producer status, pack types, rights/discovery fields, metadata, readiness/version fields, indicative starting-price backfill and database checks on score/price ranges.

The second migration preserves rows but deliberately changes their public eligibility: existing producers default to `APPLIED`, existing listings to `REVIEW_REQUIRED` and `STOREFRONT`. An admin must approve producers and resolve/review inventory before it returns publicly. Back up first; do not assume migration success means the old catalog remains visible.

For schema changes, edit `schema.prisma`, generate a new migration on development PostgreSQL, inspect the SQL, regenerate the client, update callers/tests and commit the new migration directory. Do not edit an already-applied migration. Existing untracked schemas need a deliberate Prisma baseline rather than a reset. Production rollback of an additive schema is not the same operation as redeploying an earlier application image.

To bootstrap an admin, supply `ADMIN_EMAIL` in the local environment and run the seed against the intended database, then sign in through Google using that same email. No password is created. A newly inserted admin has completed onboarding; the existing-user update changes role and the legacy verified flag but does not rewrite all onboarding/profile fields. Use an already-onboarded account or inspect that state before handing over access. Remove bootstrap values from routine environments when no longer needed.

## 16 Railway deployment

The intended arrangement is one Next.js service and one PostgreSQL service in the same Railway project, with S3 for media. The repository has a Dockerfile but no committed `railway.json` defining all project settings; the Railway project configuration remains part of the operator handover.

### Build and runtime

The Dockerfile installs OpenSSL on Alpine, installs locked dependencies, generates Prisma and runs the Next.js build. Its final non-root image contains the standalone server, static output and public assets. It starts with `node server.js`, not a separate API server. Do not override it with a migration command or assume the final image contains the full source checkout.

Set `NEXT_PUBLIC_SUPPORT_EMAIL` before building; the Dockerfile declares its `ARG`. Runtime credentials are Railway Variables, not Dockerfile edits. Keep both commerce switches false. The listener defaults to port 3000 on all interfaces; Railway routing must target the actual listener port.

### Release sequence

1. Connect the intended GitHub branch and add PostgreSQL in the same project.
2. Reference PostgreSQL's private `DATABASE_URL` in the application service. Choose the available nearby region for both services together, subject to Railway availability.
3. Set Google credentials, session secret, support address, AWS region and the two false payment flags. Set `NEXTAUTH_URL` and `APP_URL` to the actual HTTPS domain.
4. Add that domain's `/api/auth/callback/google` to the Google web client. When switching to a custom domain, update both application URLs and the callback configuration.
5. Apply migrations before serving the new application. **The final Docker image does not include the Prisma CLI, migration directory and seed toolchain.** Run migration/seed commands from a source checkout on the developer machine or a separately configured source-based release job. A Railway pre-deploy command is not a fix unless its image actually includes those tools.
6. If running commands from another computer, use the database's public connection URL for that local process, not the internal hostname. Keep the application on the private URL. Do not commit either URL.
7. Deploy the existing Dockerfile; normally leave custom build/start commands unset. Use `/api/health` for liveness and `/api/ready` for database readiness.
8. Seed the admin if needed. Verify login, permissions, uploads, review, search and the disabled-commerce smoke paths. Configure backups, monitoring and managed rate limits before inviting creators.

`/api/ready` tests database connectivity only, not schema completeness, Google credentials, S3 permissions, CORS or the CDN. An HTTP 200 there does not prove the entire product works. No actual Railway/AWS/Google resources are provisioned by installing this repository.

## 17 Development and verification

### Standard checks

```bash
npm run db:generate
npx prisma validate
npm run typecheck
npm run lint
npm test
npm run build
npm run test:smoke
```

Provide the required environment before validation/build. `npm run check` combines lint, typecheck, unit tests and build, but does not apply migrations or run the HTTP smoke script. `npm start` serves a completed local production build; it is different from the standalone Docker entrypoint.

| Test file or tool | What it checks |
| --- | --- |
| `catalog-policy.test.ts` | Publication restrictions, completeness scoring, beat/pack declarations and upload metadata limits |
| `mvp-policy.test.ts` | Reserved usernames, executable URL schemes and strict metadata edit fields |
| `payment-config.test.ts` | Default-off commerce, two-switch requirement, key matching and invalid settings |
| `utils.test.ts` | Dormant commission calculation and slug generation |
| `scripts/smoke-preview.mjs` | Built-server health, four disabled payment endpoints, selected public pages, checkout redirect and origin rejection |

The smoke script starts its own server on port 3101 and shuts it down afterward. It needs a completed build and valid environment; keep that port free. It forces both commerce switches off. It does not log into Google, upload to S3, exercise admin reviews or test financial settlement.

CI runs on pull requests and pushes to `main`. It starts disposable PostgreSQL 16, installs dependencies, generates/validates Prisma, applies migrations, typechecks, lints, tests, builds and runs HTTP smoke checks. CI OAuth/AWS values are placeholders, not live integration tests. There is no browser end-to-end suite or measured coverage gate in this repository.

### Safe change workflow

Start from the agreed branch, inspect local changes and applicable repository instructions, and use a feature branch. Trace the relevant server query and mutation, not just the visible form. Keep unrelated work intact, use a pull request for review and include any migration/variable changes in the handover. Never assume a local change is deployed until the commit is pushed, the intended Railway branch builds successfully and the running application is checked.

For a new field, update the Prisma model/migration if persisted, the relevant validation schema, API write allowlist, public DTO if appropriate, UI, tests and handbook. Do not expose every new column automatically. For a new rule, update both write-side validation and read-side eligibility where required.

## 18 Disabled commerce architecture

### Gate semantics

Effective `env.PAYMENTS_ENABLED` is true only when both `PAYMENTS_ENABLED` and `COMMERCE_LAUNCH_APPROVED` are literal `"true"`. Missing flags default false. Keys alone or either single switch cannot enable purchases. When both are true, all four Razorpay values must exist and public/server key IDs must match.

In preview, checkout redirects to listing details. Checkout, verification, provider webhook POSTs and payout-account PATCH return `503` with `PAYMENTS_DISABLED` before doing financial work. The normal preview pages do not load Razorpay's external checkout script. Historical agreement and entitled-download endpoints remain available; the two switches do not revoke existing valid purchases.

### Existing but inactive transaction sequence

1. Checkout validates an active beat plan, artist onboarding, legal names, non-self purchase and a producer linked account.
2. A transaction creates a pending order, stored licence snapshot, agreement/acceptance/hash and payment record. Exclusive checkout reserves the beat for 15 minutes.
3. The Razorpay adapter creates the provider order with INR converted to paise and a producer transfer instruction. Provider creation failure releases/cancels the local reservation.
4. The verification endpoint checks a checkout HMAC; the webhook verifies its raw-body HMAC and provider event ID. Both can invoke `fulfillOrder`.
5. Fulfilment updates payment/order state, creates an entitlement, records the payout and audit entry, and marks an exclusively reserved beat sold. Email is attempted after the transaction without blocking the response.
6. A licensed download checks the buyer, PAID order, active entitlement and file-inclusion flags, logs the access and signs a short-lived URL. `PACK` is explicitly not accepted by this endpoint.

The agreement is currently plain text, not a PDF or external e-signature document. Its hash evidences content integrity, not legal review. Existing non-exclusive licence survival is expressed in the template; it is not a copyright assignment implementation.

### Required work before any activation

The verification endpoint currently fulfils after a valid signature without independently fetching and checking captured payment status, amount and currency. Transfer events are tracked, but `transfer.processed` is mapped to `Payout.PAID`, which is not reliable proof of bank settlement. Refund handling assumes full producer reversal with an available transfer reference; partial refunds, retries and reconciliation need further design. Provider event IDs are unique, but financial side effects and final event recording are not one atomic transaction; concurrency and out-of-order cases still need robust tests.

There is no scheduled reservation-expiry/financial-reconciliation worker. New sound-pack commercial contracts and download entitlements are incomplete. Commission defaults do not implement direct-versus-marketplace attribution. The legal template version environment variable does not automatically update stored plans. Do not enable both switches merely to demonstrate a button: payment capture, exclusive concurrency, refunds, reversals, bank settlement, tax/invoices, producer terms and counsel-approved contracts require a separately verified release.

## 19 Security and operating boundaries

### Boundaries to preserve

- Recheck session, ownership and current database producer approval on mutations. Client roles and hidden buttons are not authorization.
- Keep the public catalog allowlist. Private scores, evidence, legal names, payout identifiers and master keys must not become public props or JSON.
- Use private S3 buckets with public access blocked. Give the application only required prefix-scoped `PutObject`/`GetObject` permissions; HEAD uses object read permission. Prefer short-lived/default-chain credentials where supported, otherwise restrict and rotate explicit keys.
- Configure CORS for the actual website origin, PUT and the content-type, encryption and conditional-write headers. Localhost is a separate development origin.
- If CloudFront is configured, expose `profile/*` through controlled origin access and deny `beats/*`. Audio previews are signed; production files must not become alternate public CDN URLs.
- Treat signed URLs as secrets until expiry. A public listening preview can still be downloaded/captured; it is not DRM.
- Put authentication, uploads, previews and mutations behind host/WAF rate limits. Keep backups and test restoration. Never log provider secrets or raw connection strings.

### Current operating gaps

There is no distributed rate limiter, malware scanner, audio decoder verification, ZIP content inspection, per-user byte quota, orphan cleanup worker, automated infringement detection or generative-audio detector. Size and MIME checks operate on metadata and do not establish the file's true contents. Declarations and editorial review do not certify legal clearance. Contact/copyright pages provide a support process, not a built-in support ticketing or dispute-management system.

Dynamic catalog pages query PostgreSQL per request; there is no explicit Redis catalog cache or specialist search index. Search uses contains filters and offset pagination. Start performance investigations with query plans, database connections, image size, preview delivery and client bundle/network behavior; do not add services before identifying the bottleneck. Ordinary image elements and disabled Next.js image optimization are deliberate current facts, not an optimized-media guarantee.

The Google callback treats the returned email as the account identity and records verification in the application. Review provider email-verification requirements when hardening authentication or adding providers; do not turn an email field in a client payload into an account-linking mechanism.

## 20 Troubleshooting

| Symptom | First checks |
| --- | --- |
| Empty home/search but uploaded listings exist | Producer approved; rights DECLARED; status PUBLISHED; editor-selected tier; review timestamp; score at least 60 |
| Listing is on storefront but absent from search | Expected for STOREFRONT-only; request editorial review rather than weakening the public query |
| Listing disappeared after an edit | Edit reset discovery/review; check storefront and rights/publication state |
| Old catalog disappears after migration | Existing producer and rights defaults need admin review; data was not necessarily deleted |
| Upload access denied | Current database producer role/status, legal name and 100-listing limit; form access alone is insufficient |
| S3 PUT fails | Correct bucket/region/credentials, CORS origin/headers, encryption and conditional header; existing-key reuse should fail |
| Files uploaded but listing save failed | Check object prefixes, HEAD permission, declared MIME/size/encryption, complete metadata and declarations; orphan files may remain |
| Artwork reports 503 | Both bucket and CloudFront URL required for the artwork route |
| Preview reports 404 or 503 | Public/owner/admin permission, PREVIEW asset, bucket configuration and S3 object existence |
| Save or follow fails | Active session, correct CUID and public target eligibility; self-follow is invalid |
| Mutation reports Invalid origin | `APP_URL` must match the browser's full origin, including scheme and port; check custom-domain configuration |
| Google redirect mismatch | Exact deployed callback `/api/auth/callback/google`, URL variables and correct OAuth client |
| Role seems stale | Refresh the session/sign in again and verify the application database User; do not rely only on UI state |
| Admin seed does nothing | `ADMIN_EMAIL` must exist in that command's environment and the target database must be correct |
| Prisma rejects database URL | Use PostgreSQL, not legacy SQLite; external computer needs public URL rather than Railway private DNS |
| Runtime is up but database pages fail | `/api/health` does not test DB; inspect `/api/ready`, migrations and application logs |
| Railway migration command missing | Minimal Docker runner lacks the migration toolchain; run from source/release job |
| Checkout returns 503 or redirects | Expected preview behavior; do not bypass the gate to make the test pass |
| Build fails with environment errors | Native build needs mandatory variables; Docker also needs valid public support-email build input |
| Windows test runner reports spawn EPERM | Local sandbox/process policy may block test workers; use an authorized environment, not production code workarounds |

## 21 Where to make common changes

| Task | Main edit points and checks |
| --- | --- |
| Change homepage sections | `app/page.tsx`, `HomeBeats`, `HeroHeadline`; keep marketplace predicate |
| Change brand styling | `app/globals.css`, layout components, public branding; inspect mobile and keyboard focus |
| Add search filters | `app/search/page.tsx` and GET `api/beats`; preserve matching server filters and sort-before-pagination |
| Change public visibility | `catalog.ts`, publication rules, admin handler and tests; verify saves, storefront and preview paths |
| Change completeness weights | `catalog-policy.ts`, its tests, version and stored-score backfill plan |
| Add an upload format | Prisma enum/migration, upload schema, storage verification, form slots and entitlement policy |
| Add editable metadata | `listing-metadata.ts`, owner PATCH, editor UI, score calculation and public DTO where needed |
| Change producer application | Onboarding/apply pages, both application APIs, User model and admin presentation |
| Change approval behavior | Producer-status handler, public predicates and upload/edit permission checks |
| Add OAuth provider | `auth.ts`, provider account identity/linking design, session types and onboarding tests |
| Enable any paid feature | Separate commerce project with release gates; never just remove 503 responses |
| Change legal copy | Policy pages and `contracts.ts` as applicable; review versioning and acceptance evidence with counsel |
| Add environment variable | `.env.example`, `env.ts` or pure payment schema, Docker build/runtime inputs, CI and docs |
| Change schema | Prisma model, new migration, generated client, callers, tests and deployment sequence |

## 22 Developer handover checklist

### First day

1. Obtain repository access, the intended development branch and approved development service credentials through a secure channel. Obtain Railway/AWS/Google access only at the required permission level.
2. Read README, MVP scope, this guide, Prisma schema, catalog policy, auth and upload handlers in that order.
3. Install and migrate an isolated database, configure OAuth and start the site with payments off.
4. Sign in as an artist; save a selected sound and follow its producer.
5. Use separate producer/admin accounts: apply, approve, upload an original beat and pack, inspect storefront-only publication, then select marketplace inventory.
6. Edit a selected listing and verify its discovery reset. Test sampled work staying private and suspension hiding public inventory.
7. Run static/unit/build/smoke checks and record any environment-specific failures before changing behavior.

### Before handing over a release

- Identify the exact deployed commit/branch, Railway project/service and domain, variable owners and release/migration process. Never include secret values in the handover document.
- Confirm database backups, restore ownership, AWS bucket/CDN prefixes, OAuth callback and support inbox.
- State whether migrations and admin seed have run; note existing-catalog reapproval work.
- Confirm both commerce switches are false and disabled endpoint checks pass.
- Verify real-account and media flows in addition to CI. Include permission, restriction and private-field checks, not only the happy path.
- Update this guide, README and MVP scope when behavior or deployment requirements change. Share the document through GitHub review so it stays aligned with the code.
