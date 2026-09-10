import test from "node:test";
import assert from "node:assert/strict";
import {
  checkoutEnabled,
  parseCartAction,
  hasValidOrigin,
  isHalloween,
  validCheckoutUrl,
} from "../lib/graphql-validation.ts";

test("checkout requires working configuration and an explicit launch flag", () => {
  assert.equal(checkoutEnabled(true, "true"), true);
  assert.equal(checkoutEnabled(false, "true"), false);
  for (const flag of [undefined, "", "false", "TRUE", "1"])
    assert.equal(checkoutEnabled(true, flag), false);
});

test("only accepts bounded quantities and product variant GIDs", () => {
  const valid = {
    action: "add",
    variantId: "gid://shopify/ProductVariant/123",
    quantity: 2,
  };
  assert.deepEqual(parseCartAction(valid), valid);
  for (const quantity of [0, -1, 1.5, 11, "2", null])
    assert.equal(parseCartAction({ ...valid, quantity }), null);
  for (const variantId of [
    "123",
    "gid://shopify/Product/123",
    "https://evil.example",
    "gid://shopify/ProductVariant/123?key=x",
  ])
    assert.equal(parseCartAction({ ...valid, variantId }), null);
});
test("line mutations require Shopify cart line IDs and explicit remove", () => {
  const lineId = "gid://shopify/CartLine/abc-123?cart=abc";
  assert.deepEqual(parseCartAction({ action: "remove", lineId }), {
    action: "remove",
    lineId,
  });
  assert.equal(
    parseCartAction({ action: "update", lineId, quantity: 0 }),
    null,
  );
  assert.equal(
    parseCartAction({ action: "remove", lineId: "gid://shopify/Cart/other" }),
    null,
  );
});
test("rejects cross-site and missing origins", () => {
  assert.equal(
    hasValidOrigin(
      "https://haunted.example",
      "https://haunted.example/api/cart",
    ),
    true,
  );
  assert.equal(
    hasValidOrigin("https://other.example", "https://haunted.example/api/cart"),
    false,
  );
  assert.equal(hasValidOrigin(null, "https://haunted.example/api/cart"), false);
  assert.equal(
    hasValidOrigin(
      "https://haunted.example.evil.test",
      "https://haunted.example/api/cart",
    ),
    false,
  );
});
test("Halloween eligibility excludes ordinary sets and accepts explicit tags", () => {
  assert.equal(isHalloween(["halloween"], "Moonlight", "moonlight"), true);
  assert.equal(isHalloween([], "Halloween Ghost Nails", "ghost-nails"), true);
  assert.equal(
    isHalloween(
      ["halloween"],
      "Soft Espresso",
      "soft-espresso-nude-press-on-nails",
    ),
    false,
  );
  assert.equal(
    isHalloween([], "Burgundy", "burgundy-hour-almond-press-on-nails"),
    false,
  );
  assert.equal(
    isHalloween(["beauty"], "Everyday Nude", "everyday-nude"),
    false,
  );
});
test("checkout allows configured Shopify domain, rejecting lookalikes and insecure URLs", () => {
  const domain = "example.myshopify.com";
  assert.equal(
    validCheckoutUrl("https://example.myshopify.com/checkouts/123", domain),
    true,
  );
  assert.equal(
    validCheckoutUrl("https://checkout.shopify.com/checkouts/123", domain),
    true,
  );
  assert.equal(
    validCheckoutUrl(
      "https://example.myshopify.com.evil.test/checkout",
      domain,
    ),
    false,
  );
  assert.equal(
    validCheckoutUrl("https://other.myshopify.com/checkout", domain),
    false,
  );
  assert.equal(
    validCheckoutUrl("http://example.myshopify.com/checkout", domain),
    false,
  );
  assert.equal(
    validCheckoutUrl(
      "https://user:pass@example.myshopify.com/checkout",
      domain,
    ),
    false,
  );
});
