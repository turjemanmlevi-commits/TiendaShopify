import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import { renderToStaticMarkup } from 'react-dom/server';
import { filterProductReviews, reviewSource } from '../lib/review-validation.ts';
import * as nativeShopifyModule from '../lib/native-shopify.ts';

const product = { id: 'gid://shopify/Product/1234', handle: 'fixture-design' };
const source = 'https://www.alibaba.com/product-detail/Fixture-Only_1600000000000.html';
const now = new Date('2026-09-10T00:00:00Z');
const review = (changes = {}) => ({ id: 'fixture-review-1', author: 'Test fixture', rating: 2, date: '2026-09-01', text: 'Synthetic test fixture only. Never published.', source_url: source, source_product_id: '1600000000000', publication_approved: true, reuse_basis: 'brief_attributed_quote', verified_purchase: false, ...changes });
const envelope = (reviews = [review()], changes = {}) => ({ schema_version: 1, shopify_product_id: '1234', product_handle: 'fixture-design', source_kind: 'product', product_match_verified: true, source_product_id: '1600000000000', source_product_url: source, reviews, ...changes });

test('requires exact product mapping and rejects supplier-wide or unapproved content', () => {
  assert.deepEqual(filterProductReviews(undefined, product, now), []);
  for (const changed of [{ shopify_product_id: '9999' }, { product_handle: 'another-design' }, { source_kind: 'supplier' }, { product_match_verified: false }]) assert.deepEqual(filterProductReviews(envelope(undefined, changed), product, now), []);
  assert.deepEqual(filterProductReviews(envelope([review({ publication_approved: false }), review({ reuse_basis: '' })]), product, now), []);
});

test('allows authentic rating range without cherry-picking and counts unique valid records', () => {
  const data = envelope([review({ rating: 1 }), review({ id: 'fixture-review-2', rating: 5 }), review(), review({ id: 'fixture-review-3', rating: 7 }), review({ id: 'fixture-review-4', date: '2026-02-30' }), review({ id: 'fixture-review-5', date: '2026-09-11' })]);
  const accepted = filterProductReviews(data, product, now);
  assert.deepEqual(accepted.map(r => r.rating), [1, 5]);
  assert.equal(accepted.length, 2);
  assert.equal(accepted[0].verifiedPurchase, false);
  assert.equal(filterProductReviews(envelope(Array.from({ length: 30 }, (_, i) => review({ id: `fixture-${i}`, reuse_basis: 'permission_confirmed' }))), product, now).length, 25);
});

test('only links canonical HTTPS product pages with matching source IDs', () => {
  assert.equal(reviewSource(source, '1600000000000'), 'Alibaba');
  assert.equal(reviewSource('https://www.aliexpress.com/item/1005000000000000.html', '1005000000000000'), 'AliExpress');
  for (const bad of [source.replace('https:', 'http:'), source.replace('www.alibaba.com', 'www.alibaba.com.evil.test'), source.replace('www.alibaba.com', 'www.alibaba.com@evil.test'), source + '?redirect=https://evil.test', source + '#other', 'javascript:alert(1)', source.replace('_1600000000000', '_1600000000001')]) assert.equal(reviewSource(bad, '1600000000000'), null);
  assert.deepEqual(filterProductReviews(envelope([review({ source_product_id: '1600000000001' })]), product, now), []);
});

test('approved source record belongs only to Midnight Muse and retains its limitation', () => {
  const records = JSON.parse(readFileSync(new URL('../data/verified-reviews.json', import.meta.url), 'utf8'));
  const realProduct = { id: 'gid://shopify/Product/11125707506001', handle: 'midnight-muse-halloween-press-on-nails' };
  const data = records.products[realProduct.handle];
  const accepted = filterProductReviews(data, realProduct, now);
  assert.equal(accepted.length, 1);
  assert.equal(accepted[0].text.split(/\s+/u).length, 5);
  assert.equal(accepted[0].variantVerified, false);
  assert.equal(accepted[0].verifiedPurchase, true);
  assert.deepEqual(filterProductReviews(data, { ...realProduct, id: 'HT001' }, now), []);
  const longQuote = review({ text: Array.from({ length: 26 }, () => 'word').join(' ') });
  assert.deepEqual(filterProductReviews(envelope([longQuote]), product, now), []);
});

test('rating-only feedback counts without turning a platform-generated summary into customer words', () => {
  const genuineRatingOnly = review({ content_kind: 'rating_only', reuse_basis: 'factual_rating', text: null, rating: 5 });
  const accepted = filterProductReviews(envelope([genuineRatingOnly]), product, now);
  assert.equal(accepted.length, 1);
  assert.equal(accepted[0].rating, 5);
  assert.equal(accepted[0].text, null);
  assert.deepEqual(filterProductReviews(envelope([review({ ...genuineRatingOnly, text: 'Automatic platform summary, not customer words.' })]), product, now), []);
  assert.deepEqual(filterProductReviews(envelope([review({ text: null })]), product, now), []);
  const registered = JSON.parse(readFileSync(new URL('../data/verified-reviews.json', import.meta.url), 'utf8'));
  const crimson = { id: 'gid://shopify/Product/11125912306001', handle: 'crimson-ritual-red' };
  const mapped = filterProductReviews(registered.products[crimson.handle], crimson, now);
  assert.equal(mapped.length, 1);
  assert.equal(mapped[0].author, 'S***n');
  assert.equal(mapped[0].text, null);
  assert.equal(mapped[0].verifiedPurchase, true);
  assert.equal(mapped[0].variantVerified, false);
  assert.deepEqual(filterProductReviews(registered.products[crimson.handle], { ...crimson, id: 'gid://shopify/Product/11125707506001' }, now), []);
});

function reviewRenderer() {
  const localData = JSON.parse(readFileSync(new URL('../data/verified-reviews.json', import.meta.url), 'utf8'));
  const componentSource = readFileSync(new URL('../components/product-reviews.tsx', import.meta.url), 'utf8');
  const compiled = ts.transpileModule(componentSource, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  const actualRequire = createRequire(import.meta.url);
  const exports = {};
  const componentRequire = specifier => {
    if (specifier === '@/data/verified-reviews.json') return localData;
    if (specifier === '@/lib/review-validation') return { filterProductReviews };
    if (specifier === '@/lib/native-shopify') return nativeShopifyModule;
    if (specifier.endsWith('.css')) return {};
    return actualRequire(specifier);
  };
  new Function('require', 'exports', compiled)(componentRequire, exports);
  return { localData, render: product => renderToStaticMarkup(exports.ProductReviews({ product })) };
}

test('rendered live reviews use Shopify exclusively, including an empty or removed metafield', () => {
  const { localData, render } = reviewRenderer();
  const product = { id: 'gid://shopify/Product/11125707506001', handle: 'midnight-muse-halloween-press-on-nails', source: 'shopify' };
  for (const supplierReviews of [undefined, null, { reviews: [] }]) {
    const html = render({ ...product, supplierReviews });
    assert.ok(html.includes('No reviews added yet'));
    assert.ok(!html.includes('D***h'));
  }
  const live = structuredClone(localData.products[product.handle]);
  live.reviews[0].author = 'Live source author';
  const liveHtml = render({ ...product, supplierReviews: live });
  assert.ok(liveHtml.includes('Live source author'));
  assert.ok(!liveHtml.includes('D***h'));
  const previewHtml = render({ ...product, source: 'preview', supplierReviews: live });
  assert.ok(previewHtml.includes('D***h'));
  assert.ok(!previewHtml.includes('Live source author'));
});

test('native snapshot reviews link to that design on Shopify without copying stale preview reviews', () => {
  const { render } = reviewRenderer();
  const handle = 'haunted-tips-night-crawlers';
  const html = render({ id: 'gid://shopify/Product/11126156525905', handle, source: 'shopify-snapshot' });
  assert.ok(html.includes(`https://${nativeShopifyModule.nativeShopify.storeDomain}/products/${handle}#judgeme_product_reviews`));
  assert.ok(html.includes('Read customer reviews'));
  assert.ok(html.includes('not verified purchases from Haunted Tips'));
  assert.ok(!html.includes('No reviews added yet'));
  assert.ok(!html.includes('D***h'));
  assert.ok(!html.includes('out of 5'));
});
