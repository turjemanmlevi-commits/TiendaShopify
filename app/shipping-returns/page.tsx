import type { Metadata } from "next";
import { EditorialPage } from "@/components/editorial-page";
import { site } from "@/lib/site";
export const metadata: Metadata = {
  title: "Shipping & Returns",
  robots: { index: false, follow: true },
};
export default function Page() {
  return (
    <EditorialPage
      eyebrow="Before your order"
      title="Shipping & returns."
      intro="The practical details deserve as much care as the pretty ones."
    >
      <div className="editorial-page__note">
        <p>
          We are preparing this collection for launch. Checkout remains closed
          for designs whose stock and delivery arrangements have not yet been
          confirmed.
        </p>
      </div>
      <h2 id="shipping">Delivery to the United States</h2>
      <p>
        Delivery options, charges and estimated dates depend on the design,
        supplier and destination. We will confirm those details before taking
        payment. A supplier&apos;s sample shipping estimate is not a delivery
        promise for every address.
      </p>
      <h2 id="returns">Returns and order questions</h2>
      <p>
        Our final return window, eligibility rules and return instructions are
        being completed before checkout opens. Do not send a return without the
        correct instructions and destination.
      </p>
      <p>
        For product questions or help with an existing order, email{" "}
        <a href={"mailto:" + site.email}>{site.email}</a>. Include your order
        number if you have one, and a description of what you need help with.
      </p>
      <h2>Damaged or incorrect items</h2>
      <p>
        If your order arrives damaged or contains an incorrect item, contact us
        with your order number and clear photos of the item and packaging so we
        can review it with you.
      </p>
    </EditorialPage>
  );
}
