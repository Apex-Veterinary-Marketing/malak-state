// Per-client Gravity Forms EMBED SNIPPETS — added 2026-09-21 (audit item
// A1). GravityFormEmbed.astro (§6, §8 of Skeleton-Build-Spec.md) was a
// static placeholder in all 6 places it's used, with no mechanism for a
// client's real form to appear at all.
//
// STAGE 1 (this file): a plain <iframe> pointing at a minimal WordPress
// page that hosts the real form (its shortcode rendered on the WP side,
// where shortcodes actually work) — confirmed as the mechanism for now.
// NOT a raw WordPress shortcode pasted directly: `[gravityform id="1"]`
// (what you'd copy straight out of the GF admin) only renders inside
// WordPress's own PHP pipeline and does nothing on a static Astro site —
// GravityFormEmbed detects that specific mistake and warns instead of
// silently showing broken bracket text.
//
// STAGE 2 (confirmed direction, not yet built): a native Astro-built form
// UI posting straight to the Gravity Forms REST API instead of an iframe —
// matches the client's design exactly instead of inheriting GF's own field
// styling. Tracked in Ideas.md idea #2 (needs a server-side proxy for the
// API consumer key/secret — idea #1's Cloudflare Worker is the natural fit
// — plus real per-client field-mapping work). Do that as its own build, not
// a silent replacement of this file's mechanism.
//
// This component also tolerates a JS-widget <script>-loader snippet, if a
// specific client's setup ever needs one instead of a plain iframe — a
// browser never executes a <script> tag that arrives via innerHTML/
// set:html, only ones created via the DOM API, so GravityFormEmbed
// re-creates and re-runs any script tags it finds. A no-op for the normal
// iframe case; there for the exception, not the rule.
//
// If a client's GF form has reCAPTCHA enabled, it's already part of the
// form itself (GF's own reCAPTCHA field) — it ships for free inside
// whatever snippet is pasted here, nothing extra to wire up in Skeleton for
// that case. (A separate, NOT-Gravity-Forms reCAPTCHA v3 Cloudflare Worker
// for fully custom one-off forms is a different, parked idea — see
// Ideas.md #1 — this file isn't that.)
//
// Key = the same `formId` string each <GravityFormEmbed formId="..."> call
// already uses. Current call sites (Skeleton-Build-Spec.md §8):
//   contact                 — /contact-us
//   appointment-request     — /appointment-request
//   general-information-request — /general-information-request
//   new-patient              — /online-forms
//   contact (again)          — the sitewide contact modal (BaseLayout)
//   reputation-feedback      — ReputationWidget's negative-feedback stage
//
// Leave a key out (or empty) and that form renders GravityFormEmbed's
// placeholder instead — safe to fill these in one at a time during client
// intake, never blocks a build.
export const gravityFormEmbeds: Record<string, string> = {
  // Malak GF forms on onboarding.apexveterinarymarketing.com (client-supplied
  // 2026-10-02). gfembed.min.js auto-resizes each iframe to its form's height;
  // GravityFormEmbed re-runs the script tag so it actually executes.

  // Contact (GF form 666): /contact-us and the site-wide contact modal.
  contact: `<iframe src="https://onboarding.apexveterinarymarketing.com/gfembed/?f=666" width="100%" height="500" frameBorder="0" class="gfiframe" title="Contact form"></iframe>
<script src="https://onboarding.apexveterinarymarketing.com/wp-content/plugins/gravity-forms-iframe-master/assets/scripts/gfembed.min.js" type="text/javascript"></script>`,
};
