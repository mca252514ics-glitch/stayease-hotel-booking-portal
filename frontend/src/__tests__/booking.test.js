import test from "node:test";
import assert from "node:assert/strict";
import {
  formatINR,
  getNightCount,
  isValidISODate,
  isValidStay,
} from "../utils/booking.js";

test("accepts real ISO calendar dates and rejects impossible dates", () => {
  assert.equal(isValidISODate("2026-11-20"), true);
  assert.equal(isValidISODate("2026-02-30"), false);
  assert.equal(isValidISODate("20-11-2026"), false);
});

test("validates check-in and check-out ordering and past dates", () => {
  assert.equal(isValidStay("2026-11-20", "2026-11-23", "2026-11-13"), true);
  assert.equal(isValidStay("2026-11-23", "2026-11-20", "2026-11-13"), false);
  assert.equal(isValidStay("2026-11-12", "2026-11-14", "2026-11-13"), false);
});

test("calculates nights using checkout-exclusive hotel dates", () => {
  assert.equal(getNightCount("2026-11-20", "2026-11-23"), 3);
  assert.equal(getNightCount("2026-11-20", "2026-11-20"), 0);
});

test("formats totals as Indian rupees", () => {
  assert.equal(formatINR(6000), "₹6,000");
  assert.equal(formatINR(1250.5), "₹1,250.5");
});
