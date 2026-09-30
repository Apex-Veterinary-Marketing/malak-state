# Malak Estate Group Site Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the veterinary Skeleton into The Malak Estate Group's real estate site. The homepage must match the approved V2 preview, and every page in the spec must be built with SEO copy, meta tags and JSON-LD.

**Architecture:**

- Keep the Skeleton's contracts: tokens only, the `src/lib/data/*` accessors, `BaseLayout` SEO and schema, and `phoneHref`.
- Re-skin through `tokens.css` and `fonts.css`.
- Rebuild the chrome (Header, Footer, MobileCallbar) to match V2.
- Add `brokers`, `listings`, `events` and `gallery` collections.
- Derive interior pages from the existing Skeleton pages and components, restyled, and build new pages where none exist.
- A new built-output checker, `check-seo`, is the test harness for every page's title, description, JSON-LD and vet-wording removal.

**Tech Stack:**

- Astro 7 with static output
- TypeScript
- Content Collections (zod)
- `@fontsource/playfair-display` and `@fontsource/manrope`
- Node 24 built-in test runner (`node --test`, native TypeScript stripping) for pure helpers
- puppeteer-core with the local Edge install (scratchpad only) for screenshots

**Spec:** `docs/superpowers/specs/2026-09-30-malak-estate-site-design.md` (approved 2026-09-30, including palette option A, the Luxury and Military/VA split, and the `brokers` rename).
**Visual reference:** `docs/design/homepage-variations/v2-fullscreen-menu.html`. The homepage must match it section for section.

## Global Constraints

- No literal colors, durations or easings in component or page CSS. Every value comes from `src/styles/tokens.css`, and `npm run check:tokens` must pass.
- Tier 1 palette values come from `npm run palette -- --main "#BFB6AF" --cta "#BFB6AF" --write`. They are never hand-edited.
- Every `tel:` link comes from `phoneHref(site)`. The visible number is always `site.phoneNumber` = `440.420.0580`; the dialed number is `+14404204549`.
- Pages and components read content only through `src/lib/data/*`.
- Motion is opt-in through `data-reveal` and `data-hover`. There are no per-component `prefers-reduced-motion` blocks.
- Breakpoints are the literals `900px` and `767px`.
- Meta titles are 60 characters or fewer after the suffix rule, and meta descriptions are 160 or fewer. Both are unique per page.
- Visible copy uses no em-dashes (—) and no en-dashes (–) as separators.
- No vet wording anywhere in the built site: Veterinar\*, pet(s), patient(s), "Dr.", hooman, paw.
- One label per intent: "Book a call" goes to `/schedule`, "Send a message" to the contact form, "View listings" to `/listings`, and the phone link is written as `440.420.0580`.
- Square corners (radius 0) everywhere except the circular review-platform icons.
- Blog storage is unchanged: `src/content/blog/`, `src/assets/blog/`, loader `*.{md,mdx}`. Schema changes to it are additive only.
- Agent-written copy is a draft for the client. Factual FAQ claims cite primary sources.
- Do all work on branch `feat/malak-site`, never on `main`. Commit at the end of each task.

## Review Focus

These are the conditions the spec implies that no task exercises on its own:

1. **Zero content in a collection.** No upcoming events, no testimonials, no listings (once the samples are deleted), or no gallery items. Every section that depends on one hides itself or shows its empty state, and never renders an empty heading. Tested in Tasks 9 and 10 by building with the collection emptied.
2. **An event dated today.** An event whose date is today counts as upcoming for the whole day, not past. Tested in Task 3 (`splitEvents`).
3. **Menu keyboard use.** Opening the full-screen menu, pressing Tab repeatedly, then Esc. Focus stays inside the overlay and returns to the MENU button. Tested in Task 5 (puppeteer script).
4. **Long listing text at 360px.** Long street addresses and prices like `$1,249,000` don't overflow the card or the facts row. Tested in Task 9 with a long-address sample listing.
5. **JSON-LD references across pages.** A cross-page `@id` (a listing's agent `/agents/marissa-lubera#person`) must match the profile page's node `@id` exactly, including the trailing slash. Tested by `check-seo` in Task 2, which resolves cross-page references against every built page.

---

## File Structure

| Path | Responsibility |
|---|---|
| `src/styles/tokens.css` | Generated Tier 1 palette. Tier 3 changes: radius 0, type scale, motion, header height, container. |
| `src/styles/fonts.css` | Playfair Display and Manrope imports |
| `src/data/site.ts` | Client config. New fields: `brokerageName`, `brokerageLicense`, `calendlyUrl`. |
| `src/data/idx.ts` | IDX slot snippets and `idxEnabled` |
| `src/content.config.ts` | Collections: `brokers`, `listings`, `events`, `gallery`, plus the existing ones minus `staff` |
| `src/lib/data/brokers.ts` `listings.ts` `events.ts` `gallery.ts` | Accessors |
| `src/lib/utils/events.ts` | Pure `splitEvents(events, now)` |
| `src/lib/utils/format.ts` | Pure `formatPrice`, `formatListingFacts`, `listingTitle` |
| `src/lib/schema/organization.ts` | `areaServedNode()` (county vs city), `parentOrganization`, breadcrumb `SEGMENTS` |
| `src/lib/schema/listing.ts` | Pure `listingSchema(listing, url)` |
| `tests/*.test.ts` | Unit tests for the pure helpers |
| `scripts/check-seo.mjs` | Built-output test: titles, descriptions, JSON-LD `@id` resolution, banned wording |
| `src/components/Header.astro` | V2 header and full-screen menu |
| `src/components/Footer.astro`, `MobileCallbar.astro` | Rebuilt chrome |
| `src/components/HomeHero.astro` `ServiceStrips.astro` `MissionQuote.astro` `MeetBroker.astro` `BuildersFeature.astro` `ListingGrid.astro` `ListingCard.astro` `ListingFacts.astro` `EventList.astro` `GalleryGrid.astro` `CalendlyEmbed.astro` `IdxEmbed.astro` `BookCall.astro` `BrokerCard.astro` `BrokerGrid.astro` | New UI units, one job each |
| `src/pages/**` | Routes per spec section 5 |
| `src/assets/brand/`, `src/assets/placeholders/` | Client photos and downloaded placeholder property photos |

---

### Task 1: Branch, palette, fonts, tokens

**Files:**
- Modify: `src/styles/tokens.css`
- Modify: `src/styles/fonts.css`
- Modify: `src/layouts/BaseLayout.astro` (the font preload imports)
- Modify: `package.json` (dependencies)

**Interfaces:**
- Produces these tokens, used by every later task:
  - `--font-heading: "Playfair Display", Georgia, serif`
  - `--font-body: "Manrope", system-ui, sans-serif`
  - `--font-size-5xl: 4.1rem`, `--font-size-2xl: 1.9rem`, `--font-size-xl: 1.5rem`
  - `--line-height-body: 1.75`
  - `--radius-sm/md/lg: 0`, `--radius-round: 50%`
  - `--header-height: 4.75rem`
  - `--container-max: 82.5rem`
  - `--letter-spacing-button: 0.08em`, `--letter-spacing-label: 0.14em`
  - `--motion-duration-reveal: 900ms`, `--motion-duration-menu: 800ms`, `--motion-duration-image: 1200ms`
  - `--scrim-strong: #1f1b18e0`, `--scrim-mid: #1f1b1899`, `--scrim-clear: #1f1b1800`. These are generated from `--main-dark`'s hue and documented as Tier 3 image scrims.
  - `--on-dark-muted: #ddd8d4` (body text on espresso)

- [ ] **Step 1: Create the branch**

Run: `git switch -c feat/malak-site`
Expected: `Switched to a new branch 'feat/malak-site'`

- [ ] **Step 2: Generate the palette**

Run: `npm run palette -- --main "#BFB6AF" --cta "#BFB6AF" --write`
Expected: the output lists `--main: #7c6e63`, `--cta: #bfb6af` and `--on-cta: var(--main-dark)`, and every contrast row passes. The only WARN is the advisory "cta on white".

- [ ] **Step 3: Install the fonts**

Run: `npm uninstall @fontsource/inter && npm install @fontsource/playfair-display @fontsource/manrope`

Replace the `@import` lines in `fonts.css` with the block below, and update the header comment's "Currently Inter" line to "Currently Playfair Display (headings) + Manrope (body)".

```css
@import "@fontsource/playfair-display/400.css";
@import "@fontsource/playfair-display/400-italic.css";
@import "@fontsource/manrope/400.css";
@import "@fontsource/manrope/500.css";
@import "@fontsource/manrope/600.css";
```

- [ ] **Step 4: Update the BaseLayout preloads**

Replace the two Inter imports and preload links with the ones below.

```ts
import manropeLatin400 from "@fontsource/manrope/files/manrope-latin-400-normal.woff2?url";
import playfairLatin400 from "@fontsource/playfair-display/files/playfair-display-latin-400-normal.woff2?url";
```

Also make these edits in `BaseLayout.astro`:

- Update the `<link rel="preload">` hrefs to the two new imports.
- Global body rule: `line-height: var(--line-height-body)`.
- Heading rule: `:where(h1…h6){ font-weight: 400; line-height: 1.12; }`.

- [ ] **Step 5: Edit Tier 3 tokens**

In `tokens.css`, set the values listed under Interfaces. Each new token gets a one-line comment saying what it's for. Set `--font-body` and `--font-heading` as listed.

- [ ] **Step 6: Run the token check**

Run: `npm run check:tokens && npm run test:palette`
Expected: both pass. If `check:tokens` flags a component's literal radius or font, fix it in that component with a token.

- [ ] **Step 7: Build**

Run: `npx astro build`
Expected: build completes; 28 pages.

- [ ] **Step 8: Commit**

```bash
git add -A src/styles src/layouts/BaseLayout.astro package.json package-lock.json
git commit -m "style: Malak palette, Playfair/Manrope, V2 tokens"
```

---

### Task 2: SEO test harness, unit-test runner, site config, schema helpers

**Files:**
- Create: `scripts/check-seo.mjs`
- Create: `tests/organization.test.ts`
- Modify: `src/lib/schema/organization.ts`
- Modify: `src/data/site.ts`
- Modify: `src/content/social-links/*` (delete `linkedin`, `tiktok`, `x`, `google`; keep `instagram` and `facebook`)
- Modify: `package.json` (scripts)

**Interfaces:**
- Produces:
  - `areaServedNode(name: string): { "@type": "AdministrativeArea" | "City"; name: string }`, exported from `organization.ts`.
  - The business node gains `parentOrganization` when `site.brokerageName` is set.
  - `SiteInfo` gains `brokerageName?`, `brokerageLicense?` and `calendlyUrl?`.
  - The npm scripts `test:unit` and `check:seo`, and `verify` now includes both.

- [ ] **Step 1: Write the failing unit test**

```ts
// tests/organization.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { areaServedNode } from "../src/lib/schema/areaServed.ts";

test("counties become AdministrativeArea", () => {
  assert.deepEqual(areaServedNode("Cuyahoga County"), { "@type": "AdministrativeArea", name: "Cuyahoga County" });
});
test("anything else stays a City", () => {
  assert.deepEqual(areaServedNode("Medina"), { "@type": "City", name: "Medina" });
});
test("trims and is case-insensitive about 'county'", () => {
  assert.deepEqual(areaServedNode("  lake county "), { "@type": "AdministrativeArea", name: "lake county" });
});
```

Put the helper in its own dependency-free file, `src/lib/schema/areaServed.ts`, so Node can import it without Astro. `organization.ts` re-exports it.

Add to `package.json`:

```json
"test:unit": "node --test tests/",
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm run test:unit`
Expected: FAIL, "Cannot find module …/areaServed.ts".

- [ ] **Step 3: Implement**

```ts
// src/lib/schema/areaServed.ts
// Service areas from site.ts: a county is an AdministrativeArea in schema.org, not a City.
export function areaServedNode(raw: string) {
  const name = raw.trim();
  return { "@type": /\bcounty\b/i.test(name) ? "AdministrativeArea" : "City", name } as const;
}
```

In `organization.ts`, make these changes:

- `export { areaServedNode } from "./areaServed";`
- Replace `areaServed: areas.map((name) => ({ "@type": "City", name }))` with `areas.map(areaServedNode)`.
- Add `parentOrganization: site.brokerageName ? { "@type": "Organization", name: site.brokerageName } : undefined` to the business node.
- Add these `SEGMENTS` entries:

```ts
agents: { name: "Meet Marissa", href: "/meet-the-team" },
listings: { name: "Listings" },
```

Also remove the `doctors` and `staff` entries.

In `src/pages/services/[slug].astro`, change `areas.map((name) => ({ "@type": "City", name }))` to `areas.map(areaServedNode)`.

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npm run test:unit`
Expected: 3 passing.

- [ ] **Step 5: Write `scripts/check-seo.mjs`**

The script checks the built site in `dist/` and exits 1 on the first run.

```js
// scripts/check-seo.mjs: built-output checks for every indexable page.
//   title: present, ≤ 60 chars, unique      description: present, ≤ 160, unique
//   JSON-LD: parses; every {"@id": X} reference resolves to a node @id on this page or another built page
//   copy: no vet wording and no em/en dashes in visible text
import fs from "node:fs";
import path from "node:path";

const DIST = "dist";
const BANNED = [/\bveterinar/i, /\bpets?\b/i, /\bpatients?\b/i, /\bDr\.\s/, /\bhooman\b/i, /\bpaws?\b/i];
const DASHES = /[\u2013\u2014]/;
const errors = [];
const pages = [];

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
  const p = path.join(dir, d.name);
  return d.isDirectory() ? walk(p) : d.name.endsWith(".html") ? [p] : [];
});

for (const file of walk(DIST)) {
  const html = fs.readFileSync(file, "utf8");
  if (/http-equiv="refresh"/i.test(html) && html.length < 2000) continue; // redirect stub
  const rel = "/" + path.relative(DIST, file).replace(/\\/g, "/").replace(/index\.html$/, "");
  const noindex = /<meta name="robots" content="[^"]*noindex/i.test(html);
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim() ?? "";
  const desc = html.match(/<meta name="description" content="([^"]*)"/)?.[1]?.trim() ?? "";
  const graphs = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => {
    try { return JSON.parse(m[1]); } catch { errors.push(`${rel}: JSON-LD does not parse`); return null; }
  }).filter(Boolean);
  const nodes = graphs.flatMap((g) => g["@graph"] ?? [g]);
  const ids = new Set(nodes.map((n) => n["@id"]).filter(Boolean));
  const refs = [];
  const collect = (v, top) => {
    if (Array.isArray(v)) return v.forEach((x) => collect(x, false));
    if (v && typeof v === "object") {
      if (!top && v["@id"] && Object.keys(v).length === 1) refs.push(v["@id"]);
      Object.values(v).forEach((x) => collect(x, false));
    }
  };
  nodes.forEach((n) => collect(n, true));
  const text = html
    .replace(/<script[\s\S]*?<\/script>/g, "")
    .replace(/<style[\s\S]*?<\/style>/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ");
  pages.push({ rel, noindex, title, desc, ids, refs, text });
}

const allIds = new Set(pages.flatMap((p) => [...p.ids]));
const seen = { title: new Map(), desc: new Map() };
for (const p of pages) {
  const is404 = p.rel.startsWith("/404");
  if (!p.title) errors.push(`${p.rel}: missing <title>`);
  else if (p.title.length > 60) errors.push(`${p.rel}: title ${p.title.length} chars > 60 ("${p.title}")`);
  if (!p.desc) errors.push(`${p.rel}: missing meta description`);
  else if (p.desc.length > 160) errors.push(`${p.rel}: description ${p.desc.length} chars > 160`);
  if (!p.noindex && !is404) {
    for (const [k, v] of [["title", p.title], ["desc", p.desc]]) {
      if (seen[k].has(v)) errors.push(`${p.rel}: duplicate ${k} (also on ${seen[k].get(v)})`);
      else seen[k].set(v, p.rel);
    }
  }
  for (const r of p.refs) if (!allIds.has(r)) errors.push(`${p.rel}: JSON-LD reference ${r} has no matching node`);
  for (const re of BANNED) { const m = p.text.match(re); if (m) errors.push(`${p.rel}: banned wording "${m[0]}"`); }
  if (DASHES.test(p.text)) errors.push(`${p.rel}: em/en dash in visible text`);
}

if (errors.length) { console.error(errors.map((e) => "✖ " + e).join("\n")); console.error(`\n${errors.length} SEO/copy error(s) across ${pages.length} pages`); process.exit(1); }
console.log(`✔ ${pages.length} pages: titles, descriptions, JSON-LD references and copy rules pass`);
```

Add to `package.json`:

```json
"check:seo": "node scripts/check-seo.mjs",
```

Append `&& npm run test:unit && npm run check:seo` to the end of `verify`.

- [ ] **Step 6: Run the harness and confirm it fails as expected**

Run: `npx astro build && npm run check:seo`
Expected: FAIL. It lists vet wording ("veterinary", "pet", "Dr.") and duplicate descriptions. That's correct; later tasks make it pass.

- [ ] **Step 7: Fill in `site.ts`**

Replace the `siteInfo` object with the one below. Add the three new optional fields to the `SiteInfo` interface, with comments.

```ts
export const siteInfo: SiteInfo = {
  practiceName: "The Malak Estate Group",
  phoneNumber: "440.420.0580",
  callTrackingNumber: "+14404204549",
  email: "marissa@malakestates.com",
  showStreetAddress: false, // intake: address TBD (cloud brokerage), confirm before publishing one
  cityState: "Northeast Ohio",
  serviceAreaOfCoverage: "Cuyahoga County, Medina County, Summit County, Stark County, Lake County, Lorain County",
  businessSchemaType: "RealEstateAgent",
  businessDescription:
    "The Malak Estate Group is a relationship-first real estate team led by Realtor Marissa Lubera, helping buyers, sellers and builders across Greater Cleveland and Northeast Ohio.",
  brokerageName: "Real of Ohio",
  calendlyUrl: "https://calendly.com/marissa-malakestates/30min",
  bookingUrl: "/schedule",
  bookingLabel: "Book a call",
  hours: "<p>Monday to Sunday: 8am to 8pm<br>Evenings by appointment</p>",
  openingHoursSpecification: [
    { dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "08:00", closes: "20:00" },
  ],
  footerAbout:
    "Honest guidance, clear communication and a plan built around your goals, for buyers, sellers and builders across Northeast Ohio.",
  url: "https://www.themalakestategroup.com",
  // googleReviewsLink: requested from client (Google Business Profile review URL)
};
```

Remove the `logoWhite` and `logoColor` placeholders. The Header renders a text wordmark until the client's logo arrives. Social links: `instagram.json` becomes `{ "icon": "instagram", "link": "https://www.instagram.com/themalakestategroup" }`. `facebook.json` is kept with a placeholder link and flagged in `check:launch` (Task 12).

- [ ] **Step 8: Run the unit tests and the type check**

Run: `npm run test:unit && npx astro check`
Expected: pass.

- [ ] **Step 9: Commit**

```bash
git add -A scripts/check-seo.mjs tests src/lib/schema src/data/site.ts src/content/social-links src/pages/services/[slug].astro package.json
git commit -m "feat: SEO harness, unit tests, client site config, county areaServed"
```

---

### Task 3: Content model (brokers, drop staff, listings, events, gallery)

**Files:**
- Modify: `src/content.config.ts`
- Rename: `src/content/doctors/` → `src/content/brokers/`. Delete the three example entries; create `marissa-lubera.md`.
- Delete: `src/content/staff/`, `src/lib/data/staff.ts`, `src/lib/data/doctors.ts`, `src/components/StaffCard.astro`, `StaffGrid.astro`, `DoctorCard.astro`, `DoctorGrid.astro`, `BeforeYourVisit.astro`, `src/data/visit-tips.ts`, `src/pages/staff/`, `src/pages/doctors/`
- Create: `src/lib/data/brokers.ts`, `listings.ts`, `events.ts`, `gallery.ts`
- Create: `src/lib/utils/events.ts`, `src/lib/utils/format.ts`
- Create: `tests/events.test.ts`, `tests/format.test.ts`
- Create: `src/content/listings/*.md` (three samples, `sample: true`), `src/content/gallery/*.json`
- Create: `src/content/events/` containing a `.gitkeep`
- Modify: `scripts/check-posts.mjs:26,84` (doctors → brokers), `docs/BLOG-POST-CONTRACT.md` (the `author` row)
- Copy: client photos into `src/assets/brand/`; download placeholder property photos into `src/assets/placeholders/`

**Interfaces:**
- Produces:
  - `getAllBrokers(): Promise<CollectionEntry<"brokers">[]>`, sorted by `order`
  - `getBrokerBySlug(slug)`
  - `getAllListings()`, sorted featured first, then active before pending before sold
  - `getFeaturedListings(limit = 3)`
  - `getListingBySlug(slug)`
  - `getAllEvents()`
  - `getGallery(album?: "brand" | "gather-and-ground" | "properties")`
  - `splitEvents<T extends { startDate: Date }>(events: T[], now: Date): { upcoming: T[]; past: T[] }`. Upcoming events are sorted ascending and past events descending. An event on the same calendar day as `now`, in America/New_York, counts as upcoming.
  - `formatPrice(n: number): string`. For example, `1249000` becomes `"$1,249,000"`.
  - `listingFacts(d: { beds: number; baths: number; sqft: number }): string`. For example, `"4 bd, 3 ba, 2,860 sq ft"`.
  - `listingTitle(d: { address: string; city: string; state: string }): string`. For example, `"123 Oak Ln, Medina, OH"`.

- [ ] **Step 1: Write failing tests**

```ts
// tests/events.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { splitEvents } from "../src/lib/utils/events.ts";

const e = (iso: string) => ({ name: iso, startDate: new Date(iso) });

test("same-day event (NY time) is still upcoming late that evening", () => {
  const now = new Date("2026-10-15T23:30:00-04:00");
  const { upcoming, past } = splitEvents([e("2026-10-15T18:00:00-04:00")], now);
  assert.equal(upcoming.length, 1); assert.equal(past.length, 0);
});
test("yesterday is past; ordering is soonest-first / most-recent-first", () => {
  const now = new Date("2026-10-15T09:00:00-04:00");
  const { upcoming, past } = splitEvents(
    [e("2026-11-12T18:00:00-05:00"), e("2026-10-14T18:00:00-04:00"), e("2026-10-20T18:00:00-04:00"), e("2026-09-10T18:00:00-04:00")], now);
  assert.deepEqual(upcoming.map((x) => x.name), ["2026-10-20T18:00:00-04:00", "2026-11-12T18:00:00-05:00"]);
  assert.deepEqual(past.map((x) => x.name), ["2026-10-14T18:00:00-04:00", "2026-09-10T18:00:00-04:00"]);
});
test("empty input", () => {
  assert.deepEqual(splitEvents([], new Date()), { upcoming: [], past: [] });
});
```

```ts
// tests/format.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatPrice, listingFacts, listingTitle } from "../src/lib/utils/format.ts";

test("formatPrice", () => {
  assert.equal(formatPrice(1249000), "$1,249,000");
  assert.equal(formatPrice(489000), "$489,000");
});
test("listingFacts handles half baths and thousands", () => {
  assert.equal(listingFacts({ beds: 3, baths: 2.5, sqft: 2140 }), "3 bd, 2.5 ba, 2,140 sq ft");
});
test("listingTitle", () => {
  assert.equal(listingTitle({ address: "123 Oak Ln", city: "Medina", state: "OH" }), "123 Oak Ln, Medina, OH");
});
```

- [ ] **Step 2: Run the tests and confirm they fail**

Run: `npm run test:unit`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement the helpers**

```ts
// src/lib/utils/events.ts: upcoming vs past for Gather & Ground. "Today" is judged in the client's time zone.
const DAY = (d: Date) => d.toLocaleDateString("en-CA", { timeZone: "America/New_York" }); // YYYY-MM-DD
export function splitEvents<T extends { startDate: Date }>(events: T[], now: Date) {
  const today = DAY(now);
  const upcoming = events.filter((e) => DAY(e.startDate) >= today).sort((a, b) => +a.startDate - +b.startDate);
  const past = events.filter((e) => DAY(e.startDate) < today).sort((a, b) => +b.startDate - +a.startDate);
  return { upcoming, past };
}
```

```ts
// src/lib/utils/format.ts: listing display strings (shared by cards, detail pages and schema)
const n = new Intl.NumberFormat("en-US");
export const formatPrice = (price: number) => `$${n.format(price)}`;
export const listingFacts = (d: { beds: number; baths: number; sqft: number }) => `${d.beds} bd, ${d.baths} ba, ${n.format(d.sqft)} sq ft`;
export const listingTitle = (d: { address: string; city: string; state: string }) => `${d.address}, ${d.city}, ${d.state}`;
```

- [ ] **Step 4: Run the tests and confirm they pass**

Run: `npm run test:unit`
Expected: all pass.

- [ ] **Step 5: Update the collections in `content.config.ts`**

1. Rename `doctors` to `brokers`, with base `./src/content/brokers`.
2. Add these optional fields to `brokers`:

```ts
title: z.string().optional(),
licenseNumber: z.string().optional(),
yearsExperience: z.number().optional(),
specialties: z.array(z.string()).default([]),
languages: z.array(z.string()).default([]),
serviceAreas: z.array(z.string()).default([]),
awards: z.array(z.object({ name: z.string(), years: z.string(), detail: z.string().optional() })).default([]),
order: z.number().default(0),
```

3. In the `blog` schema, change `author: reference("doctors")` to `reference("brokers")`, with a comment noting this fork's deviation.
4. Delete `staff`.
5. Add the new collections:

```ts
const listings = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/listings" }),
  schema: ({ image }) => z.object({
    address: z.string(), city: z.string(), state: z.string().default("OH"), zip: z.string(),
    status: z.enum(["active", "pending", "sold", "coming-soon"]).default("active"),
    price: z.number(), beds: z.number(), baths: z.number(), sqft: z.number(),
    lotSize: z.string().optional(), yearBuilt: z.number().optional(),
    propertyType: z.enum(["single-family", "condo-townhome", "new-construction", "land"]),
    mlsNumber: z.string().optional(),
    highlights: z.array(z.string()).default([]),
    images: z.array(z.object({ src: image(), alt: z.string() })).min(1),
    listingAgent: reference("brokers"),
    featured: z.boolean().default(false),
    externalUrl: z.string().url().optional(),
    metaTitle: z.string().optional(), metaDescription: z.string().optional(),
    sample: z.boolean().default(false), // placeholder entry: check:launch warns until removed
  }),
});
const events = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/events" }),
  schema: ({ image }) => z.object({
    name: z.string(), startDate: z.coerce.date(), endDate: z.coerce.date().optional(),
    venueName: z.string().optional(), venueAddress: z.string().optional(),
    image: image().optional(), imageAlt: z.string().optional(),
    rsvpUrl: z.string().url().optional(),
    status: z.enum(["scheduled", "cancelled", "postponed"]).default("scheduled"),
  }),
});
const gallery = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/gallery" }),
  schema: ({ image }) => z.object({
    image: image(), alt: z.string(), caption: z.string().optional(),
    album: z.enum(["brand", "gather-and-ground", "properties"]), order: z.number().default(0),
  }),
});
```

6. Export `collections = { brokers, serviceCategories, blogCategories, services, blog, socialLinks, testimonials, listings, events, gallery }`.

- [ ] **Step 6: Add the accessors**

`src/lib/data/brokers.ts`, `listings.ts`, `events.ts` and `gallery.ts` wrap `getCollection` and `getEntry` with the signatures under Interfaces. `events.ts` exports `getEventsSplit(now = new Date())`, which returns `splitEvents` over the scheduled events.

Update `scripts/check-posts.mjs` to read `src/content/brokers` in both places. The error text becomes "isn't a src/content/brokers/ id". Update the `author` row in `docs/BLOG-POST-CONTRACT.md` to match.

- [ ] **Step 7: Add content and assets**

Copy the client photos from `C:/Users/arman/Downloads/Malak Pictures/optimized/` into `src/assets/brand/`:

- `IMG_4036` → `marissa-doorway-wide.jpg`
- `IMG_4037` → `marissa-doorway.jpg`
- `IMG_4056` → `marissa-living-room.jpg`
- `IMG_4053` → `marissa-laptop-living-room.jpg`
- `IMG_4030` → `marissa-seated.jpg`
- `IMG_4016` → `marissa-seated-black.jpg`
- `IMG_4029` → `marissa-seated-wide.jpg`

Download these Unsplash photos into `src/assets/placeholders/`. They are the verified IDs from the mockups, fetched at `w=1800&q=80`:

- `house-colonial.jpg` (1570129477492)
- `house-modern-dusk.jpg` (1600585154340)
- `house-gable-dusk.jpg` (1568605114967)
- `house-new-build.jpg` (1600047509807)
- `house-white-modern.jpg` (1523217582562)
- `house-brick.jpg` (1449844908441)
- `interior-living.jpg` (1600607687939)
- `interior-warm.jpg` (1600210492486)
- `interior-stairs.jpg` (1600573472550)
- `interior-bedroom.jpg` (1616594039964)
- `interior-bath.jpg` (1600566752355)
- `community-table.jpg` (1519225421980)
- `community-flowers.jpg` (1511795409834)
- `community-friends.jpg` (1529156069898)

Add a `src/assets/placeholders/README.md`: "Unsplash stand-ins. Replace with client photos before launch; check:launch lists any still referenced."

Create `src/content/brokers/marissa-lubera.md`:

```md
---
name: "Marissa Lubera"
shortName: "Marissa"
title: "Realtor"
yearsExperience: 6
specialties: ["New construction", "First-time home buyers", "Relocation", "Senior downsizing"]
languages: ["English"]
serviceAreas: ["Cuyahoga County", "Medina County", "Summit County", "Stark County", "Lake County", "Lorain County"]
awards:
  - { name: "President's Club", years: "2023-2025", detail: "Top consultant in revenue and units sold in her division" }
  - { name: "Home Builder Award", years: "2023-2025" }
  - { name: "National KHAM Award", years: "2023-2024", detail: "In-house mortgage capture" }
  - { name: "Rookie of the Year", years: "2022" }
mainImage: "../../assets/brand/marissa-seated-black.jpg"
secondaryImage: "../../assets/brand/marissa-doorway.jpg"
imageAltText: "Marissa Lubera, Realtor, seated in a velvet chair"
showOnHome: true
order: 0
bioShort: "Realtor with six years across resale and new construction, serving buyers, sellers and builders across Greater Cleveland."
bio: |
  (Task 7 writes the full bio from the client's intake answers.)
---
```

Create three sample listings, `src/content/listings/sample-medina-gable.md`, `sample-strongsville-modern.md` and `sample-hudson-colonial-with-a-very-long-street-name.md`. Each has `sample: true` and `listingAgent: marissa-lubera`. Use the placeholder photos and the prices from the mockup: 624900, 489000 and 1249000. The third one's `address` is `"12450 Chagrin River Road West Extension"`, to exercise Review Focus 4.

Create the gallery entries: `brand-*.json` for the six brand photos, and `properties-*.json` for four property placeholders. Leave the `gather-and-ground` album empty until the client sends real photos.

- [ ] **Step 8: Remove the old routes and components**

Delete the files listed under Files. Fix the resulting imports:

- `meet-the-team.astro` now uses `BrokerGrid`, created in Task 6. Until then, make it a minimal page that renders `getAllBrokers()` names, so the build stays green.
- `blog/[slug].astro` changes its author lookup from `getDoctorBySlug` to `getBrokerBySlug`, and its link from `/doctors/` to `/agents/`.
- `organization.ts` `SEGMENTS` was already done in Task 2.

Add to `astro.config.mjs`:

```js
redirects: {
  "/doctors/[slug]": "/agents/[slug]",
  "/staff/[slug]": "/meet-the-team",
  "/online-forms": "/contact-us",
  "/appointment-request": "/schedule",
  "/general-information-request": "/contact-us",
},
```

Delete `src/pages/online-forms.astro`, `appointment-request.astro` and `general-information-request.astro`. `/schedule` is created in Task 11. Until then the redirect target returns 404, and `check:links` will flag it. That's expected and fixed in Task 11.

- [ ] **Step 9: Build and run the unit tests**

Run: `npm run test:unit && npx astro check && npx astro build`
Expected: pass. `check:links` isn't run yet (see Step 8).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: brokers/listings/events/gallery collections; drop staff and vet routes"
```

---

### Task 4: Shared primitives (buttons, page header, section, CTA, FAQ, embeds)

**Files:**
- Modify: `BaseLayout.astro` (global `.btn` classes), `PageHeaderBanner.astro`, `Section.astro`, `CtaBand.astro`, `FaqAccordion.astro`, `ServiceCard.astro`, `ServiceGrid.astro`, `TestimonialSlider.astro`, `ServicesSidebar.astro`, `FeatureSplit.astro`, `LocationSection.astro`, `GravityFormEmbed.astro` (styles only), `404.astro`
- Create: `src/components/CalendlyEmbed.astro`, `src/components/IdxEmbed.astro`, `src/data/idx.ts`, `src/components/ArrowLink.astro`

**Interfaces:**
- Global classes (from `BaseLayout`'s `is:global`):
  - `.btn`, `.btn--cta`, `.btn--line`, `.btn--line-light` (the light outline, for dark sections)
  - `.eyebrow`
  - `.container`, which is `max-width: var(--container-max)` plus the gutter
- `<ArrowLink href text />`
- `<PageHeaderBanner heading intro? image? imageAlt? eyebrow? />`. It uses the split layout when `image` is set and centers the text when it isn't. The H1 can italicize its last word: pass `heading="Real estate questions, *answered.*"` and the `*…*` is parsed into an `<em>`.
- `<CalendlyEmbed height? />`. It reads `site.calendlyUrl` and appends `?hide_gdpr_banner=1&background_color=ffffff&text_color=333333&primary_color=7c6e63`. The primary color is read from the tokens with the same regex BaseLayout uses for `theme-color`, never hard-coded. It lazy-loads an `<iframe loading="lazy">` with a visible fallback link, "Open the scheduler".
- `<IdxEmbed slot="search" />`. It reads `idxEmbeds[slot]` and re-runs scripts using the same technique as `GravityFormEmbed`. It renders nothing when the slot is empty or `idxEnabled` is false.
- `src/data/idx.ts` exports `idxEnabled = false` and `idxEmbeds: Record<string, string> = {}`, with a header comment copied in style from `forms.ts`.

- [ ] **Step 1: Global button and label classes**

Match the V2 mockup's `.btn`, `.btn--cta` and `.btn--line`:

- Uppercase Manrope 600
- `letter-spacing: var(--letter-spacing-button)`
- `padding: 1.05rem 1.9rem`
- Transitions use `--motion-duration-slow` and `--motion-ease`
- `:active` adds `translateY(1px)`

- [ ] **Step 2: PageHeaderBanner split layout**

- Grid `1fr 1fr` with `min-height: 70vh`.
- The left column has a `--solid-bg` background and `padding-top: calc(var(--header-height) + 3rem)`.
- The image is on the right, full height, `object-fit: cover`.
- Below 900px it stacks to one column: the image first at `50vh`, then the text.
- Without an image, it's a single centered column, left-aligned text at `max-width: 48rem`, on `--solid-bg`.

- [ ] **Step 3: Restyle the other components with V2 tokens**

- **Section:** padding `clamp(5rem, 10vw, 9rem)`; the dark tone uses `--main-dark` and `--on-dark-muted`.
- **CtaBand:** espresso background; a `.btn--cta` button.
- **FaqAccordion:** hairline dividers, a Playfair question at `1.25rem`, and a plus/minus marker drawn with CSS pseudo-elements. No icon font.
- **ServiceCard:** image, Playfair title, excerpt and an ArrowLink. No card box; spacing only.
- **TestimonialSlider:** one centered italic Playfair quote, with a Phosphor-free CSS quote mark rendered by `::before` with `content: "\201C"`.

- [ ] **Step 4: CalendlyEmbed and IdxEmbed**

Write both components per the Interfaces above.

- [ ] **Step 5: Check**

Run: `npm run check:tokens && npx astro check && npx astro build`
Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: V2 primitives (buttons, split page header, sections, FAQ, Calendly, IDX slot)"
```

---

### Task 5: Header (full-screen menu), footer, mobile call bar, reputation widget

**Files:**
- Rewrite: `src/components/Header.astro`
- Rewrite: `src/components/Footer.astro`
- Modify: `src/components/MobileCallbar.astro`
- Modify: `src/components/ReputationWidget.astro`
- Replace: `public/images/reputation/paw-like.svg` and `paw-dislike.svg` with `thumb-up.svg` and `thumb-down.svg`. These are simple single-path icons from Phosphor's MIT set, copied as files, not hand-drawn.
- Create (scratchpad only, not committed): `menu-a11y.mjs`

**Interfaces:**
- Consumes: `getSiteInfo`, `getServicesByCategory`, `getAllServiceCategories`, `getAllSocialLinks`, `phoneHref`, and the `.btn` classes.
- Header DOM contract, used by the test and by CSS:
  - `[data-header]` gets `.is-scrolled` from an IntersectionObserver sentinel, not a scroll listener.
  - `[data-menu-toggle]` has `aria-expanded` and `aria-controls="site-menu"`.
  - `#site-menu[role=dialog][aria-modal=true]`.
  - `document.body.classList` has `menu-open` while the menu is open.
  - `[data-modal-target="reputation-widget"]` is kept inside the menu (How'd We Do?).
- Menu contents, in order:
  - Large links: Home, Meet Marissa (`/meet-the-team`), Services (a `<details>` expanding to each category's services plus "All services"), Builders & Developers, Listings, Gather & Ground, Contact.
  - Secondary links: Photo Gallery, How'd We Do?, FAQ.
  - Contact row: Call (`phoneHref`, showing `site.phoneNumber`), Email, Follow (social links).
  - Image: `src/assets/brand/marissa-living-room.jpg` through `<Image>`, `object-position: 50% 35%`, hidden below 900px.
- Header bar: the wordmark "The *Malak* Estate Group" (a text wordmark until the logo arrives; if `site.logoColor` is set it's used instead), the "Book a call" link to `site.bookingUrl`, and the MENU button.
  - Background `--solid-bg`; white with a hairline when `.is-scrolled`; `--main-dark` while `menu-open`.
  - The header never sits on an image. Pages start below it, because PageHeaderBanner and HomeHero pad by `--header-height`.
- Footer: espresso, with these columns:
  - Brand: the wordmark, "Brokered by Real of Ohio", `site.footerAbout`.
  - Explore: Meet Marissa, Builders & Developers, Listings, Gather & Ground, Photo Gallery, FAQ.
  - Services: each service.
  - Contact: phone, email, hours, and the counties as a sentence.
  - Legal row: © year, the brokerage line, Privacy Policy, Terms of Use.
  - ReviewsBand stays mounted as it is today.
- MobileCallbar: Hours (modal), Meet Marissa (`icon-user` if it exists in the icon font; otherwise a Phosphor-derived SVG file in `public/images/icons/`), Call (the raised circle), Book (`site.bookingUrl`). The paw is removed.
- ReputationWidget: "How are we doing?", "Thank you!", the thumbs icons, and the button labels "Good" and "Could be better".

- [ ] **Step 1: Write the failing accessibility script (in the scratchpad)**

```js
// menu-a11y.mjs: run against `astro preview --port 4399`
import puppeteer from "puppeteer-core";
const b = await puppeteer.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: true });
const p = await b.newPage(); await p.setViewport({ width: 1440, height: 900 });
await p.goto("http://localhost:4399/", { waitUntil: "networkidle2" });
const fail = (m) => { console.error("FAIL:", m); process.exitCode = 1; };
await p.click("[data-menu-toggle]"); await new Promise((r) => setTimeout(r, 900));
if (!(await p.$eval("body", (b) => b.classList.contains("menu-open")))) fail("menu did not open");
for (let i = 0; i < 40; i++) await p.keyboard.press("Tab");
const inside = await p.evaluate(() => !!document.activeElement.closest("#site-menu, [data-header]"));
if (!inside) fail("focus escaped the open menu");
await p.keyboard.press("Escape"); await new Promise((r) => setTimeout(r, 900));
if (await p.$eval("body", (b) => b.classList.contains("menu-open"))) fail("Esc did not close");
if (!(await p.evaluate(() => document.activeElement.matches("[data-menu-toggle]")))) fail("focus not returned to toggle");
const expanded = await p.$eval("[data-menu-toggle]", (e) => e.getAttribute("aria-expanded"));
if (expanded !== "false") fail("aria-expanded not reset");
await b.close(); if (!process.exitCode) console.log("PASS menu a11y");
```

- [ ] **Step 2: Run it against the current build and confirm it fails**

Run: `npx astro build && (npx astro preview --port 4399 &) && node menu-a11y.mjs`
Expected: `FAIL: menu did not open` (the old header has no `#site-menu`).

- [ ] **Step 3: Implement the Header**

Port the mockup's header and overlay CSS, with every literal swapped for a token:

- `.header`, `.menu-btn`, `.overlay`, `.overlay__nav a.big` staggered with `--i`, `.overlay__meta`, `.overlay__img`.
- The clip-path open transition uses `--motion-duration-menu` and `--motion-ease-out`.

Script behavior:

- The toggle opens and closes the menu.
- A focus trap: Tab and Shift-Tab cycle through the focusables inside the header and `#site-menu`.
- Esc closes the menu.
- Clicking a link closes the menu.
- The How'd We Do? button closes the menu and then lets Modal open the widget.
- Body scroll locks while the menu is open.

- [ ] **Step 4: Run the script and confirm it passes**

Run: `npx astro build && node menu-a11y.mjs`
Expected: `PASS menu a11y`.

- [ ] **Step 5: Footer, MobileCallbar and ReputationWidget**

Implement per the Interfaces above.

- [ ] **Step 6: Visual check**

Take screenshots with the menu open and closed at 1440 and 390, the footer, and the reputation widget. Compare them against the mockup screenshots in the scratchpad (`menu-open-desk.png`, `menu-closed-desk.png`). The layouts and colors should match.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat: V2 full-screen menu header, footer, callbar; neutral reputation widget"
```

---

### Task 6: Homepage (must match the V2 preview)

**Files:**
- Rewrite: `src/pages/index.astro`
- Create: `src/components/HomeHero.astro`, `MissionQuote.astro`, `ServiceStrips.astro`, `MeetBroker.astro`, `BuildersFeature.astro`, `ListingGrid.astro`, `ListingCard.astro`, `GatherTeaser.astro`, `BookCall.astro`, `BrokerCard.astro`, `BrokerGrid.astro`
- Delete: `src/components/Hero.astro` (replaced by HomeHero), after confirming nothing else imports it with `grep -r "components/Hero" src`

**Interfaces:**
- `<HomeHero heading intro image imageAlt primary={{text,href}} secondary={{text,href}} />`, where `heading` supports the `*italic*` word syntax (shared helper `renderEmphasis(heading)` in `src/lib/utils/emphasis.ts`, which returns an HTML string with the `*x*` parts escaped into `<em>x</em>`).
- `<ServiceStrips items={{title, text, href, image, imageAlt}[]} />`. This is the V2 accordion: the first item is active, and mouseenter or focus activates an item. Titles are top-anchored at 62%. Below 900px the strips stack vertically.
- `<MeetBroker broker={CollectionEntry<"brokers">} />`. Portrait on the left. On the right: the H2 "Meet Marissa Lubera.", an intro paragraph, awards in a 2×2 grid, and an ArrowLink to `/agents/<id>`.
- `<BuildersFeature image imageAlt />`. A full-bleed image with a white panel at the bottom right, and a "Partner with Marissa" button linking to `/builders-developers`.
- `<ListingGrid listings layout="feature" | "grid" />`. `feature` is 1 large plus 2 stacked, as in V2. `grid` is 3 columns.
- `<ListingCard listing size="lg" | "sm" />`. Image, then price (`formatPrice`), city, and facts (`listingFacts`). When `sample` is true it shows the caption "Sample listing".
- `<GatherTeaser />`. Reads `getEventsSplit()` and `getGallery("gather-and-ground")`, falling back to the three community placeholder images. Shows the next event, or "Next gathering: announced monthly".
- `<BookCall />`. Espresso section with the H2 "Book a 30-minute call." and an intro. Lists phone (`phoneHref`), email and hours, the counties sentence, and CalendlyEmbed.

**Homepage content** (sections in V2 order, copy as in the mockup unless changed here):

1. **HomeHero**
   - H1: "Real estate, handled with *care.*"
   - Intro: "Personal strategy for buyers, sellers, and new construction across Northeast Ohio, from first conversation through closing."
   - Buttons: "Book a call" (`/schedule`), "View listings".
   - Image: `marissa-doorway-wide.jpg` at `object-position: 50% 45%`, loaded eagerly with `fetchpriority="high"`.
2. **MissionQuote**: "Honest guidance, clear communication, and an advocate who puts *your* interests first." with the label "Our mission".
3. **ServiceStrips**, headed "Every kind of move, one steady guide." Four strips:
   - Buying: "A strategy shaped around your budget, timeline, and the neighborhoods that fit your life."
   - Selling: "Pricing, preparation, and marketing tailored to your home and your street."
   - New construction: "Builder-side experience on your side of the table, from lot selection to final walkthrough."
   - Relocation & downsizing, linking to `/services/relocation`: "Moving to Northeast Ohio or into your next chapter, with every detail handled."
4. **MeetBroker** for `marissa-lubera`, with the intro: "With six years across resale and new construction, Marissa brings a well-rounded perspective to every move. What sets her apart is how invested she is in the people she serves: you'll feel informed, supported, and genuinely cared for."
5. **BuildersFeature** with `house-white-modern.jpg`. H2 "For builders and developers." Copy: "Greater Cleveland is building. Marissa's new-construction sales background and marketing-first approach help communities reach the buyers they were designed for."
6. **Featured homes**: ListingGrid in `feature` layout over `getFeaturedListings(3)`, with an ArrowLink "All listings". Hidden when there are no listings.
7. **TestimonialSlider**, only when `getAllTestimonials()` returns any.
8. **GatherTeaser**.
9. **BookCall**.

Homepage meta:

- `title="Northeast Ohio Realtor | The Malak Estate Group"` with `titleTemplate="full"`.
- The description is from spec section 5.
- `schemaGraph`:
  - An `ItemList` of the four service URLs with `"@id": "#services"`.
  - `{ "@id": "/agents/marissa-lubera#person" }` in the WebPage's `about` array, alongside `#business`. It's passed through `webPage={{ about: [{ "@id": "#business" }, { "@id": "/agents/marissa-lubera#person" }] }}`.

- [ ] **Step 1: Write the failing check**

Add a homepage structure assertion to `scripts/check-seo.mjs`. When `rel === "/"`, require these strings in order in the HTML:

- `data-home="hero"`
- `data-home="mission"`
- `data-home="services"`
- `data-home="meet"`
- `data-home="builders"`
- `data-home="book"`

Otherwise, push an error: "homepage section order differs from V2 preview".

Run: `npx astro build && npm run check:seo`
Expected: FAIL, including the homepage section-order error.

- [ ] **Step 2: Implement the components and the page**

Port the CSS for `.hero`, `.manifesto`, `.strips` and `.strip*`, `.meet` and `.awards`, `.builders` and `.builders__panel`, `.lgrid` and `.card`, `.gg__*`, `.quote`, `.book*` from `docs/design/homepage-variations/v2-fullscreen-menu.html` into the scoped styles of each component. Swap every hex for its token:

| Mockup literal | Token |
|---|---|
| `#f6f5f4` | `--solid-bg` |
| `#352f2b` | `--main-dark` |
| `#7c6e63` | `--main` |
| `#bfb6af` | `--cta` |
| `#d6d0cb` | `--cta-hover` |
| `#333333` | `--text` |
| `#796d63` | `--text-muted` |
| `#d1d1d1` | `--light-grey` |
| `#ddd8d4` / `#e3ded9` / `#cfc8c2` | `--on-dark-muted` |
| scrim gradients | `--scrim-*` |

Swap every `.3s`-style literal for a motion token. Each root element gets `data-home="…"` and `data-reveal` where the mockup reveals. The hero never gets `data-reveal`.

- [ ] **Step 3: Pass the check**

Run: `npx astro build && npm run check:seo 2>&1 | grep -i "homepage\|^/ :"`
Expected: no homepage errors. Errors on other pages remain, and are fixed in later tasks.

- [ ] **Step 4: Visual parity check**

Take full-page screenshots of `/` at 1440 and 390 with the preview server, and full-page screenshots of the mockup at the same widths. Compare them side by side. The section order, the split hero with the doorway photo, the strip layout, the Meet block, the builders panel, the listings layout and the booking section should all match. The allowed differences are real data (no testimonial when there are none) and the header, which is solid from the start. Fix any drift before committing.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: homepage built to the approved V2 preview"
```

---

### Task 7: Meet the team and the agent profile

**Files:**
- Rewrite: `src/pages/meet-the-team.astro`
- Create: `src/pages/agents/[slug].astro`
- Modify: `src/content/brokers/marissa-lubera.md` (full bio)

**Copy and SEO (spec section 5):**

`/meet-the-team`:

- H1 "The people behind The Malak Estate Group", with the intro "A relationship-first real estate team in Greater Cleveland."
- Image: `marissa-seated.jpg`.
- Sections:
  1. "What we stand for": the client's Mission, verbatim.
  2. "Where we're headed": the client's Vision, verbatim, with "NEO" written out as "Northeast Ohio".
  3. "How we work": the Core Values as a horizontal list.
  4. "What makes us different": the client's "What's unique" answer, verbatim with the typography fixed.
  5. The agent BrokerGrid.
  6. Recognition.
  7. BookCall.
- Meta per the spec.
- `webPage={{ "@type": "AboutPage" }}` with a `Person` reference.

`/agents/[slug]`:

- H1 is the broker's name, with the title "Realtor" as the intro line.
- Image: `mainImage`.
- The bio follows. Marissa's bio is composed from the client's "Why do clients choose you?" answer (first person, close to verbatim), plus a short intro paragraph about six years in resale and new construction and the six counties she serves.
- Then: a specialties list, areas served, languages, awards, and BookCall.
- Schema:

```ts
{ "@type": "Person", "@id": "#person", name, jobTitle: title, image: abs(mainImage), worksFor: { "@id": "#business" },
  award: awards.map(a => `${a.name} (${a.years})`), knowsLanguage: languages, knowsAbout: specialties,
  description: stripHtml(bioShort), url }
```

- `webPage={{ "@type": "ProfilePage", mainEntity: { "@id": "#person" } }}`.
- Breadcrumb: Home › Meet Marissa › Marissa Lubera.

- [ ] **Step 1: Run the checker and confirm it fails for these pages**

Run: `npx astro build && npm run check:seo | grep -E "meet-the-team|agents"`
Expected: FAIL. The page is missing (`/agents/marissa-lubera`), or the reference `/agents/marissa-lubera#person` from the homepage doesn't resolve.

- [ ] **Step 2: Implement the pages**

Build both pages per the copy above. The profile uses the spec's meta title "Marissa Lubera, Northeast Ohio Realtor" and its description.

- [ ] **Step 3: Check**

Run: `npx astro build && npm run check:seo | grep -E "meet-the-team|agents|^/ :"`
Expected: no errors for these routes. The homepage's `#person` reference now resolves.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: Meet the team and agent profile pages with Person schema"
```

---

### Task 8: Services (8 pages, 3 categories, index, category pages)

**Files:**
- Delete: `src/content/services/{dental-care,surgery,wellness-exams}.md`, `src/content/service-categories/{dental,surgery,wellness}.md`
- Create: `src/content/service-categories/{buying,selling,specialties}.md`
- Create: `src/content/services/{buying-a-home,selling-your-home,new-construction,relocation,first-time-home-buyers,senior-downsizing,luxury-homes,military-va-buyers}.md`
- Modify: `src/pages/services/index.astro`, `src/pages/services/[slug].astro`, `src/pages/services-categories/[slug].astro`, `src/components/ServicesSidebar.astro` (styling only)

Each service entry has these fields:

- `name`
- `serviceCategory`:
  - buying for buying-a-home, first-time-home-buyers, relocation and military-va-buyers
  - selling for selling-your-home and senior-downsizing
  - specialties for new-construction and luxury-homes
- `pageHeaderImage` (placeholder property photo, or a brand photo for senior-downsizing and relocation)
- `featured` (true for the four homepage strips)
- `featuredText` (a single-sentence summary)
- `metaTitle` and `metaDescription`, copied verbatim from spec section 5
- `contentBlocks`: 3 default blocks, each with an `<h2>`, then 1 `style: "cta"` block
- `faqs`: exactly 5

Body copy rules come from the spec's section 6.

**Research step.** This happens before writing FAQs. For each service, run WebSearch or WebFetch against primary sources, and put the source link inside the answer HTML, e.g. `<a href="…">Ohio Department of Commerce</a>`. Topics per service:

- **buying:** the Ohio purchase agreement and inspection contingency norms, and buyer agency agreements after the 2024 NAR settlement (source: nar.realtor).
- **selling:** the Ohio Residential Property Disclosure Form (source: ohio.gov / Ohio Division of Real Estate, ORC 5302.30), and seller concessions.
- **new-construction:** why to bring your own agent to a builder (a general explanation; no statistics), and builder warranties in Ohio (ORC 4722 home construction service contracts; source: codes.ohio.gov).
- **relocation:** Northeast Ohio counties overview (source: county sites), and Ohio property tax basics (source: tax.ohio.gov).
- **first-time buyers:** the Ohio Housing Finance Agency's first-time homebuyer programs (source: ohiohome.org), and the Closing Disclosure (source: consumerfinance.gov).
- **senior downsizing:** Ohio homestead exemption (source: tax.ohio.gov), and timing a sale and a purchase.
- **luxury:** privacy and showings; no statistics.
- **military-va:** VA loan entitlement, the funding fee and the VA appraisal (source: va.gov).

Each service page's `<h2>` sections follow "what it is and why it matters / what to expect / who it's for", in Marissa's voice and plain words. Name counties or towns in the opening paragraph.

**Schema.** The detail page already emits `Service` and `FAQPage`. Add `audience` to the Service node when the service is buyer or seller focused, e.g. `{ "@type": "Audience", audienceType: "Home buyers" }`, driven by a new optional frontmatter field `audience`. Add `audience: z.string().optional()` to the services schema.

- [ ] **Step 1: Run the checker and confirm the service pages fail**

Run: `npx astro build && npm run check:seo | grep services`
Expected: FAIL. Vet wording and old routes still appear.

- [ ] **Step 2: Research and write the eight entries and three categories**

Also restyle `services/index.astro`:

- H1 "Real estate services across Northeast Ohio".
- ServiceGrid grouped by category, with one heading per category.
- `schemaGraph`: an ItemList of the Service URLs.
- `webPage` `@type` is CollectionPage.

The category page H1 is "{Category} services". Its meta description is written per category:

- **Buying:** "Buying help for every situation: first home, relocation, VA loans and more, across Greater Cleveland with Realtor Marissa Lubera."
- **Selling:** "Selling help for every situation, from pricing and preparation to downsizing, across Greater Cleveland with Realtor Marissa Lubera."
- **Specialties:** "New construction and luxury real estate across Northeast Ohio, with Realtor Marissa Lubera's builder-side experience on your side."

- [ ] **Step 3: Check the services**

Run: `npx astro build && npm run check:seo | grep services; npm run check:launch 2>&1 | grep -i faq`
Expected: no `/services` errors, and no "fewer than 5 FAQs" warnings.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: eight real estate service pages with sourced FAQs"
```

---

### Task 9: Listings (index, detail, IDX slot, schema)

**Files:**
- Create: `src/pages/listings/index.astro`, `src/pages/listings/[slug].astro`, `src/components/ListingFacts.astro`, `src/lib/schema/listing.ts`, `tests/listing-schema.test.ts`

**Interfaces:**
- `listingSchema(d: ListingData & { images: { src: string; alt: string }[] }, pageUrl: string, agentId: string)`. It returns the `RealEstateListing` node:

```ts
{ "@type": "RealEstateListing", "@id": "#listing", name: listingTitle(d), url: pageUrl,
  image: d.images.map(i => i.src), datePosted?: undefined,
  offers: { "@type": "Offer", price: d.price, priceCurrency: "USD", availability: d.status === "sold" ? "https://schema.org/SoldOut" : "https://schema.org/InStock" },
  about: { "@type": d.propertyType === "condo-townhome" ? "Apartment" : d.propertyType === "land" ? "Landform" : "SingleFamilyResidence",
           address: { "@type": "PostalAddress", streetAddress: d.address, addressLocality: d.city, addressRegion: d.state, postalCode: d.zip },
           numberOfRooms: d.beds, numberOfBathroomsTotal: d.baths,
           floorSize: { "@type": "QuantitativeValue", value: d.sqft, unitCode: "FTK" } },
  provider: { "@id": agentId } }
```

For `land`, leave out `numberOfRooms`, `numberOfBathroomsTotal` and `floorSize`.

- [ ] **Step 1: Write the failing test**

```ts
// tests/listing-schema.test.ts
import { test } from "node:test";
import assert from "node:assert/strict";
import { listingSchema } from "../src/lib/schema/listing.ts";
const base = { address: "1 Elm St", city: "Medina", state: "OH", zip: "44256", price: 624900, beds: 4, baths: 3, sqft: 2860,
  status: "active", propertyType: "single-family", images: [{ src: "https://x/a.jpg", alt: "a" }] } as const;

test("single-family listing node", () => {
  const n = listingSchema(base as any, "https://site/listings/x", "/agents/marissa-lubera#person");
  assert.equal(n["@type"], "RealEstateListing");
  assert.equal(n.offers.price, 624900);
  assert.equal(n.about["@type"], "SingleFamilyResidence");
  assert.equal(n.about.floorSize.value, 2860);
  assert.deepEqual(n.provider, { "@id": "/agents/marissa-lubera#person" });
});
test("sold listing is SoldOut; land omits rooms/size", () => {
  const n = listingSchema({ ...base, status: "sold", propertyType: "land" } as any, "u", "a");
  assert.equal(n.offers.availability, "https://schema.org/SoldOut");
  assert.equal(n.about.numberOfRooms, undefined);
  assert.equal(n.about.floorSize, undefined);
});
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm run test:unit`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `listing.ts`**

Write the function per Interfaces. It imports `listingTitle` from `../utils/format.ts`, and it must not import Astro.

- [ ] **Step 4: Run the test and confirm it passes**

Run: `npm run test:unit`
Expected: pass.

- [ ] **Step 5: Build the pages**

`/listings`:

- PageHeaderBanner with H1 "Featured listings" and the intro "Homes Marissa is proud to represent across Greater Cleveland."
- `<IdxEmbed slot="search" />`.
- ListingGrid in `grid` layout, with status filter chips (All, Active, Pending, Sold). The chips are client-side, hide cards through `data-status`, and only render when more than one status is present.
- Empty state, when there are no listings: "New listings are on the way. Book a call and Marissa will send you homes that match what you're looking for." with a "Book a call" button.
- BookCall.
- `schemaGraph`: an ItemList of the listing URLs. `webPage` is CollectionPage.

`/listings/[slug]`:

- A gallery: the large first image plus a strip of thumbnails, opening the lightbox from GalleryGrid (built in Task 10; until then, plain images).
- Title: `listingTitle`.
- ListingFacts, a row of large numbers: price, beds, baths, sq ft, year built.
- Highlights list, then the description (the markdown body).
- A "Schedule a showing" button to `/schedule?listing=<slug>`. `?listing` is informational only; Calendly ignores it.
- The agent card, and "View on MLS" when `externalUrl` is set.
- When `sample` is true, the caption "Sample listing shown for layout. Real listings coming soon."

Meta: `metaTitle` or `listingTitle(d)`. Description: `metaDescription`, or `${listingFacts(d)} ${typeLabel} in ${d.city}, OH. Listed by Marissa Lubera, The Malak Estate Group.`, capped at 160 characters by dropping the last sentence if it runs over.

- [ ] **Step 6: Check, including the long address at 360px**

Run: `npx astro build && npm run check:seo | grep listings`
Expected: no errors.

Take a screenshot of `/listings/sample-hudson-colonial-with-a-very-long-street-name` and `/listings` at 360 px width. Confirm there's no horizontal overflow, using `scrollWidth - innerWidth === 0` in puppeteer. That covers Review Focus 4.

- [ ] **Step 7: Confirm the empty state (Review Focus 1)**

Temporarily move `src/content/listings/*.md` out of the folder and run `npx astro build`. Confirm three things:

- the homepage shows no "Featured homes" section;
- `/listings` shows the empty state;
- `check:seo` passes.

Restore the files afterwards.

- [ ] **Step 8: Commit**

```bash
git add -A && git commit -m "feat: listings index/detail with RealEstateListing schema and IDX slot"
```

---

### Task 10: Gather & Ground, and Photo Gallery

**Files:**
- Create: `src/pages/gather-and-ground.astro`, `src/components/EventList.astro`, `src/components/GalleryGrid.astro`
- Rewrite: `src/pages/photo-gallery.astro`

**Interfaces:**
- `<EventList events={CollectionEntry<"events">[]} emptyText />`. Each event shows a date block (month abbreviation and day), the name, venue, time, and an "RSVP" link when `rsvpUrl` is set.
- `<GalleryGrid items={CollectionEntry<"gallery">[]} />`. A CSS-columns masonry layout. Each item is a `<button>` that opens the existing `Modal` (a new `id="gallery-lightbox"`) with the large image and its caption. Arrow keys move between images, and Esc closes the lightbox, using Modal's existing handling.

**`/gather-and-ground`:**

- H1 "Gather & Ground".
- Intro: "A monthly community gathering Marissa co-sponsors, bringing Greater Cleveland neighbors around one table to connect and give back."
- Image: `community-table.jpg`.
- Sections:
  1. "What Gather & Ground is": two short paragraphs, drafted. They mention that it's co-sponsored by two local businesses, with the partner's name to be confirmed.
  2. "Upcoming gatherings": EventList of `upcoming`. Empty text: "The next gathering is announced monthly. Follow @themalakestategroup on Instagram for dates."
  3. "Past gatherings": EventList of past events, if any, plus GalleryGrid of the `gather-and-ground` album. The whole section is hidden when both are empty.
  4. BookCall.
- Schema: one `Event` node per upcoming event:

```ts
{ "@type": "Event", "@id": `#event-${id}`, name, startDate: iso, endDate?, eventStatus: `https://schema.org/Event${status === "scheduled" ? "Scheduled" : status === "cancelled" ? "Cancelled" : "Postponed"}`,
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  location: { "@type": "Place", name: venueName, address: venueAddress }, organizer: { "@id": "#business" }, image? }
```

- When gallery images exist, add an `ImageGallery` node. `webPage` is CollectionPage.

**`/photo-gallery`:**

- H1 "Photo gallery", with the intro "Homes, client moments and community gatherings across Greater Cleveland."
- Album tabs: All, Brand, Gather & Ground, Properties. A tab only renders when its album has items.
- GalleryGrid.
- An `ImageGallery` schema node with `associatedMedia` holding each image's ImageObject (url, caption).

- [ ] **Step 1: Run the checker and confirm the missing route fails**

Run: `npx astro build && npm run check:links`
Expected: FAIL. A nav or footer link to `/gather-and-ground` has no page.

- [ ] **Step 2: Implement both pages and both components**

- [ ] **Step 3: Test the event states (Review Focus 1 and 2)**

Create a temporary `src/content/events/test-today.md` dated today at 18:00 America/New_York. Build and confirm it appears under "Upcoming gatherings" and in the `Event` JSON-LD. Delete the file, rebuild, and confirm the empty text shows and `check:seo` passes.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: Gather & Ground events page and photo gallery with lightbox"
```

---

### Task 11: Builders & Developers, Contact, Schedule, FAQ, legal, search, blog, 404

**Files:**
- Create: `src/pages/builders-developers.astro`, `src/pages/schedule.astro`, `src/data/site-faqs.ts`
- Rewrite: `src/pages/contact-us.astro`, `src/pages/faq.astro`, `src/pages/privacy-policy.astro` (vet wording only; keep the structure), `src/pages/404.astro`, `src/pages/search.astro` (styling), `src/pages/blog/index.astro`, `src/pages/blog/[slug].astro`, `src/pages/blog-categories/[slug].astro` (styling and copy)
- Modify: `src/pages/terms-of-use.astro` (add `noindex` until the client supplies terms)
- Replace: `src/content/blog/example-post.md` and `src/content/blog-categories/pet-health.md` with `src/content/blog-categories/buying-and-selling.md`, and no posts. `src/assets/blog/` keeps its folder with a `.gitkeep`. `check-posts` requires the folder to exist; confirm it still passes with zero posts.

**`/builders-developers`** (the client's direct request):

- H1: "Builders: your community deserves a sharper launch".
- Intro: "New development is reshaping Greater Cleveland. Many projects never reach the buyers they were built for."
- Image: `house-new-build.jpg`.
- Sections:
  1. "Why builder experience matters on the listing side": Marissa's years inside new-construction sales, the Home Builder Award 2023-2025 and President's Club, and what she saw working on the builder side. Built from the client notes, drafted.
  2. "What I bring to your project", as three items with a heading and one sentence each:
     - Positioning and pricing strategy
     - Launch marketing for single homes and full communities
     - Buyer guidance from first visit through closing
  3. "How we'd work together": a four-step flow. Each step is labeled by its verb (Walk the project, Position and price, Launch, Sell through). No "Step 1" labels.
  4. 5 FAQs aimed at builders, e.g. "Do you represent single spec homes or only full communities?" None of them contain factual claims that would need sources.
  5. A closing section, "Let's talk about your project", with "Book a call" and the phone number.
- Schema:
  - `Service` with `name: "New construction listing and marketing"`, `audience: { "@type": "BusinessAudience", audienceType: "Home builders and developers" }`, `provider #business`, and `areaServed` from the counties.
  - `FAQPage`.

**`/contact-us`:**

- H1 "Let's talk about your next move", with the intro "Call, email, or send a message. Marissa replies personally."
- Image: `marissa-laptop-living-room.jpg`.
- A two-column body. On the left, the contact details: phone (`phoneHref`), email, hours, and the counties. On the right, `GravityFormEmbed formId="contact"` with the heading "Send a message".
- Below: a "Prefer to pick a time?" band with "Book a call".
- `LocationSection` is removed, because there's no public address.
- `webPage` `@type` is ContactPage.

**`/schedule`:**

- H1 "Book a *30-minute* call", with the intro "Pick a time that suits you. No pressure, just a clear next step."
- No image.
- Body: CalendlyEmbed at 760px tall, with a narrow side column "What we'll cover" (3 short lines) and "Prefer to talk now?" with the phone number.
- `webPage={{ potentialAction: { "@type": "ScheduleAction", target: site.calendlyUrl } }}`.

**`/faq`:**

- Source: `src/data/site-faqs.ts` exports `siteFaqs: { question: string; answer: string }[]`. That's 8 general real estate questions with sources, researched as in Task 8:
  - Who pays the buyer's agent after the 2024 NAR settlement? (nar.realtor)
  - What are typical closing costs for buyers in Ohio? (consumerfinance.gov and general ranges; no invented numbers)
  - How long does closing take?
  - Do I need a Realtor for new construction?
  - What is the Ohio Residential Property Disclosure Form? (ORC 5302.30)
  - Can I buy and sell at the same time?
  - What areas do you serve?
  - How do I get started? ("Book a call")
- The page shows them in groups (Buying, Selling, Working with Marissa), followed by an ArrowLink to each service page.
- Schema: `FAQPage` over `siteFaqs`. It no longer aggregates the service FAQs, because those already carry FAQPage on their own pages and duplicating them would compete.

**Privacy policy:** replace the vet wording with "real estate services" and "clients". Set `effectiveDate` to the launch date placeholder that `check:launch` already flags.

**404:** H1 "This page has moved", with links to Home, Listings and "Book a call".

**Blog pages:** H1 "Buying & selling insights". When there are no posts, show "Articles are coming soon." with an ArrowLink to Services. Breadcrumb label "Blog" is kept, and the nav stays unchanged: the blog isn't linked.

- [ ] **Step 1: Run the full checks and confirm what fails**

Run: `npx astro build && npm run check:seo && npm run check:links`
Expected: FAIL on the remaining pages, and the `/schedule` redirect target is missing.

- [ ] **Step 2: Implement every page listed**

- [ ] **Step 3: Run the full verify**

Run: `npm run verify`
Expected: PASS. That covers `astro check`, `check:posts`, `check:tokens`, `test:palette`, build, `check:links`, `test:unit` and `check:seo`.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat: builders, contact, schedule, FAQ, legal, blog and 404 pages"
```

---

### Task 12: Launch checks, social image, favicon, docs

**Files:**
- Modify: `scripts/check-launch.mjs`, `wrangler.jsonc`, `AGENTS.md` (a "This fork" section at the top)
- Replace: `public/og-default.png` (1200×630), `public/favicon.png` (32×32), `public/favicon.ico`, `public/apple-touch-icon.png` (180×180)
- Create: `scripts/make-brand-images.mjs`. This is a one-off script using `sharp`, which Astro already includes as a dependency.

**Interfaces:**
- `check-launch.mjs` gains these warnings (!):
  - sample listings remain (any listing with `sample: true`)
  - `src/assets/placeholders/` is still referenced by any `src/content` or `src/pages` file
  - the testimonials collection is empty
  - the Facebook social link is still a placeholder (contains `example`)
  - `site.brokerageLicense` is unset
  - `idxEnabled` is false (informational)
- It also fails (✖) on any event whose date is in the past while its status is still "scheduled" and it has no gallery photos. That's a reminder to add photos or delete the event.

- [ ] **Step 1: Write the failing check**

Run `npm run check:launch` before the change. It should currently report nothing about sample listings; that's the missing warning.

- [ ] **Step 2: Add the checks and confirm them**

Run: `npm run check:launch`
Expected: the new "sample listing" and "placeholder images" warnings appear, alongside the existing ✖ items for forms and the Worker name.

- [ ] **Step 3: Brand images**

The script builds:

- The OG image: `marissa-doorway-wide.jpg` cropped to 1200×630 (`fit: cover`, `position: attention`), with a left `--main-dark` panel set to the wordmark and the line "Northeast Ohio Realtor". The text is rendered as an SVG overlay in Playfair; the TTF comes from `@fontsource/playfair-display/files`.
- The favicon PNGs: an "M" in Playfair on `--main-dark`, at 32 and 180 px.
- The `.ico`, generated from the 32 px PNG using the same method as the existing `scripts/generate-placeholder-assets.mjs`.

Colors are read from `tokens.css` with the regex BaseLayout uses. Run it once and commit the outputs.

- [ ] **Step 4: `wrangler.jsonc` and AGENTS.md**

Leave `"name": "skeleton"` in `wrangler.jsonc`, because the Worker name hasn't come from you yet and `check:launch` keeps flagging it. Add the comment `// TODO(client): set to the Cloudflare Worker name`.

Add the "This fork" section to AGENTS.md. It lists:

- the brokers, listings, events and gallery collections;
- the IDX slot (`src/data/idx.ts`);
- the redirects;
- the `check:seo` and `test:unit` scripts;
- the blog `author` field now pointing at `brokers`;
- the banned-wording list.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: launch checks, brand OG/favicon, fork notes"
```

---

### Task 13: Full verification and visual review

- [ ] **Step 1: Run the full verify**

Run: `npm run verify`
Expected: PASS end to end.

- [ ] **Step 2: Screenshots**

Use the scratchpad `shoot.mjs`, pointed at `astro preview`. Take full-page screenshots of every route in spec section 5 at 1440, 900 and 360 px widths. Check each one for these problems:

- a header overlapping content;
- text on images with poor contrast;
- phone numbers or display headings that wrap;
- horizontal overflow (assert 0 for every route and width);
- empty sections.

Fix anything found and re-run Step 1.

- [ ] **Step 3: Homepage against the V2 preview**

Put the 1440 px screenshots of `/` and the mockup next to each other for a final comparison.

- [ ] **Step 4: Run the launch report**

Run: `npm run check:launch`
Expected: only the client-dependent items from spec section 10 remain.

- [ ] **Step 5: Commit any fixes**

```bash
git add -A && git commit -m "fix: visual review pass"
```
