import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";
import { nativeShopify, nativeStoreOrigin, nativeProductDestination } from "../lib/native-shopify.ts";
import * as validation from "../lib/graphql-validation.ts";
import * as imagery from "../lib/product-imagery.ts";

const products = JSON.parse(readFileSync(new URL("../data/products.json", import.meta.url), "utf8"));

test("native destinations accept only a canonical Shopify domain", () => {
  assert.equal(nativeStoreOrigin("example.myshopify.com"), "https://example.myshopify.com");
  for (const domain of ["https://example.myshopify.com", "example.myshopify.com.evil.test", "evil.test", "example.myshopify.com@evil.test", "example.myshopify.com/cart", "EXAMPLE.myshopify.com", "example.myshopify.com\n"]) {
    assert.equal(nativeStoreOrigin(domain), null);
  }
});

test("every design opens its selected real variant without creating or replacing a native cart", () => {
  const single = products.find(product => product.variants.length === 1);
  const multiple = products.find(product => product.variants.length > 1);
  assert.equal(nativeProductDestination(single), `https://${nativeShopify.storeDomain}/products/${single.handle}?variant=${single.variantId.split("/").at(-1)}`);
  const selected = multiple.variants.at(-1);
  assert.equal(nativeProductDestination({ ...multiple, variantId: selected.id }), `https://${nativeShopify.storeDomain}/products/${multiple.handle}?variant=${selected.id.split("/").at(-1)}`);
  for (const modification of [
    { available: false }, { source: "preview" }, { variantId: null },
    { variantId: "gid://shopify/ProductVariant/99999999" }, { handle: "../../checkout" },
    { variants: single.variants.map(variant => ({ ...variant, availableQuantity: 0 })) },
    { variants: single.variants.map(variant => ({ ...variant, availableQuantity: NaN })) },
  ]) assert.equal(nativeProductDestination({ ...single, ...modification }), null);
  for (const id of ["gid://shopify/Product/123", "gid://shopify/ProductVariant/0", "123", "gid://shopify/ProductVariant/123?checkout=true"]) {
    assert.equal(nativeProductDestination({ ...single, variantId: id, variants: [{ ...single.variants[0], id }] }), null);
  }
});

test("published catalog contains 20 distinct approved designs and 31 tracked-stock snapshot variants", () => {
  assert.equal(products.length, 20);
  assert.equal(new Set(products.map(product => product.id)).size, 20);
  assert.equal(new Set(products.map(product => product.handle)).size, 20);
  const variants = products.flatMap(product => product.variants);
  assert.equal(variants.length, 31);
  assert.equal(new Set(variants.map(variant => variant.id)).size, 31);
  for (const product of products) {
    assert.match(product.id, /^gid:\/\/shopify\/Product\/[1-9]\d*$/);
    assert.equal(product.source, "shopify-snapshot");
    assert.ok(Number.isFinite(Date.parse(product.stockObservedAt)));
    assert.ok(existsSync(join(process.cwd(), "public", product.image)));
    assert.ok(product.price > 0 && product.currency === "USD");
    assert.ok(product.variants.some(variant => variant.id === product.variantId));
    for (const variant of product.variants) {
      assert.match(variant.id, /^gid:\/\/shopify\/ProductVariant\/[1-9]\d*$/);
      assert.ok(Number.isInteger(variant.availableQuantity) && variant.availableQuantity >= 10);
      assert.equal(variant.price, product.price);
    }
  }
  assert.equal(nativeShopify.paymentsEnabled, false);
  assert.equal(nativeShopify.passwordProtected, true);
});

test("missing Storefront credentials use the explicit snapshot without network calls or enabling API checkout", async () => {
  const source = readFileSync(new URL("../lib/shopify.ts", import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const require = createRequire(import.meta.url);
  const loadedStore = { exports: {} };
  new Function("require", "module", "exports", "process", "fetch", compiled)((name) => {
    if (name === "server-only") return {};
    if (name === "react") return { cache: fn => fn };
    if (name === "./graphql-validation") return validation;
    if (name === "./native-shopify") return { nativeShopify };
    if (name === "./product-imagery") return imagery;
    return require(name);
  }, loadedStore, loadedStore.exports, { env: {}, cwd: process.cwd }, () => { throw new Error("Unexpected Storefront request"); });
  assert.equal(loadedStore.exports.hasShopifyConfiguration, false);
  assert.equal(loadedStore.exports.isNativeCatalogMode, true);
  assert.equal(loadedStore.exports.isCheckoutEnabled, false);
  const catalog = await loadedStore.exports.getProducts();
  assert.equal(catalog.length, 20);
  assert.ok(catalog.every(product => product.source === "shopify-snapshot" && product.available && product.variantId));
  const product = await loadedStore.exports.getProduct(products[0].handle);
  assert.equal(product.variantId, products[0].variantId);
  assert.equal(await loadedStore.exports.getProduct("emerald-hex-k077"), null);
});
