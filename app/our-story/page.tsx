import type { Metadata } from "next";
import Image from "next/image";
import { EditorialPage } from "@/components/editorial-page";
export const metadata: Metadata = { title: "Our Story" };
export default function Page() {
  return (
    <EditorialPage
      eyebrow="A note from the haunt"
      title="For the beautifully bewitching."
      intro="Haunted Tips is a love letter to Halloween, little rituals and the details that make a look entirely yours."
    >
      <div className="editorial-story-photo"><Image src="/images/products/haunted-tips-pumpkin-web-french-styled.webp" alt="Pumpkin Web French long nude square nails with orange jack-o-lanterns, black webs, spiders and flame accents; AI-styled product photograph" width={1254} height={1254} sizes="(max-width: 700px) 100vw, 720px" /></div>
      <h2>Wicked nails. Sweet screams.</h2>
      <p>
        Black lace with a ribbon tied just so. A wine-colored lip. The last
        little detail before you head out. We love the place where romance meets
        a darker mood—and that is where Haunted Tips begins.
      </p>
      <p>
        Our edit brings together Halloween press-on nail designs for different
        sides of your style: delicate cobwebs, playful ghosts, dramatic reds and
        midnight finishes. Some days call for a quiet spell. Others call for a
        full entrance.
      </p>
      <h2>Choose your own kind of magic.</h2>
      <p>
        Wear a set with your Halloween costume, your favorite black dress or an
        oversized knit. There is no single way to make it yours. Explore the
        shapes and details, take a moment to check the fit, and choose the
        design you want to reach for.
      </p>
      <p>
        We curate the designs in our collection. Product details describe each
        individual set, and availability will always be shown on its product
        page.
      </p>
    </EditorialPage>
  );
}
