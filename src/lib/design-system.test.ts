import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const css = readFileSync("src/app/globals.css", "utf8");
function token(name: string) {
  const value = css.match(new RegExp(`--${name}: ([0-9 ]+);`));
  assert.ok(value, `Missing color token ${name}`);
  return value[1].split(" ").map(Number);
}
function luminance(rgb: number[]) {
  const linear = rgb.map((channel) => { const value = channel / 255; return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4; });
  return linear[0] * .2126 + linear[1] * .7152 + linear[2] * .0722;
}
test("core text and primary action colors meet normal-text contrast", () => {
  const pairs = [["foreground", "canvas"], ["secondary", "panel"], ["muted", "field"], ["accent-light", "panel"]];
  for (const [foreground, background] of pairs) {
    const values = [luminance(token(foreground)), luminance(token(background))].sort((a, b) => b - a);
    assert.ok((values[0] + .05) / (values[1] + .05) >= 4.5, `${foreground} on ${background} needs 4.5:1 contrast`);
  }
  assert.ok(1.05 / (luminance(token("accent")) + .05) >= 4.5, "White primary-action text needs 4.5:1 contrast");
  for (const state of ["accent-hover", "accent-pressed"]) assert.ok(1.05 / (luminance(token(state)) + .05) >= 4.5, `White text on ${state} needs 4.5:1 contrast`);
});

test("shared controls retain predictable size, feedback and loading semantics", () => {
  assert.match(css, /--control-size: 2\.75rem/);
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\)/);
  assert.match(css, /button\[aria-busy="true"\] \{ cursor: progress/);
  assert.match(css, /input\[type="range"\].*height: var\(--control-size\)/);
  assert.match(css, /\.soundfuel-input:focus.*outline: 2px solid rgb\(var\(--accent-light\)\)/);
  const player = readFileSync("src/components/layout/AudioPlayer.tsx", "utf8");
  assert.match(player, /className="player-play"/);
  assert.match(player, /disabled=\{queueIndex <= 0\}/);
  assert.match(player, /disabled=\{queueIndex >= queue.length - 1\}/);
  const save = readFileSync("src/components/beats/SaveSoundButton.tsx", "utf8");
  assert.match(save, /aria-busy=\{busy\}/);
  assert.match(save, /busy \? "Saving…"/);
});
test("accessibility preferences and immediate interaction feedback stay supported", () => {
  for (const preference of ["prefers-reduced-motion", "prefers-reduced-transparency", "prefers-contrast"]) assert.ok(css.includes(preference));
  assert.match(css, /:focus-visible/);
  assert.match(css, /button:not\(:disabled\):active/);
  assert.doesNotMatch(css, /fonts\.googleapis\.com/);
});
test("marketplace views share the accent palette", () => {
  function inspect(directory: string) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) inspect(path);
      else if (path.endsWith(".tsx")) assert.doesNotMatch(readFileSync(path, "utf8"), /\b(?:bg|text|ring|border|accent)-amber-\d/, `${path} uses the retired accent`);
    }
  }
  inspect("src/app"); inspect("src/components");
});

test("home and preview inherit the shared graphite-and-rust palette", () => {
  const landing = css.match(/\.landing-page \{([^}]+)\}/)?.[1] || "";
  assert.ok(landing);
  assert.doesNotMatch(landing, /--(?:canvas|panel|foreground|accent):|color-scheme:\s*light/);
  assert.match(landing, /background: rgb\(var\(--canvas\)\)/);
  assert.deepEqual(token("accent"), [168, 69, 44]);
  assert.deepEqual(token("accent-light"), [244, 168, 141]);
  const theme = readFileSync("tailwind.config.ts", "utf8");
  assert.doesNotMatch(theme, /#(?:d6eaff|a9d3ff|49a3ff|0063c7|0055ad)/i);
  const home = readFileSync("src/app/page.tsx", "utf8");
  assert.match(home, /<LandingPage/);
  try {
    const preview = readFileSync("src/app/ui-preview/PreviewCatalog.tsx", "utf8");
    assert.match(preview, /<LandingPage/);
  } catch { /* ui-preview is optional and excluded from production */ }
});

test("split home uses real playback and the shared minimal chrome", () => {
  const landing = readFileSync("src/components/home/LandingPage.tsx", "utf8");
  assert.match(landing, /Start with<br \/>a sound\./);
  assert.match(landing, /landing-hero-grid/);
  assert.match(landing, /<TrendingSounds sounds=\{sounds\}/);
  assert.doesNotMatch(landing, /heroArtwork|<figure/);
  assert.doesNotMatch(landing, /0:00|2:48|setInterval|landing-creator-visual/);
  assert.match(landing, /href="\/search"/);
  assert.match(landing, /href="\/apply"/);
  const footer = readFileSync("src/components/layout/Footer.tsx", "utf8");
  assert.doesNotMatch(footer, /<Brand/);
  for (const href of ["/contact", "/terms", "/privacy", "/refund-policy", "/copyright"]) assert.ok(footer.includes(href));
});

test("the redesign uses a licensed local font without external font requests", () => {
  assert.match(css, /@font-face/);
  assert.match(css, /url\("\/fonts\/Sora-Variable\.ttf"\)/);
  assert.ok(readFileSync("public/fonts/Sora-Variable.ttf").length > 10000);
  assert.match(readFileSync("public/fonts/Sora-OFL.txt", "utf8"), /SIL OPEN FONT LICENSE/);
  const landing = readFileSync("src/components/home/LandingPage.tsx", "utf8");
  assert.doesNotMatch(landing, /landing-eyebrow|uppercase|tracking-\[/);
});

test("trending hero only queries eligible playable marketplace sounds and shares playback", () => {
  const home = readFileSync("src/app/page.tsx", "utf8");
  assert.match(home, /\.\.\.marketplaceWhere, assets: \{ some: \{ type: "PREVIEW"/);
  assert.match(home, /orderBy: \[\{ plays: "desc" \}, \{ createdAt: "desc" \}, \{ id: "desc" \}\]/);
  assert.match(home, /heroSounds=\{trending.map\(serializeCatalogItem\)\}/);
  const trending = readFileSync("src/components/home/TrendingSounds.tsx", "utf8");
  assert.match(trending, /Trending<\/h2>/);
  assert.match(trending, /Ranked by total plays/);
  assert.match(trending, /useAudioPlayer/);
  assert.match(trending, /setQueue\(playable.map\(toTrack\)/);
  assert.match(trending, /currentTrack\?\.beatId === sound.id\) \{ toggle\(\)/);
  assert.match(trending, /disabled=\{!sound.previewUrl\}/);
  assert.match(trending, /role="status"/);
  assert.doesNotMatch(trending, /<audio|autoPlay|setInterval/);
});
