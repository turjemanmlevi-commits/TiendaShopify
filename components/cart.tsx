"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Image from "next/image";
import { ShoppingBag, X, Minus, Plus, ArrowRight } from "lucide-react";
import type { Product } from "@/lib/types";
import type { Cart, CartAction, CartResponse } from "@/lib/cart-types";
import { nativeShopify, nativeStoreOrigin, nativeProductDestination } from "@/lib/native-shopify";
import "./cart.css";

type CartContextValue = {
  nativeMode: boolean;
  cart: Cart | null;
  busy: boolean;
  configured: boolean | null;
  open: () => void;
  change: (action: CartAction) => Promise<void>;
};
const CartContext = createContext<CartContextValue | null>(null);
function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("Cart components require CartProvider.");
  return context;
}
const money = (amount: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", { style: "currency", currency }).format(
    amount,
  );
async function fetchCurrentCart(): Promise<CartResponse> {
  const response = await fetch("/api/cart", { cache: "no-store" });
  const result = (await response.json()) as CartResponse;
  if (!response.ok)
    throw new Error(
      result.error || "We could not open your bag. Please try again.",
    );
  return result;
}

export function CartProvider({ children, nativeMode = false }: { children: ReactNode; nativeMode?: boolean }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [busy, setBusy] = useState(!nativeMode);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [opened, setOpened] = useState(false);
  const [error, setError] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const result = await fetchCurrentCart();
      setCart(result.cart);
      setConfigured(result.configured);
    } catch (e) {
      setError(e instanceof Error ? e.message : "We could not open your bag.");
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (nativeMode) return;
    let ignore = false;
    fetchCurrentCart()
      .then((result) => {
        if (!ignore) {
          setCart(result.cart);
          setConfigured(result.configured);
        }
      })
      .catch((e) => {
        if (!ignore)
          setError(
            e instanceof Error ? e.message : "We could not open your bag.",
          );
      })
      .finally(() => {
        if (!ignore) setBusy(false);
      });
    return () => {
      ignore = true;
    };
  }, [nativeMode]);
  useEffect(() => {
    const element = dialog.current;
    if (!opened || !element) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    return () => {
      element.close();
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus();
    };
  }, [opened]);

  const change = useCallback(async (action: CartAction) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError("");
    setWarnings([]);
    setOpened(true);
    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action),
      });
      const result = (await response.json()) as CartResponse;
      if (!response.ok)
        throw new Error(
          result.error || "We could not update your bag. Please try again.",
        );
      setCart(result.cart);
      setConfigured(result.configured);
      setWarnings(result.warnings || []);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "We could not update your bag.",
      );
    } finally {
      setBusy(false);
      inFlight.current = false;
    }
  }, []);

  const unavailable =
    cart?.lines.some((line) => line.availableQuantity < line.quantity) ?? false;
  return (
    <CartContext.Provider
      value={{ cart, busy, configured, nativeMode, open: () => setOpened(true), change }}
    >
      {children}
      <dialog
        ref={dialog}
        className="ht-cart"
        aria-labelledby="ht-cart-title"
        onCancel={(event) => {
          event.preventDefault();
          setOpened(false);
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpened(false);
        }}
        onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const focusable = Array.from(
            dialog.current?.querySelectorAll<HTMLElement>(
              'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), [tabindex="0"]',
            ) || [],
          ).filter((el) => el.getClientRects().length);
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }}
      >
        <div className="ht-cart__surface">
          <header className="ht-cart__header">
            <div>
              <p className="ht-cart__eyebrow">A little after-dark ritual</p>
              <h2 id="ht-cart-title">
                Your bag<span aria-hidden="true">.</span>
              </h2>
            </div>
            <button
              ref={closeButton}
              type="button"
              className="ht-cart__icon"
              aria-label="Close shopping bag"
              onClick={() => setOpened(false)}
            >
              <X size={23} />
            </button>
          </header>
          <div className="ht-cart__body" aria-busy={busy}>
            {error && (
              <div role="alert" className="ht-cart__notice">
                <p>{error}</p>
                <button
                  type="button"
                  onClick={() => {
                    setBusy(true);
                    setError("");
                    void refresh();
                  }}
                  disabled={busy}
                >
                  Refresh bag
                </button>
              </div>
            )}
            {warnings.map((warning, i) => (
              <p key={i} role="status" className="ht-cart__notice">
                {warning}
              </p>
            ))}
            {busy && !cart && (
              <p role="status" className="ht-cart__empty">
                Opening your bag…
              </p>
            )}
            {!busy && !error && !cart?.lines.length && (
              <div className="ht-cart__empty">
                <ShoppingBag size={40} strokeWidth={1} aria-hidden="true" />
                <h3>A little room for magic.</h3>
                <p>
                  {configured === false
                    ? "Explore the collection preview. Shopping opens once product availability and the store connection are confirmed."
                    : "Your bag is waiting for your favorite nail designs."}
                </p>
                <a href="/shop" onClick={() => setOpened(false)}>
                  Explore the collection{" "}
                  <ArrowRight size={16} aria-hidden="true" />
                </a>
              </div>
            )}
            {cart?.lines.map((line) => (
              <article className="ht-cart__line" key={line.id}>
                {line.image ? (
                  <Image
                    src={line.image}
                    alt={line.title}
                    width={96}
                    height={120}
                    unoptimized
                    className="ht-cart__image"
                  />
                ) : (
                  <div
                    className="ht-cart__image ht-cart__image--empty"
                    aria-hidden="true"
                  >
                    <ShoppingBag />
                  </div>
                )}
                <div className="ht-cart__line-details">
                  <a
                    href={`/products/${line.handle}`}
                    onClick={() => setOpened(false)}
                    className="ht-cart__product"
                  >
                    {line.title}
                  </a>
                  {line.variantTitle !== "Default Title" && (
                    <p className="ht-cart__variant">{line.variantTitle}</p>
                  )}
                  <p className="ht-cart__line-price">
                    {money(line.total, cart.currency)}
                  </p>
                  {line.availableQuantity < line.quantity && (
                    <p className="ht-cart__stock" role="status">
                      This quantity is no longer available. Reduce it or remove
                      the set.
                    </p>
                  )}
                  <div className="ht-cart__line-actions">
                    <div
                      className="ht-cart__quantity"
                      aria-label={`Quantity for ${line.title}`}
                    >
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${line.title}`}
                        disabled={busy || line.quantity <= 1}
                        onClick={() =>
                          void change({
                            action: "update",
                            lineId: line.id,
                            quantity: line.quantity - 1,
                          })
                        }
                      >
                        <Minus size={13} />
                      </button>
                      <span aria-live="polite">{line.quantity}</span>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${line.title}`}
                        disabled={
                          busy ||
                          line.quantity >= Math.min(10, line.availableQuantity)
                        }
                        onClick={() =>
                          void change({
                            action: "update",
                            lineId: line.id,
                            quantity: line.quantity + 1,
                          })
                        }
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                    <button
                      className="ht-cart__remove"
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        void change({ action: "remove", lineId: line.id })
                      }
                    >
                      Remove
                      <span className="ht-cart__sr-only"> {line.title}</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
          {!!cart?.lines.length && (
            <footer className="ht-cart__footer">
              <div className="ht-cart__total">
                <span>Estimated total</span>
                <strong>{money(cart.total, cart.currency)}</strong>
              </div>
              <p>
                Shipping and taxes are calculated at checkout. Stock is checked
                again before payment.
              </p>
              {unavailable || busy ? (
                <button type="button" className="ht-cart__checkout" disabled>
                  {busy
                    ? "Updating your bag…"
                    : "Update unavailable items to continue"}
                </button>
              ) : (
                <a className="ht-cart__checkout" href={cart.checkoutUrl}>
                  Continue to checkout{" "}
                  <ArrowRight size={18} aria-hidden="true" />
                </a>
              )}
              <button
                type="button"
                className="ht-cart__continue"
                onClick={() => setOpened(false)}
              >
                Keep exploring
              </button>
            </footer>
          )}
        </div>
      </dialog>
    </CartContext.Provider>
  );
}

export function CartTrigger() {
  const { cart, open, nativeMode } = useCart();
  const origin = nativeStoreOrigin(nativeShopify.storeDomain);
  if (nativeMode && origin && nativeShopify.cartVerified) {
    return <a href={`${origin}/cart`} className="ht-cart-trigger" aria-label="Open your bag in Shopify">
      <ShoppingBag size={22} strokeWidth={1.35} aria-hidden="true" />
    </a>;
  }
  const count = cart?.totalQuantity || 0;
  return (
    <button
      type="button"
      className="ht-cart-trigger"
      onClick={open}
      aria-label={`Open shopping bag, ${count} ${count === 1 ? "item" : "items"}`}
    >
      <ShoppingBag size={22} strokeWidth={1.35} aria-hidden="true" />
      {count > 0 && <span aria-hidden="true">{count}</span>}
    </button>
  );
}

export function AddToCart({ product }: { product: Product }) {
  const { busy, configured, change, nativeMode } = useCart();
  const destination = nativeMode ? nativeProductDestination(product) : null;
  if (nativeMode && product.source === "shopify-snapshot") {
    return <div className="ht-add">
      {destination ? <a className="ht-add__button" href={destination}>
        {(product.variants?.length ?? 0) > 1 ? "Choose your size" : "View options & add to bag"}
        <ShoppingBag size={18} aria-hidden="true" />
      </a> : <button type="button" className="ht-add__button" disabled>Currently unavailable</button>}
      {nativeShopify.bogoVerified && <p className="ht-add__note"><strong>{nativeShopify.offerTitle}.</strong> {nativeShopify.offerDetails}</p>}
      <p className="ht-add__note">Your selection opens in Shopify, where current stock, pricing and delivery are checked.</p>
      {!nativeShopify.paymentsEnabled && <p className="ht-add__note" role="status">{nativeShopify.setupNotice}</p>}
    </div>;
  }
  const ready =
    configured === true &&
    product.source === "shopify" &&
    product.available &&
    Boolean(product.variantId);
  const label =
    product.source === "preview"
      ? "Preview · not available to order"
      : !product.available
        ? "Currently out of stock"
        : busy
          ? "Please wait…"
          : configured !== true
            ? "Shopping is not open yet"
            : "Add to bag";
  const note =
    product.source === "preview"
      ? "This design is a collection preview. Price and product details must be confirmed before ordering."
      : !product.available
        ? "We only accept orders when confirmed stock is available."
        : "Ordering is not enabled yet. We are completing the store connection and delivery checks.";
  return (
    <div className="ht-add">
      <button
        type="button"
        className="ht-add__button"
        disabled={!ready || busy}
        onClick={() => {
          if (ready && product.variantId)
            void change({
              action: "add",
              variantId: product.variantId,
              quantity: 1,
            });
        }}
      >
        {label}
        {ready && <ShoppingBag size={18} aria-hidden="true" />}
      </button>
      {!ready && <p className="ht-add__note">{note}</p>}
    </div>
  );
}
