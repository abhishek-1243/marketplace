import assert from "node:assert/strict";
import test from "node:test";
import { catalogKind, catalogHref, listingHref } from "./listing-kind";
import { isReservedUsername } from "./usernames";

test("catalog navigation never falls back to mixed results", () => {
  assert.equal(catalogKind(undefined), "BEAT");
  assert.equal(catalogKind("ALL"), "BEAT");
  assert.equal(catalogHref("SOUND_PACK"), "/sound-packs");
  assert.equal(listingHref({ id: "beat-1", kind: "BEAT" }), "/beats/beat-1");
  assert.equal(listingHref({ id: "pack-1", kind: "SOUND_PACK" }), "/sound-packs/pack-1");
  for (const name of ["beats", "sound-packs"]) assert.equal(isReservedUsername(name), true);
});
