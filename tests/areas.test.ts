import { test } from "node:test";
import assert from "node:assert/strict";
import { countiesSentence } from "../src/lib/utils/areas.ts";

test("joins counties with commas and 'and', dropping repeated 'County'", () => {
  assert.equal(countiesSentence("Cuyahoga County, Medina County, Summit County"), "Cuyahoga, Medina and Summit counties");
});
test("single area keeps its own name", () => {
  assert.equal(countiesSentence("Lake County"), "Lake County");
});
test("empty gives empty string", () => {
  assert.equal(countiesSentence(""), "");
  assert.equal(countiesSentence(undefined), "");
});
