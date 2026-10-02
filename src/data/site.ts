// Site-wide config — NOT a content collection. Webflow models this as two
// CMS collections (Practice Information, Practice Social Links) but both
// are effectively singletons, not repeatable content. See
// Skeleton-Build-Spec.md §4.2. Per-client values get filled in here (or in
// a sibling .json this module imports) during client intake.
//
// NOTE (2026-09-08): direct social-profile links used to live here as a
// plain array (`socialLinks`). They're now their own real content
// collection (src/content/social-links/, accessed via
// getAllSocialLinks()) so each platform's icon renders from the inline-SVG
// library in src/lib/icons/social.ts instead of a name string — see
// content.config.ts. googleReviewsLink/facebookReviewsLink/yelpReviewLink
// below are a different thing (review-platform CTA links used by
// ReputationWidget), unaffected by that move.

export interface SiteInfo {
  practiceName: string;
  // The number SHOWN everywhere. Every tel: link dials callTrackingNumber when
  // set, else this — always build links with phoneHref() from
  // src/lib/utils/phone.ts, never by hand (check:links enforces one number).
  phoneNumber?: string;
  callTrackingNumber?: string; // e.g. "+18635914728" — dialed, never displayed
  email?: string;
  address?: string; // street line — see showStreetAddress
  addressLine2?: string; // "City, ST 00000"
  addressLocality?: string; // city, for the schema PostalAddress
  addressRegion?: string; // state, e.g. "FL"
  postalCode?: string;
  addressLink?: string;
  // Publish the street address? Defaults to true, or to FALSE when mobileVet
  // is true (a mobile/home-based business usually works from a private home).
  // When false, getSiteInfo() drops address, addressLink and mapEmbedLink, so
  // no component, page or schema node can leak it; city/ZIP stay.
  // Confirm with the client at intake — never publish a home address by default.
  showStreetAddress?: boolean;
  mobileVet?: boolean;
  serviceAreaOfCoverage?: string; // comma-separated cities; becomes schema areaServed
  // Primary booking action — every "book" CTA (header button, service pages'
  // closing block, CTA bands) reads these instead of hard-coding a route.
  bookingUrl?: string;
  bookingLabel?: string;
  businessDescription?: string; // one or two plain sentences for the schema Business node
  // Machine-readable hours for schema (hours above is display HTML), e.g.
  // [{ dayOfWeek: ["Monday","Tuesday"], opens: "08:00", closes: "18:00" }]
  openingHoursSpecification?: { dayOfWeek: string[]; opens: string; closes: string }[];
  hours?: string; // rich text/HTML — formatted hours table, not a plain string
  afterHours?: string; // rich text/HTML
  mapEmbedLink?: string;
  googleReviewsLink?: string;
  facebookReviewsLink?: string;
  yelpReviewLink?: string;
  googleRating?: number; // static fallback shown until googleWidgetId is configured
  googleReviewCount?: number;
  logoColor?: string; // asset path
  logoWhite?: string; // asset path
  footerAbout?: string; // ~160-char practice blurb, Footer's About Us column
  cityState?: string; // "[CITY, ST]" display string
  googleWidgetId?: string;
  // UserWay accessibility-widget account id. Optional override only — leave
  // unset to use the agency's own company-wide account (E6izlREqK3, baked
  // into AccessibilityWidget.astro as the default); set this only if a
  // specific client needs their own separate UserWay account.
  userwayAccountId?: string;
  url?: string; // site's canonical origin, e.g. "https://example.com" — the SINGLE
  // place the domain is configured. astro.config.mjs imports this file directly
  // and sets Astro's `site` from this field, so canonical URLs, OG/Twitter tags,
  // and the sitemap all derive from it automatically — never hard-code the
  // domain anywhere else. MUST be the real production domain (no trailing
  // slash) before launch, or canonical/sitemap URLs will point at the
  // placeholder below.
  // Schema.org @type for the site-wide Business node (see Skeleton-Build-Spec.md
  // §9/§14 item 8). Set it from intake — defaults to "VeterinaryCare", but a
  // non-clinic client (trainer, groomer, boarding) is NOT VeterinaryCare:
  // use e.g. ["LocalBusiness", "ProfessionalService"]. A mobile business
  // also sets mobileVet + serviceAreaOfCoverage (→ areaServed).
  businessSchemaType?: string | string[];
  // Real estate fork additions (all optional):
  brokerageName?: string; // the supervising brokerage, shown in header/footer and as schema parentOrganization (Ohio license law: brokerage name in advertising)
  brokerageLicense?: string; // brokerage license number, shown in the footer once supplied
  calendlyUrl?: string; // booking scheduler; /schedule embeds it (CalendlyEmbed)
}

// The Malak Estate Group — values from the client's onboarding form (2026-09-18)
// and follow-up notes. Items still owed by the client are marked "requested".
export const siteInfo: SiteInfo = {
  practiceName: "The Malak Estate Group",
  phoneNumber: "440.420.0580",
  callTrackingNumber: "+14404204549",
  email: "marissa@malakestates.com",
  showStreetAddress: false, // intake: address TBD (cloud brokerage) — confirm before publishing one
  cityState: "Northeast Ohio",
  serviceAreaOfCoverage: "Cuyahoga County, Medina County, Summit County, Stark County, Lake County, Lorain County",
  businessSchemaType: "RealEstateAgent",
  businessDescription:
    "The Malak Estate Group is led by REALTOR® Marissa Lubera, guiding buyers, sellers, investors and builders across Greater Cleveland with clarity, preparation and thoughtful strategy.",
  brokerageName: "Real of Ohio",
  // brokerageLicense: requested from client
  calendlyUrl: "https://calendly.com/marissa-malakestates/30min",
  bookingUrl: "/schedule",
  bookingLabel: "Book a call",
  hours: "<p>Monday to Sunday: 8am to 8pm<br>Evenings by appointment</p>",
  openingHoursSpecification: [
    { dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"], opens: "08:00", closes: "20:00" },
  ],
  footerAbout:
    "Cleveland real estate, guided with intention. Clarity, honesty, and a plan that aligns with your goals, for buyers, sellers, investors and builders.",
  // Google Business Profile (client-supplied 2026-10-02, tracking params removed): the
  // How'd We Do? widget's review link. The client has no Facebook page, so there's no
  // facebookReviewsLink and no Facebook social link.
  googleReviewsLink: "https://www.google.com/search?kgmid=/g/11n45_26qv&q=The+Malak+Estate+Group-+Marissa+Lubera+REALTOR%C2%AE",
  url: "https://themalakestategroup.com", // apex is canonical; www 301s here (Cloudflare Redirect Rule, see wrangler.jsonc)
  // logoColor / logoWhite: requested from client — Header/Footer render a text wordmark until then
};
