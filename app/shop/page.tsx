import type { Metadata } from "next";
import { Bow } from "@/components/brand-mark";
import { ShopGrid } from "@/components/shop-grid";
import { getProducts } from "@/lib/shopify";

export const metadata: Metadata = {
  title: "Shop Halloween Press-On Nails",
  description:
    "Explore dark romantic press-on nails, playful Halloween details and your next midnight manicure.",
};
export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ mood?: string; search?: string }>;
}) {
  const [products, params] = await Promise.all([getProducts(), searchParams]);
  return (
    <>
      <section className="shop-intro shell">
        <Bow />
        <p className="eyebrow">THE HAUNTED TIPS NAIL EDIT</p>
        <h1>
          Pick your <i>pretty.</i>
        </h1>
        <p>
          A little dark, a little darling. All your next nail moods, right here.
        </p>
      </section>
      <section className="shell shop-catalog">
        {products[0]?.source === "preview" && (
          <p className="collection-preview-note">
            Collection preview · Checkout opens after availability is confirmed.
          </p>
        )}
        <ShopGrid
          key={`${params.mood || ""}-${params.search || ""}`}
          products={products}
          initialMood={params.mood}
          initialSearch={params.search}
        />
      </section>
    </>
  );
}
