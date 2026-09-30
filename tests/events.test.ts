import { test } from "node:test";
import assert from "node:assert/strict";
import { splitEvents } from "../src/lib/utils/events.ts";

const e = (iso: string) => ({ name: iso, startDate: new Date(iso) });

test("same-day event (NY time) is still upcoming late that evening", () => {
  const now = new Date("2026-10-15T23:30:00-04:00");
  const { upcoming, past } = splitEvents([e("2026-10-15T18:00:00-04:00")], now);
  assert.equal(upcoming.length, 1);
  assert.equal(past.length, 0);
});
test("yesterday is past; ordering is soonest-first / most-recent-first", () => {
  const now = new Date("2026-10-15T09:00:00-04:00");
  const { upcoming, past } = splitEvents(
    [e("2026-11-12T18:00:00-05:00"), e("2026-10-14T18:00:00-04:00"), e("2026-10-20T18:00:00-04:00"), e("2026-09-10T18:00:00-04:00")],
    now
  );
  assert.deepEqual(upcoming.map((x) => x.name), ["2026-10-20T18:00:00-04:00", "2026-11-12T18:00:00-05:00"]);
  assert.deepEqual(past.map((x) => x.name), ["2026-10-14T18:00:00-04:00", "2026-09-10T18:00:00-04:00"]);
});
test("empty input", () => {
  assert.deepEqual(splitEvents([], new Date()), { upcoming: [], past: [] });
});

import { parseEventDate } from "../src/lib/utils/events.ts";

test("a date-only event (YAML 2026-10-15) is Oct 15 in New York, and upcoming all that day", () => {
  const d = parseEventDate("2026-10-15");
  assert.equal(d.toLocaleDateString("en-CA", { timeZone: "America/New_York" }), "2026-10-15");
  const { upcoming } = splitEvents([{ startDate: d }], new Date("2026-10-15T22:00:00-04:00"));
  assert.equal(upcoming.length, 1);
});
test("a date-time without an offset is New York wall-clock time (EDT and EST)", () => {
  assert.equal(parseEventDate("2026-10-15T18:00").toISOString(), "2026-10-15T22:00:00.000Z");
  assert.equal(parseEventDate("2026-12-10 18:30").toISOString(), "2026-12-10T23:30:00.000Z");
});
test("an explicit offset or Z is respected; a Date passes through", () => {
  assert.equal(parseEventDate("2026-10-15T18:00:00-04:00").toISOString(), "2026-10-15T22:00:00.000Z");
  assert.equal(parseEventDate("2026-10-15T18:00:00Z").toISOString(), "2026-10-15T18:00:00.000Z");
  const x = new Date("2026-01-01T00:00:00Z");
  assert.equal(parseEventDate(x), x);
});

import { normalizeFrontmatterDate } from "../src/lib/utils/events.ts";

test("unquoted YAML dates (parsed by YAML as UTC) are reread as New York wall time", () => {
  // js-yaml turns `startDate: 2026-10-15` into 2026-10-15T00:00:00Z and `2026-10-15 18:00` into 18:00Z
  assert.equal(normalizeFrontmatterDate(new Date("2026-10-15T00:00:00Z")).toISOString(), "2026-10-15T04:00:00.000Z");
  assert.equal(normalizeFrontmatterDate(new Date("2026-10-15T18:00:00Z")).toISOString(), "2026-10-15T22:00:00.000Z");
});
test("quoted strings go through parseEventDate (offsets respected)", () => {
  assert.equal(normalizeFrontmatterDate("2026-10-15T18:00:00-04:00").toISOString(), "2026-10-15T22:00:00.000Z");
  assert.equal(normalizeFrontmatterDate("2026-10-15").toISOString(), "2026-10-15T04:00:00.000Z");
});
