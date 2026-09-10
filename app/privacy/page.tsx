import type { Metadata } from "next";
import { EditorialPage } from "@/components/editorial-page";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy — Collection Preview",
  description:
    "How information is handled while you explore the Haunted Tips collection preview.",
  robots: { index: false, follow: true },
};

export default function PrivacyPage() {
  return (
    <EditorialPage
      eyebrow="Your information matters"
      title="A little privacy, please."
      intro="Here is what to know about information you share while exploring our collection preview."
    >
      <div className="editorial-page__note">
        <p>
          This is a preview notice, updated September 10, 2026. Our complete
          store privacy policy, including the business operator&apos;s legal
          details and the services used at launch, is being finalized before the
          store opens for orders.
        </p>
      </div>
      <h2>When you browse</h2>
      <p>
        Your browser sends information needed to load this website, such as your
        IP address, browser details and the pages or files requested, to the
        services that deliver it. Technical logs may be used to keep the site
        working and investigate errors.
      </p>
      <h2>When you contact us</h2>
      <p>
        If you email us, we receive your email address, your message and any
        attachments you choose to include. We use that information to respond to
        your request. Please share only what is needed to help, and do not send
        passwords, payment card details or identity documents.
      </p>
      <h2>Your shopping bag</h2>
      <p>
        When the shopping bag is enabled, a necessary cookie remembers your bag
        so you can continue browsing. It is set to expire after 10 days and may
        be refreshed when you update your bag. Clearing your browser&apos;s
        cookies can remove that connection.
      </p>
      <p>
        Products marked as previews cannot be purchased. If checkout becomes
        available for an eligible product, it is handled through Shopify. Review
        the privacy information presented there before submitting your checkout
        details.
      </p>
      <h2>Questions about your information</h2>
      <p>
        Contact <a href={`mailto:${site.email}`}>{site.email}</a> with a privacy
        question or a request about information you have shared with us. Tell us
        enough to identify your request without including sensitive documents.
      </p>
      <h2>Before the store opens</h2>
      <p>
        The final policy will identify the business responsible for your
        information and explain the purposes, retention periods, service
        providers and privacy choices that apply to the launched store. This
        preview notice will be updated as those arrangements are confirmed.
      </p>
    </EditorialPage>
  );
}
