import assert from "node:assert/strict";
import test from "node:test";
import { listingMetadataSchema } from "./listing-metadata";
import { isReservedUsername } from "./usernames";
import { isHttpUrl } from "./web-url";

test("application and artwork URLs cannot use executable schemes", () => {
  assert.equal(isHttpUrl("https://youtube.com/@producer"), true);
  for (const url of ["javascript:alert(1)", "data:text/html,hello", "file:///secret", "invalid"]) assert.equal(isHttpUrl(url), false);
});

test("storefront usernames cannot collide with application routes", () => {
  for (const name of ["admin", "API", "sounds", "dashboard", "apply", "search"]) assert.equal(isReservedUsername(name), true);
  assert.equal(isReservedUsername("punjab-drums"), false);
});

test("listing edits cannot change ownership, rights, scoring or publication", () => {
  const metadata = { title: "Punjab Nights", description: "An original dhol recording with warm bass and spacious textures for independent vocal releases.", region: "Punjab", instruments: "Dhol", tags: ["dhol"] };
  assert.equal(listingMetadataSchema.safeParse(metadata).success, true);
  for (const field of ["producerId", "rightsStatus", "discoveryTier", "qualityScore", "status", "assets", "startingPrice"]) assert.equal(listingMetadataSchema.safeParse({ ...metadata, [field]: "override" }).success, false);
});
