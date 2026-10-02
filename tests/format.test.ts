import { test } from "node:test";
import assert from "node:assert/strict";
import { formatPrice, listingFacts, listingTitle, formatPostDate } from "../src/lib/utils/format.ts";

test("formatPrice", () => {
  assert.equal(formatPrice(1249000), "$1,249,000");
  assert.equal(formatPrice(489000), "$489,000");
});
test("listingFacts handles half baths and thousands", () => {
  assert.equal(listingFacts({ beds: 3, baths: 2.5, sqft: 2140 }), "3 bd, 2.5 ba, 2,140 sq ft");
});
test("listingTitle", () => {
  assert.equal(listingTitle({ address: "123 Oak Ln", city: "Medina", state: "OH" }), "123 Oak Ln, Medina, OH");
});
test("formatPostDate keeps the pubDate's own day (UTC), whatever the build's time zone", () => {
  assert.equal(formatPostDate(new Date("2026-10-07")), "October 7, 2026");
  assert.equal(formatPostDate(new Date("2026-01-01")), "January 1, 2026");
});
