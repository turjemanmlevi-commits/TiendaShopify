import approvedImages from "../data/approved-product-images.json" with { type: "json" };

type ApprovedImage = { image: string; imageAlt: string };
const manifest: Record<string, ApprovedImage> = approvedImages;
export const IMAGE_COMING_SOON = "/images/image-coming-soon.svg";

// Only exact, reviewed handles can select product photography for the storefront.
export function publicProductImagery(handle: string, name = "this design") {
  const approved = Object.hasOwn(manifest, handle) ? manifest[handle] : undefined;
  const image = approved?.image || IMAGE_COMING_SOON;
  return {
    image,
    images: [image],
    imageAlt:
      approved?.imageAlt ||
      `Image coming soon for ${name}. No product photograph is shown.`,
  };
}
