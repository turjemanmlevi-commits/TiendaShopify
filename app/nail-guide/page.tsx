import type { Metadata } from "next";
import { EditorialPage } from "@/components/editorial-page";
export const metadata: Metadata = { title: "Your Nail Ritual" };
export default function Page() {
  return (
    <EditorialPage
      eyebrow="Your nail ritual"
      title="The details make the spell."
      intro="A considered fit and a little preparation help your chosen design feel more like you."
    >
      <h2>Before you choose</h2>
      <p>
        Look at the shape, length and contents on the individual product page.
        Check the supplier&apos;s measurements against your natural nails before
        ordering. Sets and included sizes vary; a piece count is not a guarantee
        of fit.
      </p>
      <h2>Your getting-ready ritual</h2>
      <ol>
        <li>
          <strong>Match your sizes.</strong> Lay the nails out in order and
          check the fit of each one before using any adhesive. A nail should sit
          comfortably without pressing on the surrounding skin.
        </li>
        <li>
          <strong>Prepare as directed.</strong> Follow the preparation
          instructions supplied with the set and your chosen adhesive. Keep your
          nails clean and dry.
        </li>
        <li>
          <strong>Follow the adhesive instructions.</strong> Different glues and
          adhesive tabs have different application and removal steps. Use only
          the quantity and method stated on their packaging.
        </li>
        <li>
          <strong>Take your time removing them.</strong> Follow the recommended
          removal method. Never pull or force the nails off.
        </li>
      </ol>
      <h2>A few things to keep in mind</h2>
      <p>
        Wear time and reusability depend on the particular set, fit,
        preparation, adhesive and daily use. We do not promise a fixed wear time
        for every design.
      </p>
      <p>
        Read the warnings supplied with adhesives and removers. Avoid applying
        them to damaged or irritated nails or skin, and stop use if irritation
        occurs.
      </p>
    </EditorialPage>
  );
}
