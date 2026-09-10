"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "./product-card";
import type { NailMood, Product } from "@/lib/types";

const moods: NailMood[] = [
  "All",
  "Gothic Romance",
  "Little Frights",
  "After Dark",
];
export function ShopGrid({
  products,
  initialMood = "All",
  initialSearch = "",
}: {
  products: Product[];
  initialMood?: string;
  initialSearch?: string;
}) {
  const [mood, setMood] = useState(
    moods.includes(initialMood as NailMood) ? initialMood : "All",
  );
  const [search, setSearch] = useState(initialSearch);
  const [shape, setShape] = useState("All shapes");
  const [sort, setSort] = useState("featured");
  const shapes = useMemo(
    () =>
      [
        ...new Set(products.map((product) => product.shape).filter(Boolean)),
      ].sort(),
    [products],
  );
  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    const result = products.filter(
      (product) =>
        (mood === "All" || product.mood === mood) &&
        (shape === "All shapes" || product.shape === shape) &&
        (!query ||
          `${product.name} ${product.description} ${product.mood} ${product.shape}`
            .toLowerCase()
            .includes(query)),
    );
    if (sort === "price-low") result.sort((a, b) => a.price - b.price);
    if (sort === "price-high") result.sort((a, b) => b.price - a.price);
    if (sort === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [products, mood, shape, search, sort]);
  const reset = () => {
    setMood("All");
    setSearch("");
    setShape("All shapes");
    setSort("featured");
  };
  return (
    <div className="shop-grid-section">
      <div className="mood-tabs" aria-label="Filter by mood">
        {moods.map((item) => (
          <button
            key={item}
            className={mood === item ? "selected" : ""}
            aria-pressed={mood === item}
            onClick={() => setMood(item)}
          >
            {item === "All" ? "All the pretty things" : item}
          </button>
        ))}
      </div>
      <div className="catalog-tools">
        <label className="catalog-search">
          <Search size={17} />
          <span className="sr-only">Search nail designs</span>
          <input
            type="search"
            value={search}
            placeholder="Find your nail obsession…"
            onChange={(event) => setSearch(event.target.value)}
          />
          {search && (
            <button
              className="icon-button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </label>
        <div className="catalog-selects">
          <SlidersHorizontal size={15} aria-hidden="true" />
          <label>
            <span className="sr-only">Nail shape</span>
            <select
              value={shape}
              onChange={(event) => setShape(event.target.value)}
            >
              <option>All shapes</option>
              {shapes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Sort nail designs</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </label>
        </div>
      </div>
      <p className="results-count" role="status" aria-live="polite">
        {filtered.length} {filtered.length === 1 ? "design" : "designs"} to fall
        for{mood !== "All" ? ` · ${mood}` : ""}
      </p>
      {filtered.length ? (
        <div className="product-grid">
          {filtered.map((product) => (
            <ProductCard product={product} key={product.id} />
          ))}
        </div>
      ) : (
        <div className="empty-catalog">
          <span aria-hidden="true">✧</span>
          <h2>No spells found.</h2>
          <p>
            Try a different word or mood. Your next set might be just around the
            corner.
          </p>
          <button className="button button-dark" onClick={reset}>
            Show every design
          </button>
        </div>
      )}
    </div>
  );
}
