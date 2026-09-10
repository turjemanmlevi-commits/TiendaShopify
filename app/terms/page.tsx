import type { Metadata } from "next";
import Link from "next/link";
import { EditorialPage } from "@/components/editorial-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms — Collection Preview",
  description:
    "Important details about browsing the Haunted Tips collection preview.",
  robots: { index: false, follow: true },
};

export default function TermsPage() {
  return (
    <EditorialPage
      eyebrow="The practical little details"
      title="Before the midnight magic."
      intro="A few clear notes about this collection preview, and what is still being prepared before launch."
    >
      <div className="editorial-page__note">
        <p>
          This page describes the current preview, updated September 10, 2026.
          It is not the store&apos;s final terms of sale. The business
          operator&apos;s legal details and complete purchase terms will be
          provided before the store opens for orders.
        </p>
      </div>
      <h2>Exploring the collection</h2>
      <p>
        You can browse nail designs, compare styles and contact us with
        questions. A product marked Preview is still being prepared for the
        store. A product marked unavailable cannot be added to your bag.
      </p>
      <h2>Prices and promotions</h2>
      <p>
        Prices are shown in US dollars. Preview prices and product details may
        change while the collection is being finalized. Before any purchase,
        review the current item price and the shipping charges, taxes and
        discounts shown at checkout.
      </p>
      <p>
        A promotion applies only to the products and conditions specified in
        that offer. An editorial image or collection name does not by itself
        make an item eligible for a discount.
      </p>
      <h2>The details of your set</h2>
      <p>
        Read the product description for its shape, length, nail count and
        included accessories. Props used to style a photograph are not included
        unless the product description says they are. Follow the application and
        removal instructions for the adhesive supplied with your chosen set.
      </p>
      <h2>Delivery and returns</h2>
      <p>
        Delivery arrangements and the final returns policy are being confirmed
        before orders open. You can read the current information on our{" "}
        <Link href="/shipping-returns">shipping and returns page</Link>. A
        Halloween theme does not guarantee delivery by Halloween.
      </p>
      <h2>Need a hand?</h2>
      <p>
        For questions about a design or the preview, email{" "}
        <a href={`mailto:${site.email}`}>{site.email}</a>. If you are asking
        about an existing order, include your order number so we can locate it.
      </p>
      <h2>When the store launches</h2>
      <p>
        The final terms will identify the seller and explain ordering, payments,
        delivery, cancellations, returns and the customer rights that apply.
        They will be available for review before a purchase is placed.
      </p>
    </EditorialPage>
  );
}
