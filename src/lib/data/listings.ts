import { getCollection, getEntry } from "astro:content";

const STATUS_ORDER = { active: 0, "coming-soon": 1, pending: 2, sold: 3 } as const;

// Listings are hidden site-wide for now (client request, 2026-10-02). With this
// false, no listings section, link or page is rendered: the homepage section,
// the "View listings" buttons, the menu/footer/search links and /listings (+ each
// /listings/<id>) are all left out of the build. The components, the collection
// and the pages stay as they are; set it back to true to bring everything back.
export const LISTINGS_ENABLED = false;

// Featured first, then active > coming soon > pending > sold, then highest price.
// Empty while LISTINGS_ENABLED is false, so nothing downstream can render one.
export async function getAllListings() {
  if (!LISTINGS_ENABLED) return [];
  return (await getCollection("listings")).sort(
    (a, b) =>
      Number(b.data.featured) - Number(a.data.featured) ||
      STATUS_ORDER[a.data.status] - STATUS_ORDER[b.data.status] ||
      b.data.price - a.data.price
  );
}
export async function getFeaturedListings(limit = 3) {
  return (await getAllListings()).slice(0, limit);
}
export async function getListingBySlug(slug: string) {
  return getEntry("listings", slug);
}
