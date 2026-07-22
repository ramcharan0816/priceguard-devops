import { getSupabaseClient } from "../../../lib/supabase";

export async function GET() {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ products: data });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const { name, base_price, target_price, alert_email } = body;

  if (!name || !alert_email) {
    return Response.json(
      { error: "name and alert_email are required" },
      { status: 400 }
    );
  }

  const basePriceNum = Number(base_price);
  const targetPriceNum = Number(target_price);

  if (!Number.isFinite(basePriceNum) || basePriceNum <= 0) {
    return Response.json({ error: "base_price must be a positive number" }, { status: 400 });
  }
  if (!Number.isFinite(targetPriceNum) || targetPriceNum <= 0) {
    return Response.json({ error: "target_price must be a positive number" }, { status: 400 });
  }

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .insert([
      {
        name,
        base_price: basePriceNum,
        target_price: targetPriceNum,
        alert_email,
        current_price: basePriceNum,
      },
    ])
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ product: data }, { status: 201 });
}
