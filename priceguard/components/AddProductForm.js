"use client";

import { useState } from "react";

export default function AddProductForm({ onAdd }) {
  const [name, setName] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [targetPrice, setTargetPrice] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name || !basePrice || !targetPrice || !email) return;

    setSubmitting(true);
    await onAdd({
      name,
      base_price: parseFloat(basePrice),
      target_price: parseFloat(targetPrice),
      alert_email: email,
    });
    setName("");
    setBasePrice("");
    setTargetPrice("");
    setEmail("");
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Product name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="number"
        step="0.01"
        placeholder="Current price (₹)"
        value={basePrice}
        onChange={(e) => setBasePrice(e.target.value)}
        required
      />
      <input
        type="number"
        step="0.01"
        placeholder="Alert me below (₹)"
        value={targetPrice}
        onChange={(e) => setTargetPrice(e.target.value)}
        required
      />
      <input
        type="email"
        className="email"
        placeholder="Email for alerts"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit" disabled={submitting}>
        {submitting ? "Adding…" : "Track this product"}
      </button>
    </form>
  );
}
