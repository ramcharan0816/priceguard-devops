/**
 * email.js
 *
 * Sends a price-drop alert email via Resend's HTTP API. Kept as a plain
 * fetch call (no SDK dependency) so it's easy to read and swap providers.
 */

async function sendPriceDropAlert({ to, productName, oldPrice, newPrice, targetPrice }) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.ALERT_FROM_EMAIL || "alerts@priceguard.app";

  if (!apiKey) {
    console.warn("RESEND_API_KEY not set — skipping email send (logged only)");
    console.log(`[ALERT] ${productName}: ${oldPrice} -> ${newPrice} (target ${targetPrice})`);
    return { skipped: true };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress,
      to,
      subject: `Price drop: ${productName} is now ₹${newPrice}`,
      html: `
        <h2>${productName} dropped below your target price</h2>
        <p>Previous price: ₹${oldPrice}</p>
        <p><strong>New price: ₹${newPrice}</strong></p>
        <p>Your target: ₹${targetPrice}</p>
      `,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API error (${response.status}): ${body}`);
  }

  return response.json();
}

module.exports = { sendPriceDropAlert };
