"use client";

import { useState, useEffect } from "react";
import AddProductForm from "../components/AddProductForm";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadProducts() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/products");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Request failed with status ${res.status}`);
      }
      setProducts(data.products || []);
    } catch (err) {
      console.error("Failed to load products:", err);
      setError(err.message || "Failed to load your watchlist. Please try refreshing.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function handleAdd(product) {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to add product");
      }
      await loadProducts();
    } catch (err) {
      console.error("Failed to add product:", err);
      setError(err.message || "Failed to add product. Please try again.");
    }
  }

  async function handleRemove(id) {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to remove product");
      }
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Failed to remove product:", err);
      setError(err.message || "Failed to remove product. Please try again.");
    }
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

      {error && <p className="error-message">{error}</p>}

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
