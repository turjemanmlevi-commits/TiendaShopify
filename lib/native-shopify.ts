import configuration from "../data/native-shopify.json" with { type: "json" };
import type { Product } from "./types";

export const nativeShopify = configuration;
export function nativeStoreOrigin(domain: string): string | null {
  return /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(domain)
    ? `https://${domain}`
    : null;
}
export function nativeProductDestination(product: Product): string | null {
  if (!nativeShopify.enabled || !nativeShopify.catalogPublished || !nativeShopify.cartVerified)
    return null;
  if (product.source !== "shopify-snapshot" || !product.available || !product.variantId)
    return null;
  const selected = product.variants?.find((variant) => variant.id === product.variantId);
  if (!selected || !Number.isInteger(selected.availableQuantity) || selected.availableQuantity < 1) return null;
  const origin = nativeStoreOrigin(nativeShopify.storeDomain);
  if (!origin || !/^[a-z0-9-]{1,200}$/.test(product.handle)) return null;
  const id = /^gid:\/\/shopify\/ProductVariant\/([1-9]\d*)$/.exec(product.variantId)?.[1];
  // Add through Shopify's product form to preserve an existing native cart.
  return id ? `${origin}/products/${product.handle}?variant=${id}` : null;
}
