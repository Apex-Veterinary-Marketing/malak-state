#!/usr/bin/env node
/**
 * Pre-launch gate for a client fork: `npm run check:launch`.
 *
 * NOT part of `verify` — the template itself is all placeholders and would
 * fail by design. Run it in a client fork before sending the site for
 * approval and again before DNS moves. Each check below exists because a real
 * launch shipped (or nearly shipped) with that problem.
 *
 * Errors (✖) exit 1. Warnings (!) are listed for a human decision.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const errors = [];
const warnings = [];
const read = (p) => (fs.existsSync(p) ? fs.readFileSync(p, "utf8") : "");

// Placeholder file hashes (sha256, first 16 hex; .svg normalized to LF).
// Regenerating the placeholders means updating these.
const PLACEHOLDERS = {
  "public/favicon.png": "f78ed8687b8f87d2",
  "public/favicon.ico": "a044f36f7d0cb0fe",
  "public/apple-touch-icon.png": "5efa167d2b94c8b3",
  "public/og-default.png": "62dd8714207bb21b",
  "public/logo-color.svg": "1914f5e37a9d0fdb",
  "public/logo-white.svg": "d789206c136d83b8",
};
const hash = (p) => {
  let buf = fs.readFileSync(p);
  if (p.endsWith(".svg")) buf = Buffer.from(buf.toString("utf8").replace(/\r\n/g, "\n"));
  return crypto.createHash("sha256").update(buf).digest("hex").slice(0, 16);
};

// 1. site.ts — real domain and business details.
const site = read("src/data/site.ts");
const field = (name) => site.match(new RegExp(`^\\s*${name}:\\s*"([^"]*)"`, "m"))?.[1];
const url = field("url");
if (!url || /example\.com/.test(url)) errors.push(`site.ts url is "${url}" — set the confirmed production domain (apex vs www confirmed with the client).`);
for (const [name, value] of [["practiceName", field("practiceName")], ["phoneNumber", field("phoneNumber")], ["email", field("email")], ["addressLine2", field("addressLine2")]]) {
  if (value && /\[|000\) 000|example\.com/.test(value)) errors.push(`site.ts ${name} is still a placeholder ("${value}").`);
}
for (const name of ["googleReviewsLink", "facebookReviewsLink", "yelpReviewLink"]) {
  const value = field(name);
  if (value && /example/.test(value)) errors.push(`site.ts ${name} is a placeholder — set the real link or remove it.`);
}
// Malak: the How'd We Do? widget needs at least one review link (the client has Google, no Facebook).
if (!["googleReviewsLink", "facebookReviewsLink", "yelpReviewLink"].some((n) => field(n))) errors.push(`site.ts has no review link — the How'd We Do? widget would offer nowhere to leave a review.`);
if (!/^\s*businessSchemaType:/m.test(site)) warnings.push(`site.ts businessSchemaType is unset (defaults to VeterinaryCare) — confirm the business type.`);
if (/^\s*mobileVet:\s*true/m.test(site) && !/^\s*showStreetAddress:/m.test(site)) warnings.push(`mobileVet is true, so the street address is hidden by default — confirm with the client (showStreetAddress).`);
if (!/^\s*callTrackingNumber:/m.test(site)) warnings.push(`No callTrackingNumber in site.ts — confirm the client has no call-tracking number.`);
if (process.env.SITE_URL) warnings.push(`SITE_URL is set (${process.env.SITE_URL}) — that makes a noindexed preview build. Remove it at launch.`);

// 2. Brand assets — client files, not the generated placeholders.
for (const [file, placeholder] of Object.entries(PLACEHOLDERS)) {
  if (fs.existsSync(file) && hash(file) === placeholder) {
    const isLogo = file.includes("logo-");
    (isLogo ? warnings : errors).push(`${file} is still the template placeholder${isLogo ? " (fine if site.ts points the logos elsewhere)" : ""}.`);
  }
}
if (fs.existsSync("public/favicon.svg")) errors.push(`public/favicon.svg exists — browsers prefer it over the PNG favicon. Delete it unless it's the client's real mark (then link it in SeoHead).`);

// 3. Forms — every embedded formId has a real snippet.
const formsSrc = read("src/data/forms.ts").split("\n").filter((l) => !l.trim().startsWith("//")).join("\n");
const configured = new Set([...formsSrc.matchAll(/^\s*"?([\w-]+)"?\s*:\s*`/gm)].map((m) => m[1]));
const used = new Map();
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (p.endsWith(".astro")) {
      for (const m of read(p).matchAll(/formId="([^"]+)"/g)) used.set(m[1], p);
    }
  }
})("src");
for (const [id, file] of used) {
  if (!configured.has(id)) errors.push(`Form "${id}" (${file}) has no embed in src/data/forms.ts — it would render the placeholder.`);
}

// 4. Deploy — the Worker name must match the Cloudflare dashboard.
const wrangler = read("wrangler.jsonc");
if (!wrangler) errors.push(`wrangler.jsonc is missing — Cloudflare would deploy its "Hello World" stub.`);
else if (/"name":\s*"skeleton"/.test(wrangler)) errors.push(`wrangler.jsonc "name" is still "skeleton" — set it to the client's Worker name.`);
// Malak (2026-10-02): the custom-domain routes are commented out for the workers.dev preview.
if (wrangler && !/^\s*"routes"\s*:/m.test(wrangler)) errors.push(`wrangler.jsonc has no active "routes" — uncomment the custom domains (see the PRE-LAUNCH note in wrangler.jsonc) before launch.`);

// 5. Content — FAQs per service, leftover placeholder copy, legal pages.
const servicesDir = "src/content/services";
if (fs.existsSync(servicesDir)) {
  for (const f of fs.readdirSync(servicesDir).filter((f) => f.endsWith(".md"))) {
    const src = read(path.join(servicesDir, f));
    const faqs = (src.match(/^\s*- question:/gm) || []).length;
    if (faqs < 5) warnings.push(`${servicesDir}/${f} has ${faqs} FAQ(s) — the standard is 5, research-based.`);
    if (!/style:\s*"?cta"?/.test(src)) warnings.push(`${servicesDir}/${f} has no closing style: "cta" block.`);
  }
}
const placeholderCopy = [];
(function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (/\.(md|mdx|json)$/.test(p) && /Example|Replace per client|Lorem ipsum/i.test(read(p))) placeholderCopy.push(p);
  }
})("src/content");
if (placeholderCopy.length) errors.push(`${placeholderCopy.length} content file(s) still contain placeholder copy:\n    ${placeholderCopy.join("\n    ")}`);
if (read("src/pages/privacy-policy.astro").includes("[Month DD, YYYY]")) errors.push(`privacy-policy.astro effectiveDate is still "[Month DD, YYYY]".`);
if (/content goes here|replace with real legal copy/i.test(read("src/pages/terms-of-use.astro"))) warnings.push(`terms-of-use.astro still has placeholder text — get the client's terms.`);

// Report.
// ---- Real estate fork (The Malak Estate Group) ----
const listDir = (d, re) => (fs.existsSync(d) ? fs.readdirSync(d).filter((f) => re.test(f)) : []);
// Listings can be switched off site-wide (LISTINGS_ENABLED in src/lib/data/listings.ts):
// then nothing under listings is built, so its samples and photos aren't launch issues.
const listingsOn = !/^export const LISTINGS_ENABLED = false;/m.test(read("src/lib/data/listings.ts"));
if (!listingsOn) warnings.push(`Listings are switched off (LISTINGS_ENABLED = false): no listings section, link or page is published.`);
const samples = listDir("src/content/listings", /\.mdx?$/).filter((f) => /^\s*sample:\s*true/m.test(read(`src/content/listings/${f}`)));
if (listingsOn && samples.length) warnings.push(`${samples.length} sample listing(s) still published (sample: true): ${samples.join(", ")} — replace with real listings or delete.`);
const phUsers = [];
(function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p);
    else if (!listingsOn && /[\\/]listings[\\/]/.test(p)) continue; // not built while listings are off
    else if (/\.(astro|md|mdx|json|ts)$/.test(p) && /assets\/placeholders\//.test(read(p))) phUsers.push(p);
  }
})("src");
if (phUsers.length) warnings.push(`${phUsers.length} file(s) still use Unsplash placeholder photos (src/assets/placeholders/) — swap in client photos:\n    ${phUsers.join("\n    ")}`);
if (!listDir("src/content/testimonials", /\.(md|mdx|json)$/).length) warnings.push(`No testimonials yet — add the client's Google reviews she wants featured (src/content/testimonials/).`);
for (const f of listDir("src/content/social-links", /\.(md|json)$/)) {
  if (/example/.test(read(`src/content/social-links/${f}`))) errors.push(`src/content/social-links/${f} is still a placeholder link — set the real profile or delete the file.`);
}
if (!/^\s*brokerageLicense:/m.test(site)) warnings.push(`site.ts brokerageLicense is unset — get the Real of Ohio license number (shown in the footer).`);
if (/idxEnabled\s*=\s*false/.test(read("src/data/idx.ts"))) warnings.push(`IDX is not enabled (src/data/idx.ts) — expected until an IDX provider is chosen.`);
if (/noindex/.test(read("src/pages/terms-of-use.astro"))) warnings.push(`terms-of-use.astro is a noindexed placeholder — get the client's Terms of Use.`);
const today = new Date().toISOString().slice(0, 10);
const galleryHasGG = listDir("src/content/gallery", /\.json$/).some((f) => /"gather-and-ground"/.test(read(`src/content/gallery/${f}`)));
for (const f of listDir("src/content/events", /\.mdx?$/)) {
  const src = read(`src/content/events/${f}`);
  const date = src.match(/^\s*startDate:\s*"?(\d{4}-\d{2}-\d{2})/m)?.[1];
  const status = src.match(/^\s*status:\s*"?(\w+)/m)?.[1] || "scheduled";
  if (date && date < today && status === "scheduled" && !galleryHasGG) errors.push(`src/content/events/${f} is past (${date}) with no Gather & Ground photos — add photos to the gallery or delete the event.`);
}

for (const w of warnings) console.log(`! ${w}`);
for (const e of errors) console.log(`✖ ${e}`);
if (errors.length) {
  console.log(`\n${errors.length} launch blocker(s), ${warnings.length} warning(s).`);
  process.exit(1);
}
console.log(`✔ launch checks pass (${warnings.length} warning(s) to review).`);
