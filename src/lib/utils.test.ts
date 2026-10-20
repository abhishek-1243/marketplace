import assert from "node:assert/strict";
import test from "node:test";
import { calculateCommission, slugify } from "./utils";

test("commission is ten percent and capped", () => {
  assert.deepEqual(calculateCommission(2_999, 1_000, 5_000), {
    commission: 300,
    producerAmount: 2_699,
  });
  assert.deepEqual(calculateCommission(100_000, 1_000, 5_000), {
    commission: 5_000,
    producerAmount: 95_000,
  });
});

test("slugify produces stable URL segments", () => {
  assert.equal(slugify("  Bombay Nights!  "), "bombay-nights");
});
