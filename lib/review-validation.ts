export type SourcedReview = {
  id: string;
  author: string;
  rating: number;
  date: string;
  text: string | null;
  sourceUrl: string;
  platform: "Alibaba" | "AliExpress";
  verifiedPurchase: boolean;
  variantVerified: boolean;
};

type RecordValue = Record<string, unknown>;
const record = (value: unknown): value is RecordValue =>
  value !== null && typeof value === "object" && !Array.isArray(value);

export function reviewSource(url: unknown, id: unknown): "Alibaba" | "AliExpress" | null {
  if (typeof url !== "string" || typeof id !== "string" || !/^\d+$/.test(id)) return null;
  if (!/^https:\/\//.test(url) || /[\s\\]/.test(url)) return null;
  let parsed: URL;
  try { parsed = new URL(url); } catch { return null; }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.port || parsed.search || parsed.hash) return null;
  if (parsed.href !== url) return null;
  if (["alibaba.com", "www.alibaba.com"].includes(parsed.hostname) && new RegExp(`^/product-detail/[^/]+_${id}\\.html$`).test(parsed.pathname)) return "Alibaba";
  if (["aliexpress.com", "www.aliexpress.com"].includes(parsed.hostname) && parsed.pathname === `/item/${id}.html`) return "AliExpress";
  return null;
}

export function filterProductReviews(
  raw: unknown,
  product: { id: string; handle: string },
  now = new Date(),
): SourcedReview[] {
  if (!record(raw) || raw.schema_version !== 1 || raw.source_kind !== "product" || raw.product_match_verified !== true) return [];
  const productId = product.id.replace(/^gid:\/\/shopify\/Product\//, "");
  if (typeof raw.shopify_product_id !== "string" || raw.shopify_product_id !== productId || raw.product_handle !== product.handle) return [];
  const platform = reviewSource(raw.source_product_url, raw.source_product_id);
  if (!platform || !Array.isArray(raw.reviews)) return [];
  const accepted: SourcedReview[] = [];
  const seen = new Set<string>();
  let quotedWords = 0;
  for (const row of raw.reviews.slice(0, 50)) {
    if (accepted.length >= 25) break;
    if (!record(row) || row.publication_approved !== true) continue;
    const ratingOnly = row.content_kind === "rating_only";
    const reviewText = typeof row.text === "string" ? row.text.trim() : null;
    if (ratingOnly) {
      if (row.reuse_basis !== "factual_rating" || reviewText || (row.text != null && typeof row.text !== "string")) continue;
    } else if (!["brief_attributed_quote", "permission_confirmed"].includes(String(row.reuse_basis)) || !reviewText || reviewText.length > 2000) continue;
    if (row.source_url !== raw.source_product_url || row.source_product_id !== raw.source_product_id) continue;
    if (typeof row.id !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.id) || seen.has(row.id)) continue;
    if (typeof row.author !== "string" || !row.author.trim() || row.author.trim().length > 80) continue;
    if (typeof row.rating !== "number" || !Number.isInteger(row.rating) || row.rating < 1 || row.rating > 5) continue;
    if (typeof row.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)) continue;
    const time = Date.parse(`${row.date}T00:00:00Z`);
    if (!Number.isFinite(time) || time < Date.UTC(2000, 0, 1) || time > now.getTime() || new Date(time).toISOString().slice(0, 10) !== row.date) continue;
    if (row.reuse_basis === "brief_attributed_quote") {
      const words = (reviewText || "").split(/\s+/u).length;
      if (quotedWords + words > 25) continue;
      quotedWords += words;
    }
    seen.add(row.id);
    accepted.push({ id: row.id, author: row.author.trim(), rating: row.rating, date: row.date, text: ratingOnly ? null : reviewText, sourceUrl: row.source_url as string, platform, verifiedPurchase: row.verified_purchase === true, variantVerified: row.variant_verified === true });
  }
  return accepted;
}
