// Upcoming vs past for Gather & Ground. "Today" is judged in the client's time zone,
// so an evening event stays upcoming for its whole day. Dependency-free (unit-tested).
const DAY = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "America/New_York" }); // YYYY-MM-DD

export function splitEvents<T extends { startDate: Date }>(events: T[], now: Date) {
  const today = DAY(now);
  const upcoming = events.filter((e) => DAY(e.startDate) >= today).sort((a, b) => +a.startDate - +b.startDate);
  const past = events.filter((e) => DAY(e.startDate) < today).sort((a, b) => +b.startDate - +a.startDate);
  return { upcoming, past };
}
