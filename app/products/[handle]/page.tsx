import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Sparkles } from "lucide-react";
import { getProduct, getProducts } from "@/lib/shopify";
import { ProductGallery } from "@/components/product-gallery";
import { ProductCard } from "@/components/product-card";
import { AddToCart } from "@/components/cart";
import { site } from "@/lib/site";
import "./product.css";

type Props = { params: Promise<{ handle: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).handle);
  if (!product) return { title: "Design not found", robots: { index: false } };
  return {
    title: product.name,
    description: product.description.slice(0, 160),
    alternates: { canonical: `/products/${product.handle}` },
    openGraph: {
      title: product.name,
      description: product.subtitle,
      images: [{ url: product.image, alt: product.imageAlt }],
    },
    robots: {
      index:
        product.source === "shopify" &&
        process.env.STOREFRONT_LAUNCH_READY === "true",
      follow: true,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct((await params).handle);
  if (!product) notFound();
  const catalog = await getProducts();
  const related = [
    ...catalog.filter(
      (p) => p.handle !== product.handle && p.mood === product.mood,
    ),
    ...catalog.filter(
      (p) => p.handle !== product.handle && p.mood !== product.mood,
    ),
  ].slice(0, 4);
  return (
    <article className="product-page">
      <nav className="product-breadcrumb shell" aria-label="Breadcrumb">
        <Link href="/shop">
          <ArrowLeft size={13} aria-hidden="true" /> The collection
        </Link>
        <span aria-hidden="true">/</span>
        <span>{product.name}</span>
      </nav>
      <div className="product-layout shell">
        <ProductGallery product={product} />
        <div className="product-info">
          <p className="eyebrow">
            <Sparkles size={13} aria-hidden="true" /> {product.mood}
          </p>
          <h1>
            {product.name}
            <i>.</i>
          </h1>
          <p className="product-subtitle">{product.subtitle}</p>
          <div className="product-price-row">
            <span>
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: product.currency,
              }).format(product.price)}
            </span>
            <small>
              {product.source === "preview" ? "Proposed price · USD" : "USD"}
            </small>
          </div>
          <p className="product-description">{product.description}</p>
          <dl className="product-attributes">
            <div>
              <dt>Shape</dt>
              <dd>{product.shape}</dd>
            </div>
            <div>
              <dt>Length</dt>
              <dd>{product.length}</dd>
            </div>
            <div>
              <dt>Collection</dt>
              <dd>Halloween</dd>
            </div>
          </dl>
          <AddToCart product={product} />
          <a className="product-sizing" href="/nail-guide">
            Find your fit & application guide{" "}
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
          <div className="product-accordions">
            <details open>
              <summary>The little details</summary>
              <ul>
                {product.details.map((detail) => (
                  <li key={detail}>{detail}</li>
                ))}
              </ul>
            </details>
            <details>
              <summary>Make them your own</summary>
              <p>
                Pair this set with your favorite dark knit, a ribbon in your
                hair, or an outfit that deserves one unexpected detail.
                Halloween is in the finishing touches.
              </p>
              <p>
                Follow the sizing and adhesive instructions supplied with your
                chosen set. Our <Link href="/nail-guide">nail guide</Link>{" "}
                covers the basics.
              </p>
            </details>
            <details>
              <summary>Delivery & returns</summary>
              <p>
                {product.source === "preview"
                  ? "This design is being prepared for launch. Stock, delivery costs and the final return policy need to be confirmed before orders open."
                  : "Available shipping options and charges are shown at checkout. Read our shipping and returns information before placing your order."}
              </p>
              <Link href="/shipping-returns">
                Read shipping & returns <span aria-hidden="true">↗</span>
              </Link>
            </details>
            <details>
              <summary>A question about this set?</summary>
              <p>
                We would love to help you choose. Email{" "}
                <a
                  href={`mailto:${site.email}?subject=${encodeURIComponent(`A question about ${product.name}`)}`}
                >
                  {site.email}
                </a>{" "}
                and mention {product.name}.
              </p>
            </details>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="product-related shell section">
          <div className="product-related__heading">
            <div>
              <p className="eyebrow">Another little temptation</p>
              <h2>
                You might fall <i>under their spell.</i>
              </h2>
            </div>
            <Link className="text-link" href="/shop">
              Explore all designs <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
