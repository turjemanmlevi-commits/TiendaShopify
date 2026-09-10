export type NailMood =
  | "All"
  | "Gothic Romance"
  | "Little Frights"
  | "After Dark";
export type Product = {
  id: string;
  handle: string;
  name: string;
  subtitle: string;
  description: string;
  price: number;
  currency: "USD";
  image: string;
  images: string[];
  imageAlt: string;
  shape: string;
  length: string;
  mood: Exclude<NailMood, "All">;
  details: string[];
  available: boolean;
  variantId: string | null;
  source: "shopify" | "preview";
  supplierReviews?: unknown;
};
