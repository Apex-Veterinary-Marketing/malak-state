import { getCollection, getEntry } from "astro:content";

// Agents/brokers (the template's "doctors", renamed for this fork).
export async function getAllBrokers() {
  return (await getCollection("brokers")).sort((a, b) => a.data.order - b.data.order);
}
export async function getBrokerBySlug(slug: string) {
  return getEntry("brokers", slug);
}
export async function getHomeBrokers() {
  return (await getAllBrokers()).filter((b) => b.data.showOnHome);
}
