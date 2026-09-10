import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/types";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  return (
    <article className="product-card">
      <Link href={`/products/${product.handle}`} className="product-card-link">
        <div className="product-card-image">
          <Image
            src={product.image}
            alt={product.imageAlt || product.name}
            width={720}
            height={900}
            sizes="(max-width: 600px) 50vw, (max-width: 1000px) 33vw, 25vw"
            priority={priority}
            unoptimized
          />
          <span className="product-mood">{product.mood}</span>
          {!product.available && (
            <span className="product-availability">
              {product.source === "preview"
                ? "Preview"
                : "Currently unavailable"}
            </span>
          )}
          <span className="product-image-arrow" aria-hidden="true">
            <ArrowUpRight size={19} />
          </span>
        </div>
        <div className="product-card-details">
          <div>
            <h3>{product.name}</h3>
            <p>
              {product.subtitle ||
                [product.shape, product.length].filter(Boolean).join(" · ")}
            </p>
          </div>
          <span className="product-price">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: product.currency,
            }).format(product.price)}
          </span>
        </div>
      </Link>
    </article>
  );
}
