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
): boolean {
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(requestUrl).origin;
  } catch {
    return false;
  }
}
export function isHalloween(tags: string[], title = "", handle = ""): boolean {
  const names = `${title} ${handle}`.toLowerCase();
  if (/burgundy-hour|soft-espresso/.test(handle)) return false;
  return (
    tags.some((tag) =>
      /^(halloween|haunted-tips|the-halloween-edit)$/i.test(tag.trim()),
    ) || /\bhalloween\b/.test(names)
  );
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
