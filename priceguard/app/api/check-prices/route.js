import { getSupabaseClient } from "../../../lib/supabase";
import { getSimulatedPrice } from "../../../lib/mockPriceFeed";
import { sendPriceDropAlert } from "../../../lib/email";

/**
 * This endpoint is called on a schedule (see .github/workflows/price-check.yml).
 * It is protected by a shared secret so it can't be triggered by anyone
 * who happens to find the URL.
 */
export async function POST(request) {
  const authHeader = request.headers.get("authorization");
  const expected = `Bearer ${process.env.PRICE_CHECK_SECRET}`;

  if (!process.env.PRICE_CHECK_SECRET || authHeader !== expected) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseClient();
  const { data: products, error } = await supabase.from("products").select("*");

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const results = [];

  // Each product is processed independently — a failure for one (a bad
  // email send, a transient DB error) must not stop the rest from being
  // checked, since this job runs unattended on a schedule.
  for (const product of products) {
    try {
      const newPrice = getSimulatedPrice(product.id, product.base_price);
      const oldPrice = product.current_price;

      const { error: historyError } = await supabase
        .from("price_history")
        .insert([{ product_id: product.id, price: newPrice }]);
      if (historyError) throw new Error(`price_history insert failed: ${historyError.message}`);

      const { error: updateError } = await supabase
        .from("products")
        .update({ current_price: newPrice })
        .eq("id", product.id);
      if (updateError) throw new Error(`product update failed: ${updateError.message}`);

      const droppedBelowTarget = newPrice <= product.target_price;
      const alreadyDropped = oldPrice <= product.target_price;
      const alerted = droppedBelowTarget && !alreadyDropped;

      if (alerted) {
        await sendPriceDropAlert({
          to: product.alert_email,
          productName: product.name,
          oldPrice,
          newPrice,
          targetPrice: product.target_price,
        });

        const { error: alertError } = await supabase
          .from("alerts_sent")
          .insert([{ product_id: product.id, price: newPrice }]);
        if (alertError) throw new Error(`alerts_sent insert failed: ${alertError.message}`);
      }

      results.push({ id: product.id, name: product.name, oldPrice, newPrice, alerted });
    } catch (err) {
      console.error(`Failed processing product ${product.id} (${product.name}):`, err.message);
      results.push({ id: product.id, name: product.name, error: err.message });
    }
  }

  const failedCount = results.filter((r) => r.error).length;

  return Response.json({
    checked: results.length,
    failed: failedCount,
    results,
  });
}
