const { getSimulatedPrice } = require("../lib/mockPriceFeed");

describe("getSimulatedPrice", () => {
  test("returns a positive number", () => {
    const price = getSimulatedPrice("product-1", 1000);
    expect(price).toBeGreaterThan(0);
  });

  test("stays within a reasonable band of the base price", () => {
    const base = 1000;
    const price = getSimulatedPrice("product-1", base);
    expect(price).toBeGreaterThan(base * 0.8);
    expect(price).toBeLessThan(base * 1.2);
  });

  test("is deterministic within the same time bucket", () => {
    const at = new Date("2026-01-01T10:00:00Z");
    const priceA = getSimulatedPrice("product-1", 1000, at);
    const priceB = getSimulatedPrice("product-1", 1000, at);
    expect(priceA).toBe(priceB);
  });

  test("different products with the same base price can diverge", () => {
    const at = new Date("2026-01-01T10:00:00Z");
    const priceA = getSimulatedPrice("product-1", 1000, at);
    const priceB = getSimulatedPrice("product-2", 1000, at);
    // not a strict guarantee, but should hold for these two seeds
    expect(priceA).not.toBe(priceB);
  });

  test("throws on invalid base price", () => {
    expect(() => getSimulatedPrice("product-1", -5)).toThrow();
    expect(() => getSimulatedPrice("product-1", 0)).toThrow();
  });
});
