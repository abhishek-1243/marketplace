import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("header and favicons use the approved burning-bars master", () => {
  const master = readFileSync("public/images/soundfuel-mark.svg", "utf8");
  const icon = readFileSync("public/icons/soundfuel-bars-v3.svg", "utf8");
  const shape = master.match(/<path\b[^>]+\/>/)?.[0];
  assert.ok(shape);
  assert.ok(icon.includes(shape));
  assert.doesNotMatch(master, /<image|<filter|<linearGradient/);
  assert.match(readFileSync("src/components/layout/Brand.tsx", "utf8"), /\/images\/soundfuel-mark.svg/);
  const layout = readFileSync("src/app/layout.tsx", "utf8");
  for (const asset of ["soundfuel-bars-v3.svg", "soundfuel-bars-32-v3.png", "soundfuel-apple-180-v2.png"]) assert.ok(layout.includes(asset));
});

test("browser and mobile icon rasters have the expected dimensions", () => {
  for (const [file, size] of [["public/icons/soundfuel-bars-32-v3.png", 32], ["public/icons/soundfuel-apple-180-v2.png", 180], ["src/app/icon.png", 512]] as const) {
    const png = readFileSync(file);
    assert.equal(png.subarray(1, 4).toString(), "PNG");
    assert.equal(png.readUInt32BE(16), size);
    assert.equal(png.readUInt32BE(20), size);
  }
});
