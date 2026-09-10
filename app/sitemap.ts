import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/shopify";
import { site } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (process.env.STOREFRONT_LAUNCH_READY !== "true") return [];
  const products = await getProducts();
  return [
    "",
    "/shop",
    "/our-story",
    "/nail-guide",
    "/faqs",
    "/contact",
    ...products
      .filter((p) => p.source === "shopify")
      .map((p) => `/products/${p.handle}`),
  ].map((path) => ({ url: `${site.url}${path}` }));
}
