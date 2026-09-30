import { test } from "node:test";
import assert from "node:assert/strict";
import { listingSchema } from "../src/lib/schema/listing.ts";

const base = {
  address: "1 Elm St", city: "Medina", state: "OH", zip: "44256", price: 624900, beds: 4, baths: 3, sqft: 2860,
  status: "active", propertyType: "single-family", images: [{ src: "https://x/a.jpg", alt: "a" }],
} as const;

test("single-family listing node", () => {
  const n: any = listingSchema(base as any, "https://site/listings/x", "/agents/marissa-lubera#person");
  assert.equal(n["@type"], "RealEstateListing");
  assert.equal(n.name, "1 Elm St, Medina, OH");
  assert.equal(n.offers.price, 624900);
  assert.equal(n.offers.availability, "https://schema.org/InStock");
  assert.equal(n.about["@type"], "SingleFamilyResidence");
  assert.equal(n.about.floorSize.value, 2860);
  assert.deepEqual(n.provider, { "@id": "/agents/marissa-lubera#person" });
});
test("sold listing is SoldOut; land omits rooms and size", () => {
  const n: any = listingSchema({ ...base, status: "sold", propertyType: "land" } as any, "u", "a");
  assert.equal(n.offers.availability, "https://schema.org/SoldOut");
  assert.equal(n.about.numberOfRooms, undefined);
  assert.equal(n.about.floorSize, undefined);
});
test("condo maps to Apartment", () => {
  const n: any = listingSchema({ ...base, propertyType: "condo-townhome" } as any, "u", "a");
  assert.equal(n.about["@type"], "Apartment");
});
