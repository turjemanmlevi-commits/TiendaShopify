export const MAX_LINE_QUANTITY = 10;
export const MAX_CART_QUANTITY = 50;
export function checkoutEnabled(
  configured: boolean,
  launchFlag: string | undefined,
): boolean {
  return configured && launchFlag === "true";
}

export function isVariantId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^gid:\/\/shopify\/ProductVariant\/\d{1,30}$/.test(value)
  );
}
export function isLineId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.length <= 512 &&
    /^gid:\/\/shopify\/CartLine\/[a-zA-Z0-9_-]+(?:\?[a-zA-Z0-9_=&%./+:-]+)?$/.test(
      value,
    )
  );
}
export function validQuantity(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= MAX_LINE_QUANTITY
  );
}
export function hasValidOrigin(
  origin: string | null,
  requestUrl: string,
  requestHost: string | null = null,
): boolean {
  if (!origin) return false;
  try {
    const source = new URL(origin);
    const target = new URL(requestUrl);
    if (
      !["http:", "https:"].includes(source.protocol) ||
      origin !== source.origin ||
      source.protocol !== target.protocol
    )
      return false;

    // Host must agree with the browser's Origin; forwarded headers are not trusted.
    if (requestHost !== null && requestHost.toLowerCase() !== source.host)
      return false;
    if (source.origin === target.origin) return true;

    // NextURL rewrites loopback IPs to localhost. Restore only that exact case,
    // using the original Host and retaining the port and protocol boundary.
    return (
      requestHost !== null &&
      target.hostname === "localhost" &&
      ["127.0.0.1", "[::1]"].includes(source.hostname) &&
      source.port === target.port
    );
  } catch {
    return false;
  }
}
export function isPressOnNails(tags: string[], productType = ""): boolean {
  const isNailSet = (value: string) =>
    /^press[\s-]+on[\s-]+nails$/i.test(value.trim());
  // An explicit type takes priority, so accessory types cannot pass on a broad tag.
  if (productType.trim()) return isNailSet(productType);
  return tags.some(isNailSet);
}
export function validCheckoutUrl(value: string, shopDomain: string): boolean {
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      !url.username &&
      !url.password &&
      (url.hostname === shopDomain || url.hostname === "checkout.shopify.com")
    );
  } catch {
    return false;
  }
}
export function parseCartAction(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const action = value as Record<string, unknown>;
  if (
    action.action === "add" &&
    isVariantId(action.variantId) &&
    validQuantity(action.quantity)
  ) {
    return {
      action: "add" as const,
      variantId: action.variantId,
      quantity: action.quantity,
    };
  }
  if (
    action.action === "update" &&
    isLineId(action.lineId) &&
    validQuantity(action.quantity)
  ) {
    return {
      action: "update" as const,
      lineId: action.lineId,
      quantity: action.quantity,
    };
  }
  if (action.action === "remove" && isLineId(action.lineId))
    return { action: "remove" as const, lineId: action.lineId };
  return null;
}
