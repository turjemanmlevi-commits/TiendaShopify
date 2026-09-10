import verified_review_json from "@/data/verified-reviews.json";
import { filterProductReviews } from "@/lib/review-validation";
import type { Product } from "@/lib/types";
import "./product-reviews.css";

export function ProductReviews({ product }: { product: Product }) {
  const sources = verified_review_json.products as Record<string, unknown>;
  const reviewData = product.source === "shopify"
    ? product.supplierReviews
    : sources[product.handle];
  const reviews = filterProductReviews(reviewData, product);
  return (
    <section className="source-reviews shell" aria-labelledby={`reviews-${product.handle}`}>
      <div className="source-reviews__heading">
        <h2 id={`reviews-${product.handle}`}>Product <i>reviews.</i></h2>
        {reviews.length > 0 && <p>{reviews.length} sourced {reviews.length === 1 ? "review" : "reviews"}</p>}
      </div>
      {reviews.length === 0 ? (
        <div className="source-reviews__empty">
          <h3>No reviews added yet</h3>
          <p>There are no sourced reviews for this design here yet.</p>
        </div>
      ) : (
        <>
          <p className="source-reviews__attribution">Originally published on {reviews[0].platform} for this product listing.</p>
          <ul className="source-reviews__list" role="list">
            {reviews.map(review => (
              <li key={review.id} className="source-reviews__card">
                <div className="source-reviews__byline">
                  <strong>{review.author}</strong>
                  <time dateTime={review.date}>{new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${review.date}T00:00:00Z`))}</time>
                </div>
                <p className="source-reviews__rating">{review.rating} out of 5</p>
                <p className="source-reviews__text">{review.text ?? "Rating only — no written review was provided."}</p>
                <p className="source-reviews__verification">Review of the supplier listing on {review.platform} — not a Haunted Tips purchase.{!review.variantVerified && " Exact variant not recorded."}</p>
                {review.verifiedPurchase && <p className="source-reviews__verification">Purchase marked as verified by {review.platform}</p>}
                <a className="source-reviews__source" href={review.sourceUrl} target="_blank" rel="noopener noreferrer">Read at {review.platform} <span aria-hidden="true">↗</span></a>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
