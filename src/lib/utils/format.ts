// Listing display strings, shared by cards, detail pages and schema. Dependency-free (unit-tested).
const n = new Intl.NumberFormat("en-US");

export const formatPrice = (price: number) => `$${n.format(price)}`;
export const listingFacts = (d: { beds: number; baths: number; sqft: number }) =>
  `${d.beds} bd, ${d.baths} ba, ${n.format(d.sqft)} sq ft`;
export const listingTitle = (d: { address: string; city: string; state: string }) => `${d.address}, ${d.city}, ${d.state}`;

// Blog dates. pubDate is a date-only value (UTC midnight), so it's formatted in UTC:
// in a US time zone the local date would be the day before.
const postDate = new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
export const formatPostDate = (date: Date) => postDate.format(date);
