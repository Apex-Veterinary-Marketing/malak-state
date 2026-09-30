// Read a Tier 1 hex token (e.g. --main: #7c6e63) out of tokens.css source,
// for places that need a raw color outside CSS (Calendly's URL parameters).
// Returns the 6 hex digits without "#", or undefined. Dependency-free (unit-tested).
export function tokenHex(css: string, name: string): string | undefined {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return css.match(new RegExp(String.raw`--${escaped}:\s*#([0-9a-fA-F]{6})\b`))?.[1];
}
