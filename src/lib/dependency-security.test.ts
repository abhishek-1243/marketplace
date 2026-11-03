import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import postcss from "postcss";
import tailwindcss from "tailwindcss";
import autoprefixer from "autoprefixer";
import tailwindConfig from "../../tailwind.config";

const lock = JSON.parse(readFileSync("package-lock.json", "utf8")) as {
  packages: Record<string, { version?: string }>;
};
const braceMinimums: Record<string, string> = { "1": "1.1.21", "2": "2.1.7", "3": "3.0.9" };

function atLeast(version: string, minimum: string) {
  const installed = version.split(".").map(Number);
  const required = minimum.split(".").map(Number);
  for (let index = 0; index < 3; index++) {
    if (installed[index] !== required[index]) return installed[index] > required[index];
  }
  return true;
}

test("lockfile does not reintroduce the patched dependency advisories", () => {
  // GHSA-vfj7-8cjw-p6xm remains open for braces: no fixed upstream release exists.
  // This guard covers the patched families, not a blanket clean security audit.
  let checked = 0;
  for (const [path, entry] of Object.entries(lock.packages)) {
    if (!entry.version) continue;
    const name = path.split("node_modules/").at(-1);
    const minimum = name === "postcss" ? "8.5.26"
      : name === "source-map-js" ? "1.2.2"
        : name === "postcss-selector-parser" ? "7.1.6"
          : name === "brace-expansion" ? (braceMinimums[entry.version.split(".")[0]] ?? "5.0.12") : null;
    if (minimum) {
      checked++;
      assert.ok(atLeast(entry.version, minimum), `${path}@${entry.version} must be at least ${minimum}`);
    }
  }
  assert.ok(checked >= 4, "Expected the patched dependency families in the lockfile");
});

test("patched CSS tooling preserves Tailwind 3 utilities and application controls", async () => {
  const input = readFileSync("src/app/globals.css", "utf8");
  const result = await postcss([
    tailwindcss({ ...tailwindConfig, content: [{ raw: '<div class="grid grid-cols-2 sm:grid-cols-3 bg-accent-500 rounded-full soundfuel-button soundfuel-button-secondary soundfuel-input surface"></div>', extension: "html" }] }),
    autoprefixer(),
  ]).process(input, { from: "src/app/globals.css", map: false });
  assert.ok(/\.soundfuel-button\s*\{/.test(result.css), "Application button styles should compile");
  assert.ok(/\.soundfuel-input\s*\{/.test(result.css), "Application input styles should compile");
  assert.ok(/\.grid-cols-2\s*\{/.test(result.css), "Grid utilities should compile");
  assert.ok(/grid-template-columns:\s*repeat\(3,/.test(result.css), "Responsive utilities should compile");
  assert.ok(/border-radius:\s*9999px/.test(result.css), "Rounded control styles should be preserved");
  assert.ok(/:focus-visible/.test(result.css), "Keyboard focus styles should be preserved");
  assert.ok(!/@tailwind\s|@apply\s/.test(result.css), "Tailwind directives should be fully expanded");
});
