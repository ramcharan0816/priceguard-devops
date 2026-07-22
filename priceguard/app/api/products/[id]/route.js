import { getSupabaseClient } from "../../../../lib/supabase";

export async function DELETE(request, { params }) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("products").delete().eq("id", params.id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ deleted: true });
}

export async function GET(request, { params }) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("price_history")
    .select("*")
    .eq("product_id", params.id)
    .order("checked_at", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return Response.json({ history: data });
}
