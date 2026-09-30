import { test } from "node:test";
import assert from "node:assert/strict";
import { renderEmphasis, stripEmphasis } from "../src/lib/utils/emphasis.ts";

test("wraps *word* in <em>", () => {
  assert.equal(renderEmphasis("Real estate, handled with *care.*"), "Real estate, handled with <em>care.</em>");
});
test("escapes HTML in the heading", () => {
  assert.equal(renderEmphasis("Buying & <selling>"), "Buying &amp; &lt;selling&gt;");
});
test("leaves lone asterisks alone", () => {
  assert.equal(renderEmphasis("5 * 3"), "5 * 3");
});
test("stripEmphasis gives plain text for titles and schema", () => {
  assert.equal(stripEmphasis("Book a *30-minute* call"), "Book a 30-minute call");
});
