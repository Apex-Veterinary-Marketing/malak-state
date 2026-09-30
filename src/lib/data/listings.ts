import { getCollection, getEntry } from "astro:content";

const STATUS_ORDER = { active: 0, "coming-soon": 1, pending: 2, sold: 3 } as const;

// Featured first, then active > coming soon > pending > sold, then highest price.
export async function getAllListings() {
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
