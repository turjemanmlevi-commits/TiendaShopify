import test from "node:test";
import assert from "node:assert/strict";
import {
  checkoutEnabled,
  parseCartAction,
  hasValidOrigin,
  isPressOnNails,
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
test("permits only Next's loopback normalization with the original matching Host", () => {
  const target = "http://localhost:3000/api/cart";
  assert.equal(hasValidOrigin("http://127.0.0.1:3000", target, "127.0.0.1:3000"), true);
  assert.equal(hasValidOrigin("http://[::1]:3000", target, "[::1]:3000"), true);
  assert.equal(hasValidOrigin("http://localhost:3000", target, "localhost:3000"), true);
  for (const [origin, host] of [
    ["http://127.0.0.1:3000", null],
    ["http://127.0.0.1:3000", "localhost:3000"],
    ["http://127.0.0.1:3001", "127.0.0.1:3001"],
    ["https://127.0.0.1:3000", "127.0.0.1:3000"],
    ["http://unrelated.invalid:3000", "unrelated.invalid:3000"],
    ["http://localhost.evil.invalid:3000", "localhost.evil.invalid:3000"],
  ]) assert.equal(hasValidOrigin(origin, target, host), false);
});
test("rejects forged Host and malformed origin even when URL matching would succeed", () => {
  const target = "https://haunted.example/api/cart";
  for (const [origin, host] of [
    ["https://haunted.example", "evil.invalid"],
    ["https://evil.invalid", "evil.invalid"],
    ["https://haunted.example", "haunted.example,evil.invalid"],
    ["https://haunted.example/", "haunted.example"],
    ["https://user:pass@haunted.example", "haunted.example"],
    ["https://haunted.example/path", "haunted.example"],
    ["null", "haunted.example"],
  ]) assert.equal(hasValidOrigin(origin, target, host), false);
});
test("nail eligibility accepts explicit press-on types or tags without seasonal branding", () => {
  assert.equal(isPressOnNails([], "Press-on nails"), true);
  assert.equal(isPressOnNails(["halloween"], "Press on Nails"), true);
  assert.equal(isPressOnNails(["press-on-nails", "everyday"]), true);
  assert.equal(isPressOnNails(["  Press On Nails  "]), true);
});
test("seasonal labels and accessory types cannot qualify unrelated products as nail sets", () => {
  assert.equal(isPressOnNails(["halloween", "haunted-tips"]), false);
  assert.equal(isPressOnNails(["beauty", "nails"]), false);
  assert.equal(isPressOnNails(["press-on-nails"], "Nail glue"), false);
  assert.equal(isPressOnNails(["press-on-nails"], "Nail accessories"), false);
  assert.equal(isPressOnNails(["haunted-tips"], "Handbags"), false);
  assert.equal(isPressOnNails(["press-on nails stickers"]), false);
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
