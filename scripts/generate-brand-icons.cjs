// Render the approved SVG master into browser/mobile icons. No raster tracing.
const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const master = fs.readFileSync(path.join(root, "public/images/soundfuel-mark.svg"), "utf8");
const mark = master.match(/<path\b[^>]+\/>/)[0];
const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256"><title>Soundfuel</title><rect width="256" height="256" rx="52" fill="#101114"/><svg x="14" y="37" width="228" height="182" viewBox="80 210 1090 760">${mark}</svg></svg>`;

async function main() {
  const dir = path.join(root, "public/icons");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "soundfuel-flame-v1.svg"), icon);
  for (const size of [32, 180]) {
    const name = size === 180 ? "soundfuel-apple-180-v1.png" : "soundfuel-flame-32-v1.png";
    await sharp(Buffer.from(icon)).resize(size, size).png().toFile(path.join(dir, name));
  }
  // Next.js file-convention icon: replace the previous brand, not a second logo.
  await sharp(Buffer.from(icon)).resize(512, 512).png().toFile(path.join(root, "src/app/icon.png"));
  console.log("Generated matching SVG, 32px, Apple touch and Next.js icons.");
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
