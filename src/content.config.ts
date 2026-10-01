import { defineCollection, reference, z } from "astro:content";
import { glob } from "astro/loaders";
import { normalizeFrontmatterDate } from "./lib/utils/events";

// Event dates are New York wall time unless a quoted value carries an offset
// ("2026-10-15T18:00:00-04:00"). See lib/utils/events.ts.
const eventDate = z.preprocess((v) => (v instanceof Date || typeof v === "string" ? normalizeFrontmatterDate(v) : v), z.date());

// Agents/brokers (renamed from the template's "doctors" for this real estate fork).
// Public label is "Meet Marissa"; profile pages live at /agents/<id>.
const brokers = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx,json}", base: "./src/content/brokers" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      shortName: z.string().optional(),
      bioShort: z.string().optional(), // rich text (HTML/MD) — Webflow: RichText
      bio: z.string().optional(), // rich text (HTML/MD) — Webflow: RichText
      mainImage: image().optional(),
      secondaryImage: image().optional(),
      showOnHome: z.boolean().default(false),
      imageAltText: z.string().optional(),
      title: z.string().optional(), // e.g. "Realtor"
      licenseNumber: z.string().optional(),
      yearsExperience: z.number().optional(),
      specialties: z.array(z.string()).default([]),
      languages: z.array(z.string()).default([]),
      serviceAreas: z.array(z.string()).default([]),
      awards: z.array(z.object({ name: z.string(), years: z.string(), detail: z.string().optional() })).default([]),
      order: z.number().default(0),
    }),
});

const serviceCategories = defineCollection({
  loader: glob({ pattern: "**/*.{md,json}", base: "./src/content/service-categories" }),
  schema: z.object({
    name: z.string(), // plain text only — categories are just names
    description: z.string().optional(), // meta description for /services-categories/<id>
    intro: z.string().optional(), // one-line page intro
  }),
});

const blogCategories = defineCollection({
  loader: glob({ pattern: "**/*.{md,json}", base: "./src/content/blog-categories" }),
  schema: z.object({
    name: z.string(), // plain text only
  }),
});

const services = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx,json}", base: "./src/content/services" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      customName: z.string().optional(),
      serviceIcon: image().optional(),
      pageHeaderImage: image().optional(),
      contentBlocks: z
        .array(
          z.object({
            body: z.string(),
            image: image().optional(),
            // "cta": the closing booking block (body + the site's booking
            // button, no image). Standard service page (agency Webflow
            // structure): 3 text+image blocks, then one "cta" block, then FAQs.
            style: z.enum(["default", "cta"]).default("default"),
          })
        )
        .default([]),
      serviceCategory: z.array(reference("serviceCategories")).default([]),
      featured: z.boolean().default(false),
      featuredHeading: z.string().optional(),
      featuredText: z.string().optional(),
      showOnSidebarMenu: z.boolean().default(true),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      faqs: z
        .array(
          z.object({
            question: z.string(),
            answer: z.string(),
          })
        )
        .default([]),
      manualSchema: z.string().optional(),
      audience: z.string().optional(),
      headline: z.string().optional(), // display H1 (supports *italic*); falls back to customName/name, which stay the SEO name // schema.org Audience.audienceType on the Service node, e.g. "Home buyers"
    }),
});

// BLOG POST CONTRACT — docs/BLOG-POST-CONTRACT.md. Posts are also published by
// external automations (Zapier / Make / n8n → GitHub), so the storage is fixed
// in every fork even when the public URL changes (/blog, /resources, …):
//   posts   src/content/blog/<slug>.md      images  src/assets/blog/<file>
// Only ADD optional fields here; never rename/remove one or make one required
// (it would break every automation already publishing to the fork).
// `npm run check:posts` validates posts against this contract.
const blog = defineCollection({
  loader: glob({ pattern: "*.{md,mdx}", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(), // post title (H1)
      pubDate: z.coerce.date(), // YYYY-MM-DD; a future date = scheduled (hidden until a build on/after it)
      draft: z.boolean().default(false), // true = never published, whatever the date
      titleTag: z.string().optional(), // SEO title (≤ 60 chars)
      metaDescription: z.string().optional(), // ≤ 160 chars
      postSummary: z.string().optional(), // card excerpt
      postThumbnail: image().optional(), // "../../assets/blog/<file>"
      thumbnailAlt: z.string().optional(),
      author: reference("brokers").optional(), // a brokers/ entry id (this fork renamed doctors -> brokers; see AGENTS.md "This fork")
      authorName: z.string().optional(), // byline when there's no broker author
      category: z.array(reference("blogCategories")).default([]),
      readTime: z.string().optional(), // e.g. "5 min read"
      keyTakeaways: z.array(z.string()).default([]),
      sources: z.array(z.object({ text: z.string(), url: z.string().url() })).default([]),
      featured: z.boolean().default(false),
      monthLabel: z.string().optional(), // legacy display override for the date
    }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx,json}", base: "./src/content/testimonials" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      testimonial: z.string(),
      image: image().optional(), // usage optional — slider/card render fine without one
      imageAltText: z.string().optional(),
    }),
});

// Direct links to the practice's own social/review profile pages — distinct
// from site.ts's googleReviewsLink/facebookReviewsLink/yelpReviewLink
// (review-platform CTAs used by ReputationWidget). "icon" names a key into
// src/lib/icons/social.ts's inline-SVG library rather than an image asset,
// so the icon can inherit color via currentColor (header/footer render it
// differently depending on scroll/theme state). See Skeleton-Build-Spec.md §6.
export const SOCIAL_ICON_KEYS = ["linkedin", "facebook", "x", "instagram", "tiktok", "google"] as const;
export type SocialIconKey = (typeof SOCIAL_ICON_KEYS)[number];

const socialLinks = defineCollection({
  loader: glob({ pattern: "**/*.{md,json}", base: "./src/content/social-links" }),
  schema: z.object({
    icon: z.enum(SOCIAL_ICON_KEYS),
    link: z.string(),
  }),
});

// Listings: hand-entered (or sample) properties. When IDX goes live (src/data/idx.ts) this
// collection can stay as "featured listings" or be emptied.
const listings = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/listings" }),
  schema: ({ image }) =>
    z.object({
      address: z.string(),
      city: z.string(),
      state: z.string().default("OH"),
      zip: z.string(),
      status: z.enum(["active", "pending", "sold", "coming-soon"]).default("active"),
      price: z.number(),
      beds: z.number(),
      baths: z.number(),
      sqft: z.number(),
      lotSize: z.string().optional(),
      yearBuilt: z.number().optional(),
      propertyType: z.enum(["single-family", "condo-townhome", "new-construction", "land"]),
      mlsNumber: z.string().optional(),
      highlights: z.array(z.string()).default([]),
      images: z.array(z.object({ src: image(), alt: z.string() })).min(1),
      listingAgent: reference("brokers"),
      featured: z.boolean().default(false),
      externalUrl: z.string().url().optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      sample: z.boolean().default(false), // placeholder entry — check:launch warns until removed
    }),
});

// Gather & Ground events. Upcoming vs past is derived from startDate (lib/utils/events.ts).
const events = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/events" }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      startDate: eventDate,
      endDate: eventDate.optional(),
      venueName: z.string().optional(),
      venueAddress: z.string().optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
      rsvpUrl: z.string().url().optional(),
      status: z.enum(["scheduled", "cancelled", "postponed"]).default("scheduled"),
    }),
});

// Photo gallery items, grouped into albums (Photo Gallery shows all; Gather & Ground its own album).
const gallery = defineCollection({
  loader: glob({ pattern: "**/*.json", base: "./src/content/gallery" }),
  schema: ({ image }) =>
    z.object({
      image: image(),
      alt: z.string(),
      caption: z.string().optional(),
      album: z.enum(["brand", "gather-and-ground", "properties"]),
      order: z.number().default(0),
    }),
});

export const collections = { brokers, serviceCategories, blogCategories, services, blog, socialLinks, testimonials, listings, events, gallery };
