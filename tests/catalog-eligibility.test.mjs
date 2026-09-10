import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import ts from "typescript";
import * as validation from "../lib/graphql-validation.ts";

const require = createRequire(import.meta.url);
const source = await readFile(new URL("../lib/shopify.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const fixture = (handle, productType, tags = []) => ({
  id: "gid://shopify/Product/123", handle, title: handle, description: "A nail set.",
  tags, productType,
  variants: { nodes: [{ id: "gid://shopify/ProductVariant/123", title: "Default", availableForSale: true,
    quantityAvailable: 0, price: { amount: "8.90", currencyCode: "USD" } }] },
});
const records = [
  fixture("soft-espresso-nude-press-on-nails", "Press-on nails"),
  fixture("burgundy-hour-almond-press-on-nails", "Press-on nails"),
  fixture("halloween-ghost-nails", "Press-on nails", ["halloween"]),
  fixture("everyday-french", "", ["press-on-nails"]),
  fixture("nail-glue", "Nail glue", ["halloween", "press-on-nails"]),
  fixture("halloween-purse", "Handbags", ["haunted-tips"]),
];
const calls = [];
const loadedStore = { exports: {} };
new Function("require", "module", "exports", "process", "fetch", compiled)((name) => {
  if (name === "server-only") return {};
  if (name === "react") return { cache: (fn) => fn };
  if (name === "./graphql-validation") return validation;
  if (name === "./native-shopify") return { nativeShopify: { enabled: false } };
  if (name === "./product-imagery") return { publicProductImagery: () => ({ image: "/placeholder.svg", images: [], imageAlt: "Pending image" }) };
  return require(name);
}, loadedStore, loadedStore.exports, { env: {
  SHOPIFY_STORE_DOMAIN: "test-store.myshopify.com", SHOPIFY_STOREFRONT_ACCESS_TOKEN: "test-only", STOREFRONT_LAUNCH_READY: "false",
} }, async (_url, init) => {
  const { query, variables } = JSON.parse(init.body);
  calls.push(query);
  const data = variables.handle
    ? { product: records.find((item) => item.handle === variables.handle) || null }
    : { products: { nodes: records, pageInfo: { hasNextPage: false, endCursor: null } } };
  return Response.json({ data });
});

test("catalog fetch includes normal and Halloween nail sets while excluding accessories", async () => {
  const products = await loadedStore.exports.getProducts();
  assert.deepEqual(products.map((product) => product.handle), records.slice(0, 4).map((product) => product.handle));
  assert.ok(products.every((product) => product.available === false));
  assert.equal(loadedStore.exports.isCheckoutEnabled, false);
  assert.match(calls[0], /productType/);
  assert.doesNotMatch(calls[0], /tag:halloween|title:halloween/);
});
test("direct product lookup applies the same explicit nail classification", async () => {
  assert.ok(await loadedStore.exports.getProduct("soft-espresso-nude-press-on-nails"));
  assert.equal(await loadedStore.exports.getProduct("nail-glue"), null);
  assert.equal(await loadedStore.exports.getProduct("halloween-purse"), null);
});
