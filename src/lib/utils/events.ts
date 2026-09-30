// Upcoming vs past for Gather & Ground. "Today" is judged in the client's time zone,
// so an evening event stays upcoming for its whole day. Dependency-free (unit-tested).
const DAY = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "America/New_York" }); // YYYY-MM-DD

const TZ = "America/New_York";

// Minutes that New York is behind UTC at a given instant (240 in EDT, 300 in EST).
function nyOffsetMinutes(at: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: TZ, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      .formatToParts(at)
      .map((p) => [p.type, p.value])
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return Math.round((at.getTime() - asUtc) / 60000);
}

// Event dates as editors write them in frontmatter. A value with an explicit
// offset or "Z" is used as-is; a date-only value ("2026-10-15") or a date-time
// without an offset ("2026-10-15T18:00", "2026-10-15 18:00") is New York wall
// time, never UTC (zod's plain coerce.date would shift those by 4-5 hours).
export function parseEventDate(raw: string | Date): Date {
  if (raw instanceof Date) return raw;
  const s = raw.trim();
  if (/(Z|[+-]\d{2}:?\d{2})$/i.test(s)) return new Date(s);
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!m) return new Date(s);
  const [, y, mo, d, h = "0", mi = "0", se = "0"] = m;
  const wall = Date.UTC(+y, +mo - 1, +d, +h, +mi, +se);
  const firstGuess = nyOffsetMinutes(new Date(wall));
  const offset = nyOffsetMinutes(new Date(wall + firstGuess * 60000)); // re-check across DST changes
  return new Date(wall + offset * 60000);
}

// Frontmatter values reach the schema already parsed by YAML: an unquoted
// `2026-10-15` or `2026-10-15 18:00` becomes a Date at that wall time in UTC.
// Reread those UTC components as New York wall time. Quoted strings go through
// parseEventDate, so write an explicit offset in quotes when one is needed.
export function normalizeFrontmatterDate(value: string | Date): Date {
  if (!(value instanceof Date)) return parseEventDate(value);
  const iso = value.toISOString(); // YYYY-MM-DDTHH:MM:SS.sssZ
  return parseEventDate(`${iso.slice(0, 10)}T${iso.slice(11, 19)}`);
}

export function splitEvents<T extends { startDate: Date }>(events: T[], now: Date) {
  const today = DAY(now);
  const upcoming = events.filter((e) => DAY(e.startDate) >= today).sort((a, b) => +a.startDate - +b.startDate);
  const past = events.filter((e) => DAY(e.startDate) < today).sort((a, b) => +b.startDate - +a.startDate);
  return { upcoming, past };
}
