import { test } from "node:test";
import assert from "node:assert/strict";
import { tokenHex } from "../src/lib/utils/tokens.ts";

const css = ":root {\n  --main: #7c6e63; /* brand */\n  --main-dark: #352f2b;\n  --text:#333333;\n}";

test("reads a 6-digit hex token without the #", () => {
  assert.equal(tokenHex(css, "main"), "7c6e63");
});
test("does not confuse --main with --main-dark", () => {
  assert.equal(tokenHex(css, "main-dark"), "352f2b");
});
test("works with no space after the colon; missing token is undefined", () => {
  assert.equal(tokenHex(css, "text"), "333333");
  assert.equal(tokenHex(css, "cta"), undefined);
});
