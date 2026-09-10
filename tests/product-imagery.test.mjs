import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { IMAGE_COMING_SOON, publicProductImagery } from "../lib/product-imagery.ts";

test("approved product handles expose only their locally styled image", () => {
  const manifest = JSON.parse(readFileSync(new URL("../data/approved-product-images.json", import.meta.url)));
  for (const [handle, approved] of Object.entries(manifest)) {
    const image = publicProductImagery(handle);
    assert.match(image.image, /^\/images\/products\/[a-z0-9-]+-styled\.webp$/);
    assert.equal(image.image, approved.image);
    assert.deepEqual(image.images, [approved.image]);
    assert.ok(existsSync(join(process.cwd(), "public", approved.image)));
  }
});

test("unknown and inherited object keys receive an explicit non-product placeholder", () => {
  for (const handle of ["unreviewed-shopify-handle", "__proto__", "constructor", "https://example.com/original.jpg", ""]) {
    const image = publicProductImagery(handle, "A new design");
    assert.equal(image.image, IMAGE_COMING_SOON);
    assert.deepEqual(image.images, [IMAGE_COMING_SOON]);
    assert.match(image.imageAlt, /Image coming soon.*No product photograph/);
  }
});

test("the preview catalog never references a supplier original", () => {
  const products = JSON.parse(readFileSync(new URL("../data/products.json", import.meta.url)));
  for (const product of products) {
    const approved = publicProductImagery(product.handle, product.name);
    assert.equal(product.image, approved.image);
    assert.deepEqual(product.images, approved.images);
    if (product.image === IMAGE_COMING_SOON) {
      assert.equal(product.source, "preview");
      assert.equal(product.available, false);
      assert.equal(product.variantId, null);
    }
  }
});
