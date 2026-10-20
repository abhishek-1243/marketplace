# Soundfuel — curated catalog MVP

A simple, dark-and-amber discovery platform for original Indian beats and sound packs. **This release is a catalog preview, not a transactional marketplace. Razorpay, checkout, payment verification, webhooks and payout configuration remain disabled.**

See [the final MVP specification](docs/MVP.md) for scope, moderation rules, routes and launch acceptance checks.

## Included

- Google sign-in, artist onboarding and producer portfolio applications.
- Admin producer approval/suspension; no bank details required for preview.
- Private audio/ZIP uploads, tagged listening previews and original sound packs.
- Producer storefronts, metadata editing, internal completeness scoring and editorial discovery selection.
- Search, beat/pack and genre filters, sorting, pagination, playback, saves and producer follows.
- Rights declarations, private clearance notes, sampled-beat review, restrictions and decision audit records.
- Support/policy pages, health/readiness endpoints, Docker and CI.

Excluded: messaging, paid subscriptions, advertising, referrals, royalties, distribution, automatic copyright/AI detection and new purchase/download flows. Historical paid entitlements are preserved.

## Configure and run

Use Node.js 22 and PostgreSQL 16. Copy `.env.example` to an untracked `.env` locally; populate hosting environment secrets separately. Never put credentials into source files or a `NEXT_PUBLIC_*` variable. A private GitHub repository is not a secret manager.

```powershell
Copy-Item .env.example .env
npm ci
npm run db:generate
npm run db:deploy
npm run dev
```

Required: PostgreSQL URL, random NextAuth secret (32+ characters), Google OAuth credentials, application URLs, AWS region and a real support email. S3 is needed for media; without a bucket the website can run but uploads/previews return an unavailable response. CloudFront is needed only for profile/cover artwork uploads. SES and all Razorpay credentials can remain blank.

Keep both values false in every preview environment:

```dotenv
PAYMENTS_ENABLED=false
COMMERCE_LAUNCH_APPROVED=false
```

Google must allow `https://YOUR_DOMAIN/api/auth/callback/google` (and the localhost equivalent for development). Set `NEXTAUTH_URL` and `APP_URL` to the deployed HTTPS origin. Set a working `NEXT_PUBLIC_SUPPORT_EMAIL` before building; this address is intentionally public.

Set `ADMIN_EMAIL` and run `npm run db:seed` to bootstrap the administrator, then sign in with that Google account. The seed does not create fake catalog inventory.

## AWS media

Prefer an attached IAM role over long-lived access keys. Use least-privilege `s3:PutObject` and `s3:GetObject` on the intended media prefixes (`GetObject` also authorizes `HeadObject`). Enable S3 Block Public Access, default encryption and a lifecycle policy for abandoned uploads. Bucket CORS:

```json
[
  {
    "AllowedOrigins": ["https://YOUR_DOMAIN"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["content-type", "x-amz-server-side-encryption", "if-none-match"],
    "ExposeHeaders": ["etag"],
    "MaxAgeSeconds": 3600
  }
]
```

Use a separate localhost origin only in development. Conditional uploads prevent reuse of a signed PUT to overwrite an existing media object. Preview links expire after five minutes; they are listenable public media, not DRM. Masters/ZIPs are never in public catalog responses.

If using CloudFront, expose `/profile/*` only through an origin access control; **deny `/beats/*`**, which includes private masters. Do not use a public bucket. MIME/size checks validate declared metadata, not file contents or legal ownership; review uploads and add scanning before opening broad public upload access.

## Deploy

1. Back up an existing database. Run `npm ci`, `npm run db:generate`, `npm run db:deploy` as a release step. The new additive migration deliberately makes existing producer accounts pending and existing listings require rights review. Approve/review them before they become visible again.
2. Configure production secrets in the host, with both commerce switches false. Leave Razorpay and SES credentials empty.
3. Build/start normally, or build the Docker image with `--build-arg NEXT_PUBLIC_SUPPORT_EMAIL=YOUR_WORKING_EMAIL`. Supply actual runtime environment variables; the Docker build placeholders are not production credentials. Run migrations from the source release job, not the minimal runner image.
4. Use `/api/health` for liveness and `/api/ready` for database readiness. Readiness checks the database, not OAuth/S3 permissions.
5. Configure HTTPS, managed rate limits/WAF (auth, upload, preview and mutation endpoints), database backups, monitoring and restricted admin access. This app has no distributed rate limiter or malware scanner built in.
6. Complete the manual acceptance checklist in [docs/MVP.md](docs/MVP.md). Review policies with counsel before public launch.

## Verification

```bash
npm run db:generate
npx prisma validate
npm run typecheck
npm run lint
npm test
npm run build
npm run test:smoke
```

CI applies migrations to disposable PostgreSQL before running the checks. The lockfile and explicit compatibility pins keep installation reproducible; refresh dependency pins together with build/security checks. Internal laptop-registry URLs are intentionally omitted from the lockfile while versions and integrity hashes remain pinned, allowing npm to use the deployment host's configured registry.

## Commerce is a later release

Razorpay adapters and historical order tables remain for future development. They are **not ready to activate simply by adding keys**. Resolve server-side capture verification, amount/currency validation, refund/reversal reconciliation and transfer-versus-bank-settlement tracking; approve contracts/tax treatment; implement a sound-pack entitlement/licence; and test payment failure/concurrency cases. Only a separately verified release should enable both switches. Do not stop webhook processing on a live store without first reconciling pending transactions.
