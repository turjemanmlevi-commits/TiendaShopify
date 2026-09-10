import type { Metadata } from "next";
import { EditorialPage } from "@/components/editorial-page";
import { site } from "@/lib/site";
export const metadata: Metadata = { title: "Contact the Haunt" };
export default function Page() {
  return (
    <EditorialPage
      eyebrow="We are a message away"
      title="Contact the haunt."
      intro="A question about a design, a detail or your order? We would love to help."
    >
      <h2>Send us a little note.</h2>
      <a className="editorial-page__email" href={"mailto:" + site.email}>
        {site.email}
      </a>
      <p>
        For product questions, include the design name. For order questions,
        include your order number and the email used at checkout. Please do not
        email card details or passwords.
      </p>
      <h2>A good place to start</h2>
      <p>
        Our <a href="/faqs">frequently asked questions</a> cover choosing a set,
        adhesives and availability. You can also find preparation and removal
        pointers in the <a href="/nail-guide">nail guide</a>.
      </p>
    </EditorialPage>
  );
}
