// RealEstateListing JSON-LD for a listing detail page. Dependency-free apart
// from the shared format helper (unit-tested with node --test, so the import
// keeps its .ts extension).
import { listingTitle } from "../utils/format.ts";

type ListingInput = {
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  status: "active" | "pending" | "sold" | "coming-soon";
  propertyType: "single-family" | "condo-townhome" | "new-construction" | "land";
  images: { src: string; alt: string }[];
};

const RESIDENCE = { "single-family": "SingleFamilyResidence", "new-construction": "SingleFamilyResidence", "condo-townhome": "Apartment", land: "Landform" } as const;

export function listingSchema(d: ListingInput, pageUrl: string, agentId: string) {
  const isLand = d.propertyType === "land";
  return {
    "@type": "RealEstateListing",
    "@id": "#listing",
    name: listingTitle(d),
    url: pageUrl,
    image: d.images.map((i) => i.src),
    offers: {
      "@type": "Offer",
      price: d.price,
      priceCurrency: "USD",
      availability: d.status === "sold" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
    },
    about: {
      "@type": RESIDENCE[d.propertyType],
      address: { "@type": "PostalAddress", streetAddress: d.address, addressLocality: d.city, addressRegion: d.state, postalCode: d.zip },
      numberOfRooms: isLand ? undefined : d.beds,
      numberOfBathroomsTotal: isLand ? undefined : d.baths,
      floorSize: isLand ? undefined : { "@type": "QuantitativeValue", value: d.sqft, unitCode: "FTK" },
    },
    provider: { "@id": agentId },
  };
}
