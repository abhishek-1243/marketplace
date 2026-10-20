import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";

const port = 3101;
const origin = `http://127.0.0.1:${port}`;
const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
  env: { ...process.env, PAYMENTS_ENABLED: "false", COMMERCE_LAUNCH_APPROVED: "false" },
  stdio: ["ignore", "pipe", "pipe"], windowsHide: true,
});
// Suppress application logs: they can contain environment-specific diagnostics.
server.stdout.resume(); server.stderr.resume();
let serverError;
server.on("error", (error) => { serverError = error; });
const request = (path, options) => fetch(`${origin}${path}`, { ...options, signal: AbortSignal.timeout(10000) });

try {
  let ready = false;
  for (let attempt = 0; attempt < 90; attempt++) {
    if (serverError) throw serverError;
    if (server.exitCode !== null) throw new Error("Preview smoke-test server exited before readiness");
    try { ready = (await request("/api/health")).ok; } catch { /* server is starting */ }
    if (ready) break;
    await delay(500);
  }
  assert.ok(ready, "Server must start within 45 seconds");
  for (const [path, method] of [
    ["/api/checkout", "POST"], ["/api/payments/verify", "POST"],
    ["/api/webhooks/razorpay", "POST"], ["/api/admin/users/smoke-user/payout-account", "PATCH"],
  ]) {
    const response = await request(path, { method, headers: { "Content-Type": "application/json" }, body: "{}" });
    assert.equal(response.status, 503, `${path} must be disabled before auth, body validation or DB mutation`);
    assert.equal((await response.json()).code, "PAYMENTS_DISABLED");
  }
  for (const path of ["/apply", "/register", "/contact", "/terms", "/privacy"]) {
    const response = await request(path);
    assert.equal(response.status, 200, `${path} should render`);
    assert.doesNotMatch(await response.text(), /<script[^>]+src=["'][^"']*checkout\.razorpay\.com/i);
  }
  const checkout = await request("/checkout/smoke-listing", { redirect: "manual" });
  assert.equal(checkout.status, 307);
  assert.ok(checkout.headers.get("location")?.endsWith("/sounds/smoke-listing"));
  const blocked = await request("/api/beats", { method: "POST", headers: { Origin: "https://untrusted.invalid", "Content-Type": "application/json" }, body: "{}" });
  assert.equal(blocked.status, 403, "Cross-origin listing writes must be rejected");
  console.log("Preview smoke checks passed: payment gates, static pages, checkout redirect and origin guard.");
} finally {
  server.kill();
}
