import assert from "node:assert/strict";
import test from "node:test";
import { paymentEnvSchema } from "./payment-config";

const keys = {
  RAZORPAY_KEY_ID: "rzp_test_example",
  NEXT_PUBLIC_RAZORPAY_KEY_ID: "rzp_test_example",
  RAZORPAY_KEY_SECRET: "test-secret",
  RAZORPAY_WEBHOOK_SECRET: "test-webhook-secret",
};

test("payments stay disabled by default even with credentials present", () => {
  assert.equal(paymentEnvSchema.parse({}).PAYMENTS_ENABLED, false);
  assert.equal(paymentEnvSchema.parse(keys).PAYMENTS_ENABLED, false);
  assert.equal(paymentEnvSchema.parse({ PAYMENTS_ENABLED: "false", RAZORPAY_KEY_ID: "" }).PAYMENTS_ENABLED, false);
});

test("enabling payments requires all credentials and matching public/server keys", () => {
  assert.equal(paymentEnvSchema.parse({ PAYMENTS_ENABLED: "true" }).PAYMENTS_ENABLED, false);
  assert.equal(paymentEnvSchema.safeParse({ PAYMENTS_ENABLED: "true", COMMERCE_LAUNCH_APPROVED: "true" }).success, false);
  for (const key of Object.keys(keys)) {
    assert.equal(paymentEnvSchema.safeParse({ ...keys, PAYMENTS_ENABLED: "true", COMMERCE_LAUNCH_APPROVED: "true", [key]: " " }).success, false);
  }
  assert.equal(paymentEnvSchema.safeParse({ ...keys, PAYMENTS_ENABLED: "true", COMMERCE_LAUNCH_APPROVED: "true", NEXT_PUBLIC_RAZORPAY_KEY_ID: "different" }).success, false);
  assert.equal(paymentEnvSchema.parse({ ...keys, PAYMENTS_ENABLED: "true", COMMERCE_LAUNCH_APPROVED: "true" }).PAYMENTS_ENABLED, true);
});

test("credentials or either single switch cannot enable commerce", () => {
  for (const input of [keys, { ...keys, PAYMENTS_ENABLED: "true" }, { ...keys, COMMERCE_LAUNCH_APPROVED: "true" }]) assert.equal(paymentEnvSchema.parse(input).PAYMENTS_ENABLED, false);
});

test("invalid payment switches fail validation instead of enabling payments", () => {
  for (const value of ["1", "yes", "FALSE", ""]) {
    assert.equal(paymentEnvSchema.safeParse({ ...keys, PAYMENTS_ENABLED: value }).success, false);
  }
});
