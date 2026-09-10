export type CartLine = {
  id: string;
  variantId: string;
  handle: string;
  title: string;
  variantTitle: string;
  image: string | null;
  quantity: number;
  availableQuantity: number;
  total: number;
};
export type Cart = {
  lines: CartLine[];
  totalQuantity: number;
  subtotal: number;
  total: number;
  currency: string;
  checkoutUrl: string;
};
export type CartAction =
  | { action: "add"; variantId: string; quantity: number }
  | { action: "update"; lineId: string; quantity: number }
  | { action: "remove"; lineId: string };
export type CartResponse = {
  cart: Cart | null;
  configured: boolean;
  error?: string;
  warnings?: string[];
};
