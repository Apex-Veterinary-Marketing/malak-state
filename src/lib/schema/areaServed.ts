// Service areas from site.ts: a county is an AdministrativeArea in schema.org, not a City.
// Dependency-free so the unit tests (node --test) can import it without Astro.
export function areaServedNode(raw: string) {
  const name = raw.trim();
  return { "@type": /\bcounty\b/i.test(name) ? "AdministrativeArea" : "City", name } as const;
}
