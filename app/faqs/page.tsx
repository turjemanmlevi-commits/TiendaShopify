import type { Metadata } from "next";
import Link from "next/link";
import { EditorialPage } from "@/components/editorial-page";
export const metadata: Metadata = { title: "Questions & Little Mysteries" };
export default function Page() {
  return (
    <EditorialPage
      eyebrow="A little clarity"
      title="Questions & little mysteries."
      intro="A few helpful details before you find your Halloween manicure."
    >
      <details>
        <summary>What are press-on nails?</summary>
        <p>
          They are predesigned nail covers applied to your natural nails using a
          compatible nail adhesive. Check the instructions and contents of your
          chosen set before applying.
        </p>
      </details>
      <details>
        <summary>How do I know which size to choose?</summary>
        <p>
          Compare the measurements of the set with your natural nails. Shapes
          and size ranges vary by design. Our{" "}
          <Link href="/nail-guide">nail guide</Link> explains the basics;
          contact us if the size information you need is missing.
        </p>
      </details>
      <details>
        <summary>Is glue included?</summary>
        <p>
          Check the &ldquo;Details&rdquo; section on the individual product
          page. Adhesive, tools and packaging can vary, so we only list items
          confirmed for that set.
        </p>
      </details>
      <details>
        <summary>How long will they stay on?</summary>
        <p>
          Wear time depends on the set, preparation, fit, adhesive and daily
          use. Follow the instructions supplied with your chosen product. We do
          not advertise a guaranteed number of days.
        </p>
      </details>
      <details>
        <summary>How are the product images created?</summary>
        <p>
          The product pictures shown here are styled with AI using product
          references. Designs whose pictures are still being prepared show
          “Image coming soon” instead. Props and background styling are not
          included with a nail set.
        </p>
      </details>
      <details>
        <summary>Why is a design unavailable?</summary>
        <p>
          We only enable checkout for designs whose availability is confirmed in
          our store. An unavailable design may be awaiting supplier confirmation
          or may be sold out.
        </p>
      </details>
      <details>
        <summary>Where can I check delivery and returns?</summary>
        <p>
          Visit <Link href="/shipping-returns">Shipping &amp; Returns</Link>.
          Delivery charges and options must be confirmed before payment. For a
          specific question, <Link href="/contact">get in touch</Link>.
        </p>
      </details>
    </EditorialPage>
  );
}
