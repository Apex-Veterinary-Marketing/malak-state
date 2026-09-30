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
