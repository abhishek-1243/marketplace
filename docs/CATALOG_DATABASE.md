# Separate beats and sound packs

`Listing` owns shared identity, producer, metadata, publication and review state. `Beat` and `SoundPack` each use `listingId` as their primary/foreign key. Beats contain BPM/key and exclusive-sale state; packs contain sample count. `BeatLicensePlan` and `SoundPackLicensePlan` have distinct rights and pricing fields. `ListingAsset` and `Favorite` reference listings. `OrderItem` records the listing, price and immutable rights snapshot. Checkout remains one listing per order; this change does not introduce a cart or enable purchases.

Deferred PostgreSQL constraint triggers require exactly one matching subtype when a transaction commits. Create a listing and its details in one Prisma nested create/transaction. Deleting the parent cascades to details; deleting details alone is rejected. Order-item constraints require exactly one licence, and composite foreign keys require that licence to belong to the same listing. Pack sample counts must be positive. Prisma schema describes the relations; custom SQL in the migration enforces the additional invariants.

## Product separation

- `/beats` and `/sound-packs` have independent queries, search, sorting and pagination.
- `/beats/[listingId]` and `/sound-packs/[listingId]` enforce the expected kind and return 404 for the wrong kind.
- `/search` redirects to one category, defaulting to beats; it never renders mixed results.
- Producer storefronts, library and creator studio use explicit Beats/Sound packs tabs. Home sections are separate; the trending hero contains beats only.
- `/api/listings?kind=BEAT` and `?kind=SOUND_PACK` return one category. Missing/unrecognized kind defaults to beats.
- Old `/sounds/[soundId]` links redirect to the correct product detail. The generic API uses `listingId` consistently.

Private S3 object prefixes retain `beats/` for compatibility with existing storage access policies. This storage namespace does not determine the product type and is not exposed as a mixed catalog.

## Apply on Railway (empty catalog)

1. Keep the existing database and its migration history. Do not delete the volume, reset the schema, run `db push`, or edit the two previously applied migrations.
2. Commit and push the schema, new migration, regenerated application code, lockfile if changed, and `railway.json` to the branch Railway deploys. Prisma Client is generated during the Docker build; generated `node_modules` files are not committed.
3. In the Railway web service, confirm `DATABASE_URL` references the PostgreSQL service's PostgreSQL connection URL. Keep `PAYMENTS_ENABLED=false` and `COMMERCE_LAUNCH_APPROVED=false`.
4. Railway reads `railway.json` and runs `node node_modules/prisma/build/index.js migrate deploy` as the pre-deploy command. Confirm the deployment details show this command. The included Docker runner contains the migration CLI and migration files. Keep the Dockerfile start command (`node server.js`).
5. Trigger deployment. Look for `20261113000000_separate_listing_products` applied successfully before the app starts. `/api/ready` must pass. An empty brand-new database also works: all three migrations run in order.
6. Open `/beats` and `/sound-packs`, sign in, approve a test producer, upload one item of each type, and verify each appears only in its own catalog/storefront/library tab. Marketplace visibility still requires editorial selection.

The migration is intentionally for empty product/order tables: it rebuilds the former mixed catalog structure while preserving users and follows. It takes locks and checks the legacy catalog, assets, licences, favorites and orders before changing tables. If any contain data, it raises an error and rolls back the entire migration instead of discarding it. Stop and prepare a data-preserving migration in that case; do not bypass the guard. Prisma records a failed migration and requires deliberate resolution after investigation; repeated redeploys alone will not resolve it.

Because this is an incompatible schema upgrade, deploy the new application with this migration, not an older app version. Do not roll back only the application after the migration; restore the matching database/schema version or forward-fix the application.

## Verify on a disposable PostgreSQL database

Use a test database whose name ends in `_test` (never the Railway application database):

```text
npm run db:generate
npm run db:deploy
npm run test:db
```

The database tests exercise subtype constraints, separate queries, licence ownership and cascading deletion. Every test transaction rolls back. CI runs these tests on PostgreSQL 16 after applying all migrations.
