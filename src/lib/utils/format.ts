// Listing display strings, shared by cards, detail pages and schema. Dependency-free (unit-tested).
const n = new Intl.NumberFormat("en-US");

export const formatPrice = (price: number) => `$${n.format(price)}`;
export const listingFacts = (d: { beds: number; baths: number; sqft: number }) =>
  `${d.beds} bd, ${d.baths} ba, ${n.format(d.sqft)} sq ft`;
export const listingTitle = (d: { address: string; city: string; state: string }) => `${d.address}, ${d.city}, ${d.state}`;
