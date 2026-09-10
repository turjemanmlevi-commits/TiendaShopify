import "server-only";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cache } from "react";
import type { Product } from "./types";
import type { Cart, CartAction } from "./cart-types";
import { publicProductImagery } from "./product-imagery";
import { nativeShopify } from "./native-shopify";
import {
  checkoutEnabled,
  isPressOnNails,
  MAX_CART_QUANTITY,
  MAX_LINE_QUANTITY,
  validCheckoutUrl,
} from "./graphql-validation";

const domain = (process.env.SHOPIFY_STORE_DOMAIN || "").trim().toLowerCase();
const token = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";
const version = process.env.SHOPIFY_API_VERSION || "2026-07";
export const hasShopifyConfiguration =
  /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(domain) && Boolean(token);
export const isNativeCatalogMode = !hasShopifyConfiguration && nativeShopify.enabled;
export const isCheckoutEnabled = checkoutEnabled(
  hasShopifyConfiguration,
  process.env.STOREFRONT_LAUNCH_READY,
);
export class ShopifyError extends Error {
  constructor(
    message: string,
    public status = 502,
  ) {
    super(message);
    this.name = "ShopifyError";
  }
}

// This is a PUBLIC Storefront token held on the server; never use an Admin API token here.
async function request<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  if (!hasShopifyConfiguration)
    throw new ShopifyError(
      "Shopping is not connected yet. Please check back soon.",
      503,
    );
  if (!/^20\d{2}-(01|04|07|10)$/.test(version))
    throw new ShopifyError("Store configuration needs attention.", 503);
  let response: Response;
  try {
    response = await fetch(`https://${domain}/api/${version}/graphql.json`, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({ query, variables }),
    });
  } catch {
    throw new ShopifyError("The store could not be reached. Please try again.");
  }
  if (!response.ok)
    throw new ShopifyError(
      "The store is temporarily unavailable. Please try again.",
      response.status === 429 ? 429 : 502,
    );
  const result = (await response.json()) as { data?: T; errors?: unknown[] };
  if (result.errors?.length || !result.data)
    throw new ShopifyError(
      "The store could not complete this request. Please try again.",
    );
  return result.data;
}

type Money = { amount: string; currencyCode: string };
type Variant = {
  id: string;
  title: string;
  availableForSale: boolean;
  quantityAvailable: number | null;
  price: Money;
  product?: { title: string; handle: string; tags: string[]; productType: string };
};
type StoreProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  tags: string[];
  productType: string;
  variants: { nodes: Variant[] };
  shape?: { value: string } | null;
  length?: { value: string } | null;
  supplierReviews?: { value: string } | null;
};
const PRODUCT_FIELDS = `id title handle description tags productType
  shape: metafield(namespace: "custom", key: "shape") { value }
  length: metafield(namespace: "custom", key: "length") { value }
  supplierReviews: metafield(namespace: "custom", key: "supplier_reviews") { value }
  variants(first: 100) { nodes { id title availableForSale quantityAvailable price { amount currencyCode } } }`;
function toProduct(product: StoreProduct): Product | null {
  if (!isPressOnNails(product.tags, product.productType)) return null;
  const variant =
    product.variants.nodes.find(
      (v) => v.availableForSale && (v.quantityAvailable ?? 0) > 0,
    ) || product.variants.nodes[0];
  if (!variant || variant.price.currencyCode !== "USD") return null;
  const mood = product.tags.find((tag) =>
    ["Gothic Romance", "Little Frights", "After Dark"].includes(tag),
  ) as Product["mood"] | undefined;
  let supplierReviews: unknown = null;
  if (product.supplierReviews?.value) {
    try {
      supplierReviews = JSON.parse(product.supplierReviews.value);
    } catch {
      supplierReviews = null;
    }
  }
  return {
    id: product.id,
    handle: product.handle,
    name: product.title,
    subtitle: "The press-on nail edit",
    description: product.description,
    price: Number(variant.price.amount),
    currency: "USD",
    ...publicProductImagery(product.handle, product.title),
    shape: product.shape?.value || "See product details",
    length: product.length?.value || "See product details",
    mood: mood || "After Dark",
    details: [
      "Check the product description for included items and sizing.",
      "Follow the instructions supplied with your adhesive.",
    ],
    available: variant.availableForSale && (variant.quantityAvailable ?? 0) > 0,
    variantId: variant.id,
    source: "shopify",
    supplierReviews,
  };
}
async function previews(): Promise<Product[]> {
  const data = JSON.parse(
    await readFile(join(process.cwd(), "data/products.json"), "utf8"),
  ) as Product[];
  return data.map((product) => ({
    ...product,
    ...publicProductImagery(product.handle, product.name),
    available: isNativeCatalogMode && nativeShopify.catalogPublished &&
      product.source === "shopify-snapshot" && Boolean(product.variants?.some((variant) => variant.availableQuantity > 0)),
    variantId: product.variantId,
    source: isNativeCatalogMode && product.source === "shopify-snapshot"
      ? "shopify-snapshot" as const
      : "preview" as const,
  }));
}
export const getProducts = cache(async (): Promise<Product[]> => {
  if (!hasShopifyConfiguration) return previews();
  const products: Product[] = [];
  let cursor: string | null = null;
  for (let page = 0; page < 10; page++) {
    const data: {
      products: {
        nodes: StoreProduct[];
        pageInfo: { hasNextPage: boolean; endCursor: string };
      };
    } = await request(
      `query NailProducts($cursor: String) @inContext(country: US) {
      products(first: 100, after: $cursor) { nodes { ${PRODUCT_FIELDS} } pageInfo { hasNextPage endCursor } }
    }`,
      { cursor },
    );
    products.push(
      ...data.products.nodes
        .map(toProduct)
        .filter((p): p is Product => Boolean(p)),
    );
    if (!data.products.pageInfo.hasNextPage) break;
    cursor = data.products.pageInfo.endCursor;
  }
  return products;
});
export const getProduct = cache(
  async (handle: string): Promise<Product | null> => {
    if (!/^[a-z0-9-]{1,200}$/.test(handle)) return null;
    if (!hasShopifyConfiguration)
      return (await previews()).find((p) => p.handle === handle) || null;
    const data = await request<{ product: StoreProduct | null }>(
      `query Product($handle: String!) @inContext(country: US) { product(handle: $handle) { ${PRODUCT_FIELDS} } }`,
      { handle },
    );
    return data.product ? toProduct(data.product) : null;
  },
);

type RawCart = {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: { subtotalAmount: Money; totalAmount: Money };
  lines: {
    nodes: {
      id: string;
      quantity: number;
      cost: { totalAmount: Money };
      merchandise: Variant;
    }[];
  };
};
const CART_FIELDS = `id checkoutUrl totalQuantity cost { subtotalAmount { amount currencyCode } totalAmount { amount currencyCode } }
  lines(first: 100) { nodes { id quantity cost { totalAmount { amount currencyCode } } merchandise { ... on ProductVariant {
    id title availableForSale quantityAvailable price { amount currencyCode } product { title handle tags productType }
  } } } }`;
function publicCart(cart: RawCart): Cart {
  if (!validCheckoutUrl(cart.checkoutUrl, domain))
    throw new ShopifyError("Checkout is not available. Please contact us.");
  return {
    totalQuantity: cart.totalQuantity,
    checkoutUrl: cart.checkoutUrl,
    subtotal: Number(cart.cost.subtotalAmount.amount),
    total: Number(cart.cost.totalAmount.amount),
    currency: cart.cost.totalAmount.currencyCode,
    lines: cart.lines.nodes.map((line) => ({
      id: line.id,
      variantId: line.merchandise.id,
      handle: line.merchandise.product?.handle || "",
      title: line.merchandise.product?.title || "Nail set",
      variantTitle: line.merchandise.title,
      image: publicProductImagery(line.merchandise.product?.handle || "").image,
      quantity: line.quantity,
      availableQuantity: line.merchandise.availableForSale
        ? Math.max(0, line.merchandise.quantityAvailable ?? 0)
        : 0,
      total: Number(line.cost.totalAmount.amount),
    })),
  };
}
async function rawCart(id: string): Promise<RawCart | null> {
  if (!/^gid:\/\/shopify\/Cart\//.test(id) || id.length > 2048) return null;
  return (
    await request<{ cart: RawCart | null }>(
      `query Cart($id: ID!) @inContext(country: US) { cart(id: $id) { ${CART_FIELDS} } }`,
      { id },
    )
  ).cart;
}
export async function getCart(id: string): Promise<Cart | null> {
  const cart = await rawCart(id);
  return cart ? publicCart(cart) : null;
}
async function verifyVariant(id: string, quantity: number) {
  const data = await request<{ node: Variant | null }>(
    `query AvailableVariant($id: ID!) @inContext(country: US) {
    node(id: $id) { ... on ProductVariant { id availableForSale quantityAvailable product { title handle tags productType } } }
  }`,
    { id },
  );
  const variant = data.node;
  if (
    !variant?.product ||
    !isPressOnNails(variant.product.tags, variant.product.productType)
  )
    throw new ShopifyError(
      "This nail set is not part of the current collection.",
      400,
    );
  if (!variant.availableForSale || (variant.quantityAvailable ?? 0) < quantity)
    throw new ShopifyError(
      "This quantity is not currently in stock. Please choose fewer sets or another design.",
      409,
    );
}
export async function changeCart(
  id: string | undefined,
  action: CartAction,
): Promise<{ cart: Cart; id: string; warnings: string[] }> {
  if (!isCheckoutEnabled)
    throw new ShopifyError(
      "Shopping is not open yet. We are confirming product availability and delivery before accepting orders.",
      503,
    );
  const current = id ? await rawCart(id) : null;
  let operation: string;
  let query: string;
  let variables: Record<string, unknown>;
  if (action.action === "add") {
    const existing =
      current?.lines.nodes.find(
        (line) => line.merchandise.id === action.variantId,
      )?.quantity || 0;
    if (
      existing + action.quantity > MAX_LINE_QUANTITY ||
      (current?.totalQuantity || 0) + action.quantity > MAX_CART_QUANTITY
    )
      throw new ShopifyError(
        "Please keep each design to 10 sets and each order to 50 sets.",
        400,
      );
    await verifyVariant(action.variantId, existing + action.quantity);
    operation = current ? "cartLinesAdd" : "cartCreate";
    variables = current
      ? {
          cartId: current.id,
          lines: [
            { merchandiseId: action.variantId, quantity: action.quantity },
          ],
        }
      : {
          input: {
            lines: [
              { merchandiseId: action.variantId, quantity: action.quantity },
            ],
            buyerIdentity: { countryCode: "US" },
          },
        };
    query = current
      ? `mutation Add($cartId: ID!, $lines: [CartLineInput!]!) { cartLinesAdd(cartId: $cartId, lines: $lines)`
      : `mutation Create($input: CartInput!) { cartCreate(input: $input)`;
  } else {
    if (!current)
      throw new ShopifyError(
        "Your bag has expired. Please add your nail sets again.",
        409,
      );
    const line = current.lines.nodes.find((item) => item.id === action.lineId);
    if (!line)
      throw new ShopifyError(
        "This item is no longer in your bag. Please refresh it.",
        409,
      );
    if (action.action === "update") {
      if (
        current.totalQuantity - line.quantity + action.quantity >
        MAX_CART_QUANTITY
      )
        throw new ShopifyError("Please keep each order to 50 sets.", 400);
      await verifyVariant(line.merchandise.id, action.quantity);
      operation = "cartLinesUpdate";
      variables = {
        cartId: current.id,
        lines: [{ id: action.lineId, quantity: action.quantity }],
      };
      query = `mutation Update($cartId: ID!, $lines: [CartLineUpdateInput!]!) { cartLinesUpdate(cartId: $cartId, lines: $lines)`;
    } else {
      operation = "cartLinesRemove";
      variables = { cartId: current.id, lineIds: [action.lineId] };
      query = `mutation Remove($cartId: ID!, $lineIds: [ID!]!) { cartLinesRemove(cartId: $cartId, lineIds: $lineIds)`;
    }
  }
  type Payload = {
    cart: RawCart | null;
    userErrors: { message: string }[];
    warnings: { message: string }[];
  };
  const result = await request<Record<string, Payload>>(
    `${query} { cart { ${CART_FIELDS} } userErrors { message } warnings { message } } }`,
    variables,
  );
  const payload = result[operation];
  if (payload.userErrors.length || !payload.cart)
    throw new ShopifyError(
      "Your bag could not be updated. Check availability and try again.",
      409,
    );
  return {
    cart: publicCart(payload.cart),
    id: payload.cart.id,
    warnings: payload.warnings.map((warning) => warning.message),
  };
}
