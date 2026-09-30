import { getCollection } from "astro:content";

export type GalleryAlbum = "brand" | "gather-and-ground" | "properties";

export async function getGallery(album?: GalleryAlbum) {
  const all = (await getCollection("gallery")).sort((a, b) => a.data.order - b.data.order);
  return album ? all.filter((g) => g.data.album === album) : all;
}
