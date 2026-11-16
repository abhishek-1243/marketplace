import assert from "node:assert/strict";
import { Prisma, PrismaClient } from "@prisma/client";

// Never point this verifier at an application database. Every case rolls back,
// but a dedicated test database also protects against future test changes.
if (!new URL(process.env.DATABASE_URL || "postgresql://localhost/unset").pathname.endsWith("_test")) {
  throw new Error("Database model tests require a dedicated database ending in _test");
}
const db = new PrismaClient();
const rollback = new Error("EXPECTED_TEST_ROLLBACK");

async function check(name: string, run: (tx: Prisma.TransactionClient, producerId: string) => Promise<void>, invalid = false) {
  let rejected = false;
  try {
    await db.$transaction(async (tx) => {
      const id = crypto.randomUUID();
      const user = await tx.user.create({ data: { email: `${id}@example.com`, username: id, displayName: "Database test", role: "PRODUCER", producerStatus: "APPROVED" } });
      await run(tx, user.id);
      await tx.$executeRawUnsafe("SET CONSTRAINTS ALL IMMEDIATE");
      throw rollback;
    });
  } catch (error) {
    if (error !== rollback) {
      if (!(error instanceof Prisma.PrismaClientKnownRequestError)) throw error;
      const constraintError = ["P2003", "P2004"].includes(error.code) || (error.code === "P2010" && ["23503", "23514"].includes(String(error.meta?.code)));
      if (!constraintError) throw error;
      rejected = true;
    }
  }
  assert.equal(rejected, invalid, name);
  console.log(`PASS ${name}`);
}
const listing = (producerId: string, kind: "BEAT" | "SOUND_PACK") => ({ producerId, kind, title: "Test listing", slug: crypto.randomUUID(), genre: "Test" });

async function main() {
  await check("beats and packs have independent details, licence tables and filtered queries", async (tx, producerId) => {
    const beat = await tx.listing.create({ data: { ...listing(producerId, "BEAT"), beat: { create: { bpm: 100, licensePlans: { create: { type: "BASIC", price: 999 } } } } } });
    const pack = await tx.listing.create({ data: { ...listing(producerId, "SOUND_PACK"), soundPack: { create: { sampleCount: 20, licensePlans: { create: { price: 599 } } } } } });
    assert.equal(await tx.listing.count({ where: { producerId, kind: "BEAT" } }), 1);
    assert.equal(await tx.listing.count({ where: { producerId, kind: "SOUND_PACK" } }), 1);
    assert.equal(await tx.beat.count({ where: { listingId: pack.id } }), 0);
    assert.equal(await tx.soundPack.count({ where: { listingId: beat.id } }), 0);
  });
  await check("a listing cannot be committed without details", async (tx, id) => {
    await tx.listing.create({ data: listing(id, "BEAT") });
  }, true);
  await check("a beat cannot have pack details", async (tx, id) => {
    await tx.listing.create({ data: { ...listing(id, "BEAT"), soundPack: { create: { sampleCount: 20 } } } });
  }, true);
  await check("a listing cannot have both product subtypes", async (tx, id) => {
    await tx.listing.create({ data: { ...listing(id, "BEAT"), beat: { create: {} }, soundPack: { create: { sampleCount: 20 } } } });
  }, true);
  await check("pack sample count must be positive", async (tx, id) => {
    await tx.listing.create({ data: { ...listing(id, "SOUND_PACK"), soundPack: { create: { sampleCount: 0 } } } });
  }, true);
  await check("deleting details without the parent is rejected", async (tx, id) => {
    const item = await tx.listing.create({ data: { ...listing(id, "BEAT"), beat: { create: {} } } });
    await tx.beat.delete({ where: { listingId: item.id } });
  }, true);
  await check("deleting a complete listing cascades correctly", async (tx, id) => {
    const item = await tx.listing.create({ data: { ...listing(id, "BEAT"), beat: { create: {} } } });
    await tx.listing.delete({ where: { id: item.id } });
  });
  await check("an order cannot use another listing's licence", async (tx, id) => {
    const beat = await tx.listing.create({ data: { ...listing(id, "BEAT"), beat: { create: { licensePlans: { create: { type: "BASIC", price: 999 } } } } }, include: { beat: { include: { licensePlans: true } } } });
    const pack = await tx.listing.create({ data: { ...listing(id, "SOUND_PACK"), soundPack: { create: { sampleCount: 20 } } } });
    await tx.order.create({ data: { artistId: id, producerId: id, totalAmount: 999, commission: 100, producerAmount: 899, expiresAt: new Date(), item: { create: { listingId: pack.id, beatLicensePlanId: beat.beat!.licensePlans[0].id, price: 999, licenseSnapshot: {} } } } });
  }, true);
  await check("an order item must name exactly one licence", async (tx, id) => {
    const item = await tx.listing.create({ data: { ...listing(id, "BEAT"), beat: { create: {} } } });
    await tx.order.create({ data: { artistId: id, producerId: id, totalAmount: 999, commission: 100, producerAmount: 899, expiresAt: new Date(), item: { create: { listingId: item.id, price: 999, licenseSnapshot: {} } } } });
  }, true);
}
main().finally(() => db.$disconnect()).catch((error) => { console.error(error); process.exitCode = 1; });
