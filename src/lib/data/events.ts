import { getCollection } from "astro:content";
import { splitEvents } from "../utils/events";

export async function getAllEvents() {
  return getCollection("events");
}
// Upcoming (soonest first) and past (most recent first). Cancelled events are
// dropped; postponed ones stay so visitors see the status.
export async function getEventsSplit(now = new Date()) {
  const all = (await getAllEvents()).filter((e) => e.data.status !== "cancelled");
  const { upcoming, past } = splitEvents(all.map((e) => ({ entry: e, startDate: e.data.startDate })), now);
  return { upcoming: upcoming.map((x) => x.entry), past: past.map((x) => x.entry) };
}
