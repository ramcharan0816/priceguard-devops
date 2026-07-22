/**
 * mockPriceFeed.js
 *
 * Simulates a real product price feed. In production this module would be
 * swapped for a real retailer API or scraper — everything downstream
 * (storage, alerting, charts) is written against this same interface, so
 * swapping the source later is a one-file change.
 *
 * The feed is a deterministic pseudo-random walk seeded by product id and
 * time bucket, so repeated calls within the same window return stable
 * results (useful for demos and tests) while still drifting over time.
 */

function seededRandom(seed) {
  // simple mulberry32 PRNG
  let t = seed + 0x6d2b79f5;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Returns a simulated current price for a product.
 * @param {string} productId
 * @param {number} basePrice - the anchor price to fluctuate around
 * @param {Date} [at] - point in time to simulate (defaults to now)
 * @returns {number} price rounded to 2 decimals, always > 0
 */
function getSimulatedPrice(productId, basePrice, at = new Date()) {
  if (typeof basePrice !== "number" || basePrice <= 0) {
    throw new Error("basePrice must be a positive number");
  }

  // bucket time into 30-minute windows so repeated calls are stable
  const bucket = Math.floor(at.getTime() / (1000 * 60 * 30));
  const seed = hashString(productId) + bucket;

  const noise = seededRandom(seed); // 0..1
  // fluctuate +/- 15% of base price
  const fluctuation = (noise - 0.5) * 0.3;
  const price = basePrice * (1 + fluctuation);

  return Math.max(0.01, Math.round(price * 100) / 100);
}

module.exports = { getSimulatedPrice };
