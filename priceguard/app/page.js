"use client";

import { useState, useEffect } from "react";
import AddProductForm from "../components/AddProductForm";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    setLoading(true);
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data.products || []);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleAdd(product) {
    await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(product),
    });
    loadProducts();
  }

  async function handleRemove(id) {
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <main className="wrap">
      <div className="ticker">
        <div className="ticker-label">PriceGuard // live tracking</div>
        <h1>Your watchlist</h1>
        <p className="subtitle">
          Add a product, set your target price, and we&apos;ll email you the moment it drops.
        </p>
      </div>

      <div className="section-label">Track a new product</div>
      <AddProductForm onAdd={handleAdd} />

      <div className="section-label">Currently tracking</div>
      {loading ? (
        <p className="empty">Loading watchlist…</p>
      ) : products.length === 0 ? (
        <p className="empty">Nothing tracked yet. Add a product above to get started.</p>
      ) : (
        products.map((p) => (
          <ProductCard key={p.id} product={p} onRemove={handleRemove} />
        ))
      )}
    </main>
  );
}
