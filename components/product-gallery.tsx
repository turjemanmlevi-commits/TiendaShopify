"use client";

import Image from "next/image";
import { useState } from "react";
import type { Product } from "@/lib/types";

export function ProductGallery({ product }: { product: Product }) {
  const images = product.images.length ? product.images : [product.image];
  const [selected, setSelected] = useState(0);
  return (
    <div className="product-gallery">
      <div className="product-gallery__main">
        <Image
          src={images[selected]}
          alt={product.imageAlt}
          width={1000}
          height={1200}
          sizes="(max-width: 760px) 100vw, 55vw"
          preload
          unoptimized
        />
        <span className="product-gallery__label">The Halloween edit</span>
      </div>
      {images.length > 1 && (
        <div
          className="product-gallery__thumbnails"
          aria-label="Product photos"
        >
          {images.map((src, i) => (
            <button
              type="button"
              key={src}
              onClick={() => setSelected(i)}
              aria-label={`View photo ${i + 1} of ${product.name}`}
              aria-pressed={selected === i}
            >
              <Image src={src} alt="" width={90} height={110} unoptimized />
            </button>
          ))}
        </div>
      )}
      <p className="product-gallery__caption">
        Little details. A darker kind of lovely.
      </p>
    </div>
  );
}
