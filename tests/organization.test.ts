import { test } from "node:test";
import assert from "node:assert/strict";
import { areaServedNode } from "../src/lib/schema/areaServed.ts";

test("counties become AdministrativeArea", () => {
  assert.deepEqual(areaServedNode("Cuyahoga County"), { "@type": "AdministrativeArea", name: "Cuyahoga County" });
});
test("anything else stays a City", () => {
  assert.deepEqual(areaServedNode("Medina"), { "@type": "City", name: "Medina" });
});
test("trims and is case-insensitive about 'county'", () => {
  assert.deepEqual(areaServedNode("  lake county "), { "@type": "AdministrativeArea", name: "lake county" });
});
