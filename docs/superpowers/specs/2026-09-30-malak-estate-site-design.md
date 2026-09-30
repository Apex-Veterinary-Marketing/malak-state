# The Malak Estate Group website: design spec

**Date:** 2026-09-30
**Status:** Draft for review
**Repo:** this repo (already the client's clone of the Skeleton template)
**Client:** The Malak Estate Group, Marissa Lubera, Realtor, brokered by Real of Ohio

## 1. Goal

Turn the veterinary Skeleton into a real estate site for Marissa Lubera that feels calm, polished and easy to navigate. In under a minute, a visitor should know:

- what working with Marissa is like;
- why they should choose her over another agent;
- how to book a call.

The site has to win new-construction business without feeling limited to it. Resale buyers and sellers, and builders or developers, should each find a page written for them.

**Done means** the following:

- `npm run verify` passes.
- Every page in section 5 exists, with its meta title, meta description and JSON-LD.
- Every page has been checked in a browser at 1440, 900 and 360 px.
- `npm run check:launch` shows only the client-dependent items listed in section 10.

## 2. Decisions already made

| Decision | Source |
|---|---|
| Visual direction: V2, the full-screen menu version (`docs/design/homepage-variations/v2-fullscreen-menu.html`) | You, 2026-09-30 |
| Build the real Astro site, not more static mockups | You, 2026-09-30 |
| Sitemap (section 5) | Approved by you, 2026-09-30 |
| `doctors` becomes `brokers` in code; the public label is "Meet Marissa"; profile pages at `/agents/<slug>` | You |
| `staff` is dropped; Photo Gallery stays | You |
| Listings collection for now, with a slot to embed IDX later | You |
| Builders & Developers page | Client notes |
| Gather & Ground page: what it is, upcoming events, past photos | Client notes (direct request) |
| Calendly is the main booking action | Client notes ("as you see fit") |
| Every `tel:` link dials `+14404204549`; `440.420.0580` is the only number shown | You |
| No dog imagery; the mascot is already removed | You |
| No device or product shots (phones, laptops) in hero or menu imagery | You |

## 3. Design system

These values carry V2 into the Skeleton's token contract. Component CSS keeps using tokens only.

**Palette.** Option A, generated with `npm run palette -- --main "#BFB6AF" --cta "#BFB6AF" --write`. Its values:

- `--main` `#7c6e63`: headings and links.
- `--main-dark` `#352f2b`: dark sections and the footer.
- `--cta` `#bfb6af`: the client's own color, used for primary buttons.
- `--on-cta` `--main-dark`: button text.
- `--solid-bg` `#f6f5f4`.

The client's `#BFB6AF` stays the button and accent fill. White text only appears on the espresso color, never on `#BFB6AF`, because that pairing is about 2:1 contrast and fails.

> **Needs sign-off:** you haven't explicitly confirmed option A, though the V2 mockup you picked already uses it. The spec assumes option A.

**Type.**

- Headings: Playfair Display 400, with italic 400 for one emphasized word in a heading.
- Body: Manrope 400/500/600.
- Both are self-hosted through `@fontsource`, which replaces Inter in `fonts.css` and the two preloads in `BaseLayout`.
- The token files get `--font-heading`, `--font-body`, a new display size `--font-size-5xl`, and a looser body line-height token.

**Shape.** Square corners throughout. `--radius-sm`, `--radius-md` and `--radius-lg` all become `0`. The one exception is the circular review-platform icons in the reputation widget, which keep `50%`.

**Motion.** Use the existing motion layer (`data-reveal`, `data-hover`) and its tokens. Adjust the `--motion-*` values to V2's slower, softer feel: reveal 900ms with the `--motion-ease-out` curve. There are no per-component reduced-motion blocks; the global handling already covers that.

**Buttons.** Uppercase Manrope 600 at 0.85rem with 0.08em letter-spacing.

- Primary: `--cta` background, `--on-cta` text.
- Secondary: a 1px `--main-dark` outline that fills espresso on hover.
- Text links: an arrow link in `--main` whose arrow nudges on hover.

**Header** (replaces the current utility bar and dropdown header).

- Fixed, 76px tall, with a `--solid-bg` background. On scroll it turns white with a hairline.
- Wordmark on the left. On the right: a "Book a call" text link and a MENU button with a two-line icon.
- MENU opens a full-screen espresso overlay:
  - A left column of large serif links: Home, Meet Marissa, Services, Builders & Developers, Listings, Gather & Ground, Contact.
  - Services expands in place to list the service pages.
  - The About slot items (Photo Gallery, How'd We Do?) sit in a smaller secondary list, so the fixed slot is kept.
  - Along the bottom: call, email and social links.
  - A right column with a portrait of Marissa (`marissa-living-room.jpg`), hidden below 900px.
- While the overlay is open the header turns espresso.
- Accessibility: Esc closes the overlay, focus moves into it and returns to the MENU button, and `aria-expanded` and `aria-modal` are set.
- The "Book a call" link stays visible on every screen size, including inside the open menu.

**Mobile call bar** (below 900px). Four items:

- Hours.
- Meet Marissa, using a person icon instead of the paw icon.
- Call, dialing through `phoneHref(site)`.
- Book, going to `/schedule`.

**Footer.**

- Espresso background.
- Wordmark with the line "Brokered by Real of Ohio".
- Columns: Explore, Services, Contact.
- Service areas listed as text.
- The Real of Ohio brokerage line and the Privacy and Terms links.
- The brokerage's name appears in the header wordmark area or the footer on every page.

> **To confirm:** Real of Ohio's compliance team should confirm how the brokerage name must appear. Ohio license law generally requires the brokerage's name in advertising.

**Page header.** `PageHeaderBanner` is restyled into V2's split layout: title and intro on the left over `--solid-bg`, a tall image on the right. Pages without an image fall back to text only. Every page except the homepage opens with it.

**Photography.**

- Client photos (`C:\Users\arman\Downloads\Malak Pictures\optimized`) are copied into `src/assets/brand/` with descriptive names and rendered through `<Image>`.
- Property imagery uses clearly labeled placeholder photos until the client sends real listing or community photos. Unsplash images are downloaded into `src/assets/placeholders/`, never hotlinked, and every file is listed in `check:launch`.
- The favicon and OG image get a generated "M" monogram and a 1200×630 card built from `marissa-doorway-wide.jpg`, until the real logo arrives.

## 4. Content model

**`site.ts`**

| Field | Value |
|---|---|
| `practiceName` | The Malak Estate Group |
| `phoneNumber` | 440.420.0580 |
| `callTrackingNumber` | +14404204549 |
| `email` | marissa@malakestates.com |
| `url` | https://www.themalakestategroup.com (the `www` domain comes from the form) |
| `showStreetAddress` | false (the address on the form is "TBD") |
| `addressLocality` / `addressRegion` / `addressLine2` | unset until the address is decided; `cityState` "Northeast Ohio" |
| `serviceAreaOfCoverage` | Cuyahoga County, Medina County, Summit County, Stark County, Lake County, Lorain County |
| `businessSchemaType` | RealEstateAgent |
| `bookingUrl` / `bookingLabel` | /schedule, "Book a call" |
| `hours` / `openingHoursSpecification` | Mon–Sun 8am–8pm, plus "evenings by appointment" |
| `businessDescription`, `footerAbout` | adapted from the client's "What's unique" answer |
| Review links | Google Business Profile review URL (to be requested); Facebook and Yelp unset |
| Social links collection | Instagram @themalakestategroup; Facebook (URL to be requested); the other example entries are removed |

New `site.ts` fields (all optional):

- `brokerageName`: "Real of Ohio".
- `brokerageLicense`: TBD.
- `calendlyUrl`: `https://calendly.com/marissa-malakestates/30min`.

**Collections**

- **`brokers`** (renamed from `doctors`). Same fields, plus these optional ones:
  - `title` (e.g. "Realtor")
  - `licenseNumber`
  - `yearsExperience`
  - `specialties[]`
  - `languages[]`
  - `serviceAreas[]`
  - `awards[] {name, years}`
  - `order`

  One entry, `marissa-lubera`, with her photos and form data.

  Renaming it touches the blog contract, because a post's `author` field references this collection. The field name `author` stays the same; its target collection changes from `doctors` to `brokers`. `check-posts.mjs` and `docs/BLOG-POST-CONTRACT.md` are updated to match.

  > **Deviation from the template, recorded here:** automations that set `author` must now use a `brokers` id. None of them use `author` for this client yet.

- **`staff`**: removed. That includes the collection, its pages and components, and `lib/data/staff.ts`.

- **`listings`** (new). Fields:
  - `address`, `city`, `state`, `zip`
  - `status` (active, pending, sold, coming-soon)
  - `price`, `beds`, `baths`, `sqft`, `lotSize?`, `yearBuilt?`
  - `propertyType` (single-family, condo-townhome, new-construction, land)
  - `mlsNumber?`
  - `description` (rich text)
  - `highlights[]`
  - `images[]` (image with alt text)
  - `listingAgent` (a reference to a `brokers` entry)
  - `featured`
  - `externalUrl?` (an MLS or IDX detail page)
  - `metaTitle?`, `metaDescription?`
  - `sample` (boolean, true on placeholder entries)

  It starts with three entries marked `sample: true`. `check:launch` warns while any sample listing remains.

- **`events`** (new, for Gather & Ground). Fields:
  - `name`
  - `startDate`, `endDate?`
  - `venueName?`, `venueAddress?`
  - `description`
  - `image?`
  - `rsvpUrl?`
  - `status` (scheduled, cancelled, postponed)

  Upcoming and past are derived from the date. It starts with no entries, and the page shows an "announced monthly" state when nothing is upcoming.

- **`gallery`** (new). Fields: `image`, `alt`, `caption?`, `album` (brand, gather-and-ground, properties), `order`. Photo Gallery shows every album; Gather & Ground shows its own album as past-event photos.

- **`services`**: kept as is. The existing entries are replaced; see section 5.

- **`service-categories`**: Buying, Selling, Specialties.

- **`testimonials`**: kept. It starts empty, so no invented reviews appear, and every section that uses it hides itself when there are none. The client asked for reviews from her Google Business Profile or her current website. We'll ask her for the ones she wants to feature.

- **`blog`** and **`blog-categories`**: kept exactly as the contract requires, and out of the nav. The example post and category are replaced with one real category, "Buying & Selling", and no posts.

**IDX slot.** A new `IdxEmbed.astro` component renders `idxEmbeds[slot]` from `src/data/idx.ts`, following the same pattern as `forms.ts` and `GravityFormEmbed`:

- It takes a pasted provider snippet.
- Any `<script>` in the snippet is re-created through the DOM so it actually runs.
- It renders nothing while the slot is empty.

It's placed on `/listings` above the collection grid and gated by `idxEnabled`. When IDX goes live, the grid can stay as "Featured listings" or be switched off.

## 5. Pages, SEO and schema

Every page gets these nodes from `BaseLayout` automatically:

- WebSite
- RealEstateAgent (`#business`)
- WebPage (with a `@type` override where listed below)
- BreadcrumbList

The "Page schema" column lists only the extra nodes each page adds.

A meta title followed by "+ suffix" gets " | The Malak Estate Group" appended automatically. The suffix is omitted when the full title would pass 60 characters. All descriptions are 160 characters or fewer.

| URL | H1 (page heading) | Meta title | Meta description | Main search term | Page schema |
|---|---|---|---|---|---|
| `/` | Real estate, handled with *care.* | Northeast Ohio Realtor \| The Malak Estate Group (full title) | Buy, sell, or build in Greater Cleveland with Realtor Marissa Lubera. Honest guidance, clear communication, and new construction expertise. | Cleveland realtor / Northeast Ohio real estate agent | Person (Marissa) reference, ItemList of featured services |
| `/meet-the-team` (nav: Meet Marissa) | The people behind The Malak Estate Group | About The Malak Estate Group + suffix | A relationship-first real estate team in Greater Cleveland. Our mission, values, and the recognition behind every client we serve. | Malak Estate Group | AboutPage; Person |
| `/agents/marissa-lubera` | Marissa Lubera, Realtor | Marissa Lubera, Northeast Ohio Realtor | Meet Marissa Lubera: Realtor with 6 years in resale and new construction, President's Club 2023-2025, serving Cuyahoga, Medina and Summit counties. | Marissa Lubera realtor | ProfilePage; Person (jobTitle, award[], knowsLanguage, worksFor #business, image) |
| `/services` | Real estate services across Northeast Ohio | Real Estate Services in Northeast Ohio + suffix | Buying, selling, new construction, relocation and more. See how Marissa Lubera helps clients across Greater Cleveland move with confidence. | real estate services Cleveland | CollectionPage; ItemList of Service |
| `/services/buying-a-home` | Buying a home in Greater Cleveland | Buy a Home in Greater Cleveland + suffix | A clear, personal plan for buying a home in Cuyahoga, Medina and Summit counties, from pre-approval to closing day. | buyer's agent Cleveland | Service, FAQPage |
| `/services/selling-your-home` | Selling your home in Greater Cleveland | Sell Your Home in Greater Cleveland + suffix | Pricing, preparation and marketing tailored to your home. Sell in Northeast Ohio with an agent who explains every step. | sell my house Cleveland realtor | Service, FAQPage |
| `/services/new-construction` | Buying new construction in Northeast Ohio | New Construction Homes in Northeast Ohio + suffix | Buying a new build? Marissa's builder-side sales experience helps you with lots, plans, upgrades and contracts across Greater Cleveland. | new construction realtor Cleveland | Service, FAQPage |
| `/services/relocation` | Relocating to Northeast Ohio | Relocating to Cleveland, Ohio + suffix | Moving to Greater Cleveland? Local guidance on neighborhoods, commutes and homes across six counties, handled remotely when you need it. | relocating to Cleveland Ohio | Service, FAQPage |
| `/services/first-time-home-buyers` | Your first home, explained step by step | First-Time Home Buyers in Northeast Ohio + suffix | First-time buyer in Northeast Ohio? Learn the steps, costs and Ohio programs, with a Realtor who makes the process feel manageable. | first time home buyer Ohio | Service, FAQPage |
| `/services/senior-downsizing` | Downsizing with patience and care | Senior Downsizing in Greater Cleveland + suffix | Moving to a smaller home after many years? A patient, well-organized downsizing plan for Greater Cleveland seniors and their families. | senior downsizing Cleveland | Service, FAQPage |
| `/services/luxury-homes` | Luxury homes in Northeast Ohio | Luxury Real Estate in Northeast Ohio + suffix | Discreet, high-touch representation for luxury buyers and sellers across Greater Cleveland, at a luxury level of service. | luxury homes Cleveland | Service, FAQPage |
| `/services/military-va-buyers` | Buying with a VA loan in Northeast Ohio | VA Home Buyers in Northeast Ohio + suffix | Buying with a VA loan in Greater Cleveland? A Realtor who knows VA timelines, appraisals and offers, and advocates for you. | VA home loan realtor Ohio | Service, FAQPage |
| `/services-categories/<slug>` | Buying / Selling / Specialties | "<Category> Services" + suffix | Per category, drafted when built | none | CollectionPage |
| `/builders-developers` | Builders: your community deserves a sharper launch | New Construction Listing Agent for Builders + suffix | Builders and developers in Greater Cleveland: list and market your new homes or community with an agent who comes from new-construction sales. | new construction listing agent Cleveland | Service (audience: BusinessAudience), FAQPage |
| `/listings` | Featured listings | Homes for Sale in Northeast Ohio + suffix | Featured homes for sale across Greater Cleveland from The Malak Estate Group. Schedule a showing or book a call with Marissa Lubera. | homes for sale Northeast Ohio | CollectionPage; ItemList of RealEstateListing |
| `/listings/<slug>` | Listing street address | Listing's `metaTitle` or "<address>, <city>" | Listing's `metaDescription` or "<beds> bd, <baths> ba, <sqft> sq ft home in <city>, OH…" | address | RealEstateListing (offers: Offer price/USD; about: SingleFamilyResidence or Residence with numberOfRooms and floorSize) |
| `/gather-and-ground` | Gather & Ground | Gather & Ground Community Events + suffix | Gather & Ground is a monthly community gathering Marissa co-sponsors in Greater Cleveland. See upcoming events and photos from past gatherings. | Gather & Ground Cleveland | CollectionPage; Event per upcoming event (startDate, location, organizer #business); ImageGallery |
| `/photo-gallery` | Photo gallery | Photo Gallery + suffix | Photos from The Malak Estate Group: homes, client moments, and Gather & Ground community events across Greater Cleveland. | none | CollectionPage; ImageGallery |
| `/contact-us` | Let's talk about your next move | Contact Marissa Lubera, Realtor | Call 440.420.0580, email, or send a message to The Malak Estate Group. Available 8am-8pm, 7 days a week, and evenings by appointment. | contact Cleveland realtor | ContactPage |
| `/schedule` | Book a 30-minute call | Book a Call with Marissa Lubera | Pick a time for a free 30-minute call about buying, selling, relocating, or building in Northeast Ohio. No pressure, just a clear next step. | none | WebPage (potentialAction: ScheduleAction to the Calendly URL) |
| `/faq` | Real estate questions, answered | Real Estate FAQ for Northeast Ohio + suffix | Answers to common questions about buying, selling and building a home in Northeast Ohio, from commission to closing costs and timelines. | Ohio real estate questions | FAQPage |
| `/blog` (not in the nav) | Buying & selling insights | Real Estate Insights + suffix | Guides and market notes for buyers, sellers and builders across Northeast Ohio from Realtor Marissa Lubera. | none | Blog (existing) |
| `/privacy-policy` | Privacy policy | Privacy Policy + suffix | How The Malak Estate Group collects and uses information submitted through this website. | none | none |
| `/terms-of-use` | Terms of use | Terms of Use + suffix | Stays noindexed until the client supplies terms | none | none |
| `/search`, `/404` | Existing | Existing | Existing | none | none |

**Split to confirm.** The approved sitemap had one "Luxury & Military/VA" page. For search, those are two unrelated audiences with different search terms, so this spec splits them into `/services/luxury-homes` and `/services/military-va-buyers`. Tell me if you'd rather keep a single page.

**Redirects** (in `astro.config.mjs`):

| From | To |
|---|---|
| `/doctors/:slug` | `/agents/:slug` |
| `/staff/:slug` | `/meet-the-team` |
| `/online-forms` | `/contact-us` |
| `/appointment-request` | `/schedule` |
| `/general-information-request` | `/contact-us` |

**Homepage sections**, in V2 order:

1. Split hero: H1, subhead, "Book a call" and "View listings" buttons, and the doorway photo.
2. Mission statement.
3. Services strips: Buying, Selling, New construction, Relocation & downsizing, all linking to their service pages.
4. Meet Marissa: seated portrait, awards, link to her profile.
5. Builders & Developers panel over a full-width image.
6. Featured listings.
7. Testimonial, hidden while there are none.
8. Gather & Ground teaser.
9. "Book a 30-minute call" section with the inline Calendly embed, contact details and counties.

## 6. Copy rules

These follow the copywriting skill and AGENTS.md:

- **Voice:** professional but warm, first person where Marissa is speaking, and plain words. The client's own answers (what's unique, why clients choose her, mission, vision, values) are used close to word for word; the client's copy always wins.
- **Headings** speak to the reader's goal. Service pages open with the reader's situation, then how Marissa helps, then what to expect.
- **Search terms** appear naturally in the H1 or opening lines, and the town and county are named in the copy. There's no keyword stuffing and no invented statistics.
- **Service pages** follow the standard structure:
  - Three text-and-image blocks: what it is and why it matters, what to expect, who it's for.
  - A closing call-to-action block.
  - Five researched FAQs.
- **Sources:** any factual claim in an FAQ (Ohio seller disclosure form, VA loan rules, Ohio first-time buyer programs, typical Ohio closing costs) links to a primary source such as ohio.gov, va.gov, the Ohio Housing Finance Agency or consumerfinance.gov. Those sources are listed in the hand-off.
- **Calls to action:** one label per intent across the whole site: "Book a call" (Calendly), "Call 440.420.0580", "Send a message" (contact form), "View listings". Buttons are three words or fewer.
- **No em-dashes** in visible copy, matching the mockups.
- **Drafts:** all agent-written copy goes to the client for approval before launch. The hand-off marks it as a draft and never presents it as her own words.
- **Vet wording:** every trace of vet wording is removed. That includes page copy, nav labels, `BaseLayout`'s fallback description, 404 copy, the privacy policy wording, and the reputation widget ("Thank you hooman!!" becomes "Thank you!", and the paw buttons become thumbs up and down).

## 7. Components

| Component | Change |
|---|---|
| Header | Rebuilt as V2's full-screen menu (section 3); keeps `phoneHref` and the About slot |
| MobileCallbar | Items updated; no paw icon |
| Footer | Restyled; brokerage line |
| PageHeaderBanner | V2 split layout |
| Hero | Homepage split hero |
| New: ServiceStrips | Homepage service strips (V2); becomes a stacked list below 900px |
| DoctorCard / DoctorGrid → BrokerCard / BrokerGrid | Renamed and restyled |
| New: ListingCard, ListingGrid, ListingFacts | Cards and the facts row |
| New: IdxEmbed | IDX slot (section 4) |
| New: EventList | Upcoming events and the empty state |
| New: GalleryGrid | Masonry-style grid, with a lightbox built on the existing Modal |
| New: CalendlyEmbed | Lazy-loaded inline iframe with a plain-link fallback |
| ServiceGrid / ServiceCard, FaqAccordion, CtaBand, TestimonialSlider, Section, FeatureSplit | Restyled with tokens |
| Removed | StaffCard, StaffGrid, BeforeYourVisit (the component and its paw decoration), `data/visit-tips.ts` |
| ReputationWidget | Thumbs up/down icons, neutral copy |

## 8. Code and tooling changes

- **`organization.ts`:** entries in `areaServed` that end in "County" become `AdministrativeArea` instead of `City`. Add `parentOrganization: { "@type": "Organization", name: brokerageName }` to the business node.
- **`SEGMENTS`** (breadcrumb labels): `agents` maps to "Meet Marissa" (`/meet-the-team`), `listings` to "Listings", `gather-and-ground` to its page name.
- **`check-launch.mjs`:** warn on `sample: true` listings, on placeholder property photos, on an empty testimonials collection, and on any event dated in the past that's still marked upcoming.
- **`check-posts.mjs` and the blog contract:** `doctors` becomes `brokers` (section 4).
- **`wrangler.jsonc`:** `name` changes from "skeleton" to the client's Worker name, which we still need from you.
- **`README.md` and AGENTS.md:** no rewrite. Add a short "This fork" note at the top of AGENTS.md listing the deviations: brokers, listings, events, gallery, IDX, redirects.

## 9. Verification

- `npm run verify` passes. Run `check:tokens` throughout while styling.
- **JSON-LD:** parse every built page's `ld+json` block and confirm every `@id` reference points at a node that exists. A small throwaway script does this.
- **Screenshots:** full-page captures of every route at 1440, 900 and 360 px, reviewed by eye. Also the open menu, the Calendly section, and the reputation widget.
- **Meta:** check every page's title and description length and uniqueness from the built HTML.

## 10. Waiting on the client

These don't block the build. They show up as ✖ or ! in `check:launch`.

- Logo files: color and white versions.
- Office address (or confirm it stays hidden), brokerage license number, Marissa's license number.
- Gravity Forms embeds: contact and reputation feedback.
- Google review link and the testimonials she wants featured.
- Facebook URL.
- Real listings and property or community photos.
- Gather & Ground: event dates and past-event photos, and the co-sponsoring business's name.
- Terms of Use.
- Real of Ohio's advertising requirements for the brokerage name.
- The Cloudflare Worker name.
- Her notes on what to keep or drop from the current Wix site.

## 11. Out of scope

- Live IDX integration. The slot exists; choosing and wiring a provider comes later.
- Follow Up Boss lead routing. The contact form's routing lives in Gravity Forms.
- Blog posts.
- Mortgage calculator, home valuation tool, neighborhood guides. The client didn't tick any of these.
- Dark mode. The token system is light-only by design.
